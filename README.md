# Password Reset Backend API

Express + Node.js + MongoDB backend for user authentication and password reset management.

## after host reset passwort not working email port is block , Localhost is working fine reset password

## Features

- User registration with `bcryptjs` password hashing.
- User authentication using JWT tokens.
- Secure password reset via Nodemailer and Gmail SMTP.
- 15-minute token expiration logic.

## Setup & Running

```bash
npm install
npm run dev
```

## Environment Variables (.env)

```env
PORT=4000
MONGO_URI=mongodb+srv://saikatkhamrai0702_db_user:saikat2002@cluster0.ijaiugg.mongodb.net/password-reset-app

CLIENT_URL=http://localhost:3000
RESET_TOKEN_EXPIRY_MINUTES=15
JWT_SECRET=supersecretkey_password_reset_app_2026
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM="Support Team <your_email@gmail.com>"
```
