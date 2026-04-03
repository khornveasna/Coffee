// Coffee POS System - Data Management

const defaultData = {
    products: [
        {
            id: 1,
            name: 'កាហ្វេស្រស់',
            category: 'coffee',
            price: 8000,
            salePrice: 0,
            image: '',
            icon: 'fa-coffee',
            description: 'កាហ្វេស្រស់ឆ្ងាញ់',
            active: true
        },
        {
            id: 2,
            name: 'កាហ្វេទឹកដោះគោ',
            category: 'coffee',
            price: 10000,
            salePrice: 0,
            image: '',
            icon: 'fa-coffee',
            description: 'កាហ្វេទឹកដោះគោផ្អែម',
            active: true
        },
        {
            id: 3,
            name: 'កាហ្វេទឹកក្រឡុក',
            category: 'coffee',
            price: 12000,
            salePrice: 10000,
            image: '',
            icon: 'fa-blender',
            description: 'កាហ្វេទឹកក្រឡុកត្រជាក់',
            active: true
        },
        {
            id: 4,
            name: 'កាហ្វេស្រស់ត្រជាក់',
            category: 'coffee',
            price: 9000,
            salePrice: 0,
            image: '',
            icon: 'fa-coffee',
            description: 'កាហ្វេស្រស់ត្រជាក់',
            active: true
        },
        {
            id: 5,
            name: 'តែបៃតង',
            category: 'tea',
            price: 7000,
            salePrice: 0,
            image: '',
            icon: 'fa-leaf',
            description: 'តែបៃតងក្ដៅ',
            active: true
        },
        {
            id: 6,
            name: 'តែបៃតងទឹកឃ្មុំ',
            category: 'tea',
            price: 8000,
            salePrice: 0,
            image: '',
            icon: 'fa-leaf',
            description: 'តែបៃតងទឹកឃ្មុំ',
            active: true
        },
        {
            id: 7,
            name: 'តែបៃតងទឹកដោះគោ',
            category: 'tea',
            price: 9000,
            salePrice: 0,
            image: '',
            icon: 'fa-leaf',
            description: 'តែបៃតងទឹកដោះគោ',
            active: true
        },
        {
            id: 8,
            name: 'តែបៃតងត្រជាក់',
            category: 'tea',
            price: 7500,
            salePrice: 0,
            image: '',
            icon: 'fa-leaf',
            description: 'តែបៃតងត្រជាក់',
            active: true
        }
    ],

    users: [
        {
            id: 1,
            username: 'admin',
            password: '1234',
            fullname: 'អ្នកគ្រប់គ្រង',
            role: 'admin',
            permissions: ['pos', 'items', 'orders', 'reports', 'users'],
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            username: 'manager',
            password: '1234',
            fullname: 'អ្នកគ្រប់គ្រងរង',
            role: 'manager',
            permissions: ['pos', 'items', 'orders', 'reports'],
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            username: 'staff',
            password: '1234',
            fullname: 'បុគ្គលិក',
            role: 'staff',
            permissions: ['pos', 'orders'],
            createdAt: new Date().toISOString()
        }
    ],

    orders: [],

    settings: {
        shopName: 'Coffee POS',
        currency: '៛',
        taxRate: 0
    }
};

const categoryNames = {
    all: 'ទាំងអស់',
    coffee: 'កាហ្វេ',
    tea: 'តែបៃតង'
};

const categoryIcons = {
    coffee: 'fa-coffee',
    tea: 'fa-leaf'
};

function initializeData() {
    if (!localStorage.getItem('coffeePOSData')) {
        localStorage.setItem('coffeePOSData', JSON.stringify(defaultData));
    }
}

// Reset data to default (call this once to update existing data)
function resetData() {
    localStorage.setItem('coffeePOSData', JSON.stringify(defaultData));
    console.log('Data reset successfully!');
}

function getData() {
    const data = localStorage.getItem('coffeePOSData');
    if (!data) {
        initializeData();
        return defaultData;
    }
    return JSON.parse(data);
}

function saveData(data) {
    localStorage.setItem('coffeePOSData', JSON.stringify(data));
}

function getCurrentUser() {
    const user = localStorage.getItem('coffeePOSUser');
    if (!user) return null;
    return JSON.parse(user);
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('coffeePOSUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('coffeePOSUser');
    }
}

function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function formatCurrency(amount) {
    return amount.toLocaleString('km-KH') + '៛';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('km-KH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('km-KH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function generateReceiptNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${year}${month}${day}${random}`;
}

initializeData();
