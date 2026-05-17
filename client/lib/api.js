import { getApiBase } from './apiBase.js';

const BASE_URL = getApiBase();

function parseErrorMessage(data, statusText) {
    if (typeof data?.message === 'string' && !data.message.trim().startsWith('[')) {
        return data.message;
    }
    if (data?.error?.message) return data.error.message;
    if (Array.isArray(data?.details) && data.details[0]?.message) {
        return data.details[0].message;
    }
    return statusText || 'Request failed';
}

export const api = async (endpoint, options = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        ...options,
    });

    let data = {};
    try {
        data = await res.json();
    } catch {
        data = {};
    }

    if (!res.ok) {
        throw new Error(parseErrorMessage(data, res.statusText));
    }
    return data;
};
