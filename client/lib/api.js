const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = async (endpoint, options = {}) => {
    const isFormData = options.body instanceof FormData;
    
    const headers = {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...options.headers,
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        credentials: 'include',
        ...options,
        headers,
    });

    let data;
    const text = await res.text();
    try {
        data = JSON.parse(text);
    } catch (err) {
        console.error(`[API Error] Failed to parse JSON from ${endpoint}. Body:`, text);
        throw new Error('Invalid server response');
    }

    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}