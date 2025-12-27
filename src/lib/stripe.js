/**
 * Stripe Integration for Flaming Diva
 * Client-side Stripe functionality
 */

import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''

let stripePromise = null

/**
 * Get Stripe instance (singleton)
 */
export function getStripe() {
    if (!stripePromise && stripePublishableKey) {
        stripePromise = loadStripe(stripePublishableKey)
    }
    return stripePromise
}

/**
 * Create Checkout Session and redirect to Stripe
 * For production, this should call your serverless function
 */
export async function createCheckoutSession(cartItems, customerEmail) {
    const stripe = await getStripe()
    if (!stripe) {
        throw new Error('Stripe not configured')
    }

    // Format items for Stripe
    const lineItems = cartItems.map(item => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: item.name,
                description: `Size: ${item.size}`,
                images: item.image ? [`${window.location.origin}/${item.image}`] : []
            },
            unit_amount: item.price // Price in cents
        },
        quantity: item.quantity
    }))

    // In production, you'd call your serverless function here:
    // const response = await fetch('/api/create-checkout-session', {
    //     method: 'POST',
    //     body: JSON.stringify({ items: lineItems, customerEmail })
    // })
    // const { sessionId } = await response.json()

    // For now, use Stripe Elements or redirect to a simple checkout
    // This is a placeholder - actual implementation requires server-side code

    return { lineItems, customerEmail }
}

/**
 * Redirect to Stripe Checkout
 * Requires a server-side endpoint to create the session
 */
export async function redirectToCheckout(sessionId) {
    const stripe = await getStripe()
    if (!stripe) {
        throw new Error('Stripe not configured')
    }

    const { error } = await stripe.redirectToCheckout({ sessionId })

    if (error) {
        console.error('Stripe redirect error:', error)
        throw error
    }
}

/**
 * Format price from cents to display string
 */
export function formatPrice(cents, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(cents / 100)
}

/**
 * Parse price string to cents
 * e.g., "$1,295 USD" -> 129500
 */
export function parsePrice(priceString) {
    const numericString = priceString.replace(/[^0-9.]/g, '')
    return Math.round(parseFloat(numericString) * 100)
}

export default { getStripe, createCheckoutSession, redirectToCheckout, formatPrice, parsePrice }
