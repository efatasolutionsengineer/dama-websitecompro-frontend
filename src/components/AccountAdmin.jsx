import React, { useEffect, useState } from 'react';
import { API_BASE } from '../lib/apiBase.js';
import styles from './auth.module.css';

export default function AccountAdmin() {
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [editing, setEditing] = useState(false);

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
        setEditing(false);
        setMessage('Email dan password tersimpan');
    }

    async function logout() {
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
        window.location.replace('/adminonlydama/login/');
    }

    return (
        <form className={styles.session} onSubmit={submit}>
            <div className={styles.sessionTop}>
                <p className={styles.who}>
                    Akun admin
                    <strong>{email || 'Memuat akun...'}</strong>
                </p>
                <div className={styles.actions}>
                    <button className={styles.ghost} type="button" onClick={() => { setEditing((open) => !open); setMessage(''); }}>
                        {editing ? 'Tutup' : 'Ubah akun'}
                    </button>
                    <button className={styles.ghost} type="button" onClick={logout}>Keluar</button>
                </div>
            </div>
            {editing ? (
                <div className={styles.editor}>
                    <label className={`${styles.field} ${styles.wide}`}>
                        <span>Email</span>
                        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" />
                    </label>
                    <label className={styles.field}>
                        <span>Password saat ini</span>
                        <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required autoComplete="current-password" />
                    </label>
                    <label className={styles.field}>
                        <span>Password baru</span>
                        <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Kosongkan jika tidak diganti" autoComplete="new-password" />
                    </label>
                    <button className={styles.primary} type="submit">Simpan akun</button>
                </div>
            ) : null}
            {message ? <p className={message.includes('tersimpan') ? styles.success : styles.error}>{message}</p> : null}
        </form>
    );
}
