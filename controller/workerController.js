const bcrypt = require('bcrypt');
const db = require('../config/db');

const SALT_ROUNDS = 10;

/**
 * GET /api/workers
 * Returns all users — admin(s) first, then workers.
 */
const getAll = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, name, mobile_no, role FROM users ORDER BY FIELD(role, "admin", "worker"), name ASC'
        );
        return res.status(200).json({ users: rows });
    } catch (error) {
        console.error('getAll workers error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * POST /api/workers
 * Creates a new worker (role is always 'worker').
 */
const create = async (req, res) => {
    try {
        const { name, mobile_no, password } = req.body;

        if (!name || !mobile_no || !password) {
            return res.status(400).json({ message: 'Name, mobile number, and password are required' });
        }

        // Check if mobile number already exists
        const [existing] = await db.execute(
            'SELECT id FROM users WHERE mobile_no = ?',
            [mobile_no]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: 'A user with this mobile number already exists' });
        }

        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        const [result] = await db.execute(
            'INSERT INTO users (name, mobile_no, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, mobile_no, password_hash, 'worker']
        );

        return res.status(201).json({
            message: 'Worker created successfully',
            worker: {
                id: result.insertId,
                name,
                mobile_no,
                role: 'worker',
            },
        });
    } catch (error) {
        console.error('create worker error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PUT /api/workers/:id
 * Updates a worker's name, mobile_no, and/or password.
 * Only workers can be updated (not admins).
 */
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, mobile_no, password } = req.body;

        // Verify the target user exists and is a worker
        const [rows] = await db.execute(
            'SELECT id, role FROM users WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check for duplicate mobile number (excluding this user)
        if (mobile_no) {
            const [dup] = await db.execute(
                'SELECT id FROM users WHERE mobile_no = ? AND id != ?',
                [mobile_no, id]
            );
            if (dup.length > 0) {
                return res.status(409).json({ message: 'A user with this mobile number already exists' });
            }
        }

        // Build dynamic update
        const fields = [];
        const values = [];

        if (name) {
            fields.push('name = ?');
            values.push(name);
        }
        if (mobile_no) {
            fields.push('mobile_no = ?');
            values.push(mobile_no);
        }
        if (password) {
            const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
            fields.push('password_hash = ?');
            values.push(password_hash);
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(id);
        await db.execute(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return res.status(200).json({ message: 'Worker updated successfully' });
    } catch (error) {
        console.error('update worker error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



/**
 * DELETE /api/workers/:id
 * Deletes a user.
 */
const remove = async (req, res) => {
    try {
        const { id } = req.params;

        if (rows[0].role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin accounts' });
        }

        // Check if user exists
        const [rows] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (rows[0].role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin accounts' });
        }

        await db.execute('DELETE FROM users WHERE id = ?', [id]);

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('delete worker error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getAll, create, update, remove };
