import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./homeadmin.module.css";

const VisionAdmin = () => {
    const [visions, setVisions] = useState([]);
    const [newVision, setNewVision] = useState({
        vision_content: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedVision, setSelectedVision] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        const fetchVisions = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/visions`);
                if (response.ok) {
                    const data = await response.json();
                    setVisions(data);
                } else {
                    setMessage("Failed to fetch visions.");
                }
            } catch (error) {
                console.error("Error fetching visions:", error);
                setMessage("Failed to fetch visions.");
            } finally {
                setLoading(false);
            }
        };

        fetchVisions();
    }, []);

    const addVision = async () => {
        if (!newVision.vision_content) {
            setMessage("Vision content is required.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/visions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ vision_content: newVision.vision_content }),
            });

            if (response.ok) {
                setMessage("Vision added successfully!");
                const data = await response.json();
                setVisions([...visions, data]);
                setNewVision({ vision_content: "" });
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to add vision: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error adding vision:", error);
            setMessage(`Failed to add vision: ${error.message}`);
        }
        setLoading(false);
    };

    const updateVision = async () => {
        if (!newVision.vision_content) {
            setMessage("Vision content is required.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/visions/${selectedVision.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ vision_content: newVision.vision_content }),
            });

            if (response.ok) {
                setMessage("Vision updated successfully!");
                const updatedData = await response.json();
                const updatedVisions = visions.map((vision) =>
                    vision.id === updatedData.id ? updatedData : vision
                );
                setVisions(updatedVisions);
                setNewVision({ vision_content: "" });
                setSelectedVision(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update vision: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating vision:", error);
            setMessage(`Failed to update vision: ${error.message}`);
        }
        setLoading(false);
    };

    const deleteVision = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this vision?");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/visions/${id}`, { method: "DELETE" });
            if (response.ok) {
                setMessage("Vision deleted successfully!");
                setVisions(visions.filter((vision) => vision.id !== id));
            } else {
                const errorData = await response.json();
                setMessage(`Failed to delete vision: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error deleting vision:", error);
            setMessage("Failed to delete vision.");
        }
        setLoading(false);
    };

    const handleAdd = () => {
        setNewVision({ vision_content: "" });
        setSelectedVision(null);
        setShowForm(true);
        setEditIndex(null);
    };

    const handleEdit = (vision, index) => {
        setSelectedVision(vision);
        setNewVision({ vision_content: vision.vision_content });
        setEditIndex(index);
        setShowForm(true);
    };

    return (
        <section className={styles.adminContainer}>
            <h2>Vision Admin</h2>

            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            <button onClick={handleAdd} className={styles.uploadButton}>Add Vision</button>

            {showForm && editIndex === null && (
                <form className={styles.taglineForm} onSubmit={(e) => { e.preventDefault(); addVision(); }}>
                    <label htmlFor="visionContent">Vision Content:</label>
                    <textarea
                        id="visionContent"
                        placeholder="Vision Content"
                        value={newVision.vision_content}
                        onChange={(e) => setNewVision({ ...newVision, vision_content: e.target.value })}
                        className={styles.inputField}
                        required
                    />
                    <button type="submit" disabled={loading} className={styles.actionButton}>
                        {loading ? "Adding..." : "Add Vision"}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className={styles.cancelButton}>Cancel</button>
                </form>
            )}

            <div className={styles.taglineList}>
                {visions.map((vision, index) => (
                    <div key={vision.id} className={styles.taglineItem}>
                        <div className={styles.taglineContent}>
                            <p>{vision.vision_content}</p>
                        </div>
                        <div className={styles.taglineActions}>
                            <button onClick={() => handleEdit(vision, index)} className={styles.actionButton}>Edit</button>
                            <button onClick={() => deleteVision(vision.id)} disabled={loading} className={styles.deleteButton}>Delete</button>
                        </div>
                        {showForm && editIndex === index && (
                            <form className={`${styles.taglineForm} ${styles.editForm}`} onSubmit={(e) => { e.preventDefault(); updateVision(); }}>
                                <label htmlFor="editVisionContent">Vision Content:</label>
                                <textarea
                                    id="editVisionContent"
                                    placeholder="Vision Content"
                                    value={newVision.vision_content}
                                    onChange={(e) => setNewVision({ ...newVision, vision_content: e.target.value })}
                                    className={styles.inputField}
                                    required
                                />
                                <button type="submit" disabled={loading} className={styles.actionButton}>
                                    {loading ? "Updating..." : "Update Vision"}
                                </button>
                                <button type="button" onClick={() => { setShowForm(false); setEditIndex(null); }} className={styles.cancelButton}>Cancel</button>
                            </form>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default VisionAdmin;