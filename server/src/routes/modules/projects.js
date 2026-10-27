import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Project, Proposal, Service, Order, Contract, Review, Message, Payment } from '../../models/index.js';
import { auth, role, validId, cleanSkills, fail } from '../../middleware/auth.js';
import { wrap, text, positive, dateOk, pageOpts, userPublic } from '../helpers.js';

export function registerProjectsRoutes(router) {
    router.get('/projects', wrap(async (req, res) => { const f = {}; if (req.query.status)
        f.status = req.query.status;
    else
        f.status = 'open'; if (req.query.search)
        f.$or = [{ title: { $regex: String(req.query.search).slice(0, 70).replace(/[.*+?^${}()|[\]\\]/g, '\$&'), $options: 'i' } }, { description: { $regex: String(req.query.search).slice(0, 70).replace(/[.*+?^${}()|[\]\\]/g, '\$&'), $options: 'i' } }]; if (req.query.minBudget)
        f.budget = { $gte: Number(req.query.minBudget) || 0 }; if (req.query.maxBudget)
        f.budget = { ...f.budget, $lte: Number(req.query.maxBudget) || 0 }; if (req.query.skill) {
        const skill = String(req.query.skill).trim().slice(0, 40);
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        f.skills = { $regex: escaped, $options: 'i' };
    } res.json(await Project.find(f).populate('client', 'name').sort(req.query.sort === 'budget_asc' ? { budget: 1 } : req.query.sort === 'budget_desc' ? { budget: -1 } : { createdAt: -1 }).skip(pageOpts(req.query).skip).limit(12)); }));
    router.get('/projects/mine', auth, role('client'), wrap(async (req, res) => res.json(await Project.find({ client: req.user.id }).sort({ createdAt: -1 }))));
    router.post('/projects', auth, role('client'), wrap(async (req, res) => { const { title, description, budget, deadline, skills } = req.body; if (!text(title, 5, 120) || !text(description, 15, 4000) || !positive(budget) || !dateOk(deadline))
        return fail(res, 'Valid title, description, budget and future deadline required'); const p = await Project.create({ client: req.user.id, title: title.trim(), description: description.trim(), budget, deadline, skills: cleanSkills(skills) }); res.status(201).json(p); }));
}
