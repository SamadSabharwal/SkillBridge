import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import api from './routes/api.js';

if (!process.env.MONGO_URI || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('Set MONGO_URI and a JWT_SECRET of at least 32 characters');
    process.exit(1);
}

const app = express();
app.set('trust proxy', 1);
app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map(x => x.trim().replace(/\/+$/, ''))
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/+$/, '');
        if (allowedOrigins.includes('*') || allowedOrigins.includes(cleanOrigin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true
}));

app.use(express.json({ limit: '100kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 80, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/api', api);
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
    console.error(err);
    if (err.code === 11000) return res.status(409).json({ message: 'Duplicate record' });
    if (err.name === 'ValidationError' || err.name === 'CastError') return res.status(400).json({ message: 'Invalid data' });
    res.status(500).json({ message: 'Server error' });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => app.listen(process.env.PORT || 8080, () => console.log(`SkillBridge API running on port ${process.env.PORT || 8080}`)))
    .catch(e => {
        console.error('Database connection failed:', e.message);
        process.exit(1);
    });
