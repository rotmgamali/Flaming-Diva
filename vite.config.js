import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    root: './',
    base: './',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                product: resolve(__dirname, 'product.html'),
                collections: resolve(__dirname, 'collections.html'),
                checkout: resolve(__dirname, 'checkout.html'),
                login: resolve(__dirname, 'login.html'),
                register: resolve(__dirname, 'register.html'),
                account: resolve(__dirname, 'account.html'),
                orders: resolve(__dirname, 'orders.html'),
                wishlist: resolve(__dirname, 'wishlist.html'),
                about: resolve(__dirname, 'about.html'),
                contact: resolve(__dirname, 'contact.html'),
                privacy: resolve(__dirname, 'privacy.html'),
                terms: resolve(__dirname, 'terms.html'),
                admin: resolve(__dirname, 'admin.html'),
                success: resolve(__dirname, 'success.html'),
                notfound: resolve(__dirname, '404.html'),
            }
        }
    },
    server: {
        port: 3000,
        open: true
    }
})
