import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./homeadmin.module.css";

const ServicesPageAdmin = () => {
    const [services, setServices] = useState([]);
    const [newService, setNewService] = useState({
        special_img: null,
        individual_img: null,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedService, setSelectedService] = useState(null);
    const [specialImagePreview, setSpecialImagePreview] = useState(null);
    const [individualImagePreview, setIndividualImagePreview] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/services`);
                if (response.ok) {
                    const data = await response.json();
                    setServices(data);
                } else {
                    setMessage("Failed to fetch services.");
                }
            } catch (error) {
                console.error("Error fetching services:", error);
                setMessage("Failed to fetch services.");
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const addService = async () => {
        if (!newService.special_img || !newService.individual_img) {
            setMessage("Special and Individual images are required.");
            return;
        }

        const checkImage = (file, imageName) => {
            if (file.size > 5 * 1024 * 1024) {
                setMessage(`${imageName} size must be less than 5MB.`);
                return false;
            }
            if (!file.type.startsWith("image/")) {
                setMessage(`${imageName} file type must be an image.`);
                return false;
            }
            return true;
        };

        if (!checkImage(newService.special_img, "Special Image") || !checkImage(newService.individual_img, "Individual Image")) {
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("special_img", newService.special_img);
            formData.append("individual_img", newService.individual_img);

            const response = await fetch(`${API_BASE}/services`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setMessage("Service added successfully!");
                const data = await response.json();
                setServices([...services, data]);
                setNewService({ special_img: null, individual_img: null });
                setSpecialImagePreview(null);
                setIndividualImagePreview(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to add service: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error adding service:", error);
            setMessage(`Failed to add service: ${error.message}`);
        }
        setLoading(false);
    };

    const updateService = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            if (newService.special_img) {
                formData.append("special_img", newService.special_img);
            }
            if (newService.individual_img) {
                formData.append("individual_img", newService.individual_img);
            }

            const response = await fetch(`${API_BASE}/services/${selectedService.id}`, {
                method: "PUT",
                body: formData,
            });

            if (response.ok) {
                setMessage("Service updated successfully!");
                const updatedData = await response.json();
                const updatedServices = services.map(service =>
                    service.id === updatedData.id ? updatedData : service
                );
                setServices(updatedServices);
                setNewService({ special_img: null, individual_img: null });
                setSelectedService(null);
                setSpecialImagePreview(updatedData.special_img); // Keep the updated URL
                setIndividualImagePreview(updatedData.individual_img); // Keep the updated URL
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update service: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating service:", error);
            setMessage(`Failed to update service: ${error.message}`);
        }
        setLoading(false);
    };

    const deleteService = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this service?");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/services/${id}`, { method: "DELETE" });
            if (response.ok) {
                setMessage("Service deleted successfully!");
                setServices(services.filter(service => service.id !== id));
            } else {
                const errorData = await response.json();
                setMessage(`Failed to delete service: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error deleting service:", error);
            setMessage("Failed to delete service.");
        }
        setLoading(false);
    };

    const handleSpecialImageChange = (e) => {
        const file = e.target.files[0];
        setNewService({ ...newService, special_img: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSpecialImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setSpecialImagePreview(selectedService?.special_img || null);
        }
    };

    const handleIndividualImageChange = (e) => {
        const file = e.target.files[0];
        setNewService({ ...newService, individual_img: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setIndividualImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setIndividualImagePreview(selectedService?.individual_img || null);
        }
    };

    const handleAdd = () => {
        setNewService({ special_img: null, individual_img: null });
        setSpecialImagePreview(null);
        setIndividualImagePreview(null);
        setSelectedService(null);
        setShowForm(true);
        setEditIndex(null);
    };

    const handleEdit = (service, index) => {
        setSelectedService(service);
        setNewService({
            special_img: null, // Set to null to allow updating
            individual_img: null, // Set to null to allow updating
        });
        setSpecialImagePreview(service.special_img);
        setIndividualImagePreview(service.individual_img);
        setEditIndex(index);
        setShowForm(true);
    };

    return (
        <section className={styles.adminContainer}>
            <h2>Services Page Admin</h2>
            <div style={{ fontSize: '0.8em', color: 'red', textAlign: 'left', marginBottom: '5px' }}>
                Note: Image size 600x800.
            </div>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            {showForm && editIndex === null && (
                <form className={styles.taglineForm}>
                    <div className={styles.imageUploadContainer}>
                        <div className={styles.imageUploadBox}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleSpecialImageChange}
                                id="specialImageUpload"
                                style={{ display: "none" }}
                            />
                            <label htmlFor="specialImageUpload">Upload Special Image</label>
                        </div>
                        {specialImagePreview && <img src={specialImagePreview} alt="Special Preview" className={styles.imagePreview} />}
                    </div>

                    <div className={styles.imageUploadContainer}>
                        <div className={styles.imageUploadBox}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleIndividualImageChange}
                                id="individualImageUpload"
                                style={{ display: "none" }}
                            />
                            <label htmlFor="individualImageUpload">Upload Individual Image</label>
                        </div>
                        {individualImagePreview && <img src={individualImagePreview} alt="Individual Preview" className={styles.imagePreview} />}
                    </div>

                    <button onClick={selectedService ? updateService : addService} disabled={loading} className={styles.actionButton}>
                        {loading
                            ? selectedService
                                ? "Updating..."
                                : "Adding..."
                            : selectedService
                                ? "Update Service"
                                : "Add Service"}
                    </button>
                    <button onClick={() => { setShowForm(false); setEditIndex(null); }} className={styles.cancelButton}>Cancel</button>
                </form>
            )}

            <div className={styles.taglineList}>
                {services.map((service, index) => (
                    <div key={service.id} className={styles.taglineItem}>
                        <div className={styles.taglineContent}>
                            {service.special_img && <img src={service.special_img} alt="Special" className={styles.taglineImage} style={{ maxWidth: '150px', maxHeight: '100px' }} />}
                            {service.individual_img && <img src={service.individual_img} alt="Individual" className={styles.taglineImage} style={{ maxWidth: '150px', maxHeight: '100px' }} />}
                        </div>
                        <div className={styles.taglineActions}>
                            <button onClick={() => handleEdit(service, index)} className={styles.actionButton}>Edit</button>
                            
                        </div>
                        {showForm && editIndex === index && (
                            <form className={`${styles.taglineForm} ${styles.editForm}`}>
                                <div className={styles.imageUploadContainer}>
                                    <div className={styles.imageUploadBox}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleSpecialImageChange}
                                            id={`editSpecialImageUpload-${index}`}
                                            style={{ display: "none" }}
                                        />
                                        <label htmlFor={`editSpecialImageUpload-${index}`}>Upload Special Image</label>
                                    </div>
                                    {specialImagePreview && <img src={specialImagePreview} alt="Special Preview" className={styles.imagePreview} />}
                                </div>

                                <div className={styles.imageUploadContainer}>
                                    <div className={styles.imageUploadBox}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleIndividualImageChange}
                                            id={`editIndividualImageUpload-${index}`}
                                            style={{ display: "none" }}
                                        />
                                        <label htmlFor={`editIndividualImageUpload-${index}`}>Upload Individual Image</label>
                                    </div>
                                    {individualImagePreview && <img src={individualImagePreview} alt="Individual Preview" className={styles.imagePreview} />}
                                </div>

                                <button onClick={updateService} disabled={loading} className={styles.actionButton}>
                                    {loading ? "Updating..." : "Update Service"}
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

export default ServicesPageAdmin;