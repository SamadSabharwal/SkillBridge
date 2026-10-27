import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Project, Proposal, Service, Order, Contract, Review, Message, Payment } from '../../models/index.js';
import { auth, role, validId, cleanSkills, fail } from '../../middleware/auth.js';
import { wrap, text, positive, dateOk, pageOpts, userPublic } from '../helpers.js';

export function registerProposalsRoutes(router) {
    router.get('/projects/:id/proposals', auth, role('client'), wrap(async (req, res) => { if (!validId(req.params.id))
        return fail(res, 'Invalid project ID'); const p = await Project.findById(req.params.id); if (!p)
        return fail(res, 'Project not found', 404); if (String(p.client) !== req.user.id)
        return fail(res, 'Not your project', 403); res.json(await Proposal.find({ project: p.id }).populate('freelancer', 'name skills bio').sort({ createdAt: -1 })); }));
    router.post('/projects/:id/proposals', auth, role('freelancer'), wrap(async (req, res) => { if (!validId(req.params.id))
        return fail(res, 'Invalid project ID'); const p = await Project.findById(req.params.id); if (!p)
        return fail(res, 'Project not found', 404); if (p.status !== 'open')
        return fail(res, 'Project is no longer open'); if (!text(req.body.coverLetter, 15, 2000) || !positive(req.body.bid))
        return fail(res, 'Cover letter (15+ characters) and positive bid required'); try {
        res.status(201).json(await Proposal.create({ project: p.id, freelancer: req.user.id, coverLetter: req.body.coverLetter.trim(), bid: req.body.bid }));
    }
    catch (e) {
        if (e.code === 11000)
            return fail(res, 'You already applied', 409);
        throw e;
    } }));
    router.get('/proposals/mine', auth, role('freelancer'), wrap(async (req, res) => res.json(await Proposal.find({ freelancer: req.user.id }).populate('project', 'title status budget').sort({ createdAt: -1 }))));
    router.post('/proposals/:id/accept', auth, role('client'), wrap(async (req, res) => { if (!validId(req.params.id))
        return fail(res, 'Invalid proposal ID'); const prop = await Proposal.findById(req.params.id); if (!prop)
        return fail(res, 'Proposal not found', 404); const p = await Project.findById(prop.project); if (!p || String(p.client) !== req.user.id)
        return fail(res, 'Not your project', 403); if (p.status !== 'open' || prop.status !== 'pending')
        return fail(res, 'Project already assigned or proposal unavailable', 409); const session = await mongoose.startSession(); try {
        let contract;
        await session.withTransaction(async () => { const updated = await Project.findOneAndUpdate({ _id: p.id, status: 'open' }, { $set: { status: 'in_progress', hiredFreelancer: prop.freelancer } }, { new: true, session }); if (!updated)
            throw new Error('Project already assigned'); await Proposal.updateMany({ project: p.id }, { $set: { status: 'rejected' } }, { session }); await Proposal.updateOne({ _id: prop.id }, { $set: { status: 'accepted' } }, { session }); [contract] = await Contract.create([{ project: p.id, proposal: prop.id, client: req.user.id, freelancer: prop.freelancer, price: prop.bid }], { session }); });
        res.json(contract);
    }
    catch (e) {
        if (/Transaction numbers|replica set/i.test(e.message))
            return fail(res, 'MongoDB transactions require an Atlas cluster or local replica set', 503);
        if (e.message === 'Project already assigned')
            return fail(res, e.message, 409);
        throw e;
    }
    finally {
        await session.endSession();
    } }));
}
