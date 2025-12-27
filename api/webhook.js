/**
 * Stripe Webhook Handler
 * 
 * This handles Stripe webhook events to update order status in Supabase
 * 
 * For Vercel: Place in /api/webhook.js
 * For Netlify: Place in /netlify/functions/webhook.js
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for server-side
);

// Webhook secret from Stripe dashboard
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
            req.body, // Raw body needed for signature verification
            sig,
            endpointSecret
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            await handleCheckoutComplete(session);
            break;
        }
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            break;
        }
        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object;
            console.error('Payment failed:', paymentIntent.id);
            break;
        }
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
}

async function handleCheckoutComplete(session) {
    try {
        const userId = session.metadata?.userId;
        const customerEmail = session.customer_email || session.customer_details?.email;

        // Generate order number
        const orderNumber = `FD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        // Get line items from the session
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

        // Calculate totals (all in cents)
        const subtotal = session.amount_subtotal;
        const total = session.amount_total;
        const shipping = session.total_details?.amount_shipping || 0;
        const tax = session.total_details?.amount_tax || 0;

        // Get shipping address
        const shippingAddress = session.shipping_details?.address || {};

        // Create order in Supabase
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                order_number: orderNumber,
                user_id: userId !== 'guest' ? userId : null,
                status: 'paid',
                subtotal,
                tax,
                shipping,
                total,
                currency: session.currency.toUpperCase(),
                shipping_name: session.shipping_details?.name,
                shipping_email: customerEmail,
                shipping_address_line1: shippingAddress.line1,
                shipping_address_line2: shippingAddress.line2,
                shipping_city: shippingAddress.city,
                shipping_state: shippingAddress.state,
                shipping_postal_code: shippingAddress.postal_code,
                shipping_country: shippingAddress.country,
                stripe_checkout_session_id: session.id,
                stripe_payment_intent_id: session.payment_intent
            })
            .select()
            .single();

        if (orderError) {
            console.error('Error creating order:', orderError);
            return;
        }

        // Create order items (simplified - you might want to store more product details)
        for (const item of lineItems.data) {
            await supabase
                .from('order_items')
                .insert({
                    order_id: order.id,
                    product_name: item.description,
                    price: item.amount_total / item.quantity,
                    quantity: item.quantity,
                    size: 'M' // You'd extract this from the description or metadata
                });
        }

        // Clear user's cart if logged in
        if (userId && userId !== 'guest') {
            await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', userId);
        }

        console.log(`Order ${orderNumber} created successfully`);

    } catch (error) {
        console.error('Error handling checkout complete:', error);
    }
}

module.exports = handler;
module.exports.handler = handler;
