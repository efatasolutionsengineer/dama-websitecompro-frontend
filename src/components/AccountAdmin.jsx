import React, { useEffect, useState } from 'react';
import { API_BASE } from '../lib/apiBase.js';

export default function AccountAdmin() {
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
            .then((response) => response.ok ? response.json() : null)
            .then((data) => {
                if (data?.email) setEmail(data.email);
            })
            .catch(() => {});
    }, []);

    async function submit(event) {
        event.preventDefault();
        setMessage('');
        const response = await fetch(`${API_BASE}/auth/account`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, currentPassword, newPassword }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            setMessage(data.error || 'Gagal menyimpan');
            return;
        }
        setCurrentPassword('');
        setNewPassword('');
        setMessage('Email dan password tersimpan');
    }

    async function logout() {
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
        window.location.replace('/adminonlydama/login/');
    }

    return (
        <form onSubmit={submit} style={{ margin: '1rem 0', display: 'grid', gap: '0.5rem', maxWidth: '360px' }}>
            <h3>Akun admin</h3>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Password saat ini" required />
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Password baru, kosongkan jika tidak diganti" />
            <button type="submit">Simpan akun</button>
            <button type="button" onClick={logout}>Keluar</button>
            {message ? <p>{message}</p> : null}
        </form>
    );
}
