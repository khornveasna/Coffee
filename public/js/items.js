// Items (product) management

CoffeePOS.prototype.renderItems = function () {
    const grid        = document.getElementById('itemsGrid');
    const searchTerm  = document.getElementById('searchItem').value.toLowerCase();
    const filterCat   = document.getElementById('filterCategory').value;
    let   items       = this.data.products;

    // Populate filter dropdown with categories
    const filterSelect = document.getElementById('filterCategory');
    const currentValue = filterSelect.value;
    const categories = this.data.categories || [];
    
    // Only repopulate if categories changed or it's the first time
    const existingOptions = Array.from(filterSelect.options).map(opt => opt.value);
    const categoryIds = categories.map(cat => cat.id);
    
    if (existingOptions.length !== categoryIds.length + 1 || 
        !categoryIds.every(id => existingOptions.includes(id))) {
        filterSelect.innerHTML = '<option value="all">គ្រប់ប្រភេទ</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name_km || cat.name;
            filterSelect.appendChild(option);
        });
        filterSelect.value = currentValue; // Restore selected value
    }

    if (filterCat !== 'all') items = items.filter(i => i.category === filterCat);
    if (searchTerm)          items = items.filter(i => i.name.toLowerCase().includes(searchTerm));

    if (items.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-light);">
                <i class="fas fa-box-open" style="font-size:48px;margin-bottom:15px;opacity:0.3;"></i>
                <p>គ្មានភេសជ្ជៈ</p>
            </div>`;
        return;
    }

    grid.innerHTML = items.map(item => {
        const hasSale = item.salePrice && item.salePrice > 0;
        // Get category name from data.categories
        const categories = this.data.categories || [];
        const category = categories.find(c => c.id === item.category);
        const categoryName = category ? (category.name_km || category.name) : item.category;
        
        return `
            <div class="item-card">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" class="item-card-image">` : `<div class="item-card-icon"><i class="fas ${item.icon}"></i></div>`}
                <div class="item-card-body">
                    <span class="category-tag">${categoryName}</span>
                    <h3>${item.name}</h3>
                    <div class="price-row">
                        ${hasSale
                            ? `<span class="sale-price">${formatCurrency(item.salePrice)}</span><span class="original-price">${formatCurrency(item.price)}</span>`
                            : `<span class="price">${formatCurrency(item.price)}</span>`}
                    </div>
                    <div class="item-card-actions">
                        <button class="btn-edit-item"   onclick="pos.openItemModal('${item.id}')"><i class="fas fa-edit"></i> កែសម្រួល</button>
                        <button class="btn-delete-item" onclick="pos.deleteItem('${item.id}')"><i class="fas fa-trash"></i> លុប</button>
                    </div>
                </div>
            </div>`;
    }).join('');
};

CoffeePOS.prototype.openItemModal = function (itemId = null) {
    const modal = document.getElementById('itemModal');
    document.getElementById('itemForm').reset();
    document.getElementById('imagePreview').innerHTML      = '';
    document.getElementById('uploadPlaceholder').style.display = 'block';

    // Populate category dropdown
    const categorySelect = document.getElementById('itemCategory');
    const categories = this.data.categories || [];
    categorySelect.innerHTML = '<option value="">ជ្រើសរើសប្រភេទ</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name_km || cat.name;
        categorySelect.appendChild(option);
    });

    if (itemId) {
        const idStr = String(itemId);
        const item = this.data.products.find(p => String(p.id) === idStr);
        if (item) {
            this.editingItem = item;
            document.getElementById('itemModalTitle').innerHTML = '<i class="fas fa-edit"></i> កែសម្រួលភេសជ្ជៈ';
            document.getElementById('itemId').value          = item.id;
            document.getElementById('itemName').value        = item.name;
            document.getElementById('itemCategory').value    = item.category;
            document.getElementById('itemPrice').value       = item.price;
            document.getElementById('itemSalePrice').value   = item.salePrice || '';
            document.getElementById('itemDescription').value = item.description || '';
            document.getElementById('itemActive').checked    = item.active;
            document.getElementById('itemImage').value       = item.image || '';
            if (item.image) {
                document.getElementById('imagePreview').innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <button type="button" class="remove-image" onclick="pos.removeImage()"><i class="fas fa-trash"></i></button>`;
                document.getElementById('uploadPlaceholder').style.display = 'none';
            }
        }
    } else {
        this.editingItem = null;
        document.getElementById('itemModalTitle').innerHTML = '<i class="fas fa-plus"></i> បន្ថែមភេសជ្ជៈ';
        document.getElementById('itemId').value = '';
    }
    modal.classList.add('active');
};

CoffeePOS.prototype.previewImage = function (input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const base64 = e.target.result;
        document.getElementById('itemImage').value = base64;
        document.getElementById('imagePreview').innerHTML = `
            <img src="${base64}" alt="Preview">
            <button type="button" class="remove-image" onclick="pos.removeImage()"><i class="fas fa-trash"></i></button>`;
        document.getElementById('uploadPlaceholder').style.display = 'none';
    };
    reader.readAsDataURL(file);
};

CoffeePOS.prototype.removeImage = function () {
    document.getElementById('itemImage').value            = '';
    document.getElementById('itemImageFile').value        = '';
    document.getElementById('imagePreview').innerHTML     = '';
    document.getElementById('uploadPlaceholder').style.display = 'block';
};

CoffeePOS.prototype.saveItem = async function () {
    const id          = document.getElementById('itemId').value;
    const name        = document.getElementById('itemName').value;
    const category    = document.getElementById('itemCategory').value;
    const price       = parseFloat(document.getElementById('itemPrice').value);
    const salePrice   = parseFloat(document.getElementById('itemSalePrice').value) || 0;
    const description = document.getElementById('itemDescription').value;
    const active      = document.getElementById('itemActive').checked;
    const image       = document.getElementById('itemImage').value;

    try {
        let result;
        if (id) {
            // Update existing product via API
            result = await this.apiRequest(`/api/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, name_km: name, category_id: category, price, salePrice, description, active, image })
            });
        } else {
            // Create new product via API
            result = await this.apiRequest('/api/products', {
                method: 'POST',
                body: JSON.stringify({ name, name_km: name, category_id: category, price, salePrice, description, active, image, icon: categoryIcons[category] || 'fa-utensils' })
            });
        }

        if (result.success) {
            this.showToast(id ? 'បានកែសម្រួលភេសជ្ជៈ!' : 'បានបន្ថែមភេសជ្ជៈ!', 'success');
            // Reload products from API
            await this.loadDataFromAPI();
            this.closeAllModals();
            this.renderItems();
            this.renderProducts();
        } else {
            this.showToast(result.message || 'កំហុសក្នុងការរក្សាទុក!', 'error');
        }
    } catch (error) {
        console.error('Save item error:', error);
        this.showToast('កំហុស: ' + error.message, 'error');
    }
};

CoffeePOS.prototype.deleteItem = async function (id) {
    if (!confirm('តើអ្នកចង់លុបភេសជ្ជៈនេះទេ?')) return;

    try {
        const result = await this.apiRequest(`/api/products/${id}`, { method: 'DELETE' });

        if (result.success) {
            // Reload products from API
            await this.loadDataFromAPI();
            this.renderItems();
            this.renderProducts();
            this.showToast('បានលុបភេសជ្ជៈ!', 'success');
        } else {
            this.showToast(result.message || 'កំហុសក្នុងការលុប!', 'error');
        }
    } catch (error) {
        console.error('Delete item error:', error);
        this.showToast('កំហុស: ' + error.message, 'error');
    }
};
