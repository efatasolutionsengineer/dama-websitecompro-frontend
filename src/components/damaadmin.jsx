import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./homeadmin.module.css"; // Menggunakan homeadmin.module.css

const DamaAdmin = () => {
    const [damaData, setDamaData] = useState([]);
    const [newDama, setNewDama] = useState({
        dama_whatsapp: "",
        dama_instagram: "",
        dama_linkedin: "",
        dama_tiktok: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedDama, setSelectedDama] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        const fetchDamaData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/dama`);
                if (response.ok) {
                    const data = await response.json();
                    setDamaData(data);
                } else {
                    setMessage("Failed to fetch Dama data.");
                }
            } catch (error) {
                console.error("Error fetching Dama data:", error);
                setMessage("Failed to fetch Dama data.");
            } finally {
                setLoading(false);
            }
        };

        fetchDamaData();
    }, []);

    const updateDama = async () => {
        if (!newDama.dama_whatsapp || !newDama.dama_instagram || !newDama.dama_linkedin || !newDama.dama_tiktok) {
            setMessage("All fields are required.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/dama/${selectedDama.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newDama),
            });

            if (response.ok) {
                setMessage("Dama data updated successfully!");
                const updatedData = await response.json();
                const updatedDamaData = damaData.map(dama =>
                    dama.id === updatedData.id ? updatedData : dama
                );
                setDamaData(updatedDamaData);
                setNewDama({
                    dama_whatsapp: "",
                    dama_instagram: "",
                    dama_linkedin: "",
                    dama_tiktok: "",
                });
                setSelectedDama(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update Dama data: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating Dama data:", error);
            setMessage(`Failed to update Dama data: ${error.message}`);
        }
        setLoading(false);
    };

    const handleEdit = (dama, index) => {
        setSelectedDama(dama);
        setNewDama({
            dama_whatsapp: dama.dama_whatsapp,
            dama_instagram: dama.dama_instagram,
            dama_linkedin: dama.dama_linkedin,
            dama_tiktok: dama.dama_tiktok,
        });
        setEditIndex(index);
        setShowForm(true);
    };

    return (
        <section className={styles.adminContainer}>
            <h2>Dama Admin</h2>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            <div className={styles.taglineList}>
                {damaData.length > 0 && damaData.map((dama, index) => (
                    <div key={dama.id} className={styles.taglineItem}>
                        <div className={styles.taglineContent}>
                            <div>
                                <p>WhatsApp: {dama.dama_whatsapp}</p>
                                <p>Instagram: {dama.dama_instagram}</p>
                                <p>LinkedIn: {dama.dama_linkedin}</p>
                                <p>TikTok: {dama.dama_tiktok}</p>
                            </div>
                        </div>
                        <div className={styles.taglineActions}>
                            <button onClick={() => handleEdit(dama, index)} className={styles.actionButton}>Edit</button>
                        </div>
                        {showForm && editIndex === index && (
                            <form className={`${styles.taglineForm} ${styles.editForm}`}>
                                <label htmlFor="editWhatsapp">WhatsApp:</label>
                                <input
                                    type="text"
                                    id="editWhatsapp"
                                    placeholder="WhatsApp"
                                    value={newDama.dama_whatsapp}
                                    onChange={(e) => setNewDama({ ...newDama, dama_whatsapp: e.target.value })}
                                    className={styles.inputField}
                                />
                                <label htmlFor="editInstagram">Instagram:</label>
                                <input
                                    type="text"
                                    id="editInstagram"
                                    placeholder="Instagram"
                                    value={newDama.dama_instagram}
                                    onChange={(e) => setNewDama({ ...newDama, dama_instagram: e.target.value })}
                                    className={styles.inputField}
                                />
                                <label htmlFor="editLinkedin">LinkedIn:</label>
                                <input
                                    type="text"
                                    id="editLinkedin"
                                    placeholder="LinkedIn"
                                    value={newDama.dama_linkedin}
                                    onChange={(e) => setNewDama({ ...newDama, dama_linkedin: e.target.value })}
                                    className={styles.inputField}
                                />
                                <label htmlFor="editTiktok">TikTok:</label>
                                <input
                                    type="text"
                                    id="editTiktok"
                                    placeholder="TikTok"
                                    value={newDama.dama_tiktok}
                                    onChange={(e) => setNewDama({ ...newDama, dama_tiktok: e.target.value })}
                                    className={styles.inputField}
                                />

                                <button onClick={updateDama} disabled={loading} className={styles.actionButton}>
                                    {loading ? "Updating..." : "Update Dama"}
                                </button>
                                <button onClick={() => { setShowForm(false); setEditIndex(null); }} className={styles.cancelButton}>Cancel</button>
                            </form>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default DamaAdmin;