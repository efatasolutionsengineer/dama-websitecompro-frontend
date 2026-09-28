import { API_BASE } from '../lib/apiBase.js';
import { asList } from '../lib/asList.js';
import React, { useState, useEffect } from "react";
import styles from "./servicesadmin.module.css";

const ServicesSpecialAdmin = () => {
    const [servicesSpecialData, setServicesSpecialData] = useState([]);
    const [newServiceSpecial, setNewServiceSpecial] = useState({
        services_special_name: "",
        services_special_title: "",
        services_special_desc: "",
        services_special_include: [],
        services_special_img: null,
        order: 0,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedServiceSpecial, setSelectedServiceSpecial] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [includeInput, setIncludeInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchServicesSpecialData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/services_special`);
                if (response.ok) {
                    const data = await response.json();
                    setServicesSpecialData(data.map((row) => ({
                        ...row,
                        services_special_include: asList(row.services_special_include),
                    })));
                } else {
                    console.error("Fetch error:", response.status, response.statusText);
                    setMessage("Failed to fetch Services Special data.");
                }
            } catch (error) {
                console.error("Error fetching Services Special data:", error);
                setMessage("Failed to fetch Services Special data.");
            } finally {
                setLoading(false);
            }
        };

        try {
            fetchServicesSpecialData();
        } catch (error) {
            console.error("Error in useEffect:", error);
        }
    }, []);

    const addServiceSpecial = async () => {
        if (!newServiceSpecial.services_special_name || !newServiceSpecial.services_special_title || !newServiceSpecial.services_special_desc || newServiceSpecial.services_special_include.length === 0) {
            setMessage("Name, title, description, and at least one include are required.");
            return;
        }

        if (newServiceSpecial.services_special_img && newServiceSpecial.services_special_img.size > 5 * 1024 * 1024) {
            setMessage("Image size must be less than 5MB.");
            return;
        }

        if (newServiceSpecial.services_special_img && !newServiceSpecial.services_special_img.type.startsWith("image/")) {
            setMessage("File type must be an image.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("services_special_name", newServiceSpecial.services_special_name);
            formData.append("services_special_title", newServiceSpecial.services_special_title);
            formData.append("services_special_desc", newServiceSpecial.services_special_desc);
            formData.append("services_special_include", JSON.stringify(newServiceSpecial.services_special_include));
            if (newServiceSpecial.services_special_img) {
                formData.append("services_special_img", newServiceSpecial.services_special_img);
            } else {
                formData.append("services_special_img", ""); // Kirim string kosong jika tidak ada gambar
            }
            formData.append("order", newServiceSpecial.order);

            const response = await fetch(`${API_BASE}/services_special`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setMessage("Services Special added successfully!");
                const data = await response.json();
                setServicesSpecialData([...servicesSpecialData, data]);
                setNewServiceSpecial({
                    services_special_name: "",
                    services_special_title: "",
                    services_special_desc: "",
                    services_special_include: [],
                    services_special_img: null,
                    order: 0,
                });
                setImagePreview(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to add Services Special: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error adding Services Special:", error);
            setMessage(`Failed to add Services Special: ${error.message}`);
        }
        setLoading(false);
    };

    const updateServiceSpecial = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("services_special_name", newServiceSpecial.services_special_name);
            formData.append("services_special_title", newServiceSpecial.services_special_title);
            formData.append("services_special_desc", newServiceSpecial.services_special_desc);
            formData.append("services_special_include", JSON.stringify(newServiceSpecial.services_special_include));
            if (newServiceSpecial.services_special_img) {
                formData.append("services_special_img", newServiceSpecial.services_special_img);
            } else {
                formData.append("services_special_img", ""); // Kirim string kosong jika tidak ada gambar
            }
            formData.append("order", newServiceSpecial.order);

            const response = await fetch(`${API_BASE}/services_special/${selectedServiceSpecial.id}`, {
                method: "PUT",
                body: formData,
            });

            if (response.ok) {
                setMessage("Services Special updated successfully!");
                const updatedData = await response.json();
                const updatedServicesSpecialData = servicesSpecialData.map(serviceSpecial =>
                    serviceSpecial.id === updatedData.id ? updatedData : serviceSpecial
                );
                setServicesSpecialData(updatedServicesSpecialData);
                setNewServiceSpecial({
                    services_special_name: "",
                    services_special_title: "",
                    services_special_desc: "",
                    services_special_include: [],
                    services_special_img: null,
                    order: 0,
                });
                setSelectedServiceSpecial(null);
                setImagePreview(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update Services Special: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating Services Special:", error);
            setMessage(`Failed to update Services Special: ${error.message}`);
        }
        setLoading(false);
    };

    const deleteServiceSpecial = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this Services Special?");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/services_special/${id}`, { method: "DELETE" });
            if (response.ok) {
                setMessage("Services Special deleted successfully!");
                setServicesSpecialData(servicesSpecialData.filter(serviceSpecial => serviceSpecial.id !== id));
            } else {
                const errorData = await response.json();
                setMessage(`Failed to delete Services Special: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error deleting Services Special:", error);
            setMessage("Failed to delete Services Special.");
        }
        setLoading(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewServiceSpecial({ ...newServiceSpecial, services_special_img: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleUpload = () => {
        setNewServiceSpecial({
            services_special_name: "",
            services_special_title: "",
            services_special_desc: "",
            services_special_include: [],
            services_special_img: null,
            order: 0,
        });
        setSelectedServiceSpecial(null);
        setImagePreview(null);
        setShowForm(true);
        setEditIndex(null);
    };

    const handleEdit = (serviceSpecial, index) => {
        setSelectedServiceSpecial(serviceSpecial);
        setNewServiceSpecial({
            services_special_name: serviceSpecial.services_special_name || "",
            services_special_title: serviceSpecial.services_special_title || "",
            services_special_desc: serviceSpecial.services_special_desc || "",
            services_special_include: serviceSpecial.services_special_include || [],
            services_special_img: serviceSpecial.services_special_img || null,
            order: serviceSpecial.order || 0,
        });
        setImagePreview(serviceSpecial.services_special_img);
        setEditIndex(index);
        setShowForm(true);
    };

    const handleIncludeChange = (e) => {
        setIncludeInput(e.target.value);
    };

    const handleAddInclude = () => {
        if (includeInput) {
            setNewServiceSpecial({
                ...newServiceSpecial,
                services_special_include: [...newServiceSpecial.services_special_include, includeInput],
            });
            setIncludeInput("");
        }
    };

    const handleRemoveInclude = (index) => {
        setNewServiceSpecial({
            ...newServiceSpecial,
            services_special_include: newServiceSpecial.services_special_include.filter((_, i) => i !== index),
        });
    };

    const filteredServices = servicesSpecialData.filter(serviceSpecial =>
        serviceSpecial.services_special_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section className={styles.adminContainer}>
            <h2><a href="/adminonlydama/homedama/">Services Special Admin</a></h2>

            <div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
    Note: image size 500x400
</div>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            <button onClick={handleUpload} className={styles.uploadButton}>Add Services Special</button>

            <input
                type="text"
                placeholder="Search Services Special"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
            />

            {showForm && (
                <form className={styles.taglineForm}>
                    <label htmlFor="serviceSpecialName">Name:</label>
                    <input
                        type="text"
                        id="serviceSpecialName"
                        placeholder="Name"
                        value={newServiceSpecial.services_special_name}
                        onChange={(e) => setNewServiceSpecial({ ...newServiceSpecial, services_special_name: e.target.value })}
                        className={styles.inputField}
                    />
                    <label htmlFor="serviceSpecialTitle">Title:</label>
                    <input
                        type="text"
                        id="serviceSpecialTitle"
                        placeholder="Title"
                        value={newServiceSpecial.services_special_title}
                        onChange={(e) => setNewServiceSpecial({ ...newServiceSpecial, services_special_title: e.target.value })}
                        className={styles.inputField}
                    />
                    <label htmlFor="serviceSpecialDesc">Description:</label>
                    <textarea
                        id="serviceSpecialDesc"
                        placeholder="Description"
                        value={newServiceSpecial.services_special_desc}
                        onChange={(e) => setNewServiceSpecial({ ...newServiceSpecial, services_special_desc: e.target.value })}
                        className={styles.inputField}
                    />
                    <label>Includes:</label>
                    <div className={styles.includeContainer}>
                        <input
                            type="text"
                            placeholder="Add include"
                            value={includeInput}
                            onChange={handleIncludeChange}
                            className={styles.includeInput}
                        />
                        <button type="button" onClick={handleAddInclude} className={styles.includeButton}>Add</button>
                    </div>
                    <ul className={styles.includeList}>
                        {newServiceSpecial.services_special_include.map((include, index) => (
                            <li key={index} className={styles.includeItem}>
                                {include}
                                <button type="button" onClick={() => handleRemoveInclude(index)} className={styles.removeInclude}>X</button>
                            </li>
                        ))}
                    </ul>
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
                    <label htmlFor="serviceSpecialOrder">Order:</label>
                    <input
                        type="number"
                        id="serviceSpecialOrder"
                        placeholder="Order"
                        value={newServiceSpecial.order}
                        onChange={(e) => setNewServiceSpecial({ ...newServiceSpecial, order: parseInt(e.target.value) })}
                        className={styles.inputField}
                    />
                    <button onClick={selectedServiceSpecial ? updateServiceSpecial : addServiceSpecial} disabled={loading} className={styles.actionButton}>
                        {loading
                            ? selectedServiceSpecial
                                ? "Updating..."
                                : "Adding..."
                            : selectedServiceSpecial
                                ? "Update Services Special"
                                : "Add Services Special"}
                    </button>
                    <button onClick={() => { setShowForm(false); setEditIndex(null); }} className={styles.cancelButton}>Cancel</button>
                </form>
            )}

            <div className={styles.taglineList}>
                {filteredServices.map((serviceSpecial, index) => (
                    <div key={serviceSpecial.id} className={styles.taglineItem}>
                        <div className={styles.taglineContent}>
                            <h3>{serviceSpecial.services_special_name}</h3>
                            <h4>{serviceSpecial.services_special_title}</h4>
                            <p>{serviceSpecial.services_special_desc}</p>
                            <ul>
                                {serviceSpecial.services_special_include.map((include, index) => (
                                    <li key={index}>{include}</li>
                                ))}
                            </ul>
                            {serviceSpecial.services_special_img && <img src={serviceSpecial.services_special_img} alt={serviceSpecial.services_special_name} className={styles.taglineImage} />}
                        </div>
                        <div className={styles.taglineActions}>
                            <button onClick={() => handleEdit(serviceSpecial, index)} className={styles.actionButton}>Edit</button>
                            <button onClick={() => deleteServiceSpecial(serviceSpecial.id)} disabled={loading} className={styles.deleteButton}>Delete</button>
                        </div>
                        <p>Order: {serviceSpecial.order}</p>
                        {showForm && editIndex === index && (
                            <form className={`${styles.taglineForm} ${styles.editForm}`}>
                                <label htmlFor="editServiceSpecialName">Name:</label>
                                <input
                                    type="text"
                                    id="editServiceSpecialName"
                                    placeholder="Name"
                                    value={newServiceSpecial.services_special_name}
                                    onChange={(e) => setNewServiceSpecial({ ...newServiceSpecial, services_special_name: e.target.value })}
                                    className={styles.inputField}
                                />
                                <label htmlFor="editServiceSpecialTitle">Title:</label>
                                <input
                                    type="text"
                                    id="editServiceSpecialTitle"
                                    placeholder="Title"
                                    value={newServiceSpecial.services_special_title}
                                    onChange={(e) => setNewServiceSpecial({ ...newServiceSpecial, services_special_title: e.target.value })}
                                    className={styles.inputField}
                                />
                                <label htmlFor="editServiceSpecialDesc">Description:</label>
                                <textarea
                                    id="editServiceSpecialDesc"
                                    placeholder="Description"
                                    value={newServiceSpecial.services_special_desc}
                                    onChange={(e) => setNewServiceSpecial({ ...newServiceSpecial, services_special_desc: e.target.value })}
                                    className={styles.inputField}
                                />
                                <label>Includes:</label>
                                <div className={styles.includeContainer}>
                                    <input
                                        type="text"
                                        placeholder="Add include"
                                        value={includeInput}
                                        onChange={handleIncludeChange}
                                        className={styles.includeInput}
                                    />
                                    <button type="button" onClick={handleAddInclude} className={styles.includeButton}>Add</button>
                                </div>
                                <ul className={styles.includeList}>
                                    {newServiceSpecial.services_special_include.map((include, index) => (
                                        <li key={index} className={styles.includeItem}>
                                            {include}
                                            <button type="button" onClick={() => handleRemoveInclude(index)} className={styles.removeInclude}>X</button>
                                        </li>
                                    ))}
                                </ul>
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
                                <label htmlFor="editServiceSpecialOrder">Order:</label>
                                <input
                                    type="number"
                                    id="editServiceSpecialOrder"
                                    placeholder="Order"
                                    value={newServiceSpecial.order}
                                    onChange={(e) => setNewServiceSpecial({ ...newServiceSpecial, order: parseInt(e.target.value) })}
                                    className={styles.inputField}
                                />
                                <button onClick={updateServiceSpecial} disabled={loading} className={styles.actionButton}>
                                    {loading ? "Updating..." : "Update Services Special"}
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

export default ServicesSpecialAdmin;