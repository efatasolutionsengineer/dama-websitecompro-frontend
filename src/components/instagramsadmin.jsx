import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./homeadmin.module.css";

const InstagramsAdmin = () => {
    const [instagrams, setInstagrams] = useState([]);
    const [newInstagram, setNewInstagram] = useState({
        instagram_img: null,
        instagram_name: "",
        instagram_link: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedInstagram, setSelectedInstagram] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        const fetchInstagrams = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/instagrams`);
                if (response.ok) {
                    const data = await response.json();
                    setInstagrams(data);
                } else {
                    setMessage("Failed to fetch Instagram data.");
                }
            } catch (error) {
                console.error("Error fetching Instagram data:", error);
                setMessage("Failed to fetch Instagram data.");
            } finally {
                setLoading(false);
            }
        };

        fetchInstagrams();
    }, []);

    const addInstagram = async () => {
        if (!newInstagram.instagram_img || !newInstagram.instagram_name || !newInstagram.instagram_link) {
            setMessage("Instagram image, name, and link are required.");
            return;
        }

        if (newInstagram.instagram_img.size > 5 * 1024 * 1024) {
            setMessage("Image size must be less than 5MB.");
            return;
        }

        if (!newInstagram.instagram_img.type.startsWith("image/")) {
            setMessage("File type must be an image.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("instagram_img", newInstagram.instagram_img);
            formData.append("instagram_name", newInstagram.instagram_name);
            formData.append("instagram_link", newInstagram.instagram_link);

            const response = await fetch(`${API_BASE}/instagrams`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setMessage("Instagram data added successfully!");
                const data = await response.json();
                setInstagrams([...instagrams, data]);
                setNewInstagram({
                    instagram_img: null,
                    instagram_name: "",
                    instagram_link: "",
                });
                setImagePreview(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to add Instagram data: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error adding Instagram data:", error);
            setMessage(`Failed to add Instagram data: ${error.message}`);
        }
        setLoading(false);
    };

    const updateInstagram = async () => {
        if (!newInstagram.instagram_name || !newInstagram.instagram_link) {
            setMessage("Instagram name and link are required.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("instagram_name", newInstagram.instagram_name);
            formData.append("instagram_link", newInstagram.instagram_link);
            if (newInstagram.instagram_img) {
                formData.append("instagram_img", newInstagram.instagram_img);
            }

            const response = await fetch(`${API_BASE}/instagrams/${selectedInstagram.id}`, {
                method: "PUT",
                body: formData,
            });

            if (response.ok) {
                setMessage("Instagram data updated successfully!");
                const updatedData = await response.json();
                const updatedInstagrams = instagrams.map(instagram =>
                    instagram.id === updatedData.id ? updatedData : instagram
                );
                setInstagrams(updatedInstagrams);
                setNewInstagram({
                    instagram_img: null,
                    instagram_name: "",
                    instagram_link: "",
                });
                setSelectedInstagram(null);
                setImagePreview(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update Instagram data: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating Instagram data:", error);
            setMessage(`Failed to update Instagram data: ${error.message}`);
        }
        setLoading(false);
    };

    const deleteInstagram = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this Instagram data?");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/instagrams/${id}`, { method: "DELETE" });
            if (response.ok) {
                setMessage("Instagram data deleted successfully!");
                setInstagrams(instagrams.filter(instagram => instagram.id !== id));
            } else {
                const errorData = await response.json();
                setMessage(`Failed to delete Instagram data: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error deleting Instagram data:", error);
            setMessage("Failed to delete Instagram data.");
        }
        setLoading(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewInstagram({ ...newInstagram, instagram_img: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleUpload = () => {
        setNewInstagram({ instagram_img: null, instagram_name: "", instagram_link: "" });
        setSelectedInstagram(null);
        setImagePreview(null);
        setShowForm(true);
        setEditIndex(null);
    };

    const handleEdit = (instagram, index) => {
        setSelectedInstagram(instagram);
        setNewInstagram({
            instagram_img: null,
            instagram_name: instagram.instagram_name,
            instagram_link: instagram.instagram_link,
        });
        setImagePreview(instagram.instagram_img);
        setEditIndex(index);
        setShowForm(true);
    };

    return (
        <section className={styles.adminContainer}>
            <h2>Instagrams Admin</h2>

            <div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
    Note: instagram name for SEO.
</div>
<div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
    Note: image size 500x500
</div>

            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            <button onClick={handleUpload} className={styles.uploadButton}>Add Instagram Data</button>

            {showForm && editIndex === null && (
                <form className={styles.taglineForm}>
                    <label htmlFor="instagramName">Instagram Name:</label>
                    <input
                        type="text"
                        id="instagramName"
                        placeholder="Instagram Name"
                        value={newInstagram.instagram_name}
                        onChange={(e) => setNewInstagram({ ...newInstagram, instagram_name: e.target.value })}
                        className={styles.inputField}
                    />
                    <label htmlFor="instagramLink">Instagram Link:</label>
                    <input
                        type="text"
                        id="instagramLink"
                        placeholder="Instagram Link"
                        value={newInstagram.instagram_link}
                        onChange={(e) => setNewInstagram({ ...newInstagram, instagram_link: e.target.value })}
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
                    <button onClick={selectedInstagram ? updateInstagram : addInstagram} disabled={loading} className={styles.actionButton}>
                        {loading
                            ? selectedInstagram
                                ? "Updating..."
                                : "Adding..."
                            : selectedInstagram
                                ? "Update Instagram"
                                : "Add Instagram"}
                    </button>
                    <button onClick={() => { setShowForm(false); setEditIndex(null); }} className={styles.cancelButton}>Cancel</button>
                </form>
            )}

            <div className={styles.taglineList}>
                {instagrams.map((instagram, index) => (
                    <div key={instagram.id} className={styles.taglineItem}>
                        <div className={styles.taglineContent}>
                            <img src={instagram.instagram_img} alt={instagram.instagram_name} className={styles.taglineImage} />
                            <div>
                                <span>{instagram.instagram_name}</span>
                                <p>{instagram.instagram_link}</p>
                            </div>
                        </div>
                        <div className={styles.taglineActions}>
                            <button onClick={() => handleEdit(instagram, index)} className={styles.actionButton}>Edit</button>
                            <button onClick={() => deleteInstagram(instagram.id)} disabled={loading} className={styles.deleteButton}>Delete</button>
                        </div>
                        {showForm && editIndex === index && (
                            <form className={`${styles.taglineForm} ${styles.editForm}`}>
                                <label htmlFor="editInstagramName">Instagram Name:</label>
                                <input
                                    type="text"
                                    id="editInstagramName"
                                    placeholder="Instagram Name"
                                    value={newInstagram.instagram_name}
                                    onChange={(e) => setNewInstagram({ ...newInstagram, instagram_name: e.target.value })}
                                    className={styles.inputField}
                                />
                                <label htmlFor="editInstagramLink">Instagram Link:</label>
                                <input
                                    type="text"
                                    id="editInstagramLink"
                                    placeholder="Instagram Link"
                                    value={newInstagram.instagram_link}
                                    onChange={(e) => setNewInstagram({ ...newInstagram, instagram_link: e.target.value })}
                                    className={styles.inputField}
                                />
                                <div className={styles.imageUploadContainer}>
                                    <div className={styles.imageUploadBox}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            id="editImageUpload"
                                            style={{ display: "none" }}
                                        />
                                        <label htmlFor="editImageUpload">Upload Image</label>
                                    </div>
                                    {imagePreview && <img src={imagePreview} alt="Preview" className={styles.imagePreview} />}
                                </div>

                                <button onClick={updateInstagram} disabled={loading} className={styles.actionButton}>
                                    {loading ? "Updating..." : "Update Instagram"}
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

export default InstagramsAdmin;