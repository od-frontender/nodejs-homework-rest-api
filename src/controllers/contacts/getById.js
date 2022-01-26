const { NotFound } = require('http-errors');
const { Contact } = require('../../models');

const getById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await Contact.findById(id);
    if (!result) {
      throw new NotFound(`Contact with id=${id} not found`);
    }
    res.json({
      status: 'success',
      code: 200,
      data: {
        result,
      },
    });
  } catch (error) {
    if (error.message.includes('Cast to ObjectId failed')) {
      error.status = 404;
    }
    next(error);
  }
};
module.exports = getById;
