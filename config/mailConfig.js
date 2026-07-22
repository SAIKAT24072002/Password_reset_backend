import 'dotenv/config';
import nodemailer from 'nodemailer';

const mailHost = process.env.EMAIL_HOST || '';
const isGmail = mailHost.includes('gmail') || (process.env.EMAIL_USER && process.env.EMAIL_USER.includes('gmail'));

const transporterConfig = isGmail
  ? {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    }
  : {
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };

const transporter = nodemailer.createTransport(transporterConfig);

export default transporter;