const db = require('../config/db');

/**
 * GET /api/withdrawals
 * Returns all withdrawal records with worker name, ordered by withdrawal_date DESC.
 */
const getAll = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT w.id, w.user_id, u.name AS worker_name, w.withdrawal_date,
                    w.amount, w.created_at
             FROM withdrawals w
             JOIN users u ON w.user_id = u.id
             ORDER BY w.withdrawal_date DESC, w.created_at DESC`
        );
        return res.status(200).json({ records: rows });
    } catch (error) {
        console.error('getAll withdrawals error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * POST /api/withdrawals
 * Creates a new withdrawal record.
 */
const create = async (req, res) => {
    try {
        const { user_id, withdrawal_date, amount } = req.body;

        if (!user_id || !withdrawal_date) {
            return res.status(400).json({ message: 'Worker and date are required' });
        }

        const [userRows] = await db.execute('SELECT id, name FROM users WHERE id = ?', [user_id]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        const [result] = await db.execute(
            'INSERT INTO withdrawals (user_id, withdrawal_date, amount) VALUES (?, ?, ?)',
            [user_id, withdrawal_date, amount || 0]
        );

        return res.status(201).json({
            message: 'Withdrawal record created successfully',
            record: {
                id: result.insertId,
                user_id,
                worker_name: userRows[0].name,
                withdrawal_date,
                amount: amount || 0,
            },
        });
    } catch (error) {
        console.error('create withdrawal error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PUT /api/withdrawals/:id
 * Updates an existing withdrawal record.
 */
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, withdrawal_date, amount } = req.body;

        const [rows] = await db.execute('SELECT id FROM withdrawals WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Withdrawal record not found' });
        }

        if (user_id) {
            const [userRows] = await db.execute('SELECT id FROM users WHERE id = ?', [user_id]);
            if (userRows.length === 0) {
                return res.status(404).json({ message: 'Worker not found' });
            }
        }

        const fields = [];
        const values = [];

        if (user_id) { fields.push('user_id = ?'); values.push(user_id); }
        if (withdrawal_date) { fields.push('withdrawal_date = ?'); values.push(withdrawal_date); }
        if (amount !== undefined) { fields.push('amount = ?'); values.push(amount); }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(id);
        await db.execute(`UPDATE withdrawals SET ${fields.join(', ')} WHERE id = ?`, values);

        return res.status(200).json({ message: 'Withdrawal record updated successfully' });
    } catch (error) {
        console.error('update withdrawal error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * DELETE /api/withdrawals/:id
 * Deletes a withdrawal record.
 */
const remove = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute('SELECT id FROM withdrawals WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Withdrawal record not found' });
        }

        await db.execute('DELETE FROM withdrawals WHERE id = ?', [id]);

        return res.status(200).json({ message: 'Withdrawal record deleted successfully' });
    } catch (error) {
        console.error('delete withdrawal error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getAll, create, update, remove };
