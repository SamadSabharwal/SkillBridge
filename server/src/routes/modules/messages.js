import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Project, Proposal, Service, Order, Contract, Review, Message, Payment } from '../../models/index.js';
import { auth, role, validId, cleanSkills, fail } from '../../middleware/auth.js';
import { wrap, text, positive, dateOk, pageOpts, userPublic } from '../helpers.js';

export function registerMessagesRoutes(router) {
    const conversation = async (req, res) => { const { type, id } = req.params; if (!['contract', 'order'].includes(type) || !validId(id))
        return fail(res, 'Invalid conversation'); const doc = type === 'contract' ? await Contract.findById(id) : await Order.findById(id); if (!doc)
        return fail(res, 'Work not found', 404); if (![String(doc.client), String(doc.freelancer)].includes(req.user.id))
        return fail(res, 'Access denied', 403); return doc; };
    router.get('/messages/:type/:id', auth, wrap(async (req, res) => { const doc = await conversation(req, res); if (!doc || res.headersSent)
        return; res.json(await Message.find({ [req.params.type]: doc.id }).populate('sender', 'name').sort({ createdAt: 1 }).limit(200)); }));
    router.post('/messages/:type/:id', auth, wrap(async (req, res) => { const doc = await conversation(req, res); if (!doc || res.headersSent)
        return; if (!text(req.body.body, 1, 2000))
        return fail(res, 'Message must be 1–2000 characters'); res.status(201).json(await Message.create({ [req.params.type]: doc.id, sender: req.user.id, body: req.body.body.trim() })); }));
    // Server-side Razorpay Test Mode: amounts come from persisted contracts/orders, never the browser.
}
