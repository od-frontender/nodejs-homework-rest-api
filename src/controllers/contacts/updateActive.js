const { NotFound } = require('http-errors');
const { Contact } = require('../../models');

const updateActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
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
    if (error.message.includes('validation failed')) {
      error.status = 400;
    }
    next(error);
  }
};
module.exports = updateActive;
