import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./homeadmin.module.css"; // Menggunakan homeadmin.module.css

const WhyAdmin = () => {
    const [whys, setWhys] = useState([]);
    const [newWhy, setNewWhy] = useState({ why_content: "" });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedWhy, setSelectedWhy] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        const fetchWhys = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/whys`);
                if (response.ok) {
                    const data = await response.json();
                    setWhys(data);
                } else {
                    setMessage("Failed to fetch whys.");
                }
            } catch (error) {
                console.error("Error fetching whys:", error);
                setMessage("Failed to fetch whys.");
            } finally {
                setLoading(false);
            }
        };
        fetchWhys();
    }, []);

    const addWhy = async () => {
        if (!newWhy.why_content) {
            setMessage("Why content is required.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/whys`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newWhy),
            });

            if (response.ok) {
                setMessage("Why added successfully!");
                const data = await response.json();
                setWhys([...whys, data]);
                setNewWhy({ why_content: "" });
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to add why: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error adding why:", error);
            setMessage(`Failed to add why: ${error.message}`);
        }
        setLoading(false);
    };

    const updateWhy = async () => {
        if (!newWhy.why_content) {
            setMessage("Why content is required.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/whys/${selectedWhy.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newWhy),
            });

            if (response.ok) {
                setMessage("Why updated successfully!");
                const updatedData = await response.json();
                const updatedWhys = whys.map((why) =>
                    why.id === updatedData.id ? updatedData : why
                );
                setWhys(updatedWhys);
                setNewWhy({ why_content: "" });
                setSelectedWhy(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update why: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating why:", error);
            setMessage(`Failed to update why: ${error.message}`);
        }
        setLoading(false);
    };

    const deleteWhy = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this why?");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/whys/${id}`, { method: "DELETE" });
            if (response.ok) {
                setMessage("Why deleted successfully!");
                setWhys(whys.filter((why) => why.id !== id));
            } else {
                const errorData = await response.json();
                setMessage(`Failed to delete why: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error deleting why:", error);
            setMessage("Failed to delete why.");
        }
        setLoading(false);
    };

    const handleUpload = () => {
        setNewWhy({ why_content: "" });
        setSelectedWhy(null);
        setShowForm(true);
        setEditIndex(null);
    };

    const handleEdit = (why, index) => {
        setSelectedWhy(why);
        setNewWhy({ why_content: why.why_content });
        setEditIndex(index);
        setShowForm(true);
    };

    return (
        <section className={styles.adminContainer}>
            <h2>Why Admin</h2>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            <button onClick={handleUpload} className={styles.uploadButton}>Add Why</button>

            {showForm && editIndex === null && (
                <form className={styles.taglineForm}>
                    <label htmlFor="whyContent">Why Content:</label>
                    <textarea // Atau input, tergantung kebutuhan
                        id="whyContent"
                        placeholder="Why Content"
                        value={newWhy.why_content}
                        onChange={(e) => setNewWhy({ why_content: e.target.value })}
                        className={styles.inputField}
                    />

                    <button onClick={selectedWhy ? updateWhy : addWhy} disabled={loading} className={styles.actionButton}>
                        {loading ? (selectedWhy ? "Updating..." : "Adding...") : (selectedWhy ? "Update Why" : "Add Why")}
                    </button>
                    <button onClick={() => { setShowForm(false); setEditIndex(null); }} className={styles.cancelButton}>Cancel</button>
                </form>
            )}

            <div className={styles.taglineList}>
                {whys.map((why, index) => (
                    <div key={why.id} className={styles.taglineItem}>
                        <div className={styles.taglineContent}>
                            <p>{why.why_content}</p>
                        </div>
                        <div className={styles.taglineActions}>
                            <button onClick={() => handleEdit(why, index)} className={styles.actionButton}>Edit</button>
                            <button onClick={() => deleteWhy(why.id)} disabled={loading} className={styles.deleteButton}>Delete</button>
                        </div>
                        {showForm && editIndex === index && (
                            <form className={`${styles.taglineForm} ${styles.editForm}`}>
                                <label htmlFor="editWhyContent">Why Content:</label>
                                <textarea // Atau input, tergantung kebutuhan
                                    id="editWhyContent"
                                    placeholder="Why Content"
                                    value={newWhy.why_content}
                                    onChange={(e) => setNewWhy({ why_content: e.target.value })}
                                    className={styles.inputField}
                                />

                                <button onClick={updateWhy} disabled={loading} className={styles.actionButton}>
                                    {loading ? "Updating..." : "Update Why"}
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

export default WhyAdmin;