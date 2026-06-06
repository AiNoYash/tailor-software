const API_BASE = '/api';

/**
 * Fetch all users (admin + workers).
 * @param {string} token - JWT token
 */
export const fetchWorkers = async (token) => {
    const response = await fetch(`${API_BASE}/workers`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch workers');
    }

    return data;
};

/**
 * Create a new worker.
 * @param {{ name: string, mobile_no: string, password: string }} workerData
 * @param {string} token - JWT token
 */
export const createWorker = async (workerData, token) => {
    const response = await fetch(`${API_BASE}/workers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(workerData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to create worker');
    }

    return data;
};

/**
 * Update an existing worker.
 * @param {number} id - Worker ID
 * @param {{ name?: string, mobile_no?: string, password?: string }} updates
 * @param {string} token - JWT token
 */
export const updateWorker = async (id, updates, token) => {
    const response = await fetch(`${API_BASE}/workers/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to update worker');
    }

    return data;
};

/**
 * Delete an existing worker.
 * @param {number} id - Worker ID
 * @param {string} token - JWT token
 */
export const deleteWorker = async (id, token) => {
    const response = await fetch(`${API_BASE}/workers/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to delete worker');
    }

    return data;
};
