import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Knex } from 'knex';
import knexConfig from '../knexfile';
import knex from 'knex';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}));
app.use(express.json());

// Database connection (initialize before importing routes to avoid circular imports)
const db = knex(knexConfig.development);

import apiRoutes from './routes/api';
app.use('/api', apiRoutes);

// Health check
app.get('/health', async (req, res) => {
    try {
        await db.raw('SELECT 1');
        res.json({ status: 'ok', db: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', db: 'disconnected', error });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;
export { db };
