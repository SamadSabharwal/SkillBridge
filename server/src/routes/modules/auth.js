import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Project, Proposal, Service, Order, Contract, Review, Message, Payment } from '../../models/index.js';
import { auth, role, validId, cleanSkills, fail } from '../../middleware/auth.js';
import { wrap, text, positive, dateOk, pageOpts, userPublic } from '../helpers.js';

export function registerAuthRoutes(router) {
    router.post('/auth/register', wrap(async (req, res) => { const { name, email, password, role: kind } = req.body; if (!text(name, 2, 80) || !/^\S+@\S+\.\S+$/.test(email || '') || typeof password !== 'string' || password.length < 8 || !['client', 'freelancer'].includes(kind))
        return fail(res, 'Provide a name, valid email, password (8+ characters), and role'); if (await User.exists({ email: email.toLowerCase() }))
        return fail(res, 'Email already registered', 409); const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password: await bcrypt.hash(password, 12), role: kind }); res.status(201).json({ token: jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' }), user: userPublic(user) }); }));
    router.post('/auth/login', wrap(async (req, res) => { const u = await User.findOne({ email: String(req.body.email || '').toLowerCase() }).select('+password'); if (!u || !await bcrypt.compare(String(req.body.password || ''), u.password))
        return fail(res, 'Invalid credentials', 401); res.json({ token: jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: '7d' }), user: userPublic(u) }); }));
    router.get('/auth/me', auth, (req, res) => res.json({ user: userPublic(req.user) }));
    router.patch('/auth/me', auth, wrap(async (req, res) => { const { bio, skills } = req.body; if (bio !== undefined) {
        if (typeof bio !== 'string' || bio.length > 500)
            return fail(res, 'Bio must be under 500 characters');
        req.user.bio = bio;
    } if (skills !== undefined)
        req.user.skills = cleanSkills(skills); if (req.body.portfolio !== undefined) {
        if (req.body.portfolio && !/^https?:\/\//.test(req.body.portfolio))
            return fail(res, 'Portfolio must be a URL');
        req.user.portfolio = String(req.body.portfolio).slice(0, 300);
    } await req.user.save(); res.json({ user: userPublic(req.user) }); }));
}
