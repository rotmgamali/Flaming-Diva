/**
 * Stripe Checkout Session API
 * 
 * This file is designed to work with:
 * - Vercel Serverless Functions
 * - Netlify Functions
 * - Or any Node.js serverless platform
 * 
 * Deploy this to your serverless platform of choice.
 * 
 * For Vercel: Place in /api/create-checkout-session.js
 * For Netlify: Place in /netlify/functions/create-checkout-session.js
 */

// For Vercel/Netlify, use require instead of import
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Success and cancel URLs
const DOMAIN = process.env.DOMAIN || 'http://localhost:3000';

async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { items, customerEmail, userId } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items in cart' });
        }

        // Format line items for Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: item.size ? `Size: ${item.size}` : undefined,
                    images: item.image ? [`${DOMAIN}/${item.image}`] : []
                },
                unit_amount: item.price // Price should already be in cents
            },
            quantity: item.quantity || 1
        }));

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${DOMAIN}/checkout.html`,
            customer_email: customerEmail,
            metadata: {
                userId: userId || 'guest'
            },
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB', 'AU', 'VN']
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 0,
                            currency: 'usd'
                        },
                        display_name: 'Complimentary Shipping',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 5
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 7
                            }
                        }
                    }
                },
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 2500, // $25
                            currency: 'usd'
                        },
                        display_name: 'Express Shipping',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 2
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 3
                            }
                        }
                    }
                }
            ]
        });

        return res.status(200).json({
            sessionId: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('Stripe error:', error);
        return res.status(500).json({
            error: 'Failed to create checkout session',
            message: error.message
        });
    }
}

// Export for different platforms
module.exports = handler;
module.exports.handler = handler;

// For ES modules (Vercel)
// export default handler;
