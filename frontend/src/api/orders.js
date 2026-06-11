const API_BASE = '/api';

export const fetchOrder = async (id, token) => {
    const response = await fetch(`${API_BASE}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch order');
    return data;
};

export const createOrder = async (orderData, token) => {
    const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create order');
    return data;
};

export const updateOrder = async (id, orderData, token) => {
    const response = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update order');
    return data;
};

export const deleteOrder = async (id, token) => {
    const response = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete order');
    return data;
};


export const searchOrders = async (params, token) => {
    const query = new URLSearchParams();
    if (params.billNo) query.append('bill_no', params.billNo);
    if (params.name) query.append('name', params.name);
    if (params.mobile) query.append('mobile', params.mobile);
    if (params.fromDate) query.append('from_date', params.fromDate);
    if (params.toDate) query.append('to_date', params.toDate);

    const response = await fetch(`${API_BASE}/orders?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to search orders');
    return data;
};