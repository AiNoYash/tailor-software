const db = require('../config/db');

/**
 * GET /api/orders/:id
 * Returns a single order with its items.
 */
const getById = async (req, res) => {
    try {
        const { id } = req.params;

        const [orders] = await db.execute(
            `SELECT id, customer_name, mobile_no, address, user_name,
                    order_date, delivery_date, total_amount, deposit_amount, created_at
             FROM orders WHERE id = ?`,
            [id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const [items] = await db.execute(
            `SELECT id, order_id, item_type, quantity, details
             FROM order_items WHERE order_id = ?`,
            [id]
        );

        // Parse JSON details
        const parsedItems = items.map((item) => ({
            ...item,
            details: typeof item.details === 'string' ? JSON.parse(item.details) : item.details,
        }));

        return res.status(200).json({ order: orders[0], items: parsedItems });
    } catch (error) {
        console.error('getById order error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * POST /api/orders
 * Creates a new order with items. Returns the generated bill ID.
 */
const create = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const {
            customer_name, mobile_no, address,
            order_date, delivery_date,
            total_amount, deposit_amount,
            items,
        } = req.body;

        if (!customer_name || !order_date || !delivery_date) {
            return res.status(400).json({ message: 'Customer name, order date, and delivery date are required' });
        }

        const user_name = req.user.name || 'Unknown';

        await connection.beginTransaction();

        const [orderResult] = await connection.execute(
            `INSERT INTO orders (customer_name, mobile_no, address, user_name, order_date, delivery_date, total_amount, deposit_amount)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [customer_name, mobile_no || '', address || '', user_name, order_date, delivery_date, total_amount || 0, deposit_amount || 0]
        );

        const orderId = orderResult.insertId;

        if (items && items.length > 0) {
            for (const item of items) {
                await connection.execute(
                    `INSERT INTO order_items (order_id, item_type, quantity, details) VALUES (?, ?, ?, ?)`,
                    [orderId, item.item_type, item.quantity || 0, JSON.stringify(item.details || {})]
                );
            }
        }

        await connection.commit();

        return res.status(201).json({
            message: 'Order created successfully',
            bill_id: orderId,
        });
    } catch (error) {
        await connection.rollback();
        console.error('create order error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
};

/**
 * PUT /api/orders/:id
 * Updates an existing order and replaces its items.
// ! If the old one had 2 items but new one has only one or none then it will remove all of the old items. WHICH IS INTENTED
 */
const update = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { id } = req.params;
        const {
            customer_name, mobile_no, address,
            order_date, delivery_date,
            total_amount, deposit_amount,
            items,
        } = req.body;

        const [existing] = await connection.execute('SELECT id FROM orders WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await connection.beginTransaction();

        await connection.execute(
            `UPDATE orders SET customer_name = ?, mobile_no = ?, address = ?,
             order_date = ?, delivery_date = ?, total_amount = ?, deposit_amount = ?
             WHERE id = ?`,
            [customer_name, mobile_no || '', address || '', order_date, delivery_date, total_amount || 0, deposit_amount || 0, id]
        );

        await connection.execute('DELETE FROM order_items WHERE order_id = ?', [id]);

        if (items && items.length > 0) {
            for (const item of items) {
                await connection.execute(
                    `INSERT INTO order_items (order_id, item_type, quantity, details) VALUES (?, ?, ?, ?)`,
                    [id, item.item_type, item.quantity || 0, JSON.stringify(item.details || {})]
                );
            }
        }

        await connection.commit();

        return res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('update order error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    } finally {
        connection.release();
    }
};

/**
 * DELETE /api/orders/:id
 */
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute('SELECT id FROM orders WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        await db.execute('DELETE FROM orders WHERE id = ?', [id]);
        return res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('delete order error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


/**
 * GET /api/orders
 * Searches orders by bill_no, name, mobile, and date range.
 */
const search = async (req, res) => {
    try {
        const { bill_no, name, mobile, from_date, to_date } = req.query;
        let query = `SELECT id, customer_name, mobile_no, order_date, delivery_date, total_amount, deposit_amount FROM orders WHERE 1=1`;
        const params = [];

        if (bill_no) {
            query += ` AND id = ?`;
            params.push(bill_no);
        }
        if (name) {
            query += ` AND customer_name LIKE ?`;
            params.push(`%${name}%`);
        }
        if (mobile) {
            query += ` AND mobile_no LIKE ?`;
            params.push(`%${mobile}%`);
        }
        if (from_date) {
            query += ` AND order_date >= ?`;
            params.push(from_date);
        }
        if (to_date) {
            query += ` AND order_date <= ?`;
            params.push(to_date);
        }

        query += ` ORDER BY order_date DESC, id DESC`;

        const [rows] = await db.execute(query, params);
        return res.status(200).json(rows);
    } catch (error) {
        console.error('search orders error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
/**
 * GET /api/orders/report
 * Aggregates order data within a date range.
 * Returns per-bill: bill_no, customer_name, order_date, total_pants, total_shirts, total_amount, deposit_amount, remaining.
 * Also returns overall totals.
 */
const report = async (req, res) => {
    try {
        const { from_date, to_date } = req.query;

        if (!from_date || !to_date) {
            return res.status(400).json({ message: 'from_date and to_date are required' });
        }

        const [rows] = await db.execute(
            `SELECT
                o.id AS bill_no,
                o.customer_name,
                o.order_date,
                o.total_amount,
                o.deposit_amount,
                COALESCE(SUM(CASE WHEN oi.item_type = 'pant' THEN oi.quantity ELSE 0 END), 0) AS total_pants,
                COALESCE(SUM(CASE WHEN oi.item_type = 'shirt' THEN oi.quantity ELSE 0 END), 0) AS total_shirts
             FROM orders o
             LEFT JOIN order_items oi ON oi.order_id = o.id
             WHERE o.order_date >= ? AND o.order_date <= ?
             GROUP BY o.id
             ORDER BY o.order_date DESC, o.id DESC`,
            [from_date, to_date]
        );

        // Compute remaining for each row and totals
        let totalPants = 0, totalShirts = 0, totalAmount = 0, totalDeposit = 0;
        const records = rows.map((r) => {
            const amt = Number(r.total_amount) || 0;
            const dep = Number(r.deposit_amount) || 0;
            totalPants += Number(r.total_pants);
            totalShirts += Number(r.total_shirts);
            totalAmount += amt;
            totalDeposit += dep;
            return {
                ...r,
                total_amount: amt,
                deposit_amount: dep,
                remaining: Math.max(0, amt - dep),
            };
        });

        return res.status(200).json({
            records,
            totals: {
                total_pants: totalPants,
                total_shirts: totalShirts,
                total_amount: totalAmount,
                deposit_amount: totalDeposit,
                remaining: Math.max(0, totalAmount - totalDeposit),
            },
        });
    } catch (error) {
        console.error('order report error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getById, create, update, remove, search, report };