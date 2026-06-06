const API_BASE = '/api';

/**
 * Send login request to the backend.
 *
 * @param {{ mobile_no: string, password: string, role: string }} credentials
 * @returns {Promise<{ token: string, user: object }>}
 */
export const loginUser = async ({ mobile_no, password, role }) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_no, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }

    return data;
};
