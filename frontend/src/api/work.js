const API_BASE = '/api';

/**
 * Fetch all work records (optionally filtered by month).
 * @param {string} token - JWT token
 * @param {string} [month] - Format YYYY-MM
 */
export const fetchWork = async (token, month = '') => {
    let url = `${API_BASE}/work`;
    if (month) {
        url += `?month=${encodeURIComponent(month)}`;
    }
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch work records');
    return data;
};

/**
 * Create a new work record.
 * @param {{ user_id: number, work_date: string, pants_quantity: number, shirts_quantity: number }} workData
 * @param {string} token - JWT token
 */
export const createWork = async (workData, token) => {
    const response = await fetch(`${API_BASE}/work`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(workData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create work record');
    return data;
};

/**
 * Update a work record.
 * @param {number} id
 * @param {{ user_id?: number, work_date?: string, pants_quantity?: number, shirts_quantity?: number }} updates
 * @param {string} token - JWT token
 */
export const updateWork = async (id, updates, token) => {
    const response = await fetch(`${API_BASE}/work/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update work record');
    return data;
};

/**
 * Delete a work record.
 * @param {number} id
 * @param {string} token - JWT token
 */
export const deleteWork = async (id, token) => {
    const response = await fetch(`${API_BASE}/work/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete work record');
    return data;
};
