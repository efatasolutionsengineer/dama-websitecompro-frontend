import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./homeadmin.module.css"; // Menggunakan homeadmin.module.css

const ToServicesAdmin = () => {
    const [toService, setToService] = useState(null);
    const [newToService, setNewToService] = useState({
        toservices_text: "",
        toservices_img: null,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const fetchToServices = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/toservices`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        setToService(data[0]);
                    }
                } else {
                    setMessage("Failed to fetch to services.");
                }
            } catch (error) {
                console.error("Error fetching to services:", error);
                setMessage("Failed to fetch to services.");
            } finally {
                setLoading(false);
            }
        };

        fetchToServices();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewToService({ ...newToService, toservices_img: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleEdit = () => {
        if (toService) {
            setNewToService({
                toservices_text: toService.toservices_text,
                toservices_img: null,
            });
            setImagePreview(toService.toservices_img);
            setShowForm(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        if (!newToService.toservices_text || (!toService && !newToService.toservices_img)) {
            setMessage("Service text and image are required.");
            setLoading(false);
            return;
        }

        if (newToService.toservices_img && newToService.toservices_img.size > 5 * 1024 * 1024) {
            setMessage("Image size must be less than 5MB.");
            setLoading(false);
            return;
        }

        if (newToService.toservices_img && !newToService.toservices_img.type.startsWith("image/")) {
            setMessage("File type must be an image.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("toservices_text", newToService.toservices_text);
        if (newToService.toservices_img) {
            formData.append("toservices_img", newToService.toservices_img);
        }

        try {
            const url = toService
                ? `${API_BASE}/toservices/${toService.id}`
                : `${API_BASE}/toservices`;
            const method = toService ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setToService(data);
                setMessage("Service updated successfully!");
                setNewToService({ toservices_text: "", toservices_img: null });
                setImagePreview(null);
                setShowForm(false);
            } else {
                const errorData = await response.json();
                setMessage(`Failed: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage(`Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.adminContainer}>
            <h2>To Services Admin</h2>

            <div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
    Note: image size 600x500
</div>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            {toService && (
                <div className={styles.taglineItem}>
                    <div className={styles.taglineContent}>
                        <img src={toService.toservices_img} alt={toService.toservices_text} className={styles.taglineImage} />
                        <span>{toService.toservices_text}</span>
                    </div>
                    <div className={styles.taglineActions}>
                        <button onClick={handleEdit} className={styles.actionButton}>Edit</button>
                    </div>
                </div>
            )}

            {showForm && (
                <form className={styles.taglineForm} onSubmit={handleSubmit}>
                    <label htmlFor="toservicesText">Service Text:</label>
                    <input
                        type="text"
                        id="toservicesText"
                        placeholder="Service Text"
                        value={newToService.toservices_text}
                        onChange={(e) => setNewToService({ ...newToService, toservices_text: e.target.value })}
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

                    <button type="submit" disabled={loading} className={styles.actionButton}>
                        {loading ? (toService ? "Updating..." : "Adding...") : (toService ? "Update Service" : "Add Service")}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className={styles.cancelButton}>Cancel</button>
                </form>
            )}
        </section>
    );
};

export default ToServicesAdmin;