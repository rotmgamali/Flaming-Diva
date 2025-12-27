/**
 * Flaming Diva - Custom Jackets
 * JavaScript - Enhanced E-commerce Functionality
 */

// Product catalog for search and filtering
const productCatalog = [
    {
        id: 1,
        name: 'Third Eye Patched Leather',
        price: 1295,
        priceText: '$1,295 USD',
        category: 'leather',
        image: 'images/product-1.jpg',
        hoverImage: 'images/product-1-hover.jpg',
        collection: 'inferno',
        isNew: true
    },
    {
        id: 2,
        name: 'Hip-Hop Legends Bomber',
        price: 895,
        priceText: '$895 USD',
        category: 'bomber',
        image: 'images/product-2.jpg',
        hoverImage: 'images/product-2-hover.jpg',
        collection: 'inferno',
        isNew: true
    },
    {
        id: 3,
        name: 'Rock Icons Varsity',
        price: 695,
        priceText: '$695 USD',
        category: 'varsity',
        image: 'images/product-3.jpg',
        hoverImage: 'images/product-3-hover.jpg',
        collection: 'inferno',
        isNew: true
    },
    {
        id: 4,
        name: 'Cosmic Visions Trucker',
        price: 995,
        priceText: '$995 USD',
        category: 'trucker',
        image: 'images/product-4.jpg',
        hoverImage: 'images/product-4-hover.jpg',
        collection: 'inferno',
        isNew: true
    },
    {
        id: 5,
        name: 'Snake & Skull Denim',
        price: 595,
        priceText: '$595 USD',
        category: 'denim',
        image: 'images/essential-1.jpg',
        hoverImage: 'images/essential-1.jpg',
        collection: 'essentials',
        isNew: false
    },
    {
        id: 6,
        name: 'Grateful Spirit Canvas',
        price: 495,
        priceText: '$495 USD',
        category: 'canvas',
        image: 'images/essential-2.jpg',
        hoverImage: 'images/essential-2.jpg',
        collection: 'essentials',
        isNew: false
    },
    {
        id: 7,
        name: 'Zen Master Coach',
        price: 395,
        priceText: '$395 USD',
        category: 'coach',
        image: 'images/essential-3.jpg',
        hoverImage: 'images/essential-3.jpg',
        collection: 'essentials',
        isNew: false
    },
    {
        id: 8,
        name: 'Acid Trip Field Jacket',
        price: 450,
        priceText: '$450 USD',
        category: 'field',
        image: 'images/essential-4.jpg',
        hoverImage: 'images/essential-4.jpg',
        collection: 'essentials',
        isNew: false
    },
    {
        id: 9,
        name: 'Mystic Eye Patched Leather',
        price: 1195,
        priceText: '$1,195 USD',
        category: 'leather',
        image: 'images/look-1.jpg',
        hoverImage: 'images/look-1.jpg',
        collection: 'inferno',
        isNew: false
    },
    {
        id: 10,
        name: 'Psychedelic Dreams Bomber',
        price: 945,
        priceText: '$945 USD',
        category: 'bomber',
        image: 'images/look-2.jpg',
        hoverImage: 'images/look-2.jpg',
        collection: 'phoenix',
        isNew: false
    },
    {
        id: 11,
        name: 'Rock Legend Varsity',
        price: 795,
        priceText: '$795 USD',
        category: 'varsity',
        image: 'images/look-3.jpg',
        hoverImage: 'images/look-3.jpg',
        collection: 'phoenix',
        isNew: false
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initSearch();
    initCart();
    initNewsletter();
    initFilters();
    initCollectionTabs();
    initSorting();
    initQuickAdd();
    initSizeGuide();
    loadCartFromStorage();
});

// Collection Tabs Filtering
function initCollectionTabs() {
    const tabs = document.querySelectorAll('.collection-tab');
    const products = document.querySelectorAll('.product-card[data-collection]');
    const countEl = document.querySelector('.collection-count');

    if (tabs.length === 0) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const collection = tab.dataset.collection;
            let visibleCount = 0;

            products.forEach(product => {
                if (collection === 'all' || product.dataset.collection === collection) {
                    product.style.display = '';
                    visibleCount++;
                } else {
                    product.style.display = 'none';
                }
            });

            // Update product count
            if (countEl) {
                countEl.textContent = `${visibleCount} Products`;
            }
        });
    });
}

