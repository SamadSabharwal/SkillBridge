import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Project, Proposal, Service, Order, Contract, Review, Message, Payment } from '../../models/index.js';
import { auth, role, validId, cleanSkills, fail } from '../../middleware/auth.js';
import { wrap, text, positive, dateOk, pageOpts, userPublic } from '../helpers.js';

export function registerDashboardRoutes(router) {
    router.get('/dashboard', auth, wrap(async (req, res) => { const id = req.user.id, client = req.user.role === 'client'; const [projects, services, proposals, contracts, orders, reviews] = await Promise.all([Project.countDocuments({ client: id }), Service.countDocuments({ freelancer: id }), Proposal.countDocuments(client ? { project: { $in: await Project.find({ client: id }).distinct('_id') } } : { freelancer: id }), Contract.find({ [req.user.role]: id }).select('status price'), Order.find({ [req.user.role]: id }).select('status price'), Review.find({ freelancer: id }).select('rating')]); res.json({ projects, services, proposals, active: contracts.filter(x => x.status !== 'completed').length + orders.filter(x => !['completed', 'declined'].includes(x.status)).length, completed: contracts.filter(x => x.status === 'completed').length + orders.filter(x => x.status === 'completed').length, completedValue: [...contracts, ...orders].filter(x => x.status === 'completed').reduce((a, b) => a + b.price, 0), averageRating: reviews.length ? Number((reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)) : null }); }));
    router.get('/recommendations', auth, role('freelancer'), wrap(async (req, res) => { const skills = new Set(req.user.skills.map(x => x.toLowerCase())); const projects = await Project.find({ status: 'open' }).populate('client', 'name').sort({ createdAt: -1 }).limit(100); res.json(projects.map(p => ({ ...p.toObject(), matchScore: p.skills.length ? Math.round(100 * p.skills.filter(x => skills.has(x.toLowerCase())).length / p.skills.length) : 0 })).sort((a, b) => b.matchScore - a.matchScore).slice(0, 20)); }));
}
