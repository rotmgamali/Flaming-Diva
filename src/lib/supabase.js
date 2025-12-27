/**
 * Supabase Client Configuration
 * Initialize and export Supabase client for auth and database operations
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// AUTH FUNCTIONS
// ============================================

/**
 * Sign up with email and password
 */
export async function signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata  // firstName, lastName, etc.
        }
    })
    return { data, error }
}

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })
    return { data, error }
}

/**
 * Sign out current user
 */
export async function signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
}

/**
 * Get current session
 */
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
}

/**
 * Get current user
 */
export async function getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
}

/**
 * Reset password (send email)
 */
export async function resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/account.html`
    })
    return { data, error }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword
    })
    return { data, error }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session)
    })
}

// ============================================
// PRODUCTS FUNCTIONS
// ============================================

/**
 * Get all products
 */
export async function getProducts(options = {}) {
    let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)

    if (options.category) {
        query = query.eq('category', options.category)
    }
    if (options.collection) {
        query = query.eq('collection', options.collection)
    }
    if (options.limit) {
        query = query.limit(options.limit)
    }
    if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true })
    }

    const { data, error } = await query
    return { data, error }
}

/**
 * Get single product by ID or slug
 */
export async function getProduct(idOrSlug) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .single()
    return { data, error }
}

/**
 * Search products
 */
export async function searchProducts(query) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .ilike('name', `%${query}%`)
    return { data, error }
}

// ============================================
// CART FUNCTIONS (Server-side cart for logged-in users)
// ============================================

/**
 * Get user's cart
 */
export async function getCart() {
    const { user } = await getUser()
    if (!user) return { data: [], error: null }

    const { data, error } = await supabase
        .from('cart_items')
        .select(`
            *,
            product:products(*)
        `)
        .eq('user_id', user.id)

    return { data, error }
}

/**
 * Add item to cart
 */
export async function addToCartDB(productId, size, quantity = 1) {
    const { user } = await getUser()
    if (!user) return { data: null, error: { message: 'Not authenticated' } }

    // Check if item already exists
    const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('size', size)
        .single()

    if (existing) {
        // Update quantity
        const { data, error } = await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + quantity })
            .eq('id', existing.id)
            .select()
        return { data, error }
    }

    // Insert new item
    const { data, error } = await supabase
        .from('cart_items')
        .insert({
            user_id: user.id,
            product_id: productId,
            size,
            quantity
        })
        .select()

    return { data, error }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(cartItemId, quantity) {
    if (quantity <= 0) {
        return removeCartItem(cartItemId)
    }

    const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .select()

    return { data, error }
}

/**
 * Remove item from cart
 */
export async function removeCartItem(cartItemId) {
    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)

    return { error }
}

/**
 * Clear entire cart
 */
export async function clearCart() {
    const { user } = await getUser()
    if (!user) return { error: null }

    const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

    return { error }
}

// ============================================
// WISHLIST FUNCTIONS
// ============================================

/**
 * Get user's wishlist
 */
export async function getWishlist() {
    const { user } = await getUser()
    if (!user) return { data: [], error: null }

    const { data, error } = await supabase
        .from('wishlist')
        .select(`
            *,
            product:products(*)
        `)
        .eq('user_id', user.id)

    return { data, error }
}

/**
 * Add product to wishlist
 */
export async function addToWishlist(productId) {
    const { user } = await getUser()
    if (!user) return { data: null, error: { message: 'Not authenticated' } }

    const { data, error } = await supabase
        .from('wishlist')
        .insert({
            user_id: user.id,
            product_id: productId
        })
        .select()

    return { data, error }
}

/**
 * Remove from wishlist
 */
export async function removeFromWishlist(productId) {
    const { user } = await getUser()
    if (!user) return { error: null }

    const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

    return { error }
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(productId) {
    const { user } = await getUser()
    if (!user) return false

    const { data } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single()

    return !!data
}

// ============================================
// ORDERS FUNCTIONS
// ============================================

/**
 * Get user's orders
 */
export async function getOrders() {
    const { user } = await getUser()
    if (!user) return { data: [], error: null }

    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items(
                *,
                product:products(*)
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return { data, error }
}

/**
 * Get single order
 */
export async function getOrder(orderId) {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items(
                *,
                product:products(*)
            )
        `)
        .eq('id', orderId)
        .single()

    return { data, error }
}

/**
 * Create order (called after successful payment)
 */
export async function createOrder(orderData) {
    const { user } = await getUser()
    if (!user) return { data: null, error: { message: 'Not authenticated' } }

    const { data, error } = await supabase
        .from('orders')
        .insert({
            user_id: user.id,
            ...orderData
        })
        .select()
        .single()

    return { data, error }
}

// ============================================
// PROFILE FUNCTIONS
// ============================================

/**
 * Get user profile
 */
export async function getProfile() {
    const { user } = await getUser()
    if (!user) return { data: null, error: null }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return { data, error }
}

/**
 * Update user profile
 */
export async function updateProfile(updates) {
    const { user } = await getUser()
    if (!user) return { data: null, error: { message: 'Not authenticated' } }

    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

    return { data, error }
}

// Export default for convenience
export default supabase
