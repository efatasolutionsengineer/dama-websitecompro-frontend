import { API_BASE } from '../../lib/apiBase.js';
import React, { useState, useEffect } from 'react';
import styles from './servicespage.module.css';

const ServicesPage = () => {
    const [servicesData, setServicesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServicesData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/services`);
                if (!response.ok) {
                    throw new Error("Failed to fetch services data.");
                }
                const data = await response.json();
                setServicesData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchServicesData();
    }, []);

    if (loading) return <p>Loading services...</p>;
    if (error) return <p>Error loading services: {error}</p>;

    return (
        <div className={styles.servicesContainer}>
            {servicesData.length > 0 && (
                <>
                    <div className={styles.serviceItem}>
                        <a href="/services/special" className={styles.serviceLink}>
                            <img
                                src={servicesData[0].special_img}
                                alt="Special Packages"
                                className={styles.serviceImage}
                            />
                            <h2 className={styles.serviceTitle}>Special Packages</h2>
                        </a>
                    </div>
                    <div className={styles.serviceItem}>
                        <a href="/services/individual" className={styles.serviceLink}>
                            <img
                                src={servicesData[0].individual_img}
                                alt="Individual Services"
                                className={styles.serviceImage}
                            />
                            <h2 className={styles.serviceTitle}>Individual Services</h2>
                        </a>
                    </div>
                </>
            )}
            {servicesData.length === 0 && <p>No services data available.</p>}
        </div>
    );
};

export default ServicesPage;