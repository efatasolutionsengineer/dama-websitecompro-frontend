import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./homeadmin.module.css";

const TaglinesAdmin = () => {
    const [taglines, setTaglines] = useState([]);
    const [newTagline, setNewTagline] = useState({
        tagline_text: "",
        tagline_sub_text: "",
        tagline_img: null,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedTagline, setSelectedTagline] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        const fetchTaglines = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/taglines`);
                if (response.ok) {
                    const data = await response.json();
                    setTaglines(data);
                } else {
                    setMessage("Failed to fetch taglines.");
                }
            } catch (error) {
                console.error("Error fetching taglines:", error);
                setMessage("Failed to fetch taglines.");
            } finally {
                setLoading(false);
            }
        };

        fetchTaglines();
    }, []);

    const addTagline = async () => {
        if (!newTagline.tagline_text || !newTagline.tagline_img) {
            setMessage("Tagline text and image are required.");
            return;
        }

        if (newTagline.tagline_img.size > 5 * 1024 * 1024) {
            setMessage("Image size must be less than 5MB.");
            return;
        }

        if (!newTagline.tagline_img.type.startsWith("image/")) {
            setMessage("File type must be an image.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("tagline_text", newTagline.tagline_text);
            formData.append("tagline_sub_text", newTagline.tagline_sub_text);
            formData.append("tagline_img", newTagline.tagline_img);

            const response = await fetch(`${API_BASE}/taglines`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setMessage("Tagline added successfully!");
                const data = await response.json();
                setTaglines([...taglines, data]);
                setNewTagline({
                    tagline_text: "",
                    tagline_sub_text: "",
                    tagline_img: null,
                });
                setImagePreview(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to add tagline: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error adding tagline:", error);
            setMessage(`Failed to add tagline: ${error.message}`);
        }
        setLoading(false);
    };

    const updateTagline = async () => {
        if (!newTagline.tagline_text) {
            setMessage("Tagline text is required.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("tagline_text", newTagline.tagline_text);
            formData.append("tagline_sub_text", newTagline.tagline_sub_text);
            if(newTagline.tagline_img){
                formData.append("tagline_img", newTagline.tagline_img);
            }

            const response = await fetch(`${API_BASE}/taglines/${selectedTagline.id}`, {
                method: "PUT",
                body: formData,
            });

            if (response.ok) {
                setMessage("Tagline updated successfully!");
                const updatedData = await response.json();
                const updatedTaglines = taglines.map(tagline =>
                    tagline.id === updatedData.id ? updatedData : tagline
                );
                setTaglines(updatedTaglines);
                setNewTagline({
                    tagline_text: "",
                    tagline_sub_text: "",
                    tagline_img: null,
                });
                setSelectedTagline(null);
                setImagePreview(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update tagline: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating tagline:", error);
            setMessage(`Failed to update tagline: ${error.message}`);
        }
        setLoading(false);
    };

    const deleteTagline = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this tagline?");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/taglines/${id}`, { method: "DELETE" });
            if (response.ok) {
                setMessage("Tagline deleted successfully!");
                setTaglines(taglines.filter(tagline => tagline.id !== id));
            } else {
                const errorData = await response.json();
                setMessage(`Failed to delete tagline: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error deleting tagline:", error);
            setMessage("Failed to delete tagline.");
        }
        setLoading(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewTagline({ ...newTagline, tagline_img: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleUpload = () => {
        setNewTagline({ tagline_text: "", tagline_sub_text: "", tagline_img: null });
        setSelectedTagline(null);
        setImagePreview(null);
        setShowForm(true);
        setEditIndex(null);
    };

    const handleEdit = (tagline, index) => {
        setSelectedTagline(tagline);
        setNewTagline({
            tagline_text: tagline.tagline_text,
            tagline_sub_text: tagline.tagline_sub_text,
            tagline_img: null,
        });
        setImagePreview(tagline.tagline_img);
        setEditIndex(index);
        setShowForm(true);
    };

    return (
        <section className={styles.adminContainer}>
            <h2>Taglines Admin</h2>

            <div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
    Note: image size 1200x800
</div>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            <button onClick={handleUpload} className={styles.uploadButton}>Add Tagline</button>

            {showForm && editIndex === null && (
                <form className={styles.taglineForm}>
                    <label htmlFor="taglineText">Tagline Text:</label>
                    <input
                        type="text"
                        id="taglineText"
                        placeholder="Tagline Text"
                        value={newTagline.tagline_text}
                        onChange={(e) => setNewTagline({ ...newTagline, tagline_text: e.target.value })}
                        className={styles.inputField}
                    />
                    <label htmlFor="taglineSubText">Tagline Sub Text:</label>
                    <input
                        type="text"
                        id="taglineSubText"
                        placeholder="Tagline Sub Text"
                        value={newTagline.tagline_sub_text}
                        onChange={(e) => setNewTagline({ ...newTagline, tagline_sub_text: e.target.value })}
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

                    <button onClick={selectedTagline ? updateTagline : addTagline} disabled={loading} className={styles.actionButton}>
                        {loading
                            ? selectedTagline
                                ? "Updating..."
                                : "Adding..."
                            : selectedTagline
                                ? "Update Tagline"
                                : "Add Tagline"}
                    </button>
                    <button onClick={() => { setShowForm(false); setEditIndex(null); }} className={styles.cancelButton}>Cancel</button>
                </form>
            )}

            <div className={styles.taglineList}>
                {taglines.map((tagline, index) => (
                    <div key={tagline.id} className={styles.taglineItem}>
                        <div className={styles.taglineContent}>
                            <img src={tagline.tagline_img} alt={tagline.tagline_text} className={styles.taglineImage} />
                            <div>
                                <span>{tagline.tagline_text}</span>
                                <p>{tagline.tagline_sub_text}</p>
                            </div>
                        </div>
                        <div className={styles.taglineActions}>
                            <button onClick={() => handleEdit(tagline, index)} className={styles.actionButton}>Edit</button>
                            <button onClick={() => deleteTagline(tagline.id)} disabled={loading} className={styles.deleteButton}>Delete</button>
                        </div>
                        {showForm && editIndex === index && (
                            <form className={`${styles.taglineForm} ${styles.editForm}`}>
                                <label htmlFor="editTaglineText">Tagline Text:</label>
                                <input
                                    type="text"
                                    id="editTaglineText"
                                    placeholder="Tagline Text"
                                    value={newTagline.tagline_text}
                                    onChange={(e) => setNewTagline({ ...newTagline, tagline_text: e.target.value })}
                                    className={styles.inputField}
                                />
                                <label htmlFor="editTaglineSubText">Tagline Sub Text:</label>
                                <input
                                    type="text"
                                    id="editTaglineSubText"
                                    placeholder="Tagline Sub Text"
                                    value={newTagline.tagline_sub_text}
                                    onChange={(e) => setNewTagline({ ...newTagline, tagline_sub_text: e.target.value })}
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

                                <button onClick={updateTagline} disabled={loading} className={styles.actionButton}>
                                    {loading ? "Updating..." : "Update Tagline"}
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

export default TaglinesAdmin;