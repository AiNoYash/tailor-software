const db = require('../config/db');

/**
 * GET /api/work
 * Returns all work records with worker name, ordered by work_date DESC.
 */
const getAll = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT w.id, w.user_id, u.name AS worker_name, w.work_date, 
                    w.pants_quantity, w.shirts_quantity, w.created_at
             FROM work w
             JOIN users u ON w.user_id = u.id
             ORDER BY w.work_date DESC, w.created_at DESC`
        );
        return res.status(200).json({ records: rows });
    } catch (error) {
        console.error('getAll work error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * POST /api/work
 * Creates a new work record.
 */
const create = async (req, res) => {
    try {
        const { user_id, work_date, pants_quantity, shirts_quantity } = req.body;

        if (!user_id || !work_date) {
            return res.status(400).json({ message: 'Worker and date are required' });
        }

        // Verify the worker exists
        const [userRows] = await db.execute('SELECT id, name FROM users WHERE id = ?', [user_id]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        const [result] = await db.execute(
            'INSERT INTO work (user_id, work_date, pants_quantity, shirts_quantity) VALUES (?, ?, ?, ?)',
            [user_id, work_date, pants_quantity || 0, shirts_quantity || 0]
        );

        return res.status(201).json({
            message: 'Work record created successfully',
            record: {
                id: result.insertId,
                user_id,
                worker_name: userRows[0].name,
                work_date,
                pants_quantity: pants_quantity || 0,
                shirts_quantity: shirts_quantity || 0,
            },
        });
    } catch (error) {
        console.error('create work error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PUT /api/work/:id
 * Updates an existing work record.
 */
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, work_date, pants_quantity, shirts_quantity } = req.body;

        // Verify the record exists
        const [rows] = await db.execute('SELECT id FROM work WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Work record not found' });
        }

        // If user_id provided, verify the worker exists
        if (user_id) {
            const [userRows] = await db.execute('SELECT id FROM users WHERE id = ?', [user_id]);
            if (userRows.length === 0) {
                return res.status(404).json({ message: 'Worker not found' });
            }
        }

        const fields = [];
        const values = [];

        if (user_id) { fields.push('user_id = ?'); values.push(user_id); }
        if (work_date) { fields.push('work_date = ?'); values.push(work_date); }
        if (pants_quantity !== undefined) { fields.push('pants_quantity = ?'); values.push(pants_quantity); }
        if (shirts_quantity !== undefined) { fields.push('shirts_quantity = ?'); values.push(shirts_quantity); }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(id);
        await db.execute(`UPDATE work SET ${fields.join(', ')} WHERE id = ?`, values);

        return res.status(200).json({ message: 'Work record updated successfully' });
    } catch (error) {
        console.error('update work error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * DELETE /api/work/:id
 * Deletes a work record.
 */
const remove = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute('SELECT id FROM work WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Work record not found' });
        }

        await db.execute('DELETE FROM work WHERE id = ?', [id]);

        return res.status(200).json({ message: 'Work record deleted successfully' });
    } catch (error) {
        console.error('delete work error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getAll, create, update, remove };
