const { Schema, model } = require('mongoose');
const Joi = require('joi');

const contactsSchema = Schema({
  name: {
    type: String,
    required: [true, 'Set name for contact'],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
});

const patterns = {
  name: /[a-zA-Zа-яА-Я]*$/,
  phone: /^(?:\+\s?\d+\s?)?(?:\(\d{1,4}\))?(?:[-\s./]?\d){5,}$/,
  email: /^\w+([\.-]?\w+)+@\w+([\.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/,
};

const joiSchema = Joi.object({
  name: Joi.string().pattern(patterns.name).min(1).max(20).required(),
  email: Joi.string().pattern(patterns.email).required(),
  phone: Joi.string().pattern(patterns.phone).required(),
  favorite: Joi.bool(),
});

const Contact = model('contact', contactsSchema);

module.exports = {
  Contact,
  joiSchema,
};
