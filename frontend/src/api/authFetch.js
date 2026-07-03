import useAuthStore from '../store/useAuthStore';

/**
 * Wrapper around fetch that automatically logs the user out
 * when the server responds with 401 (token expired / invalid).
 *
 * Usage is identical to the native fetch API.
 */
const authFetch = async (url, options = {}) => {
    const response = await fetch(url, options);

    if (response.status === 401) {
        // Token is expired or invalid — force logout
        useAuthStore.getState().logout();
        window.location.href = '/login';
        // Return the response so callers can still inspect it if needed
        return response;
    }

    return response;
};

export default authFetch;
