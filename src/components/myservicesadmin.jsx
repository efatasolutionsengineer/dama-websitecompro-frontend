import React, { useState } from 'react';
import ServicesSpecialAdmin from '../components/servicesspecialadmin.jsx';
import ServicesIndividualAdmin from '../components/servicesindividualadmin.jsx';
import ServicesPageAdmin from '../components/servicespageadmin.jsx';
import styles from './myhomeadmin.module.css'; // Menggunakan gaya yang sama

const MyServicesAdmin = () => {
    const [showSpecialServices, setShowSpecialServices] = useState(false);
    const [showIndividualServices, setShowIndividualServices] = useState(false);
    const [showServicesPage, setShowServicesPage] = useState(false);

    const navigateTo = (path) => {
        window.location.href = path;
    };

    return (
        <div className={styles.adminContainer}>
            <h2>Services Admin Panel</h2>
            <div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
                Note: Uploads are limited to 5GB due to database constraints.
            </div>

            {/* Container untuk tombol "Go to" */}
            <div className={styles.goToContainer}>
                <button onClick={() => navigateTo('/adminonlydama/homedama/')} className={`${styles.adminButton} ${styles.goToButton}`}>Go to Home Page</button>
                <button onClick={() => navigateTo('/adminonlydama/worksdama/')} className={`${styles.adminButton} ${styles.goToButton}`}>Go to Works Page</button>
                <button onClick={() => navigateTo('/adminonlydama/footerdama/')} className={`${styles.adminButton} ${styles.goToButton}`}>Go to Footer Page</button>
                <button onClick={() => navigateTo('/adminonlydama/aboutdama/')} className={`${styles.adminButton} ${styles.goToButton}`}>Go to About Page</button>
                <button onClick={() => navigateTo('/adminonlydama/blogsdama/')} className={`${styles.adminButton} ${styles.goToButton}`}>Go to Blogs Page</button>
            </div>

            {/* Container untuk tombol "Show" */}
            <div className={styles.showContainer}>
                <button
                    onClick={() => setShowSpecialServices(!showSpecialServices)}
                    className={`${styles.adminButton} ${showSpecialServices ? styles.active : ''}`}
                >
                    {showSpecialServices ? 'Hide Special Services' : 'Show Special Services'}
                </button>
                <button
                    onClick={() => setShowIndividualServices(!showIndividualServices)}
                    className={`${styles.adminButton} ${showIndividualServices ? styles.active : ''}`}
                >
                    {showIndividualServices ? 'Hide Individual Services' : 'Show Individual Services'}
                </button>
                <button
                    onClick={() => setShowServicesPage(!showServicesPage)}
                    className={`${styles.adminButton} ${showServicesPage ? styles.active : ''}`}
                >
                    {showServicesPage ? 'Hide Services Page Admin' : 'Show Services Page Admin'}
                </button>
            </div>

            {showSpecialServices && <ServicesSpecialAdmin />}
            {showIndividualServices && <ServicesIndividualAdmin />}
            {showServicesPage && <ServicesPageAdmin />}
        </div>
    );
};

export default MyServicesAdmin;