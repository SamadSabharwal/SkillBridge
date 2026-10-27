import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Project, Proposal, Service, Order, Contract, Review, Message, Payment } from '../../models/index.js';
import { auth, role, validId, cleanSkills, fail } from '../../middleware/auth.js';
import { wrap, text, positive, dateOk, pageOpts, userPublic } from '../helpers.js';

export function registerReviewsRoutes(router) {
    router.post('/reviews', auth, role('client'), wrap(async (req, res) => { const { type, id, rating, comment } = req.body; if (!['contract', 'order'].includes(type) || !validId(id) || !Number.isInteger(rating) || rating < 1 || rating > 5 || !text(comment, 5, 1000))
        return fail(res, 'Valid completed work, rating (1–5) and review required'); const doc = type === 'contract' ? await Contract.findById(id) : await Order.findById(id); if (!doc)
        return fail(res, 'Work not found', 404); if (String(doc.client) !== req.user.id)
        return fail(res, 'Not your work', 403); if (doc.status !== 'completed')
        return fail(res, 'Only completed work can be reviewed', 409); const existing = await Review.exists({ [type]: id }); if (existing)
        return fail(res, 'Already reviewed', 409); res.status(201).json(await Review.create({ [type]: id, client: req.user.id, freelancer: doc.freelancer, rating, comment: comment.trim() })); }));
    router.get('/reviews/mine', auth, role('client'), wrap(async (req, res) => res.json(await Review.find({ client: req.user.id }).select('contract order'))));
}
