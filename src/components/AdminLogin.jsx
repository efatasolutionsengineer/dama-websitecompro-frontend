import React, { useState } from 'react';
import { API_BASE } from '../lib/apiBase.js';
import styles from './auth.module.css';

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
        <div className={styles.loginShell}>
            <form className={styles.card} onSubmit={submit}>
                <p className={styles.eyebrow}>Dama Studio</p>
                <h1 className={styles.title}>Masuk admin</h1>
                <p className={styles.lede}>Gunakan akun admin untuk mengubah isi situs.</p>
                <label className={styles.field}>
                    <span>Email</span>
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" />
                </label>
                <label className={styles.field}>
                    <span>Password</span>
                    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
                </label>
                <button className={styles.primary} type="submit">Masuk</button>
                {message ? <p className={styles.error}>{message}</p> : null}
            </form>
        </div>
    );
}
