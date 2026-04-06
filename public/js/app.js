// CoffeePOS – core class: constructor, init, bindEvents, navigate, utilities
// Prototype methods are added by the files loaded after this one.

class CoffeePOS {
    constructor() {
        this.data         = getData();
        this.cart         = [];
        this.currentPage  = 'pos';
        this.currentCategory = 'all';
        this.currentUser  = null;
        this.editingItem  = null;
        this.editingUser  = null;
        this.viewingOrder = null;
        this.socket       = null;
        this.onlineUsers  = new Map();
        this.init();
    }

    async init() {
        await this.initSocket();
        this.checkAuth();
        this.bindEvents();
        
        // Load data from API if user is logged in
        if (this.currentUser) {
            await this.loadDataFromAPI();
            this.showApp();
        }
    }

    // Load all data from API instead of localStorage
    async loadDataFromAPI() {
        try {
            console.log('📥 Loading data from API...');

            // Load products and transform to match frontend structure
            const productsResult = await this.apiRequest('/api/products?page=1&limit=1000');
            if (productsResult.success) {
                // Transform API response to match frontend structure
                this.data.products = productsResult.products.map(p => ({
                    id: p.id,
                    name: p.name,
                    name_km: p.name_km,
                    category: p.category_id, // Map category_id to category
                    price: p.price,
                    salePrice: p.salePrice,
                    image: p.image,
                    icon: p.icon,
                    description: p.description,
                    active: p.active
                }));
                console.log(`✅ Loaded ${productsResult.products.length} products`);
            }

            // Load categories
            const categoriesResult = await this.apiRequest('/api/categories');
            if (categoriesResult.success) {
                this.data.categories = categoriesResult.categories;
                console.log(`✅ Loaded ${categoriesResult.categories.length} categories`);
            }

            // Load orders (for orders page)
            const ordersResult = await this.apiRequest('/api/orders?page=1&limit=100');
            if (ordersResult.success) {
                this.data.orders = ordersResult.orders;
                console.log(`✅ Loaded ${ordersResult.orders.length} orders`);
            }

            // Load settings
            const settingsResult = await this.apiRequest('/api/settings');
            if (settingsResult.success) {
                this.data.settings = settingsResult.settings;
                console.log('✅ Loaded settings');
            }

            console.log('🎉 All data loaded from API successfully!');
        } catch (error) {
            console.error('❌ Error loading data from API:', error);
            this.showToast('កំហុសក្នុងការទាញយកទិន្នន័យ!', 'error');
        }
    }

    bindEvents() {
        // Auth
        document.getElementById('loginForm').addEventListener('submit', e => { e.preventDefault(); this.login(); });
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', e => { e.preventDefault(); this.navigate(item.dataset.page); });
        });

        // POS
        document.getElementById('searchProduct').addEventListener('input', () => this.renderProducts());
        document.getElementById('clearCartBtn').addEventListener('click', () => this.clearCart());
        document.getElementById('discountPercent').addEventListener('input', () => {
            document.getElementById('saleAmount').value = '';
            this.updateCartTotals();
        });
        document.getElementById('saleAmount').addEventListener('input', () => {
            document.getElementById('discountPercent').value = '';
            this.updateCartTotals();
        });
        document.getElementById('checkoutBtn').addEventListener('click', () => this.openCheckout());
        document.getElementById('confirmPaymentBtn').addEventListener('click', () => this.confirmPayment());
        document.getElementById('amountReceived').addEventListener('input', () => this.calculateChange());
        document.querySelectorAll('.payment-method').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.payment-method').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        document.getElementById('newOrderBtn').addEventListener('click', () => this.clearCart());

        // Items
        document.getElementById('addItemBtn').addEventListener('click', () => this.openItemModal());
        document.getElementById('itemForm').addEventListener('submit', e => { e.preventDefault(); this.saveItem(); });
        document.getElementById('searchItem').addEventListener('input', () => this.renderItems());
        document.getElementById('filterCategory').addEventListener('change', () => this.renderItems());
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        if (uploadPlaceholder) {
            uploadPlaceholder.addEventListener('click', () => document.getElementById('itemImageFile').click());
        }

        // Categories (now accessed from Items page)
        document.getElementById('manageCategoriesBtn').addEventListener('click', () => this.openCategoryManagement());
        document.getElementById('categoryForm').addEventListener('submit', e => { e.preventDefault(); this.saveCategory(); });

        // Users
        document.getElementById('addUserBtn').addEventListener('click', () => this.openUserModal());
        document.getElementById('userForm').addEventListener('submit', e => { e.preventDefault(); this.saveUser(); });

        // Orders
        document.getElementById('orderStartDate').addEventListener('change', () => this.renderOrders());
        document.getElementById('orderEndDate').addEventListener('change', () => this.renderOrders());
        document.getElementById('orderStaffFilter').addEventListener('change', () => this.renderOrders());
        document.getElementById('exportOrdersBtn').addEventListener('click', () => this.exportOrders());
        document.getElementById('printOrderBtn').addEventListener('click', () => this.printOrder());

        // Reports
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateReports());
        document.getElementById('reportStartDate').addEventListener('change', () => this.generateReports());
        document.getElementById('reportEndDate').addEventListener('change', () => this.generateReports());

        // Modals
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', e => { e.preventDefault(); this.closeAllModals(); });
        });
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', e => { if (e.target === modal) this.closeAllModals(); });
        });
    }

    navigate(page) {
        if (this.currentUser.role !== 'admin') {
            const perms = this.currentUser.permissions || [];
            if (page === 'items'   && !perms.includes('items'))   { this.showToast('អ្នកមិនមានសិទ្ធិចូលមើលផ្នែកនេះទេ!', 'error'); return; }
            if (page === 'orders'  && !perms.includes('orders'))  { this.showToast('អ្នកមិនមានសិទ្ធិចូលមើលផ្នែកនេះទេ!', 'error'); return; }
            if (page === 'reports' && !perms.includes('reports')) { this.showToast('អ្នកមិនមានសិទ្ធិចូលមើលផ្នែកនេះទេ!', 'error'); return; }
            if (page === 'users')  { this.showToast('មានតែ Admin ទេដែលអាចចូលផ្នែកនេះ!', 'error'); return; }
        }

        this.currentPage = page;

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        document.querySelectorAll('.page').forEach(p => {
            p.classList.add('hidden');
            p.classList.remove('active');
        });
        document.getElementById(page + 'Page').classList.remove('hidden');
        document.getElementById(page + 'Page').classList.add('active');

        switch (page) {
            case 'pos':        this.renderCategoryButtons(); this.renderProducts(); break;
            case 'items':      this.renderItems();      break;
            case 'orders':     this.renderOrders();     break;
            case 'reports':    this.generateReports();  break;
            case 'users':      this.renderUsers();      break;
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        this.viewingOrder = null;
    }

    showToast(message, type = 'success') {
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle' };
        const toast = document.getElementById('toast');
        toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
        toast.className = `toast ${type}`;
        setTimeout(() => toast.classList.add('hidden'), 3000);
    }
}
