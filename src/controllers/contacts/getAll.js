const { Contact } = require('../../models');
const getAll = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const contacts = await Contact.find(
      { owner: _id },
      '-createdAt -updatedAt',
      { skip, limit: +limit },
    );
    res.json({
      status: 'success',
      code: 200,
      data: {
        result: contacts,
      },
    });
  } catch (error) {
    next(error);
  }
};
module.exports = getAll;
