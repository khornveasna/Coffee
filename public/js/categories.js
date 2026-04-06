// Categories management

CoffeePOS.prototype.openCategoryManagement = function () {
    // Show category management in a modal
    const modal = document.getElementById('categoryModal');
    document.getElementById('categoryForm').reset();
    this.editingCategory = null;
    
    // Change modal title to show it's for managing categories
    document.getElementById('categoryModalTitle').innerHTML = '<i class="fas fa-tags"></i> គ្រប់គ្រងប្រភេទ';
    document.getElementById('categoryId').value = '';
    
    // Show existing categories in the modal body before the form
    const modalBody = document.querySelector('#categoryModal .modal-body');
    const categories = this.data.categories || [];
    
    let categoriesHtml = '<div id="categoryManagementList" style="margin-bottom: 20px; max-height: 300px; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px; padding: 10px;">';
    if (categories.length === 0) {
        categoriesHtml += '<p style="text-align: center; color: var(--text-light); padding: 20px;">គ្មានប្រភេទ</p>';
    } else {
        categories.forEach(cat => {
            categoriesHtml += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid var(--border);">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas ${cat.icon}" style="font-size: 20px; color: var(--primary);"></i>
                        <div>
                            <strong>${cat.name_km || cat.name}</strong>
                            <div style="font-size: 12px; color: var(--text-light);">${cat.name}</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button type="button" onclick="pos.editCategory('${cat.id}')" style="background: var(--warning); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" onclick="pos.deleteCategory('${cat.id}')" style="background: var(--danger); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
    }
    categoriesHtml += '</div>';
    
    // Insert categories list before the form
    const existingList = document.getElementById('categoryManagementList');
    if (existingList) {
        existingList.outerHTML = categoriesHtml;
    } else {
        modalBody.insertAdjacentHTML('afterbegin', categoriesHtml);
    }
    
    modal.classList.add('active');
};

CoffeePOS.prototype.editCategory = function (categoryId) {
    const idStr = String(categoryId);
    const cat = (this.data.categories || []).find(c => String(c.id) === idStr);
    if (cat) {
        this.editingCategory = cat;
        document.getElementById('categoryModalTitle').innerHTML = '<i class="fas fa-edit"></i> កែសម្រួលប្រភេទ';
        document.getElementById('categoryId').value = cat.id;
        document.getElementById('categoryNameEn').value = cat.name;
        document.getElementById('categoryNameKm').value = cat.name_km || '';

        // Scroll to form
        document.getElementById('categoryForm').scrollIntoView({ behavior: 'smooth' });
    }
};

CoffeePOS.prototype.renderCategories = function () {
    // This function is no longer used since categories are now managed in a modal
    // Kept for backward compatibility
};

CoffeePOS.prototype.saveCategory = async function () {
    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryNameEn').value.trim();
    const nameKm = document.getElementById('categoryNameKm').value.trim();
    const icon = 'fa-box'; // Default icon, no longer editable

    if (!name) {
        this.showToast('សូមបញ្ចូលឈ្មោះប្រភេទ!', 'warning');
        return;
    }

    if (!nameKm) {
        this.showToast('សូមបញ្ចូលឈ្មោះប្រភេទ (ខ្មែរ)!', 'warning');
        return;
    }

    if (!this.data.categories) {
        this.data.categories = [];
    }

    if (id) {
        // Update existing category via API
        try {
            const result = await this.apiRequest(`/api/categories/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, name_km: nameKm, icon })
            });

            if (result.success) {
                this.showToast('បានកែសម្រួលប្រភេទ!', 'success');
                await this.loadDataFromAPI();
                this.renderItems();
                this.renderProducts();
                this.renderCategoryButtons();
            } else {
                this.showToast(result.message || 'កំហុស!', 'error');
                return;
            }
        } catch (error) {
            console.error('Update category error:', error);
            this.showToast('កំហុស: ' + error.message, 'error');
            return;
        }
    } else {
        // Check if category name already exists
        const exists = this.data.categories.find(c => c.name === name);
        if (exists) {
            this.showToast('ឈ្មោះប្រភេទនេះមានរួចហើយ!', 'warning');
            return;
        }

        // Create new category via API
        try {
            const result = await this.apiRequest('/api/categories', {
                method: 'POST',
                body: JSON.stringify({ name, name_km: nameKm, icon })
            });

            if (result.success) {
                this.showToast('បានបន្ថែមប្រភេទ!', 'success');
                await this.loadDataFromAPI();
                this.renderItems();
                this.renderProducts();
                this.renderCategoryButtons();
            } else {
                this.showToast(result.message || 'កំហុស!', 'error');
                return;
            }
        } catch (error) {
            console.error('Create category error:', error);
            this.showToast('កំហុស: ' + error.message, 'error');
            return;
        }
    }

    // Refresh the category management modal if it's open
    const categoryModal = document.getElementById('categoryModal');
    if (categoryModal.classList.contains('active')) {
        this.openCategoryManagement();
    }
    
    // Also refresh items to update the filter dropdown
    if (this.currentPage === 'items') {
        this.renderItems();
    }
    
    // Refresh POS category buttons
    if (this.currentPage === 'pos') {
        this.renderCategoryButtons();
    }
};

CoffeePOS.prototype.deleteCategory = async function (id) {
    const idStr = String(id);
    // Check if any products use this category
    const productsUsingCat = this.data.products.filter(p => String(p.category) === idStr);
    if (productsUsingCat.length > 0) {
        this.showToast(`មិនអាចលុបបានទេ! មាន ${productsUsingCat.length} ភេសជ្ជៈកំពុងប្រើប្រភេទនេះ`, 'error');
        return;
    }

    if (!confirm('តើអ្នកចង់លុបប្រភេទនេះទេ?')) return;

    try {
        // Delete category from API/database
        const result = await this.apiRequest(`/api/categories/${id}`, { method: 'DELETE' });

        if (result.success) {
            // Reload data from API to ensure consistency
            await this.loadDataFromAPI();
            this.showToast('បានលុបប្រភេទ!', 'success');

            // Refresh the category management modal if it's open
            const categoryModal = document.getElementById('categoryModal');
            if (categoryModal.classList.contains('active')) {
                this.openCategoryManagement();
            }

            // Also refresh items to update the filter dropdown
            if (this.currentPage === 'items') {
                this.renderItems();
            }

            // Refresh POS category buttons
            if (this.currentPage === 'pos') {
                this.renderCategoryButtons();
            }
        } else {
            this.showToast(result.message || 'កំហុសក្នុងការលុប!', 'error');
        }
    } catch (error) {
        console.error('Delete category error:', error);
        this.showToast('កំហុស: ' + error.message, 'error');
    }
};

// Icon preview update - REMOVED (no longer needed)
