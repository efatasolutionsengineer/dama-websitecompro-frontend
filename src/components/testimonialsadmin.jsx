import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./homeadmin.module.css";

const TestimonialsAdmin = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [newTestimonial, setNewTestimonial] = useState({
        testimonial_from: "",
        testimonial_text: "",
        testimonial_img: null,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedTestimonial, setSelectedTestimonial] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        const fetchTestimonials = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/testimonials`);
                if (response.ok) {
                    const data = await response.json();
                    setTestimonials(data);
                } else {
                    setMessage("Failed to fetch testimonials.");
                }
            } catch (error) {
                console.error("Error fetching testimonials:", error);
                setMessage("Failed to fetch testimonials.");
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    const addTestimonial = async () => {
        if (!newTestimonial.testimonial_from || !newTestimonial.testimonial_text || !newTestimonial.testimonial_img) {
            setMessage("Testimonial from, text, and image are required.");
            return;
        }

        if (newTestimonial.testimonial_img.size > 5 * 1024 * 1024) {
            setMessage("Image size must be less than 5MB.");
            return;
        }

        if (!newTestimonial.testimonial_img.type.startsWith("image/")) {
            setMessage("File type must be an image.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("testimonial_from", newTestimonial.testimonial_from);
            formData.append("testimonial_text", newTestimonial.testimonial_text);
            formData.append("testimonial_img", newTestimonial.testimonial_img);

            const response = await fetch(`${API_BASE}/testimonials`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setMessage("Testimonial added successfully!");
                const data = await response.json();
                setTestimonials([...testimonials, data]);
                setNewTestimonial({
                    testimonial_from: "",
                    testimonial_text: "",
                    testimonial_img: null,
                });
                setImagePreview(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to add testimonial: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error adding testimonial:", error);
            setMessage(`Failed to add testimonial: ${error.message}`);
        }
        setLoading(false);
    };

    const updateTestimonial = async () => {
        if (!newTestimonial.testimonial_from || !newTestimonial.testimonial_text) {
            setMessage("Testimonial from and text are required.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("testimonial_from", newTestimonial.testimonial_from);
            formData.append("testimonial_text", newTestimonial.testimonial_text);
            if (newTestimonial.testimonial_img) {
                formData.append("testimonial_img", newTestimonial.testimonial_img);
            }

            const response = await fetch(`${API_BASE}/testimonials/${selectedTestimonial.id}`, {
                method: "PUT",
                body: formData,
            });

            if (response.ok) {
                setMessage("Testimonial updated successfully!");
                const updatedData = await response.json();
                const updatedTestimonials = testimonials.map(testimonial =>
                    testimonial.id === updatedData.id ? updatedData : testimonial
                );
                setTestimonials(updatedTestimonials);
                setNewTestimonial({
                    testimonial_from: "",
                    testimonial_text: "",
                    testimonial_img: null,
                });
                setSelectedTestimonial(null);
                setImagePreview(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update testimonial: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating testimonial:", error);
            setMessage(`Failed to update testimonial: ${error.message}`);
        }
        setLoading(false);
    };

    const deleteTestimonial = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this testimonial?");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/testimonials/${id}`, { method: "DELETE" });
            if (response.ok) {
                setMessage("Testimonial deleted successfully!");
                setTestimonials(testimonials.filter(testimonial => testimonial.id !== id));
            } else {
                const errorData = await response.json();
                setMessage(`Failed to delete testimonial: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error deleting testimonial:", error);
            setMessage("Failed to delete testimonial.");
        }
        setLoading(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewTestimonial({ ...newTestimonial, testimonial_img: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleUpload = () => {
        setNewTestimonial({ testimonial_from: "", testimonial_text: "", testimonial_img: null });
        setSelectedTestimonial(null);
        setImagePreview(null);
        setShowForm(true);
        setEditIndex(null);
    };

    const handleEdit = (testimonial, index) => {
        setSelectedTestimonial(testimonial);
        setNewTestimonial({
            testimonial_from: testimonial.testimonial_from,
            testimonial_text: testimonial.testimonial_text,
            testimonial_img: null,
        });
        setImagePreview(testimonial.testimonial_img);
        setEditIndex(index);
        setShowForm(true);
    };

    return (
        <section className={styles.adminContainer}>
            <h2>Testimonials Admin</h2>

            <div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
    Note: image size 1200x700
</div>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            <button onClick={handleUpload} className={styles.uploadButton}>Add Testimonial</button>

            {showForm && editIndex === null && (
                <form className={styles.taglineForm}>
                    <label htmlFor="testimonialFrom">Testimonial From:</label>
                    <input
                        type="text"
                        id="testimonialFrom"
                        placeholder="Testimonial From"
                        value={newTestimonial.testimonial_from}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, testimonial_from: e.target.value })}
                        className={styles.inputField}
                    />
                    <label htmlFor="testimonialText">Testimonial Text:</label>
                    <input
                        type="text"
                        id="testimonialText"
                        placeholder="Testimonial Text"
                        value={newTestimonial.testimonial_text}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, testimonial_text: e.target.value })}
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

                    <button onClick={selectedTestimonial ? updateTestimonial : addTestimonial} disabled={loading} className={styles.actionButton}>
                        {loading
                            ? selectedTestimonial
                                ? "Updating..."
                                : "Adding..."
                            : selectedTestimonial
                                ? "Update Testimonial"
                                : "Add Testimonial"}
                    </button>
                    <button onClick={() => { setShowForm(false); setEditIndex(null); }} className={styles.cancelButton}>Cancel</button>
                </form>
            )}

            <div className={styles.taglineList}>
                {testimonials.map((testimonial, index) => (
                    <div key={testimonial.id} className={styles.taglineItem}>
                        <div className={styles.taglineContent}>
                            <img src={testimonial.testimonial_img} alt={testimonial.testimonial_from} className={styles.taglineImage} />
                            <div>
                                <span>{testimonial.testimonial_from}</span>
                                <p>{testimonial.testimonial_text}</p>
                            </div>
                        </div>
                        <div className={styles.taglineActions}>
                            <button onClick={() => handleEdit(testimonial, index)} className={styles.actionButton}>Edit</button>
                            <button onClick={() => deleteTestimonial(testimonial.id)} disabled={loading} className={styles.deleteButton}>Delete</button>
                        </div>
                        {showForm && editIndex === index && (
                            <form className={`${styles.taglineForm} ${styles.editForm}`}>
                                <label htmlFor="editTestimonialFrom">Testimonial From:</label>
                                <input
                                    type="text"
                                    id="editTestimonialFrom"
                                    placeholder="Testimonial From"
                                    value={newTestimonial.testimonial_from}
                                    onChange={(e) => setNewTestimonial({ ...newTestimonial, testimonial_from: e.target.value })}
                                    className={styles.inputField}
                                />
                                <label htmlFor="editTestimonialText">Testimonial Text:</label>
                                <input
                                    type="text"
                                    id="editTestimonialText"
                                    placeholder="Testimonial Text"
                                    value={newTestimonial.testimonial_text}
                                    onChange={(e) => setNewTestimonial({ ...newTestimonial, testimonial_text: e.target.value })}
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

                                <button onClick={updateTestimonial} disabled={loading} className={styles.actionButton}>
                                    {loading ? "Updating..." : "Update Testimonial"}
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

export default TestimonialsAdmin;