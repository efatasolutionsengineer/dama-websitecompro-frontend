import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./homeadmin.module.css";

const VisionMissionAdmin = () => {
    const [visionMission, setVisionMission] = useState([]);
    const [newVisionMission, setNewVisionMission] = useState({
        visionmission_img: null,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedVisionMission, setSelectedVisionMission] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        const fetchVisionMission = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/visionmission`);
                if (response.ok) {
                    const data = await response.json();
                    setVisionMission(data);
                } else {
                    setMessage("Failed to fetch Vision & Mission.");
                }
            } catch (error) {
                console.error("Error fetching Vision & Mission:", error);
                setMessage("Failed to fetch Vision & Mission.");
            } finally {
                setLoading(false);
            }
        };

        fetchVisionMission();
    }, []);

    const addVisionMission = async () => {
        if (!newVisionMission.visionmission_img) {
            setMessage("Image is required.");
            return;
        }

        if (newVisionMission.visionmission_img.size > 5 * 1024 * 1024) {
            setMessage("Image size must be less than 5MB.");
            return;
        }

        if (!newVisionMission.visionmission_img.type.startsWith("image/")) {
            setMessage("File type must be an image.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("visionmission_img", newVisionMission.visionmission_img);

            const response = await fetch(`${API_BASE}/visionmission`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setMessage("Vision & Mission added successfully!");
                const data = await response.json();
                setVisionMission([...visionMission, data]);
                setNewVisionMission({ visionmission_img: null });
                setImagePreview(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to add Vision & Mission: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error adding Vision & Mission:", error);
            setMessage(`Failed to add Vision & Mission: ${error.message}`);
        }
        setLoading(false);
    };

    const updateVisionMission = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            if (newVisionMission.visionmission_img) {
                formData.append("visionmission_img", newVisionMission.visionmission_img);
            }

            const response = await fetch(`${API_BASE}/visionmission/${selectedVisionMission.id}`, {
                method: "PUT",
                body: formData,
            });

            if (response.ok) {
                setMessage("Vision & Mission updated successfully!");
                const updatedData = await response.json();
                const updatedVisionMission = visionMission.map(vm =>
                    vm.id === updatedData.id ? updatedData : vm
                );
                setVisionMission(updatedVisionMission);
                setNewVisionMission({ visionmission_img: null });
                setSelectedVisionMission(null);
                setImagePreview(updatedData.visionmission_img); // Keep the updated URL
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update Vision & Mission: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating Vision & Mission:", error);
            setMessage(`Failed to update Vision & Mission: ${error.message}`);
        }
        setLoading(false);
    };

    const deleteVisionMission = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this Vision & Mission image?");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/visionmission/${id}`, { method: "DELETE" });
            if (response.ok) {
                setMessage("Vision & Mission deleted successfully!");
                setVisionMission(visionMission.filter(vm => vm.id !== id));
            } else {
                const errorData = await response.json();
                setMessage(`Failed to delete Vision & Mission: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error deleting Vision & Mission:", error);
            setMessage("Failed to delete Vision & Mission.");
        }
        setLoading(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewVisionMission({ ...newVisionMission, visionmission_img: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(selectedVisionMission?.visionmission_img || null);
        }
    };

    const handleAdd = () => {
        setNewVisionMission({ visionmission_img: null });
        setImagePreview(null);
        setSelectedVisionMission(null);
        setShowForm(true);
        setEditIndex(null);
    };

    const handleEdit = (vm, index) => {
        setSelectedVisionMission(vm);
        setNewVisionMission({
            visionmission_img: null, // Set to null to allow updating
        });
        setImagePreview(vm.visionmission_img);
        setEditIndex(index);
        setShowForm(true);
    };

    return (
        <section className={styles.adminContainer}>
            <h2>Vision & Mission Image</h2>
            <div style={{ fontSize: '0.8em', color: 'red', textAlign: 'left', marginBottom: '5px' }}>
                Note: Image size 1200x300.
            </div>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}


            

            <div className={styles.taglineList}>
                {visionMission.map((vm, index) => (
                    <div key={vm.id} className={styles.taglineItem}>
                        <div className={styles.taglineContent}>
                            {vm.visionmission_img && <img src={vm.visionmission_img} alt="Vision Mission" className={styles.taglineImage} style={{ maxWidth: '300px', maxHeight: '200px' }} />}
                        </div>
                        <div className={styles.taglineActions}>
                            <button onClick={() => handleEdit(vm, index)} className={styles.actionButton}>Edit</button>
                            
                        </div>
                        {showForm && editIndex === index && (
                            <form className={`${styles.taglineForm} ${styles.editForm}`}>
                                <div className={styles.imageUploadContainer}>
                                    <div className={styles.imageUploadBox}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            id={`editVisionMissionImageUpload-${index}`}
                                            style={{ display: "none" }}
                                        />
                                        <label htmlFor={`editVisionMissionImageUpload-${index}`}>Upload Image</label>
                                    </div>
                                    {imagePreview && <img src={imagePreview} alt="Preview" className={styles.imagePreview} />}
                                </div>

                                <button onClick={updateVisionMission} disabled={loading} className={styles.actionButton}>
                                    {loading ? "Updating..." : "Update Image"}
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

export default VisionMissionAdmin;