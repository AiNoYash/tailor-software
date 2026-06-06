const db = require('../config/db');

/**
 * GET /api/report
 * Query params: from_date, to_date, user_id (optional, omit or "all" for all workers)
 *
 * Returns aggregated work (pants, shirts) and withdrawal totals per worker
 * for the given date range.
 */
const getReport = async (req, res) => {
    try {
        const { from_date, to_date, user_id } = req.query;

        if (!from_date || !to_date) {
            return res.status(400).json({ message: 'from_date and to_date are required' });
        }

        // Build the WHERE clause for user filtering
        const filterAll = !user_id || user_id === 'all';
        const userFilter = filterAll ? '' : 'AND u.id = ?';
        const userParams = filterAll ? [from_date, to_date] : [from_date, to_date, user_id];

        // Query: LEFT JOIN work and withdrawals aggregated per user
        // We use sub-queries to avoid cross-join multiplication issues
        const sql = `
            SELECT
                u.id AS user_id,
                u.name AS worker_name,
                COALESCE(w.total_pants, 0)       AS total_pants,
                COALESCE(w.total_shirts, 0)      AS total_shirts,
                COALESCE(wd.total_withdrawals, 0) AS total_withdrawals
            FROM users u
            LEFT JOIN (
                SELECT user_id,
                       SUM(pants_quantity)  AS total_pants,
                       SUM(shirts_quantity) AS total_shirts
                FROM work
                WHERE work_date >= ? AND work_date <= ?
                GROUP BY user_id
            ) w ON u.id = w.user_id
            LEFT JOIN (
                SELECT user_id,
                       SUM(amount) AS total_withdrawals
                FROM withdrawals
                WHERE withdrawal_date >= ? AND withdrawal_date <= ?
                GROUP BY user_id
            ) wd ON u.id = wd.user_id
            WHERE 1 = 1 ${userFilter}
            ORDER BY u.name ASC
        `;

        // Build params: from/to for work subquery + from/to for withdrawals subquery + optional user_id
        const params = filterAll
            ? [from_date, to_date, from_date, to_date]
            : [from_date, to_date, from_date, to_date, user_id];

        const [rows] = await db.execute(sql, params);

        // Filter out rows where everything is zero (worker had no activity in range)
        // unless a specific user is requested
        const filteredRows = filterAll
            ? rows.filter(r => r.total_pants > 0 || r.total_shirts > 0 || Number(r.total_withdrawals) > 0)
            : rows;

        // Calculate totals
        const totals = filteredRows.reduce(
            (acc, row) => {
                acc.total_pants += Number(row.total_pants);
                acc.total_shirts += Number(row.total_shirts);
                acc.total_withdrawals += Number(row.total_withdrawals);
                return acc;
            },
            { total_pants: 0, total_shirts: 0, total_withdrawals: 0 }
        );

        return res.status(200).json({ rows: filteredRows, totals });
    } catch (error) {
        console.error('getReport error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getReport };
