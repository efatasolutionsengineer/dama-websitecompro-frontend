import React, { useState } from 'react';
import { API_BASE } from '../lib/apiBase.js';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    async function submit(event) {
        event.preventDefault();
        setMessage('');
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            setMessage('Email atau password salah');
            return;
        }
        window.location.replace('/adminonlydama/homedama/');
    }

    return (
        <form onSubmit={submit} style={{ maxWidth: '360px', margin: '4rem auto', display: 'grid', gap: '0.75rem' }}>
            <h1>Admin login</h1>
            <label>
                Email
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ width: '100%' }} />
            </label>
            <label>
                Password
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required style={{ width: '100%' }} />
            </label>
            <button type="submit">Masuk</button>
            {message ? <p>{message}</p> : null}
        </form>
    );
}
