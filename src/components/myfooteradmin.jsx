import React, { useState } from 'react';
import DamaAdmin from '../components/damaadmin.jsx';
import FaqAdmin from '../components/faqadmin.jsx';
import ContactAdmin from '../components/contactadmin.jsx';
import styles from './myhomeadmin.module.css'; // Menggunakan gaya yang sama

const MyFooterAdmin = () => {
    const [showDamaAdmin, setShowDamaAdmin] = useState(false);
    const [showFaqAdmin, setShowFaqAdmin] = useState(false);
    const [showContactAdmin, setShowContactAdmin] = useState(false);

    const navigateTo = (path) => {
        window.location.href = path;
    };

    return (
        <div className={styles.adminContainer}>
            <h2>Footer Admin Panel</h2>
            <div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
    Note: Uploads are limited to 5GB due to database constraints.
</div>

            {/* Container untuk tombol "Go to" */}
            <div className={styles.goToContainer}>
                <button onClick={() => navigateTo('/adminonlydama/servicesdama/')} className={`${styles.adminButton} ${styles.goToButton}`}>Go to Services Page</button>
                <button onClick={() => navigateTo('/adminonlydama/worksdama/')} className={`${styles.adminButton} ${styles.goToButton}`}>Go to Works Page</button>
                <button onClick={() => navigateTo('/adminonlydama/homedama/')} className={`${styles.adminButton} ${styles.goToButton}`}>Go to Home Page</button>
                <button onClick={() => navigateTo('/adminonlydama/aboutdama/')} className={`${styles.adminButton} ${styles.goToButton}`}>Go to About Page</button>
                <button onClick={() => navigateTo('/adminonlydama/blogsdama/')} className={`${styles.adminButton} ${styles.goToButton}`}>Go to Blogs Page</button>
            </div>

            {/* Container untuk tombol "Show" */}
            <div className={styles.showContainer}>
                <button
                    onClick={() => setShowDamaAdmin(!showDamaAdmin)}
                    className={`${styles.adminButton} ${showDamaAdmin ? styles.active : ''}`}
                >
                    {showDamaAdmin ? 'Hide Dama Admin' : 'Show Dama Admin'}
                </button>
                <button
                    onClick={() => setShowFaqAdmin(!showFaqAdmin)}
                    className={`${styles.adminButton} ${showFaqAdmin ? styles.active : ''}`}
                >
                    {showFaqAdmin ? 'Hide FAQ Admin' : 'Show FAQ Admin'}
                </button>
                <button
                    onClick={() => setShowContactAdmin(!showContactAdmin)}
                    className={`${styles.adminButton} ${showContactAdmin ? styles.active : ''}`}
                >
                    {showContactAdmin ? 'Hide Contact Admin' : 'Show Contact Admin'}
                </button>
            </div>

            {showDamaAdmin && <DamaAdmin />}
            {showFaqAdmin && <FaqAdmin />}
            {showContactAdmin && <ContactAdmin />}
        </div>
    );
};

export default MyFooterAdmin;