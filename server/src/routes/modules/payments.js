import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, Project, Proposal, Service, Order, Contract, Review, Message, Payment } from '../../models/index.js';
import { auth, role, validId, cleanSkills, fail } from '../../middleware/auth.js';
import { wrap, text, positive, dateOk, pageOpts, userPublic } from '../helpers.js';

export function registerPaymentsRoutes(router) {
    const razorpayClient = () => { const id = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET; if (!id?.startsWith('rzp_test_') || !secret)
        return null; return new Razorpay({ key_id: id, key_secret: secret }); };
    const workDoc = async (kind, id) => kind === 'contract' ? Contract.findById(id) : Order.findById(id);
    router.post('/payments/:kind/:id/create-order', auth, role('client'), wrap(async (req, res) => {
        const { kind, id } = req.params;
        if (!['contract', 'order'].includes(kind) || !validId(id))
            return fail(res, 'Invalid work item');
        const doc = await workDoc(kind, id);
        if (!doc)
            return fail(res, 'Work item not found', 404);
        if (String(doc.client) !== req.user.id)
            return fail(res, 'Not your contract', 403);
        if (kind === 'order' && !['in_progress', 'submitted', 'revision_requested', 'completed'].includes(doc.status))
            return fail(res, 'Service must be accepted first', 409);
        if (!Number.isSafeInteger(Math.round(doc.price * 100)) || doc.price < 1)
            return fail(res, 'Invalid stored contract price');
        const client = razorpayClient();
        if (!client)
            return fail(res, 'Razorpay test credentials are not configured', 503);
        const paid = await Payment.exists({ kind, workId: doc._id, status: 'paid' });
        if (paid)
            return fail(res, 'Already paid', 409);
        const amountPaise = Math.round(doc.price * 100);
        const previous = await Payment.findOne({ kind, workId: doc._id, status: 'created', amountPaise }).sort({ createdAt: -1 });
        if (previous)
            return res.json({ keyId: process.env.RAZORPAY_KEY_ID, orderId: previous.razorpayOrderId, amount: previous.amountPaise, currency: 'INR' });
        const order = await client.orders.create({ amount: amountPaise, currency: 'INR', receipt: `sb_${kind[0]}_${doc._id.toString().slice(-12)}_${Date.now().toString().slice(-8)}` });
        await Payment.create({ kind, workId: doc._id, client: doc.client, freelancer: doc.freelancer, amountPaise, razorpayOrderId: order.id });
        res.json({ keyId: process.env.RAZORPAY_KEY_ID, orderId: order.id, amount: amountPaise, currency: 'INR' });
    }));
    router.post('/payments/:kind/:id/verify', auth, role('client'), wrap(async (req, res) => {
        const { kind, id } = req.params;
        if (!['contract', 'order'].includes(kind) || !validId(id))
            return fail(res, 'Invalid work item');
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every(x => typeof x === 'string' && x.length > 5))
            return fail(res, 'Missing payment details');
        const record = await Payment.findOne({ kind, workId: id, client: req.user.id, razorpayOrderId: razorpay_order_id });
        if (!record)
            return fail(res, 'Payment order not found', 404);
        if (record.status === 'paid')
            return res.json({ status: 'paid' });
        const client = razorpayClient();
        if (!client)
            return fail(res, 'Razorpay test credentials are not configured', 503);
        const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(record.razorpayOrderId + '|' + razorpay_payment_id).digest('hex');
        if (!/^[a-f0-9]{64}$/i.test(razorpay_signature) || !crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(razorpay_signature, 'hex')))
            return fail(res, 'Invalid payment signature', 400);
        const gatewayPayment = await client.payments.fetch(razorpay_payment_id);
        if (gatewayPayment.order_id !== record.razorpayOrderId || gatewayPayment.status !== 'captured' || gatewayPayment.amount !== record.amountPaise || gatewayPayment.currency !== 'INR')
            return fail(res, 'Payment not captured or details mismatch', 409);
        const another = await Payment.exists({ kind, workId: id, status: 'paid', _id: { $ne: record._id } });
        if (another)
            return fail(res, 'Already paid', 409);
        await Payment.updateOne({ _id: record._id, status: 'created' }, { $set: { status: 'paid', razorpayPaymentId: razorpay_payment_id } });
        res.json({ status: 'paid' });
    }));
    router.get('/payments/mine', auth, wrap(async (req, res) => {
        const rows = await Payment.find({ [req.user.role]: req.user.id, status: 'paid' }).select('kind workId amountPaise status createdAt razorpayPaymentId').sort({ createdAt: -1 }).limit(100);
        res.json(rows);
    }));
}
