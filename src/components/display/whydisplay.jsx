import { API_BASE } from '../../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./whydisplay.module.css";

const WhyDisplay = () => {
    const [whyData, setWhyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWhyData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/whys`);
                if (response.ok) {
                    const data = await response.json();
                    setWhyData(data);
                } else {
                    throw new Error("Failed to fetch why data.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWhyData();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <section className={styles.whyDisplayContainer}>
            <h2>Why Us?</h2>
            {whyData.map((why, index) => (
                <div key={why.id} className={styles.whyItem}>
                    <p>
                        {index + 1}. {why.why_content}
                    </p>
                </div>
            ))}
        </section>
    );
};

export default WhyDisplay;