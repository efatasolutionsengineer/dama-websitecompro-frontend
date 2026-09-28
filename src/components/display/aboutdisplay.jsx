import { API_BASE } from '../../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./aboutdisplay.module.css";

const AboutDisplay = () => {
    const [aboutData, setAboutData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAboutData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/abouts`);
                if (response.ok) {
                    const data = await response.json();
                    setAboutData(data);
                } else {
                    throw new Error("Failed to fetch about data.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAboutData();
    }, []);

    if (loading) {
        return (
            <div className="loading-error-message loading">
                <p>Loading about us...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="loading-error-message error">
                <p>Error loading about us data: {error}</p>
            </div>
        );
    }

    return (
        <section className={styles.aboutDisplayContainer}>
            {aboutData.map((about) => (
                <div key={about.id} className={styles.aboutItem}>
                    <div className={styles.imageContainer}>
                        <img src={about.about_img} alt={about.about_title} className={styles.aboutImage} />
                    </div>
                    <div className={styles.textContainer}>
                        <h2>{about.about_title}</h2>
                        <p>{about.about_subtitle}</p>
                    </div>
                </div>
            ))}
        </section>
    );
};

export default AboutDisplay;