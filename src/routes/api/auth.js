const express = require('express');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const path = require('path');
const fs = require('fs/promises');
const { BadRequest, Conflict, Unauthorized, NotFound } = require('http-errors');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const router = express.Router();
const { User } = require('../../models');
const { joiRegisterSchema, joiLoginSchema } = require('../../models/user');
const { authenticate, upload } = require('../../middlewares');
const { jimp } = require('../../helpers');
const { sendEmail } = require('../../helpers');

const { SECRET_KEY, SITE_NAME } = process.env;
const avatarsDir = path.join(__dirname, '../../../', 'public', 'avatars');

router.post('/signup', async (req, res, next) => {
  try {
    const { error } = joiRegisterSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw new Conflict('User already exist');
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();
    const newUser = await User.create({
      email,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });
    const data = {
      to: email,
      subject: 'Подтверждение',
      html: `<a target ="_blank" href="${SITE_NAME}/users/verify/${verificationToken}">Подтвердите Email<a/>`,
    };
    await sendEmail(data);
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { error } = joiLoginSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Unauthorized('Email or password is wrong');
    }
    if (!user.verify) {
      throw new Unauthorized('Email not verify');
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw new Unauthorized('Email or password is wrong');
    }
    const { _id, subscription } = user;
    const payload = {
      id: _id,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
    await User.findByIdAndUpdate(_id, { token });
    res.json({
      token,
      user: {
        email,
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/logout', authenticate, async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).send();
});

router.get('/current', authenticate, async (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    user: {
      email,
      subscription,
    },
  });
});
router.patch(
  '/avatars',
  authenticate,
  upload.single('avatar'),
  async (req, res) => {
    const { path: tempUpload, filename } = req.file;
    await jimp(tempUpload);
    const [extension] = filename.split('.').reverse();
    const newFleName = `${req.user._id}.${extension}`;
    const fileUpload = path.join(avatarsDir, newFleName);
    await fs.rename(tempUpload, fileUpload);
    const avatarURL = path.join('avatars', newFleName);
    await User.findByIdAndUpdate(req.user._id, { avatarURL }, { new: true });
    res.json({ avatarURL });
  },
);
router.get('/verify/:verificationToken', async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw new NotFound('User not found');
    }
    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });
    res.json({ message: 'Verification successful' });
  } catch (error) {
    next(error);
  }
});
router.post('/verify', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw BadRequest('missing required field email');
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFound('User not found');
    }
    if (user.verify) {
      throw BadRequest('Verification has already been passed');
    }
    const { verificationToken } = user;
    const data = {
      to: email,
      subject: 'Подтверждение',
      html: `<a target ="_blank" href="${SITE_NAME}/users/verify/${verificationToken}">Подтвердите Email<a/>`,
    };
    await sendEmail(data);
    res.json({ message: 'Verification email sent' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
