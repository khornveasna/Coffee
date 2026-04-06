// Category Model
const databaseService = require('../services/database');

class CategoryModel {
    constructor() {
        this._db = null;
    }

    get db() {
        if (!this._db) {
            this._db = databaseService.getDatabase();
        }
        return this._db;
    }

    findById(id) {
        return this.db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    }

    findAll() {
        return this.db.prepare('SELECT * FROM categories').all();
    }

    create(categoryData) {
        const { name, name_km, icon = 'fa-box' } = categoryData;
        const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.db.prepare('INSERT INTO categories (id, name, name_km, icon) VALUES (?, ?, ?, ?)')
            .run(id, name, name_km, icon);

        return this.findById(id);
    }

    update(id, updateData) {
        const { name, name_km, icon } = updateData;

        this.db.prepare('UPDATE categories SET name = ?, name_km = ?, icon = ? WHERE id = ?')
            .run(name, name_km, icon, id);

        return this.findById(id);
    }

    delete(id) {
        return this.db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    }
}

module.exports = new CategoryModel();
