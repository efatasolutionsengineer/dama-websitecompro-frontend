import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./homeadmin.module.css";

const OurClientsAdmin = () => {
    const [clients, setClients] = useState([]);
    const [newClient, setNewClient] = useState({
        client_name: "",
        client_link: "",
        client_logo_img: null,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedClient, setSelectedClient] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/ourclients`);
                if (response.ok) {
                    const data = await response.json();
                    setClients(data);
                } else {
                    setMessage("Failed to fetch clients.");
                }
            } catch (error) {
                console.error("Error fetching clients:", error);
                setMessage("Failed to fetch clients.");
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    const addClient = async () => {
        if (!newClient.client_name || !newClient.client_link || !newClient.client_logo_img) {
            setMessage("Client name, link, and logo are required.");
            return;
        }

        if (newClient.client_logo_img.size > 5 * 1024 * 1024) {
            setMessage("Image size must be less than 5MB.");
            return;
        }

        if (!newClient.client_logo_img.type.startsWith("image/")) {
            setMessage("File type must be an image.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("client_name", newClient.client_name);
            formData.append("client_link", newClient.client_link);
            formData.append("client_logo_img", newClient.client_logo_img);

            const response = await fetch(`${API_BASE}/ourclients`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setMessage("Client added successfully!");
                const data = await response.json();
                setClients([...clients, data]);
                setNewClient({
                    client_name: "",
                    client_link: "",
                    client_logo_img: null,
                });
                setImagePreview(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to add client: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error adding client:", error);
            setMessage(`Failed to add client: ${error.message}`);
        }
        setLoading(false);
    };

    const updateClient = async () => {
        if (!newClient.client_name || !newClient.client_link) {
            setMessage("Client name and link are required.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("client_name", newClient.client_name);
            formData.append("client_link", newClient.client_link);
            if (newClient.client_logo_img) {
                formData.append("client_logo_img", newClient.client_logo_img);
            }

            const response = await fetch(`${API_BASE}/ourclients/${selectedClient.id}`, {
                method: "PUT",
                body: formData,
            });

            if (response.ok) {
                setMessage("Client updated successfully!");
                const updatedData = await response.json();
                const updatedClients = clients.map(client =>
                    client.id === updatedData.id ? updatedData : client
                );
                setClients(updatedClients);
                setNewClient({
                    client_name: "",
                    client_link: "",
                    client_logo_img: null,
                });
                setSelectedClient(null);
                setImagePreview(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update client: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating client:", error);
            setMessage(`Failed to update client: ${error.message}`);
        }
        setLoading(false);
    };

    const deleteClient = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this client?");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/ourclients/${id}`, { method: "DELETE" });
            if (response.ok) {
                setMessage("Client deleted successfully!");
                setClients(clients.filter(client => client.id !== id));
            } else {
                const errorData = await response.json();
                setMessage(`Failed to delete client: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error deleting client:", error);
            setMessage("Failed to delete client.");
        }
        setLoading(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewClient({ ...newClient, client_logo_img: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleUpload = () => {
        setNewClient({ client_name: "", client_link: "", client_logo_img: null });
        setSelectedClient(null);
        setImagePreview(null);
        setShowForm(true);
        setEditIndex(null);
    };

    const handleEdit = (client, index) => {
        setSelectedClient(client);
        setNewClient({
            client_name: client.client_name,
            client_link: client.client_link,
            client_logo_img: null,
        });
        setImagePreview(client.client_logo_img);
        setEditIndex(index);
        setShowForm(true);
    };

    return (
        <section className={styles.adminContainer}>
            <h2>Our Clients Admin</h2>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            <button onClick={handleUpload} className={styles.uploadButton}>Add Client</button>

            {showForm && editIndex === null && (
                <form className={styles.taglineForm}>
                    <label htmlFor="clientName">Client Name:</label>
                    <input
                        type="text"
                        id="clientName"
                        placeholder="Client Name"
                        value={newClient.client_name}
                        onChange={(e) => setNewClient({ ...newClient, client_name: e.target.value })}
                        className={styles.inputField}
                    />
                    <label htmlFor="clientLink">Client Link:</label>
                    <input
                        type="text"
                        id="clientLink"
                        placeholder="Client Link"
                        value={newClient.client_link}
                        onChange={(e) => setNewClient({ ...newClient, client_link: e.target.value })}
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
                            <label htmlFor="imageUpload">Upload Logo</label>
                        </div>
                        {imagePreview && <img src={imagePreview} alt="Preview" className={styles.imagePreview} />}
                    </div>

                    <button onClick={selectedClient ? updateClient : addClient} disabled={loading} className={styles.actionButton}>
                        {loading
                            ? selectedClient
                                ? "Updating..."
                                : "Adding..."
                            : selectedClient
                                ? "Update Client"
                                : "Add Client"}
                    </button>
                    <button onClick={() => { setShowForm(false); setEditIndex(null); }} className={styles.cancelButton}>Cancel</button>
                </form>
            )}

<div className={styles.taglineList}>
                {clients.map((client, index) => (
                    <div key={client.id} className={styles.taglineItem}>
                        <div className={styles.taglineContent}>
                            <img src={client.client_logo_img} alt={client.client_name} className={styles.taglineImage} />
                            <div>
                                <span style={{ display: 'block', marginBottom: '5px' }}>{client.client_name}</span>
                                <a href={client.client_link} target="_blank" rel="noopener noreferrer">
                                    {client.client_link}
                                </a>
                            </div>
                        </div>
                        <div className={styles.taglineActions}>
                            <button onClick={() => handleEdit(client, index)} className={styles.actionButton}>Edit</button>
                            <button onClick={() => deleteClient(client.id)} disabled={loading} className={styles.deleteButton}>Delete</button>
                        </div>
                        {showForm && editIndex === index && (
                            <form className={`${styles.taglineForm} ${styles.editForm}`}>
                                <label htmlFor="editClientName">Client Name:</label>
                                <input
                                    type="text"
                                    id="editClientName"
                                    placeholder="Client Name"
                                    value={newClient.client_name}
                                    onChange={(e) => setNewClient({ ...newClient, client_name: e.target.value })}
                                    className={styles.inputField}
                                />
                                <label htmlFor="editClientLink">Client Link:</label>
                                <input
                                    type="text"
                                    id="editClientLink"
                                    placeholder="Client Link"
                                    value={newClient.client_link}
                                    onChange={(e) => setNewClient({ ...newClient, client_link: e.target.value })}
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
                                        <label htmlFor="editImageUpload">Upload Logo</label>
                                    </div>
                                    {imagePreview && <img src={imagePreview} alt="Preview" className={styles.imagePreview} />}
                                </div>

                                <button onClick={updateClient} disabled={loading} className={styles.actionButton}>
                                    {loading ? "Updating..." : "Update Client"}
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

export default OurClientsAdmin;