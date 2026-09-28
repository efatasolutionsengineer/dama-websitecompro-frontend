import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./homeadmin.module.css";

const AboutAdmin = () => {
    const [about, setAbout] = useState(null);
    const [newAbout, setNewAbout] = useState({
        about_title: "",
        about_subtitle: "",
        about_img: null,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const fetchAbout = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/abouts`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        setAbout(data[0]);
                    }
                } else {
                    setMessage("Failed to fetch about data.");
                }
            } catch (error) {
                console.error("Error fetching about data:", error);
                setMessage("Failed to fetch about data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAbout();
    }, []);

    const updateAbout = async () => {
        if (!newAbout.about_title) {
            setMessage("About title is required.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("about_title", newAbout.about_title);
            formData.append("about_subtitle", newAbout.about_subtitle);
            if (newAbout.about_img) {
                formData.append("about_img", newAbout.about_img);
            }

            const response = await fetch(`${API_BASE}/abouts/${about.id}`, {
                method: "PUT",
                body: formData,
            });

            if (response.ok) {
                setMessage("About updated successfully!");
                const updatedData = await response.json();
                setAbout(updatedData);
                setNewAbout({ about_title: "", about_subtitle: "", about_img: null });
                setImagePreview(null);
                setShowForm(false);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update about: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating about:", error);
            setMessage(`Failed to update about: ${error.message}`);
        }
        setLoading(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewAbout({ ...newAbout, about_img: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleEdit = () => {
        if (about) {
            setNewAbout({
                about_title: about.about_title,
                about_subtitle: about.about_subtitle,
                about_img: null,
            });
            setImagePreview(about.about_img);
            setShowForm(true);
        }
    };

    return (
        <section className={styles.adminContainer}>
            <h2>About Admin</h2>

            <div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
    Note: image size 600x600
</div>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            {about && (
                <div className={styles.taglineItem}>
                    <div className={styles.taglineContent}>
                        <img src={about.about_img} alt={about.about_title} className={styles.taglineImage} />
                        <div>
                            <span>{about.about_title}</span>
                            <p>{about.about_subtitle}</p>
                        </div>
                    </div>
                    <div className={styles.taglineActions}>
                        <button onClick={handleEdit} className={styles.actionButton}>Edit</button>
                    </div>
                </div>
            )}

            {showForm && (
                <form className={styles.taglineForm}>
                    <label htmlFor="aboutTitle">About Title:</label>
                    <input
                        type="text"
                        id="aboutTitle"
                        placeholder="About Title"
                        value={newAbout.about_title}
                        onChange={(e) => setNewAbout({ ...newAbout, about_title: e.target.value })}
                        className={styles.inputField}
                    />
                    <label htmlFor="aboutSubTitle">About Sub Title:</label>
                    <input
                        type="text"
                        id="aboutSubTitle"
                        placeholder="About Sub Title"
                        value={newAbout.about_subtitle}
                        onChange={(e) => setNewAbout({ ...newAbout, about_subtitle: e.target.value })}
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

                    <button onClick={updateAbout} disabled={loading} className={styles.actionButton}>
                        {loading ? "Updating..." : "Update About"}
                    </button>
                    <button onClick={() => { setShowForm(false); }} className={styles.cancelButton}>Cancel</button>
                </form>
            )}
        </section>
    );
};

export default AboutAdmin;