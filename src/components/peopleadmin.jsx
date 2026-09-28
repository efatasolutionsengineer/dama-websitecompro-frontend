import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./homeadmin.module.css"; // Menggunakan homeadmin.module.css

const PeopleAdmin = () => {
    const [people, setPeople] = useState([]);
    const [newPerson, setNewPerson] = useState({
        people_name: "",
        people_role: "",
        people_img: null,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        const fetchPeople = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/peoples`);
                if (response.ok) {
                    const data = await response.json();
                    setPeople(data);
                } else {
                    setMessage("Failed to fetch people.");
                }
            } catch (error) {
                console.error("Error fetching people:", error);
                setMessage("Failed to fetch people.");
            } finally {
                setLoading(false);
            }
        };

        fetchPeople();
    }, []);

    const addPerson = async () => {
        if (!newPerson.people_name || !newPerson.people_img) {
            setMessage("Person name and image are required.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("people_name", newPerson.people_name);
            formData.append("people_role", newPerson.people_role);
            formData.append("people_img", newPerson.people_img);

            const response = await fetch(`${API_BASE}/peoples`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setMessage("Person added successfully!");
                const data = await response.json();
                setPeople([...people, data]);
                setNewPerson({ people_name: "", people_role: "", people_img: null });
                setImagePreview(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to add person: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error adding person:", error);
            setMessage(`Failed to add person: ${error.message}`);
        }
        setLoading(false);
    };

    const updatePerson = async () => {
        if (!newPerson.people_name) {
            setMessage("Person name is required.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("people_name", newPerson.people_name);
            formData.append("people_role", newPerson.people_role);
            if (newPerson.people_img) {
                formData.append("people_img", newPerson.people_img);
            }

            const response = await fetch(`${API_BASE}/peoples/${selectedPerson.id}`, {
                method: "PUT",
                body: formData,
            });

            if (response.ok) {
                setMessage("Person updated successfully!");
                const updatedData = await response.json();
                const updatedPeople = people.map((person) =>
                    person.id === updatedData.id ? updatedData : person
                );
                setPeople(updatedPeople);
                setNewPerson({ people_name: "", people_role: "", people_img: null });
                setSelectedPerson(null);
                setImagePreview(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update person: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating person:", error);
            setMessage(`Failed to update person: ${error.message}`);
        }
        setLoading(false);
    };

    const deletePerson = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this person?");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/peoples/${id}`, { method: "DELETE" });
            if (response.ok) {
                setMessage("Person deleted successfully!");
                setPeople(people.filter((person) => person.id !== id));
            } else {
                const errorData = await response.json();
                setMessage(`Failed to delete person: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error deleting person:", error);
            setMessage("Failed to delete person.");
        }
        setLoading(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setNewPerson({ ...newPerson, people_img: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleUpload = () => {
        setNewPerson({ people_name: "", people_role: "", people_img: null });
        setSelectedPerson(null);
        setImagePreview(null);
        setShowForm(true);
        setEditIndex(null);
    };

    const handleEdit = (person, index) => {
        setSelectedPerson(person);
        setNewPerson({
            people_name: person.people_name,
            people_role: person.people_role,
            people_img: null,
        });
        setImagePreview(person.people_img);
        setEditIndex(index);
        setShowForm(true);
    };

    return (
        <section className={styles.adminContainer}>
            <h2>People Admin</h2>

            <div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
    Note: image size 500x500
</div>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            <button onClick={handleUpload} className={styles.uploadButton}>Add People</button>

            {showForm && editIndex === null && (
                <form className={styles.taglineForm}>
                    <label htmlFor="peopleName">Person Name:</label>
                    <input
                        type="text"
                        id="peopleName"
                        placeholder="Person Name"
                        value={newPerson.people_name}
                        onChange={(e) => setNewPerson({ ...newPerson, people_name: e.target.value })}
                        className={styles.inputField}
                    />
                    <label htmlFor="peopleRole">Person Role:</label>
                    <input
                        type="text"
                        id="peopleRole"
                        placeholder="Person Role"
                        value={newPerson.people_role}
                        onChange={(e) => setNewPerson({ ...newPerson, people_role: e.target.value })}
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

                    <button onClick={selectedPerson ? updatePerson : addPerson} disabled={loading} className={styles.actionButton}>
                        {loading ? (selectedPerson ? "Updating..." : "Adding...") : (selectedPerson ? "Update Person" : "Add Person")}
                    </button>
                    <button onClick={() => { setShowForm(false); setEditIndex(null); }} className={styles.cancelButton}>Cancel</button>
                </form>
            )}

            <div className={styles.taglineList}>
                {people.map((person, index) => (
                    <div key={person.id} className={styles.taglineItem}>
                        <div className={styles.taglineContent}>
                            <img src={person.people_img} alt={person.people_name} className={styles.peopleImage} />
                            <div>
                                <span>{person.people_name}</span>
                                <p>{person.people_role}</p>
                            </div>
                        </div>
                        <div className={styles.taglineActions}>
                            <button onClick={() => handleEdit(person, index)} className={styles.actionButton}>Edit</button>
                            <button onClick={() => deletePerson(person.id)} disabled={loading} className={styles.deleteButton}>Delete</button>
                        </div>
                        {showForm && editIndex === index && (
                            <form className={`${styles.taglineForm} ${styles.editForm}`}>
                                <label htmlFor="editPeopleName">Person Name:</label>
                                <input
                                    type="text"
                                    id="editPeopleName"
                                    placeholder="Person Name"
                                    value={newPerson.people_name}
                                    onChange={(e) => setNewPerson({ ...newPerson, people_name: e.target.value })}
                                    className={styles.inputField}
                                />
                                <label htmlFor="editPeopleRole">Person Role:</label>
                                <input
                                    type="text"
                                    id="editPeopleRole"
                                    placeholder="Person Role"
                                    value={newPerson.people_role}
                                    onChange={(e) => setNewPerson({ ...newPerson, people_role: e.target.value })}
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

                                <button onClick={updatePerson} disabled={loading} className={styles.actionButton}>
                                    {loading ? "Updating..." : "Update Person"}
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

export default PeopleAdmin;