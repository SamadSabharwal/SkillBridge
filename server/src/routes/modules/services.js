import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Project, Proposal, Service, Order, Contract, Review, Message, Payment } from '../../models/index.js';
import { auth, role, validId, cleanSkills, fail } from '../../middleware/auth.js';
import { wrap, text, positive, dateOk, pageOpts, userPublic } from '../helpers.js';

export function registerServicesRoutes(router) {
    router.get('/services', wrap(async (req, res) => { const f = { active: true }; if (req.query.category)
        f.category = String(req.query.category).slice(0, 80); if (req.query.minBudget)
        f.price = { $gte: Number(req.query.minBudget) || 0 }; if (req.query.maxBudget)
        f.price = { ...f.price, $lte: Number(req.query.maxBudget) || 0 }; if (req.query.search)
        f.title = { $regex: String(req.query.search).slice(0, 70).replace(/[^a-z0-9 ]/gi, ''), $options: 'i' }; res.json(await Service.find(f).populate('freelancer', 'name skills').sort(req.query.sort === 'budget_asc' ? { price: 1 } : req.query.sort === 'budget_desc' ? { price: -1 } : { createdAt: -1 }).skip(pageOpts(req.query).skip).limit(12)); }));
    router.get('/services/mine', auth, role('freelancer'), wrap(async (req, res) => res.json(await Service.find({ freelancer: req.user.id }).sort({ createdAt: -1 }))));
    router.post('/services', auth, role('freelancer'), wrap(async (req, res) => { const { title, description, category, price, deliveryDays, skills } = req.body; if (!text(title, 5, 120) || !text(description, 15, 4000) || !text(category, 2, 80) || !positive(price) || !Number.isInteger(deliveryDays) || deliveryDays < 1 || deliveryDays > 365)
        return fail(res, 'Complete all service fields with valid price and delivery days'); res.status(201).json(await Service.create({ freelancer: req.user.id, title, description, category, price, deliveryDays, skills: cleanSkills(skills) })); }));
    router.patch('/services/:id/toggle', auth, role('freelancer'), wrap(async (req, res) => { if (!validId(req.params.id))
        return fail(res, 'Invalid service ID'); const s = await Service.findOne({ _id: req.params.id, freelancer: req.user.id }); if (!s)
        return fail(res, 'Service not found', 404); s.active = !s.active; await s.save(); res.json(s); }));
    router.post('/services/:id/orders', auth, role('client'), wrap(async (req, res) => { if (!validId(req.params.id))
        return fail(res, 'Invalid service ID'); const s = await Service.findById(req.params.id); if (!s || !s.active)
        return fail(res, 'Service unavailable', 404); if (!text(req.body.requirements, 10, 3000))
        return fail(res, 'Requirements must contain at least 10 characters'); res.status(201).json(await Order.create({ service: s.id, client: req.user.id, freelancer: s.freelancer, price: s.price, requirements: req.body.requirements.trim() })); }));
}