// Global toggle functions for inline onclick handlers (mobile-friendly)
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const toggle = document.getElementById('nav-toggle');

    console.log('toggleMobileMenu called', menu, toggle);

    if (!menu) {
        console.error('mobile-menu not found');
        return;
    }

    const isActive = menu.classList.contains('active');
    console.log('isActive:', isActive);

    if (isActive) {
        menu.classList.remove('active');
        document.body.classList.remove('no-scroll');
        if (toggle) {
            toggle.classList.remove('active');
        }
    } else {
        menu.classList.add('active');
        document.body.classList.add('no-scroll');
        if (toggle) {
            toggle.classList.add('active');
        }
    }
}

function toggleCart() {
    const cartDrawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('overlay');

    if (!cartDrawer) return;

    const isActive = cartDrawer.classList.contains('active');

    if (isActive) {
        cartDrawer.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    } else {
        cartDrawer.classList.add('active');
        if (overlay) overlay.classList.add('active');
        document.body.classList.add('no-scroll');
    }
}

// Header scroll behavior - Fear of God Style
// Homepage: invisible at top, solid on scroll
// Other pages: semi-transparent at top, solid on scroll
function initHeader() {
    const header = document.getElementById('header');
    const announcementBar = document.querySelector('.announcement-bar');
    const scrollThreshold = 100; // How far to scroll before header appears

    // Check if we're on the homepage
    const isHomepage = window.location.pathname === '/' ||
        window.location.pathname.endsWith('index.html') ||
        window.location.pathname === '/index.html';

    if (!header) return;

    // Apply semi-transparent style for non-homepage pages
    if (!isHomepage) {
        header.classList.add('semi-transparent');
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            // User has scrolled - show solid header and announcement bar
            header.classList.add('scrolled');
            if (announcementBar) {
                announcementBar.classList.add('visible');
            }
        } else {
            // At top of page - transparent/semi-transparent header, no announcement bar
            header.classList.remove('scrolled');
            if (announcementBar) {
                announcementBar.classList.remove('visible');
            }
        }
    });

    // Initial state check (in case page loads scrolled)
    if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled');
        if (announcementBar) {
            announcementBar.classList.add('visible');
        }
    }
}

// Mobile menu
function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('mobile-menu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        const isActive = menu.classList.contains('active');

        if (isActive) {
            menu.classList.remove('active');
            document.body.classList.remove('no-scroll');
            toggle.querySelector('span:first-child').style.transform = '';
            toggle.querySelector('span:last-child').style.transform = '';
        } else {
            menu.classList.add('active');
            document.body.classList.add('no-scroll');
            toggle.querySelector('span:first-child').style.transform = 'rotate(45deg) translate(4px, 4px)';
            toggle.querySelector('span:last-child').style.transform = 'rotate(-45deg)';
        }
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });
}

// Enhanced Search with live results
function initSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const searchClose = document.getElementById('search-close');
    const searchInput = searchOverlay?.querySelector('input');

    if (!searchBtn || !searchOverlay) return;

    // Create search results container if it doesn't exist
    let searchResults = searchOverlay.querySelector('.search-results');
    if (!searchResults) {
        searchResults = document.createElement('div');
        searchResults.className = 'search-results';
        const searchForm = searchOverlay.querySelector('.search-form');
        if (searchForm) {
            searchForm.parentNode.insertBefore(searchResults, searchForm.nextSibling);
        }
    }

    searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
        if (searchInput) setTimeout(() => searchInput.focus(), 100);
    });

    if (searchClose) {
        searchClose.addEventListener('click', () => {
            closeSearch();
        });
    }

    // Live search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            performSearch(query, searchResults);
        });

        // Search on enter
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.toLowerCase().trim();
                if (query) {
                    // Navigate to collections with search query
                    window.location.href = `collections.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            closeSearch();
        }
    });

    function closeSearch() {
        searchOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
        if (searchInput) searchInput.value = '';
        if (searchResults) searchResults.innerHTML = '';
    }
}

function performSearch(query, resultsContainer) {
    if (!resultsContainer) return;

    if (!query || query.length < 2) {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
        return;
    }

    const results = productCatalog.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.collection.toLowerCase().includes(query)
    );

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="search-no-results">
                <p>No products found for "${query}"</p>
            </div>
        `;
        resultsContainer.style.display = 'block';
        return;
    }

    resultsContainer.innerHTML = `
        <div class="search-results-header">
            <span>Products (${results.length})</span>
        </div>
        <div class="search-results-grid">
            ${results.slice(0, 6).map(product => `
                <a href="product.html?id=${product.id}" class="search-result-item">
                    <div class="search-result-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="search-result-info">
                        <span class="search-result-name">${product.name}</span>
                        <span class="search-result-price">${product.priceText}</span>
                    </div>
                </a>
            `).join('')}
        </div>
        ${results.length > 6 ? `
            <a href="collections.html?search=${encodeURIComponent(query)}" class="search-view-all">
                View all ${results.length} results
            </a>
        ` : ''}
    `;
    resultsContainer.style.display = 'block';
}

