import { API_BASE } from '../../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./connectdisplay.module.css";

const ConnectDisplay = () => {
    const [connectData, setConnectData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [damaWhatsapp, setDamaWhatsapp] = useState(null);

    useEffect(() => {
        const fetchConnectData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/connect`);
                if (response.ok) {
                    const data = await response.json();
                    setConnectData(data[0]); // Mengambil elemen pertama karena hanya ada satu data
                } else {
                    throw new Error("Failed to fetch connect data.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchDamaData = async () => {
            try {
                const response = await fetch(`${API_BASE}/dama`);
                if (response.ok) {
                    const data = await response.json();
                    setDamaWhatsapp(data[0].dama_whatsapp);
                } else {
                    throw new Error("Failed to fetch dama data.");
                }
            } catch (err) {
                console.error("Error fetching dama data:", err);
            }
        };

        fetchConnectData();
        fetchDamaData();
    }, []);

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;
    if (!connectData) return null;

    const whatsappLink = damaWhatsapp ? `https://wa.me/${damaWhatsapp}` : "#";

    return (
        <div className={styles.connectContainer} style={{ backgroundImage: `url(${connectData.connect_img})` }}>
            <div className={styles.connectContent}>
                <h2>{connectData.connect_text}</h2>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={styles.contactButton}>Work with us</a>
            </div>
        </div>
    );
};

export default ConnectDisplay;