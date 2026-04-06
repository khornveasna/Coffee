// Authentication: login, logout, checkAuth, showApp, permissions

CoffeePOS.prototype.checkAuth = function () {
    const user = getCurrentUser();
    const token = localStorage.getItem('coffeePOSToken');
    
    if (user && token) {
        this.currentUser = user;
        this.authToken = token;
        document.getElementById('currentUser').textContent = this.currentUser.fullname;
        if (this.currentUser.role === 'admin') {
            this.currentUser.permissions = ['pos', 'items', 'orders', 'reports', 'users'];
        }
        this.displayUserPermissions();
    }
};

CoffeePOS.prototype.displayUserPermissions = function () {
    const permLabel = document.getElementById('userPermissions');
    if (!permLabel) return;

    if (this.currentUser.role === 'admin') {
        permLabel.innerHTML = '<span style="color: var(--primary);">✓ Admin (Full Access)</span>';
        return;
    }

    const icons = {
        pos:     '<i class="fas fa-cash-register" title="លក់"></i>',
        items:   '<i class="fas fa-box"           title="គ្រប់គ្រងភេសជ្ជៈ"></i>',
        orders:  '<i class="fas fa-receipt"       title="មើលការលក់"></i>',
        reports: '<i class="fas fa-chart-line"    title="របាយការណ៍"></i>'
    };
    permLabel.innerHTML = (this.currentUser.permissions || []).map(p => icons[p] || '').join(' ');
};

CoffeePOS.prototype.applyUserPermissions = function () {
    const perms   = this.currentUser.permissions || [];
    const isAdmin = this.currentUser.role === 'admin';

    this.displayUserPermissions();

    const toggle = (selector, show) => {
        const el = typeof selector === 'string' && selector.startsWith('#')
            ? document.getElementById(selector.slice(1))
            : document.querySelector(selector);
        if (el) el.classList.toggle('hidden', !show);
    };

    toggle('[data-page="items"]',   isAdmin || perms.includes('items'));
    toggle('[data-page="orders"]',  isAdmin || perms.includes('orders'));
    toggle('[data-page="reports"]', isAdmin || perms.includes('reports'));
    toggle('#usersNav',             isAdmin);

    if (!perms.includes('pos') && !isAdmin) {
        const firstPage = ['items', 'orders', 'reports'].find(p => perms.includes(p));
        if (firstPage && this.currentPage === 'pos') this.navigate(firstPage);
    }
};

CoffeePOS.prototype.showApp = function () {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    this.navigate('pos');
    this.applyUserPermissions();
    if (this.socket && this.currentUser) {
        this.socket.emit('user-login', this.currentUser);
    }
};

CoffeePOS.prototype.login = async function () {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        this.showToast('សូមបញ្ចូលឈ្មោះអ្នកប្រើប្រាស់ និងពាក្យសម្ងាត់!', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ username, password })
        });
        const result = await response.json();

        if (result.success) {
            this.currentUser = result.user;
            this.authToken = result.token;
            
            // Store token and user
            localStorage.setItem('coffeePOSToken', result.token);
            setCurrentUser(result.user);
            
            document.getElementById('currentUser').textContent = result.user.fullname;
            this.showToast('ការចូលប្រើប្រាស់ជោគជ័យ!', 'success');
            this.showApp();
        } else {
            this.showToast(result.message || 'ឈ្មោះអ្នកប្រើប្រាស់ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ!', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        this.showToast('មិនអាចភ្ជាប់ទៅសែរវើរបានទេ!', 'error');
    }
};

CoffeePOS.prototype.logout = function () {
    if (this.socket && this.currentUser) this.socket.emit('user-logout');
    this.currentUser = null;
    this.authToken = null;
    setCurrentUser(null);
    localStorage.removeItem('coffeePOSToken');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appScreen').classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    this.showToast('បានចាកចេញ!', 'success');
};

// Helper function to make authenticated API requests
CoffeePOS.prototype.apiRequest = async function(url, options = {}) {
    const token = this.authToken || localStorage.getItem('coffeePOSToken');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // Handle 401 Unauthorized (token expired)
    if (response.status === 401) {
        this.showToast('សេសសិនផុតកំណត់! សូមចូលប្រើប្រាស់ម្តងទៀត!', 'error');
        this.logout();
        throw new Error('Token expired');
    }
    
    return response.json();
};
