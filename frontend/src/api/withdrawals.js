const API_BASE = '/api';

/**
 * Fetch all withdrawal records (optionally filtered by month).
 * @param {string} token - JWT token
 * @param {string} [month] - Format YYYY-MM
 */
export const fetchWithdrawals = async (token, month = '') => {
    let url = `${API_BASE}/withdrawals`;
    if (month) {
        url += `?month=${encodeURIComponent(month)}`;
    }
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch withdrawal records');
    return data;
};

/**
 * Create a new withdrawal record.
 * @param {{ user_id: number, withdrawal_date: string, amount: number }} withdrawalData
 * @param {string} token - JWT token
 */
export const createWithdrawal = async (withdrawalData, token) => {
    const response = await fetch(`${API_BASE}/withdrawals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(withdrawalData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create withdrawal record');
    return data;
};

/**
 * Update a withdrawal record.
 * @param {number} id
 * @param {{ user_id?: number, withdrawal_date?: string, amount?: number }} updates
 * @param {string} token - JWT token
 */
export const updateWithdrawal = async (id, updates, token) => {
    const response = await fetch(`${API_BASE}/withdrawals/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update withdrawal record');
    return data;
};

/**
 * Delete a withdrawal record.
 * @param {number} id
 * @param {string} token - JWT token
 */
export const deleteWithdrawal = async (id, token) => {
    const response = await fetch(`${API_BASE}/withdrawals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete withdrawal record');
    return data;
};
