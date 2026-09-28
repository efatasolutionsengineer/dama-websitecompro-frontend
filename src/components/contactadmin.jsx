import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./homeadmin.module.css";

const ContactAdmin = () => {
    const [contact, setContact] = useState(null);
    const [newContact, setNewContact] = useState({
        contact_title: "",
        contact_subtitle: "",
        contact_image: null,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const fetchContact = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/contacts`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        setContact(data[0]);
                    }
                } else {
                    setMessage("Failed to fetch contact.");
                }
            } catch (error) {
                console.error("Error fetching contact:", error);
                setMessage("Failed to fetch contact.");
            } finally {
                setLoading(false);
            }
        };

        fetchContact();
    }, []);

    const updateContact = async () => {
        if (!newContact.contact_title) {
            setMessage("Contact title is required.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("contact_title", newContact.contact_title);
            formData.append("contact_subtitle", newContact.contact_subtitle);
            if (newContact.contact_image) {
                formData.append("contact_image", newContact.contact_image);
            }

            const response = await fetch(`${API_BASE}/contacts/${contact.id}`, {
                method: "PUT",
                body: formData,
            });

            if (response.ok) {
                setMessage("Contact updated successfully!");
                const updatedData = await response.json();
                setContact(updatedData);
                setNewContact({
                    contact_title: "",
                    contact_subtitle: "",
                    contact_image: null,
                });
                setImagePreview(null);
                setShowForm(false);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update contact: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating contact:", error);
            setMessage(`Failed to update contact: ${error.message}`);
        }
        setLoading(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewContact({ ...newContact, contact_image: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleEdit = () => {
        if (contact) {
            setNewContact({
                contact_title: contact.contact_title,
                contact_subtitle: contact.contact_subtitle,
                contact_image: null,
            });
            setImagePreview(contact.contact_image);
            setShowForm(true);
        }
    };

    return (
        <section className={styles.adminContainer}>
            <h2>Contacts Admin</h2>

            <div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
    Note: image size 1200x800
</div>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            {contact && (
                <div className={styles.taglineList}>
                    <div className={styles.taglineItem}>
                        <div className={styles.taglineContent}>
                            <img src={contact.contact_image} alt={contact.contact_title} className={styles.taglineImage} />
                            <div>
                                <span>{contact.contact_title}</span>
                                <p>{contact.contact_subtitle}</p>
                            </div>
                        </div>
                        <div className={styles.taglineActions}>
                            <button onClick={handleEdit} className={styles.actionButton}>Edit</button>
                        </div>
                    </div>
                </div>
            )}

            {showForm && (
                <form className={styles.taglineForm}>
                    <label htmlFor="contactTitle">Contact Title:</label>
                    <input
                        type="text"
                        id="contactTitle"
                        placeholder="Contact Title"
                        value={newContact.contact_title}
                        onChange={(e) => setNewContact({ ...newContact, contact_title: e.target.value })}
                        className={styles.inputField}
                    />
                    <label htmlFor="contactSubTitle">Contact Sub Title:</label>
                    <input
                        type="text"
                        id="contactSubTitle"
                        placeholder="Contact Sub Title"
                        value={newContact.contact_subtitle}
                        onChange={(e) => setNewContact({ ...newContact, contact_subtitle: e.target.value })}
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

                    <button onClick={updateContact} disabled={loading} className={styles.actionButton}>
                        {loading ? "Updating..." : "Update Contact"}
                    </button>
                    <button onClick={() => setShowForm(false)} className={styles.cancelButton}>Cancel</button>
                </form>
            )}
        </section>
    );
};

export default ContactAdmin;