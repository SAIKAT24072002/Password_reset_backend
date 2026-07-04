import 'dotenv/config';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import express from 'express';
import cors from 'cors';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

connectDB();

const app = express();


app.use(
  cors({
    origin: "https://thunderous-mermaid-7044bb.netlify.app",
    credentials: true,
  })
);
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Password Reset API is running');
});


app.use('/api/auth', authRoutes);


app.use(notFound);


app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});