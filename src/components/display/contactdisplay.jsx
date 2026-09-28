import { API_BASE } from '../../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./contactdisplay.module.css";

const ContactDisplay = () => {
    const [contactData, setContactData] = useState(null);
    const [whatsappNumber, setWhatsappNumber] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const fetchContactData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/contacts`);
                if (response.ok) {
                    const data = await response.json();
                    setContactData(data[0]);
                } else {
                    throw new Error("Failed to fetch contact data");
                }
            } catch (error) {
                setHasError(true);
                console.error("Error fetching contact data:", error); 
            }
        };

        const fetchWhatsappNumber = async () => {
            try {
                const response = await fetch(`${API_BASE}/dama`);
                if (response.ok) {
                    const data = await response.json();
                    setWhatsappNumber(data[0].dama_whatsapp);
                } else {
                    throw new Error("Failed to fetch whatsapp number");
                }
            } catch (error) {
                setHasError(true);
                console.error("Error fetching whatsapp number:", error); 
            } finally {
                setLoading(false);
            }
        };

        fetchContactData();
        fetchWhatsappNumber();
    }, []);

    if (loading) {
        return (
            <div className="loading-error-message loading">
                <p>Loading contact us...</p>
            </div>
        );
    }

    if (hasError) return null;
    if (!contactData || !whatsappNumber) return null;

    return (
        <div className={styles.contactContainer} style={{ backgroundImage: `url(${contactData.contact_image})` }}>
            <div className={styles.contactContent}>
                <h2 className={styles.contactTitle}>{contactData.contact_title}</h2>
                <p className={styles.contactSubtitle}>{contactData.contact_subtitle}</p>
                <a href={`https://wa.me/${whatsappNumber}`} className={styles.whatsappLink} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                </a>
            </div>
        </div>
    );
};

export default ContactDisplay;