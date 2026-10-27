import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Project, Proposal, Service, Order, Contract, Review, Message, Payment } from '../../models/index.js';
import { auth, role, validId, cleanSkills, fail } from '../../middleware/auth.js';
import { wrap, text, positive, dateOk, pageOpts, userPublic } from '../helpers.js';

export function registerFreelancersRoutes(router) {
    router.get('/freelancers', wrap(async (req, res) => { const f = { role: 'freelancer' }; if (req.query.skill)
        f.skills = new RegExp('^' + String(req.query.skill).replace(/[^a-z0-9 ]/gi, '').slice(0, 40) + '$', 'i'); res.json(await User.find(f).select('name skills bio portfolio').limit(40)); }));
    router.get('/freelancers/:id', wrap(async (req, res) => { if (!validId(req.params.id))
        return fail(res, 'Invalid freelancer ID'); const u = await User.findOne({ _id: req.params.id, role: 'freelancer' }).select('name skills bio portfolio'); if (!u)
        return fail(res, 'Freelancer not found', 404); const reviews = await Review.find({ freelancer: u.id }).populate('client', 'name').sort({ createdAt: -1 }).limit(30); res.json({ freelancer: u, reviews, average: reviews.length ? Number((reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)) : null }); }));
}