// Cart drawer
function initCart() {
    const cartToggle = document.getElementById('cart-toggle');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartClose = document.getElementById('cart-close');
    const overlay = document.getElementById('overlay');
    const checkoutBtn = document.querySelector('.checkout-btn');

    if (!cartToggle || !cartDrawer) return;

    cartToggle.addEventListener('click', () => {
        openCart();
    });

    const closeCart = () => {
        cartDrawer.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    };

    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (overlay) overlay.addEventListener('click', closeCart);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartDrawer.classList.contains('active')) {
            closeCart();
        }
    });

    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                window.location.href = 'checkout.html';
            }
        });
    }
}

function openCart() {
    const cartDrawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('overlay');
    if (cartDrawer) cartDrawer.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.classList.add('no-scroll');
}

// Cart state with localStorage persistence
let cart = [];

function loadCartFromStorage() {
    try {
        const saved = localStorage.getItem('flamingDivaCart');
        if (saved) {
            cart = JSON.parse(saved);
            updateCartUI();
        }
    } catch (e) {
        console.warn('Could not load cart from storage:', e);
    }
}

function saveCartToStorage() {
    try {
        localStorage.setItem('flamingDivaCart', JSON.stringify(cart));
    } catch (e) {
        console.warn('Could not save cart to storage:', e);
    }
}

function addToCart(item) {
    // Check if same item (name + size) already exists
    const existingItem = cart.find(i => i.name === item.name && i.size === item.size);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        // Generate unique ID for cart item
        item.id = Date.now() + Math.random().toString(36).substr(2, 9);
        item.quantity = item.quantity || 1;
        cart.push(item);
    }

    saveCartToStorage();
    updateCartUI();
    openCart();
}

