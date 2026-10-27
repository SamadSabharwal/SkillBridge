import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
export const auth = async (req, res, next) => { try {
    const token = req.headers.authorization?.replace(/^Bearer /, '');
    if (!token)
        return res.status(401).json({ message: 'Login required' });
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(data.id);
    if (!user)
        return res.status(401).json({ message: 'Account not found' });
    req.user = user;
    next();
}
catch (e) {
    res.status(401).json({ message: 'Invalid or expired token' });
} };
export const role = (r) => (req, res, next) => req.user.role === r ? next() : res.status(403).json({ message: `${r} access required` });
export const validId = (id) => /^[a-f0-9]{24}$/i.test(String(id));
export const cleanSkills = (v) => Array.isArray(v) ? [...new Set(v.map(x => String(x).trim().slice(0, 40)).filter(Boolean))].slice(0, 12) : [];
export const fail = (res, message, status = 400) => res.status(status).json({ message });
