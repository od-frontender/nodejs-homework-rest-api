const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const { GRID_KEY, EMAIL } = process.env;

sgMail.setApiKey(GRID_KEY);

const sendEmail = async data => {
  try {
    const email = { ...data, from: EMAIL };
    await sgMail.send(email);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = sendEmail;