function updateCartUI() {
    const countEl = document.querySelector('.cart-count');
    const contentEl = document.getElementById('cart-content');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.querySelector('.checkout-btn');

    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    if (countEl) countEl.textContent = totalItems;

    if (cart.length === 0) {
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="cart-empty">
                    <p>Your cart is currently empty.</p>
                    <a href="index.html" class="continue-shopping">Continue Shopping</a>
                </div>
            `;
        }
        if (totalEl) totalEl.textContent = '$0.00';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach((item) => {
        const priceNum = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
        total += priceNum * (item.quantity || 1);

        html += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
                </div>
                <div class="cart-item-details">
                    <p class="cart-item-name">${item.name}</p>
                    <p class="cart-item-size">Size: ${item.size || 'One Size'}</p>
                    <p class="cart-item-price">${item.price}</p>
                    <div class="cart-item-quantity">
                        <button class="qty-btn minus" onclick="updateQuantity('${item.id}', -1)">−</button>
                        <span class="qty-value">${item.quantity || 1}</span>
                        <button class="qty-btn plus" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Remove item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
    });

    if (contentEl) contentEl.innerHTML = html;
    if (totalEl) totalEl.textContent = `$${total.toLocaleString()} USD`;
    if (checkoutBtn) checkoutBtn.disabled = false;
}

function updateQuantity(itemId, delta) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity = (item.quantity || 1) + delta;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCartToStorage();
            updateCartUI();
        }
    }
}

function removeFromCart(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    saveCartToStorage();
    updateCartUI();
}

// Newsletter
function initNewsletter() {
    const form = document.getElementById('newsletter-form');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input');
        const btn = form.querySelector('button');

        if (input && input.value) {
            btn.innerHTML = '✓';
            input.value = '';
            input.placeholder = 'Thank you!';
            input.disabled = true;

            setTimeout(() => {
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
                input.placeholder = 'Email Address';
                input.disabled = false;
            }, 3000);
        }
    });
}

// Collection Filters
let activeFilters = {
    category: [],
    collection: [],
    priceRange: null
};

function initFilters() {
    const filterToggle = document.getElementById('filter-toggle');
    if (!filterToggle) return;

    // Check for URL search params
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
        filterProductsBySearch(searchQuery);
        return;
    }

    // Create filter panel if on collections page
    createFilterPanel();

    filterToggle.addEventListener('click', () => {
        const filterPanel = document.getElementById('filter-panel');
        if (filterPanel) {
            filterPanel.classList.toggle('active');
        }
    });
}

function createFilterPanel() {
    const controls = document.querySelector('.collection-controls');
    if (!controls || document.getElementById('filter-panel')) return;

    const filterPanel = document.createElement('div');
    filterPanel.id = 'filter-panel';
    filterPanel.className = 'filter-panel';
    filterPanel.innerHTML = `
        <div class="filter-section">
            <h4>Category</h4>
            <div class="filter-options">
                <label class="filter-option">
                    <input type="checkbox" value="leather" onchange="applyFilter('category', 'leather', this.checked)">
                    <span>Leather Jackets</span>
                </label>
                <label class="filter-option">
                    <input type="checkbox" value="bomber" onchange="applyFilter('category', 'bomber', this.checked)">
                    <span>Bomber Jackets</span>
                </label>
                <label class="filter-option">
                    <input type="checkbox" value="varsity" onchange="applyFilter('category', 'varsity', this.checked)">
                    <span>Varsity Jackets</span>
                </label>
                <label class="filter-option">
                    <input type="checkbox" value="denim" onchange="applyFilter('category', 'denim', this.checked)">
                    <span>Denim Jackets</span>
                </label>
            </div>
        </div>
        <div class="filter-section">
            <h4>Collection</h4>
            <div class="filter-options">
                <label class="filter-option">
                    <input type="checkbox" value="inferno" onchange="applyFilter('collection', 'inferno', this.checked)">
                    <span>Inferno Collection</span>
                </label>
                <label class="filter-option">
                    <input type="checkbox" value="phoenix" onchange="applyFilter('collection', 'phoenix', this.checked)">
                    <span>Phoenix Collection</span>
                </label>
                <label class="filter-option">
                    <input type="checkbox" value="essentials" onchange="applyFilter('collection', 'essentials', this.checked)">
                    <span>Essentials</span>
                </label>
            </div>
        </div>
        <div class="filter-section">
            <h4>Price</h4>
            <div class="filter-options">
                <label class="filter-option">
                    <input type="radio" name="price" value="under500" onchange="applyPriceFilter('under500')">
                    <span>Under $500</span>
                </label>
                <label class="filter-option">
                    <input type="radio" name="price" value="500to1000" onchange="applyPriceFilter('500to1000')">
                    <span>$500 - $1,000</span>
                </label>
                <label class="filter-option">
                    <input type="radio" name="price" value="over1000" onchange="applyPriceFilter('over1000')">
                    <span>Over $1,000</span>
                </label>
            </div>
        </div>
        <button class="clear-filters-btn" onclick="clearAllFilters()">Clear All</button>
    `;

    controls.insertAdjacentElement('afterend', filterPanel);
}

function applyFilter(type, value, isChecked) {
    if (isChecked) {
        if (!activeFilters[type].includes(value)) {
            activeFilters[type].push(value);
        }
    } else {
        activeFilters[type] = activeFilters[type].filter(v => v !== value);
    }
    renderFilteredProducts();
}

function applyPriceFilter(range) {
    activeFilters.priceRange = range;
    renderFilteredProducts();
}

function clearAllFilters() {
    activeFilters = { category: [], collection: [], priceRange: null };
    document.querySelectorAll('.filter-panel input').forEach(input => {
        input.checked = false;
    });
    renderFilteredProducts();
}

function filterProductsBySearch(query) {
    const filtered = productCatalog.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.collection.toLowerCase().includes(query.toLowerCase())
    );

    const header = document.querySelector('.collection-header h1');
    if (header) {
        header.textContent = `Search: "${query}"`;
    }

    const count = document.querySelector('.collection-count');
    if (count) {
        count.textContent = `${filtered.length} Products`;
    }

    renderProductGrid(filtered);
}

function renderFilteredProducts() {
    let filtered = [...productCatalog];

    // Apply category filter
    if (activeFilters.category.length > 0) {
        filtered = filtered.filter(p => activeFilters.category.includes(p.category));
    }

    // Apply collection filter
    if (activeFilters.collection.length > 0) {
        filtered = filtered.filter(p => activeFilters.collection.includes(p.collection));
    }

    // Apply price filter
    if (activeFilters.priceRange) {
        switch (activeFilters.priceRange) {
            case 'under500':
                filtered = filtered.filter(p => p.price < 500);
                break;
            case '500to1000':
                filtered = filtered.filter(p => p.price >= 500 && p.price <= 1000);
                break;
            case 'over1000':
                filtered = filtered.filter(p => p.price > 1000);
                break;
        }
    }

    // Update count
    const count = document.querySelector('.collection-count');
    if (count) {
        count.textContent = `${filtered.length} Products`;
    }

    renderProductGrid(filtered);
}

function renderProductGrid(products) {
    const grid = document.querySelector('.collection-grid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <p>No products match your filters.</p>
                <button onclick="clearAllFilters()">Clear Filters</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map(product => `
        <article class="product-card" data-id="${product.id}">
            <a href="product.html?id=${product.id}" class="product-link">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    ${product.hoverImage !== product.image ?
            `<img src="${product.hoverImage}" alt="${product.name} - Back" class="product-hover">` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${product.priceText}</p>
                </div>
            </a>
            <button class="quick-add-btn" data-product-id="${product.id}">+ Quick Add</button>
        </article>
    `).join('');

    // Re-init quick add buttons
    initQuickAdd();
}

// Sorting
function initSorting() {
    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', (e) => {
        sortProducts(e.target.value);
    });
}

function sortProducts(sortBy) {
    const grid = document.querySelector('.collection-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.product-card'));

    cards.sort((a, b) => {
        const aName = a.querySelector('.product-name')?.textContent || '';
        const bName = b.querySelector('.product-name')?.textContent || '';
        const aPrice = parseInt(a.querySelector('.product-price')?.textContent.replace(/[^0-9]/g, '') || 0);
        const bPrice = parseInt(b.querySelector('.product-price')?.textContent.replace(/[^0-9]/g, '') || 0);

        switch (sortBy) {
            case 'price-asc':
                return aPrice - bPrice;
            case 'price-desc':
                return bPrice - aPrice;
            case 'newest':
                // In real app, would use date. For now, reverse order
                return -1;
            case 'featured':
            default:
                return 0;
        }
    });

    // Re-append in sorted order
    cards.forEach(card => grid.appendChild(card));
}

// Quick Add with size selection modal
function initQuickAdd() {
    document.querySelectorAll('.quick-add-btn').forEach(btn => {
        // Remove any existing listeners
        btn.replaceWith(btn.cloneNode(true));
    });

    document.querySelectorAll('.quick-add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const card = btn.closest('.product-card');
            const productId = btn.dataset.productId || card?.dataset.id;
            const name = card?.querySelector('.product-name')?.textContent || 'Custom Jacket';
            const priceText = card?.querySelector('.product-price')?.textContent || '$0';
            const image = card?.querySelector('.product-image img')?.src || '';

            showQuickAddModal({
                id: productId,
                name,
                price: priceText,
                image
            });
        });
    });
}

function showQuickAddModal(product) {
    // Remove existing modal if any
    const existingModal = document.getElementById('quick-add-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'quick-add-modal';
    modal.className = 'quick-add-modal';
    modal.innerHTML = `
        <div class="quick-add-overlay"></div>
        <div class="quick-add-content">
            <button class="quick-add-close">&times;</button>
            <div class="quick-add-product">
                <div class="quick-add-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="quick-add-info">
                    <h3>${product.name}</h3>
                    <p class="quick-add-price">${product.price}</p>
                    <div class="quick-add-sizes">
                        <span class="size-label">Select Size:</span>
                        <div class="size-buttons">
                            <button class="quick-size-btn" data-size="XS">XS</button>
                            <button class="quick-size-btn" data-size="S">S</button>
                            <button class="quick-size-btn active" data-size="M">M</button>
                            <button class="quick-size-btn" data-size="L">L</button>
                            <button class="quick-size-btn" data-size="XL">XL</button>
                        </div>
                    </div>
                    <button class="quick-add-to-cart-btn">Add to Bag</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');

    // Animate in
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });

    // Size selection
    modal.querySelectorAll('.quick-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.querySelectorAll('.quick-size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Add to cart
    modal.querySelector('.quick-add-to-cart-btn').addEventListener('click', () => {
        const selectedSize = modal.querySelector('.quick-size-btn.active')?.dataset.size || 'M';

        addToCart({
            name: product.name,
            price: product.price,
            size: selectedSize,
            image: product.image
        });

        closeQuickAddModal();
    });

    // Close handlers
    modal.querySelector('.quick-add-close').addEventListener('click', closeQuickAddModal);
    modal.querySelector('.quick-add-overlay').addEventListener('click', closeQuickAddModal);

    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeQuickAddModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

function closeQuickAddModal() {
    const modal = document.getElementById('quick-add-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.classList.remove('no-scroll');
        }, 300);
    }
}

