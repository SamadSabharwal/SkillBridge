import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Project, Proposal, Service, Order, Contract, Review, Message, Payment } from '../../models/index.js';
import { auth, role, validId, cleanSkills, fail } from '../../middleware/auth.js';
import { wrap, text, positive, dateOk, pageOpts, userPublic } from '../helpers.js';

export function registerOrdersRoutes(router) {
    router.get('/orders/mine', auth, wrap(async (req, res) => res.json(await Order.find({ [req.user.role]: req.user.id }).populate('service', 'title').populate('client', 'name').populate('freelancer', 'name').sort({ createdAt: -1 }))));
    router.post('/orders/:id/decision', auth, role('freelancer'), wrap(async (req, res) => { if (!validId(req.params.id))
        return fail(res, 'Invalid order ID'); const status = req.body.accept ? 'in_progress' : 'declined'; const o = await Order.findOneAndUpdate({ _id: req.params.id, freelancer: req.user.id, status: 'requested' }, { $set: { status } }, { new: true }); if (!o)
        return fail(res, 'Order not available', 409); res.json(o); }));
    router.post('/orders/:id/submit', auth, role('freelancer'), wrap(async (req, res) => { if (!validId(req.params.id))
        return fail(res, 'Invalid ID'); const paid = await Payment.exists({ kind: 'order', workId: req.params.id, status: 'paid' }); if (!paid)
        return fail(res, 'Client must complete test payment before work submission', 409); if (!validId(req.params.id))
        return fail(res, 'Invalid order ID'); const { link, note } = req.body; if (!text(link, 8, 500) || !/^https?:\/\//.test(link) || !text(note, 5, 1500))
        return fail(res, 'Valid work URL and note required'); const o = await Order.findOneAndUpdate({ _id: req.params.id, freelancer: req.user.id, status: { $in: ['in_progress', 'revision_requested'] } }, { $set: { status: 'submitted', submission: { link, note }, revisionNote: '' } }, { new: true }); if (!o)
        return fail(res, 'Order unavailable', 409); res.json(o); }));
    router.post('/orders/:id/review', auth, role('client'), wrap(async (req, res) => { if (!validId(req.params.id))
        return fail(res, 'Invalid order ID'); const { approve, note } = req.body; if (typeof approve !== 'boolean' || (!approve && !text(note, 5, 1000)))
        return fail(res, 'Approval or revision note required'); const o = await Order.findOneAndUpdate({ _id: req.params.id, client: req.user.id, status: 'submitted' }, { $set: { status: approve ? 'completed' : 'revision_requested', revisionNote: approve ? '' : note } }, { new: true }); if (!o)
        return fail(res, 'Order unavailable', 409); res.json(o); }));
    // Public freelancer directory and review history; never expose password hashes.
}
