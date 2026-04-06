// Coffee POS System - Main Application

class CoffeePOS {
    constructor() {
        this.data = getData();
        this.cart = [];
        this.currentPage = 'pos';
        this.currentCategory = 'all';
        this.currentUser = null;
        this.editingItem = null;
        this.editingUser = null;
        this.viewingOrder = null;
        
        this.init();
    }

    init() {
        this.checkAuth();
        this.bindEvents();
        if (this.currentUser) {
            this.showApp();
        }
    }

    checkAuth() {
        this.currentUser = getCurrentUser();
        if (this.currentUser) {
            document.getElementById('currentUser').textContent = this.currentUser.fullname;
        }
    }

    bindEvents() {
        // Login
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigate(page);
            });
        });

        // Category filter (POS)
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.renderProducts();
            });
        });

        // Search product
        document.getElementById('searchProduct').addEventListener('input', () => {
            this.renderProducts();
        });

        // Cart actions
        document.getElementById('clearCartBtn').addEventListener('click', () => {
            this.clearCart();
        });

        document.getElementById('discountPercent').addEventListener('input', () => {
            document.getElementById('saleAmount').value = '';
            this.updateCartTotals();
        });

        document.getElementById('saleAmount').addEventListener('input', () => {
            document.getElementById('discountPercent').value = '';
            this.updateCartTotals();
        });

        // Checkout
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.openCheckout();
        });

        document.getElementById('confirmPaymentBtn').addEventListener('click', () => {
            this.confirmPayment();
        });

        document.getElementById('amountReceived').addEventListener('input', () => {
            this.calculateChange();
        });

        // Payment methods
        document.querySelectorAll('.payment-method').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.payment-method').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // New order
        document.getElementById('newOrderBtn').addEventListener('click', () => {
            this.clearCart();
        });

        // Item management
        document.getElementById('addItemBtn').addEventListener('click', () => {
            this.openItemModal();
        });

        document.getElementById('itemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveItem();
        });

        // Search and filter items
        document.getElementById('searchItem').addEventListener('input', () => {
            this.renderItems();
        });

        document.getElementById('filterCategory').addEventListener('change', () => {
            this.renderItems();
        });

        // User management
        document.getElementById('addUserBtn').addEventListener('click', () => {
            this.openUserModal();
        });

        document.getElementById('userForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });

        // Reports
        document.getElementById('generateReportBtn').addEventListener('click', () => {
            this.generateReports();
        });

        document.getElementById('reportPeriod').addEventListener('change', () => {
            const customRange = document.getElementById('customDateRange');
            if (document.getElementById('reportPeriod').value === 'custom') {
                customRange.classList.remove('hidden');
            } else {
                customRange.classList.add('hidden');
            }
            this.generateReports();
        });

        document.getElementById('customStartDate').addEventListener('change', () => {
            this.generateReports();
        });

        document.getElementById('customEndDate').addEventListener('change', () => {
            this.generateReports();
        });

        // Order date filter
        document.getElementById('orderDateFilter').addEventListener('change', () => {
            this.renderOrders();
        });

        // Export orders
        document.getElementById('exportOrdersBtn').addEventListener('click', () => {
            this.exportOrders();
        });

        // Print order
        document.getElementById('printOrderBtn').addEventListener('click', () => {
            this.printOrder();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeAllModals();
            });
        });

        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // Image upload drop zone
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        if (uploadPlaceholder) {
            uploadPlaceholder.addEventListener('click', () => {
                document.getElementById('itemImageFile').click();
            });
        }
    }

    // Authentication
    login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const user = this.data.users.find(u => u.username === username && u.password === password);

        if (user) {
            this.currentUser = user;
            setCurrentUser(user);
            document.getElementById('currentUser').textContent = user.fullname;
            this.showToast('ការចូលប្រើប្រាស់ជោគជ័យ!', 'success');
            this.showApp();
        } else {
            this.showToast('ឈ្មោះអ្នកប្រើប្រាស់ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ!', 'error');
        }
    }

    logout() {
        this.currentUser = null;
        setCurrentUser(null);
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('appScreen').classList.add('hidden');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        this.showToast('បានចាកចេញ!', 'success');
    }

    showApp() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('appScreen').classList.remove('hidden');
        this.navigate('pos');
        
        // Hide users nav for non-admin
        if (this.currentUser.role !== 'admin') {
            document.getElementById('usersNav').classList.add('hidden');
        }
    }

    // Navigation
    navigate(page) {
        this.currentPage = page;
        
        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // Update pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.add('hidden');
            p.classList.remove('active');
        });
        document.getElementById(page + 'Page').classList.remove('hidden');
        document.getElementById(page + 'Page').classList.add('active');

        // Load page data
        switch(page) {
            case 'pos':
                this.renderProducts();
                break;
            case 'items':
                this.renderItems();
                break;
            case 'orders':
                this.renderOrders();
                break;
            case 'reports':
                this.generateReports();
                break;
            case 'users':
                this.renderUsers();
                break;
        }
    }

    // Products (POS)
    renderProducts() {
        const grid = document.getElementById('productsGrid');
        const searchTerm = document.getElementById('searchProduct').value.toLowerCase();
        let products = this.data.products.filter(p => p.active);

        if (this.currentCategory !== 'all') {
            products = products.filter(p => p.category === this.currentCategory);
        }

        if (searchTerm) {
            products = products.filter(p => p.name.toLowerCase().includes(searchTerm));
        }

        if (products.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-light);">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
                    <p>គ្មានមុខម្ហូបត្រូវនឹងការស្វែងរក</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = products.map(product => {
            const hasSale = product.salePrice && product.salePrice > 0;
            
            return `
                <div class="product-card" data-id="${product.id}" onclick="pos.addToCart(${product.id})">
                    ${product.image 
                        ? `<img src="${product.image}" alt="${product.name}">` 
                        : `<div class="product-icon"><i class="fas ${product.icon}"></i></div>`
                    }
                    <h3>${product.name}</h3>
                    ${hasSale 
                        ? `<div class="original-price">${formatCurrency(product.price)}</div>
                           <div class="sale-price">${formatCurrency(product.salePrice)}</div>`
                        : `<div class="price">${formatCurrency(product.price)}</div>`
                    }
                </div>
            `;
        }).join('');
    }

    // Cart
    addToCart(productId) {
        const product = this.data.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.salePrice && product.salePrice > 0 ? product.salePrice : product.price,
                originalPrice: product.price,
                quantity: 1,
                image: product.image,
                icon: product.icon
            });
        }

        this.renderCart();
        this.showToast(`បានបន្ថែម ${product.name} ចូលរទេះ!`, 'success');
    }

    renderCart() {
        const cartItems = document.getElementById('cartItems');
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>គ្មានមុខម្ហូបក្នុងរទេះ</p>
                </div>
            `;
            document.getElementById('checkoutBtn').disabled = true;
        } else {
            cartItems.innerHTML = this.cart.map((item, index) => `
                <div class="cart-item">
                    ${item.image 
                        ? `<img src="${item.image}" alt="${item.name}" class="cart-item-image">`
                        : `<div class="cart-item-icon"><i class="fas ${item.icon}"></i></div>`
                    }
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">${formatCurrency(item.price)}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="pos.decreaseQty(${index})">-</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="qty-btn" onclick="pos.increaseQty(${index})">+</button>
                        <button class="cart-item-remove" onclick="pos.removeFromCart(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            document.getElementById('checkoutBtn').disabled = false;
        }

        document.getElementById('cartCount').textContent = `(${this.cart.reduce((sum, item) => sum + item.quantity, 0)})`;
        this.updateCartTotals();
    }

    increaseQty(index) {
        this.cart[index].quantity++;
        this.renderCart();
    }

    decreaseQty(index) {
        if (this.cart[index].quantity > 1) {
            this.cart[index].quantity--;
        } else {
            this.removeFromCart(index);
        }
        this.renderCart();
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.renderCart();
    }

    clearCart() {
        this.cart = [];
        document.getElementById('discountPercent').value = '';
        document.getElementById('saleAmount').value = '';
        this.renderCart();
        this.showToast('បានសម្អាតរទេះ!', 'success');
    }

    updateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
        const saleAmount = parseFloat(document.getElementById('saleAmount').value) || 0;
        
        let discountAmount = 0;
        if (discountPercent > 0) {
            discountAmount = subtotal * (discountPercent / 100);
        } else if (saleAmount > 0) {
            discountAmount = Math.min(saleAmount, subtotal);
        }
        
        const total = subtotal - discountAmount;

        document.getElementById('subtotal').textContent = formatCurrency(subtotal);
        document.getElementById('discountAmount').textContent = '-' + formatCurrency(discountAmount);
        document.getElementById('total').textContent = formatCurrency(Math.max(0, total));
    }

    // Checkout
    openCheckout() {
        const modal = document.getElementById('checkoutModal');
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
        const saleAmount = parseFloat(document.getElementById('saleAmount').value) || 0;
        
        let discountAmount = 0;
        if (discountPercent > 0) {
            discountAmount = subtotal * (discountPercent / 100);
        } else if (saleAmount > 0) {
            discountAmount = Math.min(saleAmount, subtotal);
        }
        
        const total = subtotal - discountAmount;

        document.getElementById('receiptNumber').textContent = generateReceiptNumber();
        document.getElementById('receiptDate').textContent = formatDate(new Date().toISOString());
        document.getElementById('receiptServer').textContent = this.currentUser.fullname;

        document.getElementById('receiptItems').innerHTML = this.cart.map(item => `
            <div class="receipt-item">
                <span class="receipt-item-name">${item.name}</span>
                <span class="receipt-item-qty">x${item.quantity}</span>
                <span class="receipt-item-price">${formatCurrency(item.price * item.quantity)}</span>
            </div>
        `).join('');

        document.getElementById('receiptSubtotal').textContent = formatCurrency(subtotal);
        document.getElementById('receiptDiscountPercent').textContent = discountPercent > 0 ? discountPercent + '%' : '0%';
        document.getElementById('receiptDiscountAmount').textContent = formatCurrency(discountAmount);
        document.getElementById('receiptTotal').textContent = formatCurrency(Math.max(0, total));

        document.getElementById('amountReceived').value = '';
        document.getElementById('changeAmount').textContent = '0៛';

        modal.classList.add('active');
    }

    calculateChange() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
        const saleAmount = parseFloat(document.getElementById('saleAmount').value) || 0;
        
        let discountAmount = 0;
        if (discountPercent > 0) {
            discountAmount = subtotal * (discountPercent / 100);
        } else if (saleAmount > 0) {
            discountAmount = Math.min(saleAmount, subtotal);
        }
        
        const total = subtotal - discountAmount;
        const received = parseFloat(document.getElementById('amountReceived').value) || 0;
        const change = received - total;

        document.getElementById('changeAmount').textContent = change >= 0 ? formatCurrency(change) : '0៛';
    }

    confirmPayment() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
        const saleAmount = parseFloat(document.getElementById('saleAmount').value) || 0;
        
        let discountAmount = 0;
        if (discountPercent > 0) {
            discountAmount = subtotal * (discountPercent / 100);
        } else if (saleAmount > 0) {
            discountAmount = Math.min(saleAmount, subtotal);
        }
        
        const total = subtotal - discountAmount;
        const received = parseFloat(document.getElementById('amountReceived').value) || 0;

        if (received < total && total > 0) {
            this.showToast('ចំនួនទទួលមិនគ្រប់គ្រាន់!', 'error');
            return;
        }

        // Create order
        const order = {
            id: generateId(),
            receiptNumber: document.getElementById('receiptNumber').textContent,
            date: new Date().toISOString(),
            items: [...this.cart],
            subtotal: subtotal,
            discountPercent: discountPercent,
            discountAmount: discountAmount,
            total: Math.max(0, total),
            paymentMethod: document.querySelector('.payment-method.active').dataset.method,
            userId: this.currentUser.id,
            userName: this.currentUser.fullname
        };

        // Save order
        this.data.orders.unshift(order);
        saveData(this.data);

        // Print receipt
        this.printReceipt();

        // Close modal
        this.closeAllModals();

        // Clear cart
        this.clearCart();

        this.showToast('ការទូទាត់ជោគជ័យ!', 'success');
    }

    printReceipt() {
        const printWindow = window.open('', '', 'width=400,height=600');
        const receiptContent = document.querySelector('.receipt').innerHTML;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 20px; margin: 0; }
                    .receipt-header { text-align: center; margin-bottom: 15px; }
                    .receipt-header h3 { color: #6F4E37; font-size: 20px; margin: 5px 0; }
                    .receipt-header p { font-size: 12px; color: #666; margin: 3px 0; }
                    .receipt-divider { border-top: 2px dashed #ddd; margin: 15px 0; }
                    .receipt-items { margin-bottom: 15px; }
                    .receipt-item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
                    .receipt-totals { padding-top: 10px; }
                    .receipt-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
                    .receipt-row.total { font-weight: bold; font-size: 18px; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="receipt">${receiptContent}</div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }

    // Items Management
    renderItems() {
        const grid = document.getElementById('itemsGrid');
        const searchTerm = document.getElementById('searchItem').value.toLowerCase();
        const filterCategory = document.getElementById('filterCategory').value;
        
        let items = this.data.products;

        if (filterCategory !== 'all') {
            items = items.filter(i => i.category === filterCategory);
        }

        if (searchTerm) {
            items = items.filter(i => i.name.toLowerCase().includes(searchTerm));
        }

        if (items.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-light);">
                    <i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
                    <p>គ្មានមុខម្ហូប</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = items.map(item => {
            const hasSale = item.salePrice && item.salePrice > 0;
            
            return `
                <div class="item-card">
                    ${item.image 
                        ? `<img src="${item.image}" alt="${item.name}" class="item-card-image">`
                        : `<div class="item-card-icon"><i class="fas ${item.icon}"></i></div>`
                    }
                    <div class="item-card-body">
                        <span class="category-tag">${categoryNames[item.category]}</span>
                        <h3>${item.name}</h3>
                        <div class="price-row">
                            ${hasSale 
                                ? `
                                    <span class="sale-price">${formatCurrency(item.salePrice)}</span>
                                    <span class="original-price">${formatCurrency(item.price)}</span>
                                `
                                : `<span class="price">${formatCurrency(item.price)}</span>`
                            }
                        </div>
                        <div class="item-card-actions">
                            <button class="btn-edit-item" onclick="pos.openItemModal(${item.id})">
                                <i class="fas fa-edit"></i> កែសម្រួល
                            </button>
                            <button class="btn-delete-item" onclick="pos.deleteItem(${item.id})">
                                <i class="fas fa-trash"></i> លុប
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    openItemModal(itemId = null) {
        const modal = document.getElementById('itemModal');
        const form = document.getElementById('itemForm');
        
        form.reset();
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('uploadPlaceholder').style.display = 'block';

        if (itemId) {
            const item = this.data.products.find(p => p.id === itemId);
            if (item) {
                this.editingItem = item;
                document.getElementById('itemModalTitle').innerHTML = '<i class="fas fa-edit"></i> កែសម្រួលមុខម្ហូប';
                document.getElementById('itemId').value = item.id;
                document.getElementById('itemName').value = item.name;
                document.getElementById('itemCategory').value = item.category;
                document.getElementById('itemPrice').value = item.price;
                document.getElementById('itemSalePrice').value = item.salePrice || '';
                document.getElementById('itemDescription').value = item.description || '';
                document.getElementById('itemActive').checked = item.active;
                document.getElementById('itemImage').value = item.image || '';
                
                if (item.image) {
                    document.getElementById('imagePreview').innerHTML = `
                        <img src="${item.image}" alt="${item.name}">
                        <button type="button" class="remove-image" onclick="pos.removeImage()">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    document.getElementById('uploadPlaceholder').style.display = 'none';
                }
            }
        } else {
            this.editingItem = null;
            document.getElementById('itemModalTitle').innerHTML = '<i class="fas fa-plus"></i> បន្ថែមមុខម្ហូប';
            document.getElementById('itemId').value = '';
        }

        modal.classList.add('active');
    }

    previewImage(input) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Image = e.target.result;
                document.getElementById('itemImage').value = base64Image;
                document.getElementById('imagePreview').innerHTML = `
                    <img src="${base64Image}" alt="Preview">
                    <button type="button" class="remove-image" onclick="pos.removeImage()">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                document.getElementById('uploadPlaceholder').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage() {
        document.getElementById('itemImage').value = '';
        document.getElementById('itemImageFile').value = '';
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('uploadPlaceholder').style.display = 'block';
    }

    saveItem() {
        const id = document.getElementById('itemId').value;
        const name = document.getElementById('itemName').value;
        const category = document.getElementById('itemCategory').value;
        const price = parseFloat(document.getElementById('itemPrice').value);
        const salePrice = parseFloat(document.getElementById('itemSalePrice').value) || 0;
        const description = document.getElementById('itemDescription').value;
        const active = document.getElementById('itemActive').checked;
        const image = document.getElementById('itemImage').value;

        if (id) {
            // Update
            const item = this.data.products.find(p => p.id === parseInt(id));
            if (item) {
                item.name = name;
                item.category = category;
                item.price = price;
                item.salePrice = salePrice;
                item.description = description;
                item.active = active;
                item.image = image;
                this.showToast('បានកែសម្រួលមុខម្ហូប!', 'success');
            }
        } else {
            // Add new
            const newItem = {
                id: generateId(),
                name,
                category,
                price,
                salePrice,
                description,
                active,
                image,
                icon: categoryIcons[category] || 'fa-utensils'
            };
            this.data.products.push(newItem);
            this.showToast('បានបន្ថែមមុខម្ហូប!', 'success');
        }

        saveData(this.data);
        this.closeAllModals();
        this.renderItems();
    }

    deleteItem(id) {
        if (confirm('តើអ្នកចង់លុបមុខម្ហូបនេះទេ?')) {
            this.data.products = this.data.products.filter(p => p.id !== id);
            saveData(this.data);
            this.renderItems();
            this.showToast('បានលុបមុខម្ហូប!', 'success');
        }
    }

    // Orders
    renderOrders() {
        const tbody = document.getElementById('ordersTableBody');
        let orders = this.data.orders;

        const dateFilter = document.getElementById('orderDateFilter').value;
        if (dateFilter) {
            const filterDate = new Date(dateFilter);
            orders = orders.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate.toDateString() === filterDate.toDateString();
            });
        }

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: var(--text-light);">គ្មានការលក់</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map((order, index) => {
            const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
            const itemNames = order.items.map(i => i.name).join(', ');
            
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${order.receiptNumber}</td>
                    <td>${formatDate(order.date)}</td>
                    <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${itemNames}</td>
                    <td>${itemCount}</td>
                    <td>${formatCurrency(order.total)}</td>
                    <td>${order.discountAmount > 0 ? formatCurrency(order.discountAmount) : '-'}</td>
                    <td>${order.userName}</td>
                    <td>
                        <button class="btn-view-order" onclick="pos.viewOrder('${order.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    viewOrder(orderId) {
        const order = this.data.orders.find(o => o.id === orderId);
        if (!order) return;

        this.viewingOrder = order;

        const content = document.getElementById('orderViewContent');
        content.innerHTML = `
            <div class="order-view-header">
                <div class="order-info-item">
                    <label>លេខវិក័យបត្រ</label>
                    <span>${order.receiptNumber}</span>
                </div>
                <div class="order-info-item">
                    <label>កាលបរិច្ឆេទ</label>
                    <span>${formatDate(order.date)}</span>
                </div>
                <div class="order-info-item">
                    <label>អ្នកបម្រើ</label>
                    <span>${order.userName}</span>
                </div>
                <div class="order-info-item">
                    <label>វិធីទូទាត់</label>
                    <span>${order.paymentMethod.toUpperCase()}</span>
                </div>
            </div>
            <div class="order-view-items">
                ${order.items.map(item => `
                    <div class="order-view-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>${formatCurrency(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-view-totals">
                <div class="receipt-row">
                    <span>ចំនួនទឹកប្រាក់:</span>
                    <span>${formatCurrency(order.subtotal)}</span>
                </div>
                ${order.discountAmount > 0 ? `
                    <div class="receipt-row discount">
                        <span>បញ្ចុះ:</span>
                        <span>${formatCurrency(order.discountAmount)}</span>
                    </div>
                ` : ''}
                <div class="receipt-row total">
                    <span>សរុប:</span>
                    <span>${formatCurrency(order.total)}</span>
                </div>
            </div>
        `;

        document.getElementById('orderViewModal').classList.add('active');
    }

    printOrder() {
        if (!this.viewingOrder) return;
        
        const printWindow = window.open('', '', 'width=400,height=600');
        const order = this.viewingOrder;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order Receipt</title>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 20px; margin: 0; }
                    .receipt-header { text-align: center; margin-bottom: 15px; }
                    .receipt-header h3 { color: #6F4E37; font-size: 20px; margin: 5px 0; }
                    .receipt-divider { border-top: 2px dashed #ddd; margin: 15px 0; }
                    .order-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .totals { padding-top: 10px; }
                    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .total-row.final { font-weight: bold; font-size: 18px; border-top: 2px solid #000; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div style="text-align: center; margin-bottom: 15px;">
                    <h3>Coffee POS</h3>
                    <p>ប្រព័ន្ធគ្រប់គ្រងហាងកាហ្វេ</p>
                </div>
                <div style="border-top: 2px dashed #ddd; margin: 15px 0;"></div>
                <p><strong>លេខវិក័យបត្រ:</strong> ${order.receiptNumber}</p>
                <p><strong>កាលបរិច្ឆេទ:</strong> ${formatDate(order.date)}</p>
                <p><strong>អ្នកបម្រើ:</strong> ${order.userName}</p>
                <div style="border-top: 2px dashed #ddd; margin: 15px 0;"></div>
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>${formatCurrency(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
                <div style="border-top: 2px dashed #ddd; margin: 15px 0;"></div>
                <div class="totals">
                    <div class="total-row">
                        <span>ចំនួនទឹកប្រាក់:</span>
                        <span>${formatCurrency(order.subtotal)}</span>
                    </div>
                    ${order.discountAmount > 0 ? `
                        <div class="total-row" style="color: red;">
                            <span>បញ្ចុះ:</span>
                            <span>${formatCurrency(order.discountAmount)}</span>
                        </div>
                    ` : ''}
                    <div class="total-row final">
                        <span>សរុប:</span>
                        <span>${formatCurrency(order.total)}</span>
                    </div>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }

    exportOrders() {
        const orders = this.data.orders;
        if (orders.length === 0) {
            this.showToast('គ្មានទិន្នន័យសម្រាប់ Export', 'warning');
            return;
        }

        let csv = 'ល.រ,លេខវិក័យបត្រ,កាលបរិច្ឆេទ,មុខម្ហូប,ចំនួន,សរុប,បញ្ចុះ,អ្នកបម្រើ\n';
        orders.forEach((order, index) => {
            const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
            const itemNames = order.items.map(i => i.name).join('; ');
            csv += `${index + 1},${order.receiptNumber},${order.date},"${itemNames}",${itemCount},${order.total},${order.discountAmount},${order.userName}\n`;
        });

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showToast('បាន Export ទិន្នន័យ!', 'success');
    }

    // Users
    renderUsers() {
        const tbody = document.getElementById('usersTableBody');
        const users = this.data.users;

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">គ្មានអ្នកប្រើប្រាស់</td></tr>';
            return;
        }

        const roleNames = {
            admin: 'Admin',
            manager: 'អ្នកគ្រប់គ្រង',
            staff: 'បុគ្គលិក'
        };

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.username}</td>
                <td>${user.fullname}</td>
                <td><span class="role-badge ${user.role}">${roleNames[user.role]}</span></td>
                <td>${formatDisplayDate(user.createdAt)}</td>
                <td>
                    <button class="btn-view-order" onclick="pos.openUserModal(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${user.id !== this.currentUser.id ? `
                        <button class="btn-delete-item" onclick="pos.deleteUser(${user.id})" style="margin-left: 5px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    openUserModal(userId = null) {
        const modal = document.getElementById('userModal');
        const form = document.getElementById('userForm');
        
        form.reset();
        document.getElementById('userPassword').required = !userId;
        document.getElementById('passwordNote').style.display = userId ? 'block' : 'none';

        if (userId) {
            const user = this.data.users.find(u => u.id === userId);
            if (user) {
                this.editingUser = user;
                document.getElementById('userModalTitle').innerHTML = '<i class="fas fa-user-edit"></i> កែសម្រួលអ្នកប្រើប្រាស់';
                document.getElementById('userId').value = user.id;
                document.getElementById('userUsername').value = user.username;
                document.getElementById('userFullname').value = user.fullname;
                document.getElementById('userPassword').value = '';
                document.getElementById('userRole').value = user.role;
                
                // Set permissions
                document.getElementById('permPOS').checked = user.permissions?.includes('pos') || false;
                document.getElementById('permItems').checked = user.permissions?.includes('items') || false;
                document.getElementById('permOrders').checked = user.permissions?.includes('orders') || false;
                document.getElementById('permReports').checked = user.permissions?.includes('reports') || false;
            }
        } else {
            this.editingUser = null;
            document.getElementById('userModalTitle').innerHTML = '<i class="fas fa-user-plus"></i> បន្ថែមអ្នកប្រើប្រាស់';
            document.getElementById('userId').value = '';
        }

        modal.classList.add('active');
    }

    saveUser() {
        const id = document.getElementById('userId').value;
        const username = document.getElementById('userUsername').value;
        const fullname = document.getElementById('userFullname').value;
        const password = document.getElementById('userPassword').value;
        const role = document.getElementById('userRole').value;

        // Build permissions
        const permissions = [];
        if (document.getElementById('permPOS').checked) permissions.push('pos');
        if (document.getElementById('permItems').checked) permissions.push('items');
        if (document.getElementById('permOrders').checked) permissions.push('orders');
        if (document.getElementById('permReports').checked) permissions.push('reports');

        if (id) {
            // Update
            const user = this.data.users.find(u => u.id === parseInt(id));
            if (user) {
                user.username = username;
                user.fullname = fullname;
                if (password) user.password = password;
                user.role = role;
                user.permissions = permissions;
                this.showToast('បានកែសម្រួលអ្នកប្រើប្រាស់!', 'success');
            }
        } else {
            // Check if username exists
            if (this.data.users.find(u => u.username === username)) {
                this.showToast('ឈ្មោះអ្នកប្រើប្រាស់មានរួចហើយ!', 'error');
                return;
            }

            // Add new
            const newUser = {
                id: generateId(),
                username,
                password,
                fullname,
                role,
                permissions,
                createdAt: new Date().toISOString()
            };
            this.data.users.push(newUser);
            this.showToast('បានបន្ថែមអ្នកប្រើប្រាស់!', 'success');
        }

        saveData(this.data);
        this.closeAllModals();
        this.renderUsers();
    }

    deleteUser(id) {
        if (confirm('តើអ្នកចង់លុបអ្នកប្រើប្រាស់នេះទេ?')) {
            this.data.users = this.data.users.filter(u => u.id !== id);
            saveData(this.data);
            this.renderUsers();
            this.showToast('បានលុបអ្នកប្រើប្រាស់!', 'success');
        }
    }

    // Reports
    generateReports() {
        const period = document.getElementById('reportPeriod').value;
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();
        let periodLabel = '';

        switch(period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                periodLabel = 'ថ្ងៃនេះ';
                break;
            case 'yesterday':
                startDate.setDate(now.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setDate(now.getDate() - 1);
                endDate.setHours(23, 59, 59, 999);
                periodLabel = 'ម្សិលមិញ';
                break;
            case 'week':
                // Start of current week (Monday)
                const dayOfWeek = now.getDay() || 7;
                startDate.setDate(now.getDate() - dayOfWeek + 1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                periodLabel = 'សប្តាហ៍នេះ';
                break;
            case 'lastWeek':
                const lastWeekDay = now.getDay() || 7;
                startDate.setDate(now.getDate() - lastWeek - 6);
                startDate.setHours(0, 0, 0, 0);
                endDate.setDate(now.getDate() - lastWeek);
                endDate.setHours(23, 59, 59, 999);
                periodLabel = 'សប្តាហ៍មុន';
                break;
            case 'month':
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                periodLabel = 'ខែនេះ';
                break;
            case 'lastMonth':
                startDate.setMonth(now.getMonth() - 1);
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setMonth(now.getMonth() - 1);
                endDate.setDate(0);
                endDate.setHours(23, 59, 59, 999);
                periodLabel = 'ខែមុន';
                break;
            case 'year':
                startDate.setMonth(0, 1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                periodLabel = 'ឆ្នាំនេះ';
                break;
            case 'lastYear':
                startDate.setFullYear(now.getFullYear() - 1);
                startDate.setMonth(0, 1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setFullYear(now.getFullYear() - 1);
                endDate.setMonth(11, 31);
                endDate.setHours(23, 59, 59, 999);
                periodLabel = 'ឆ្នាំមុន';
                break;
            case 'custom':
                const customStart = document.getElementById('customStartDate').value;
                const customEnd = document.getElementById('customEndDate').value;
                if (customStart) {
                    startDate = new Date(customStart);
                    startDate.setHours(0, 0, 0, 0);
                }
                if (customEnd) {
                    endDate = new Date(customEnd);
                    endDate.setHours(23, 59, 59, 999);
                } else {
                    endDate = new Date();
                    endDate.setHours(23, 59, 59, 999);
                }
                periodLabel = 'កំណត់ដោយខ្លួនឯង';
                break;
            default:
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                periodLabel = 'ថ្ងៃនេះ';
        }

        const filteredOrders = this.data.orders.filter(o => {
            const orderDate = new Date(o.date);
            return orderDate >= startDate && orderDate <= endDate;
        });

        // Update period title
        document.getElementById('reportPeriodTitle').innerHTML = `
            <i class="fas fa-calendar-alt"></i>
            <span>រយៈពេល: ${periodLabel}</span>
        `;

        // Calculate stats
        const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
        const totalOrders = filteredOrders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const totalDiscount = filteredOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
        const totalItemsSold = filteredOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

        // Find top products
        const productSales = {};
        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
            });
        });

        // Sort and get top 5
        const sortedProducts = Object.entries(productSales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        let topProduct = '-';
        if (sortedProducts.length > 0) {
            topProduct = sortedProducts[0][0];
        }

        // Update UI
        document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('topProduct').textContent = topProduct;
        document.getElementById('avgOrderValue').textContent = formatCurrency(avgOrderValue);

        document.getElementById('reportTotalRevenue').textContent = formatCurrency(totalRevenue);
        document.getElementById('reportTotalDiscount').textContent = formatCurrency(totalDiscount);
        document.getElementById('reportItemsSold').textContent = totalItemsSold;
        document.getElementById('reportCustomers').textContent = totalOrders;

        // Top products list
        const topProductsList = document.getElementById('topProductsList');
        if (sortedProducts.length === 0) {
            topProductsList.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 20px;">គ្មានទិន្នន័យ</p>';
        } else {
            topProductsList.innerHTML = sortedProducts.map((product, index) => `
                <div class="top-product-item">
                    <div class="top-product-rank">${index + 1}</div>
                    <div class="top-product-info">
                        <h4>${product[0]}</h4>
                        <p>ចំនួនលក់: ${product[1]} ក្នុង ${periodLabel}</p>
                    </div>
                    <div class="top-product-sales">${product[1]}</div>
                </div>
            `).join('');
        }
    }

    // Utilities
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        this.viewingOrder = null;
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle'
        };
        
        toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
        toast.className = `toast ${type}`;
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
}

// Initialize app
const pos = new CoffeePOS();
