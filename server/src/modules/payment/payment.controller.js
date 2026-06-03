import Stripe from 'stripe';
import { asyncHandler } from '../../utils/asyncHandler.js';
import Order from '../../models/order.model.js';
import Auction from '../../models/auction.model.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export const createCheckoutSession = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate('auction');
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You are not authorized to pay for this order' });
    }

    if (order.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Order is no longer pending' });
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: order.auction.title,
                        images: order.auction.images?.length > 0 ? [order.auction.images[0]] : [],
                    },
                    unit_amount: Math.round(order.amount * 100), // Stripe expects cents
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
        cancel_url: `${process.env.FRONTEND_URL}/dashboard?payment=cancelled`,
        client_reference_id: order._id.toString(),
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.status(200).json({ success: true, url: session.url });
});

export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, // Make sure body parser is raw for this endpoint
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.client_reference_id;

        if (orderId) {
            await Order.findByIdAndUpdate(orderId, {
                status: 'paid',
                paymentDate: new Date()
            });
        }
    }

    res.status(200).json({ received: true });
};
