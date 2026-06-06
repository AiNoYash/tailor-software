const API_BASE = '/api';
/**
 * Fetch all expense records.
 * @param {string} token - JWT token
 */
export const fetchExpenses = async (token) => {
    const response = await fetch(`${API_BASE}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch expense records');
    return data;
};
/**
 * Create a new expense record.
 * @param {{ expense_date: string, amount: number, description?: string }} expenseData
 * @param {string} token - JWT token
 */
export const createExpense = async (expenseData, token) => {
    const response = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create expense record');
    return data;
};
/**
 * Update an expense record.
 * @param {number} id
 * @param {{ expense_date?: string, amount?: number, description?: string }} updates
 * @param {string} token - JWT token
 */
export const updateExpense = async (id, updates, token) => {
    const response = await fetch(`${API_BASE}/expenses/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update expense record');
    return data;
};
/**
 * Delete an expense record.
 * @param {number} id
 * @param {string} token - JWT token
 */
export const deleteExpense = async (id, token) => {
    const response = await fetch(`${API_BASE}/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete expense record');
    return data;
};
/**
 * Fetch expense report data.
 * @param {{ from_date: string, to_date: string }} params
 * @param {string} token - JWT token
 */
export const fetchExpenseReport = async (params, token) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/expenses/report?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch expense report');
    return data;
};
