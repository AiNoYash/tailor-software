const API_BASE = '/api';

/**
 * Fetch report data.
 * @param {{ from_date: string, to_date: string, user_id?: string }} params
 * @param {string} token - JWT token
 */
export const fetchReport = async (params, token) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/report?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch report');
    return data;
};
