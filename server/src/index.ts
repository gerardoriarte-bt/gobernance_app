import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, initDB } from './db';
import { taxonomyRouter } from './routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Database
initDB().catch(console.error);

// Routes
app.use('/api', taxonomyRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
