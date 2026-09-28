import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./homeadmin.module.css"; // Menggunakan homeadmin.module.css

const MissionAdmin = () => {
    const [missions, setMissions] = useState([]);
    const [newMission, setNewMission] = useState({ mission_content: "" });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedMission, setSelectedMission] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        const fetchMissions = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/missions`);
                if (response.ok) {
                    const data = await response.json();
                    setMissions(data);
                } else {
                    setMessage("Failed to fetch missions.");
                }
            } catch (error) {
                console.error("Error fetching missions:", error);
                setMessage("Failed to fetch missions.");
            } finally {
                setLoading(false);
            }
        };
        fetchMissions();
    }, []);

    const addMission = async () => {
        if (!newMission.mission_content) {
            setMessage("Mission content is required.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/missions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMission),
            });

            if (response.ok) {
                setMessage("Mission added successfully!");
                const data = await response.json();
                setMissions([...missions, data]);
                setNewMission({ mission_content: "" });
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to add mission: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error adding mission:", error);
            setMessage(`Failed to add mission: ${error.message}`);
        }
        setLoading(false);
    };

    const updateMission = async () => {
        if (!newMission.mission_content) {
            setMessage("Mission content is required.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/missions/${selectedMission.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMission),
            });

            if (response.ok) {
                setMessage("Mission updated successfully!");
                const updatedData = await response.json();
                const updatedMissions = missions.map((mission) =>
                    mission.id === updatedData.id ? updatedData : mission
                );
                setMissions(updatedMissions);
                setNewMission({ mission_content: "" });
                setSelectedMission(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update mission: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating mission:", error);
            setMessage(`Failed to update mission: ${error.message}`);
        }
        setLoading(false);
    };

    const deleteMission = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this mission?");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/missions/${id}`, { method: "DELETE" });
            if (response.ok) {
                setMessage("Mission deleted successfully!");
                setMissions(missions.filter((mission) => mission.id !== id));
            } else {
                const errorData = await response.json();
                setMessage(`Failed to delete mission: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error deleting mission:", error);
            setMessage("Failed to delete mission.");
        }
        setLoading(false);
    };

    const handleUpload = () => {
        setNewMission({ mission_content: "" });
        setSelectedMission(null);
        setShowForm(true);
        setEditIndex(null);
    };

    const handleEdit = (mission, index) => {
        setSelectedMission(mission);
        setNewMission({ mission_content: mission.mission_content });
        setEditIndex(index);
        setShowForm(true);
    };

    return (
        <section className={styles.adminContainer}>
            <h2>Mission Admin</h2>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            <button onClick={handleUpload} className={styles.uploadButton}>Add Mission</button>

            {showForm && editIndex === null && (
                <form className={styles.taglineForm}>
                    <label htmlFor="missionContent">Mission Content:</label>
                    <textarea // Atau input, tergantung kebutuhan
                        id="missionContent"
                        placeholder="Mission Content"
                        value={newMission.mission_content}
                        onChange={(e) => setNewMission({ mission_content: e.target.value })}
                        className={styles.inputField}
                    />

                    <button onClick={selectedMission ? updateMission : addMission} disabled={loading} className={styles.actionButton}>
                        {loading ? (selectedMission ? "Updating..." : "Adding...") : (selectedMission ? "Update Mission" : "Add Mission")}
                    </button>
                    <button onClick={() => { setShowForm(false); setEditIndex(null); }} className={styles.cancelButton}>Cancel</button>
                </form>
            )}

            <div className={styles.taglineList}>
                {missions.map((mission, index) => (
                    <div key={mission.id} className={styles.taglineItem}>
                        <div className={styles.taglineContent}>
                            <p>{mission.mission_content}</p>
                        </div>
                        <div className={styles.taglineActions}>
                            <button onClick={() => handleEdit(mission, index)} className={styles.actionButton}>Edit</button>
                            <button onClick={() => deleteMission(mission.id)} disabled={loading} className={styles.deleteButton}>Delete</button>
                        </div>
                        {showForm && editIndex === index && (
                            <form className={`${styles.taglineForm} ${styles.editForm}`}>
                                <label htmlFor="editMissionContent">Mission Content:</label>
                                <textarea // Atau input, tergantung kebutuhan
                                    id="editMissionContent"
                                    placeholder="Mission Content"
                                    value={newMission.mission_content}
                                    onChange={(e) => setNewMission({ mission_content: e.target.value })}
                                    className={styles.inputField}
                                />

                                <button onClick={updateMission} disabled={loading} className={styles.actionButton}>
                                    {loading ? "Updating..." : "Update Mission"}
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

export default MissionAdmin;