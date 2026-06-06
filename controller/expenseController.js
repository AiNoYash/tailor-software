const db = require('../config/db');

/**
 * GET /api/expenses
 * Returns all expense records ordered by expense_date DESC.
 */
const getAll = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT id, expense_date, amount, description, created_at
             FROM expenses
             ORDER BY expense_date DESC, created_at DESC`
        );
        return res.status(200).json({ records: rows });
    } catch (error) {
        console.error('getAll expenses error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * POST /api/expenses
 * Creates a new expense record.
 */
const create = async (req, res) => {
    try {
        const { expense_date, amount, description } = req.body;

        if (!expense_date || !amount) {
            return res.status(400).json({ message: 'Date and amount are required' });
        }

        const [result] = await db.execute(
            'INSERT INTO expenses (expense_date, amount, description) VALUES (?, ?, ?)',
            [expense_date, amount, description || null]
        );

        return res.status(201).json({
            message: 'Expense record created successfully',
            record: {
                id: result.insertId,
                expense_date,
                amount,
                description: description || null
            },
        });
    } catch (error) {
        console.error('create expense error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * PUT /api/expenses/:id
 * Updates an existing expense record.
 */
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { expense_date, amount, description } = req.body;

        const [rows] = await db.execute('SELECT id FROM expenses WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Expense record not found' });
        }

        const fields = [];
        const values = [];

        if (expense_date) { fields.push('expense_date = ?'); values.push(expense_date); }
        if (amount !== undefined) { fields.push('amount = ?'); values.push(amount); }
        if (description !== undefined) { fields.push('description = ?'); values.push(description); }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(id);
        await db.execute(`UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`, values);

        return res.status(200).json({ message: 'Expense record updated successfully' });
    } catch (error) {
        console.error('update expense error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * DELETE /api/expenses/:id
 * Deletes an expense record.
 */
const remove = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute('SELECT id FROM expenses WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Expense record not found' });
        }

        await db.execute('DELETE FROM expenses WHERE id = ?', [id]);

        return res.status(200).json({ message: 'Expense record deleted successfully' });
    } catch (error) {
        console.error('delete expense error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * GET /api/expenses/report
 * Query params: from_date, to_date
 * Returns expenses and total for the given date range.
 */
const getReport = async (req, res) => {
    try {
        const { from_date, to_date } = req.query;

        if (!from_date || !to_date) {
            return res.status(400).json({ message: 'from_date and to_date are required' });
        }

        const [rows] = await db.execute(
            `SELECT id, expense_date, amount, description, created_at
             FROM expenses
             WHERE expense_date >= ? AND expense_date <= ?
             ORDER BY expense_date DESC, created_at DESC`,
            [from_date, to_date]
        );

        const totals = rows.reduce(
            (acc, row) => {
                acc.total_amount += Number(row.amount);
                return acc;
            },
            { total_amount: 0 }
        );

        return res.status(200).json({ records: rows, totals });
    } catch (error) {
        console.error('getReport expenses error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = { getAll, create, update, remove, getReport };
