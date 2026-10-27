import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { err } from '../lib/format.js';

/** Manage Razorpay test checkout and per-work-item loading state. */
export function usePayments({ user, tab, notify, load }) {
    const [payingKey, setPayingKey] = useState(null), [paidItems, setPaidItems] = useState([]);
    const refreshPayments = async () => { if (!localStorage.getItem('sb_token'))
        return; try {
        const r = await api.get('/payments/mine');
        setPaidItems(r.data);
    }
    catch (e) {
        console.warn('Payment history unavailable');
    } };
    useEffect(() => { if (user)
        refreshPayments();
    else
        setPaidItems([]); }, [user, tab]);
    const loadRazorpay = () => new Promise((resolve, reject) => { if (window.Razorpay)
        return resolve(); const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = resolve; script.onerror = () => reject(new Error('Unable to load Razorpay Checkout')); document.body.appendChild(script); });
    const payForWork = async (kind, item) => { if (payingKey !== null)
        return; setPayingKey(`${kind}:${item._id}`); try {
        const { data } = await api.post(`/payments/${kind}/${item._id}/create-order`);
        await loadRazorpay();
        await new Promise((resolve, reject) => { const checkout = new window.Razorpay({ key: data.keyId, amount: data.amount, currency: 'INR', name: 'SkillBridge', description: `Test payment for ${kind}`, order_id: data.orderId, handler: async (response) => { try {
                await api.post(`/payments/${kind}/${item._id}/verify`, response);
                resolve();
            }
            catch (e) {
                reject(e);
            } }, modal: { ondismiss: () => reject(new Error('Checkout cancelled')) }, theme: { color: '#4456b8' } }); checkout.on('payment.failed', r => reject(new Error(r.error?.description || 'Payment failed'))); checkout.open(); });
        notify('Test payment verified successfully!');
        await refreshPayments();
        await load();
    }
    catch (e) {
        notify(err(e));
    }
    finally {
        setPayingKey(null);
    } };
    const isPaid = (kind, id) => paidItems.some(p => p.kind === kind && p.workId === id);

    return { payingKey, paidItems, payForWork, isPaid, refreshPayments };
}
