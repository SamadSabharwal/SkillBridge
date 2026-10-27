import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Project, Proposal, Service, Order, Contract, Review, Message, Payment } from '../../models/index.js';
import { auth, role, validId, cleanSkills, fail } from '../../middleware/auth.js';
import { wrap, text, positive, dateOk, pageOpts, userPublic } from '../helpers.js';

export function registerContractsRoutes(router) {
    router.get('/contracts/mine', auth, wrap(async (req, res) => res.json(await Contract.find({ [req.user.role]: req.user.id }).populate('project', 'title').populate('client', 'name').populate('freelancer', 'name').sort({ createdAt: -1 }))));
    router.post('/contracts/:id/submit', auth, role('freelancer'), wrap(async (req, res) => { if (!validId(req.params.id))
        return fail(res, 'Invalid ID'); const paid = await Payment.exists({ kind: 'contract', workId: req.params.id, status: 'paid' }); if (!paid)
        return fail(res, 'Client must complete test payment before work submission', 409); if (!validId(req.params.id))
        return fail(res, 'Invalid contract ID'); const { link, note } = req.body; if (!text(note, 5, 1500) || !text(link, 8, 500) || !/^https?:\/\//.test(link))
        return fail(res, 'A valid URL and submission note are required'); const c = await Contract.findOneAndUpdate({ _id: req.params.id, freelancer: req.user.id, status: { $in: ['in_progress', 'revision_requested'] } }, { $set: { status: 'submitted', submission: { link, note }, revisionNote: '' } }, { new: true }); if (!c)
        return fail(res, 'Contract unavailable or not yours', 409); await Project.updateOne({ _id: c.project }, { $set: { status: 'submitted' } }); res.json(c); }));
    router.post('/contracts/:id/review', auth, role('client'), wrap(async (req, res) => { if (!validId(req.params.id))
        return fail(res, 'Invalid contract ID'); const { approve, note } = req.body; if (typeof approve !== 'boolean' || (!approve && !text(note, 5, 1000)))
        return fail(res, 'Approval or revision note required'); const status = approve ? 'completed' : 'revision_requested'; const c = await Contract.findOneAndUpdate({ _id: req.params.id, client: req.user.id, status: 'submitted' }, { $set: { status, revisionNote: approve ? '' : note } }, { new: true }); if (!c)
        return fail(res, 'Contract not submitted or not yours', 409); await Project.updateOne({ _id: c.project }, { $set: { status: approve ? 'completed' : 'in_progress' } }); res.json(c); }));
}
