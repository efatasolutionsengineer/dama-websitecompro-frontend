import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./homeadmin.module.css";

const ConnectAdmin = () => {
    const [connect, setConnect] = useState(null); // Ubah ke satu item
    const [newConnect, setNewConnect] = useState({
        connect_text: "",
        connect_img: null,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const fetchConnectData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/connect`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        setConnect(data[0]); // Ambil hanya item pertama
                    }
                } else {
                    setMessage("Failed to fetch connect data.");
                }
            } catch (error) {
                console.error("Error fetching connect data:", error);
                setMessage("Failed to fetch connect data.");
            } finally {
                setLoading(false);
            }
        };

        fetchConnectData();
    }, []);

    const updateConnect = async () => {
        if (!newConnect.connect_text) {
            setMessage("Connect text is required.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("connect_text", newConnect.connect_text);
            if (newConnect.connect_img) {
                formData.append("connect_img", newConnect.connect_img);
            }

            const response = await fetch(`${API_BASE}/connect/${connect.id}`, {
                method: "PUT",
                body: formData,
            });

            if (response.ok) {
                setMessage("Connect data updated successfully!");
                const updatedData = await response.json();
                setConnect(updatedData); // Perbarui dengan data yang diterima
                setNewConnect({
                    connect_text: "",
                    connect_img: null,
                });
                setImagePreview(null);
                setShowForm(false);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update connect data: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating connect data:", error);
            setMessage(`Failed to update connect data: ${error.message}`);
        }
        setLoading(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewConnect({ ...newConnect, connect_img: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleEdit = () => {
        if (connect) {
            setNewConnect({
                connect_text: connect.connect_text,
                connect_img: null,
            });
            setImagePreview(connect.connect_img);
            setShowForm(true);
        }
    };

    return (
        <section className={styles.adminContainer}>
            <h2>Connect Admin</h2>

            <div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
    Note: image size 1200x700
</div>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            {connect && (
                <div className={styles.taglineItem}>
                    <div className={styles.taglineContent}>
                        <img src={connect.connect_img} alt={connect.connect_text} className={styles.taglineImage} />
                        <div>
                            <span>{connect.connect_text}</span>
                        </div>
                    </div>
                    <div className={styles.taglineActions}>
                        <button onClick={handleEdit} className={styles.actionButton}>Edit</button>
                    </div>
                </div>
            )}

            {showForm && (
                <form className={styles.taglineForm}>
                    <label htmlFor="connectText">Connect Text:</label>
                    <input
                        type="text"
                        id="connectText"
                        placeholder="Connect Text"
                        value={newConnect.connect_text}
                        onChange={(e) => setNewConnect({ ...newConnect, connect_text: e.target.value })}
                        className={styles.inputField}
                    />
                    <div className={styles.imageUploadContainer}>
                        <div className={styles.imageUploadBox}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                id="imageUpload"
                                style={{ display: "none" }}
                            />
                            <label htmlFor="imageUpload">Upload Image</label>
                        </div>
                        {imagePreview && <img src={imagePreview} alt="Preview" className={styles.imagePreview} />}
                    </div>

                    <button onClick={updateConnect} disabled={loading} className={styles.actionButton}>
                        {loading ? "Updating..." : "Update Connect"}
                    </button>
                    <button onClick={() => setShowForm(false)} className={styles.cancelButton}>Cancel</button>
                </form>
            )}
        </section>
    );
};

export default ConnectAdmin;