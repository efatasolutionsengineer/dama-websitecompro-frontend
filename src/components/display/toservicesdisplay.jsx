import { API_BASE } from '../../lib/apiBase.js';
import React, { useState, useEffect } from 'react';
import styles from './toservicesdisplay.module.css';

const ToServicesDisplay = () => {
    const [toService, setToService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchToServices = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/toservices`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        setToService(data[0]);
                    } else {
                        setError("No services found.");
                    }
                } else {
                    setError("Failed to fetch services.");
                }
            } catch (err) {
                console.error("Error fetching to services:", err);
                setError("Failed to fetch services.");
            } finally {
                setLoading(false);
            }
        };

        fetchToServices();
    }, []);

    if (loading) return <p>Loading services...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!toService) return <p>No services available.</p>;

    const handleSpecialPackagesClick = () => {
        window.location.href = '/services/special';
    };

    const handleIndividualServicesClick = () => {
        window.location.href = '/services/individual';
    };

    return (
        <div className={styles.toServicesContainer}>

            <div className={styles.textColumn}>
                <h2>{toService.toservices_text}</h2>
                <div className={styles.buttonContainer}>
                    <button className={styles.specialPackagesButton} onClick={handleSpecialPackagesClick}>
                        Special Packages
                    </button>
                    <button className={styles.individualServicesButton} onClick={handleIndividualServicesClick}>
                        Individual Services
                    </button>
                </div>
            </div>

            <div className={styles.imageColumn}>
                <div className={styles.toServicesImageContainer}>
                    <img src={toService.toservices_img} alt={toService.toservices_text} className={styles.toServicesImage} />
                </div>
            </div>
            
        </div>
    );
};

export default ToServicesDisplay;