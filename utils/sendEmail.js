import transporter from "../config/mailConfig.js";

const sendResetEmail = async (toEmail, resetLink) => {
  const expiryMinutes = process.env.RESET_TOKEN_EXPIRY_MINUTES || 15;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
        <h2 style="color: #4f46e5;">Password Reset Request</h2>
        <p>We received a request to reset the password for your account.</p>
        <p>Click the button below to choose a new password:</p>
        <p style="margin: 24px 0;">
          <a href="${resetLink}"
             style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px;
                    text-decoration: none; border-radius: 6px; display: inline-block;
                    font-weight: 600;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in <strong>${expiryMinutes} minutes</strong>.</p>
        <p style="color: #666; font-size: 13px;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default sendResetEmail;