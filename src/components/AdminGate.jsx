import React, { useEffect, useState } from 'react';
import { API_BASE } from '../lib/apiBase.js';

export default function AdminGate({ children }) {
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
            .then((response) => setStatus(response.ok ? 'in' : 'out'))
            .catch(() => setStatus('out'));
    }, []);

    useEffect(() => {
        if (status === 'out') {
            window.location.replace('/adminonlydama/login');
        }
    }, [status]);

    if (status !== 'in') {
        return <p style={{ padding: '2rem' }}>Memeriksa sesi...</p>;
    }

    return children;
}