// Size Guide Modal
function initSizeGuide() {
    const sizeGuideBtn = document.querySelector('.size-guide-btn');
    if (!sizeGuideBtn) return;

    sizeGuideBtn.addEventListener('click', () => {
        showSizeGuideModal();
    });
}

function showSizeGuideModal() {
    const existingModal = document.getElementById('size-guide-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'size-guide-modal';
    modal.className = 'size-guide-modal';
    modal.innerHTML = `
        <div class="size-guide-overlay"></div>
        <div class="size-guide-content">
            <button class="size-guide-close">&times;</button>
            <h2>Size Guide</h2>
            <p class="size-guide-note">All measurements are in inches</p>
            <table class="size-guide-table">
                <thead>
                    <tr>
                        <th>Size</th>
                        <th>Chest</th>
                        <th>Shoulder</th>
                        <th>Sleeve</th>
                        <th>Length</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>XS</td>
                        <td>36-38</td>
                        <td>16.5</td>
                        <td>24</td>
                        <td>25</td>
                    </tr>
                    <tr>
                        <td>S</td>
                        <td>38-40</td>
                        <td>17</td>
                        <td>24.5</td>
                        <td>26</td>
                    </tr>
                    <tr>
                        <td>M</td>
                        <td>40-42</td>
                        <td>17.5</td>
                        <td>25</td>
                        <td>27</td>
                    </tr>
                    <tr>
                        <td>L</td>
                        <td>42-44</td>
                        <td>18</td>
                        <td>25.5</td>
                        <td>28</td>
                    </tr>
                    <tr>
                        <td>XL</td>
                        <td>44-46</td>
                        <td>18.5</td>
                        <td>26</td>
                        <td>29</td>
                    </tr>
                    <tr>
                        <td>XXL</td>
                        <td>46-48</td>
                        <td>19</td>
                        <td>26.5</td>
                        <td>30</td>
                    </tr>
                </tbody>
            </table>
            <div class="size-guide-tips">
                <h4>How to Measure</h4>
                <ul>
                    <li><strong>Chest:</strong> Measure around the fullest part of your chest</li>
                    <li><strong>Shoulder:</strong> Measure from shoulder seam to shoulder seam</li>
                    <li><strong>Sleeve:</strong> Measure from shoulder seam to wrist</li>
                    <li><strong>Length:</strong> Measure from highest point of shoulder to bottom hem</li>
                </ul>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');

    requestAnimationFrame(() => {
        modal.classList.add('active');
    });

    modal.querySelector('.size-guide-close').addEventListener('click', closeSizeGuideModal);
    modal.querySelector('.size-guide-overlay').addEventListener('click', closeSizeGuideModal);

    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeSizeGuideModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

function closeSizeGuideModal() {
    const modal = document.getElementById('size-guide-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.classList.remove('no-scroll');
        }, 300);
    }
}

// Global functions for cart management
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.addToCart = addToCart;
window.applyFilter = applyFilter;
window.applyPriceFilter = applyPriceFilter;
window.clearAllFilters = clearAllFilters;

console.log('Flaming Diva loaded with enhanced functionality');
