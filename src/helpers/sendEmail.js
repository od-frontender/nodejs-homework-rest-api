const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const { GRID_KEY } = process.env;

sgMail.setApiKey(GRID_KEY);

const sendEmail = async data => {
  try {
    const email = { ...data, from: 'od.frontender@gmail.com' };
    await sgMail.send(email);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = sendEmail;
