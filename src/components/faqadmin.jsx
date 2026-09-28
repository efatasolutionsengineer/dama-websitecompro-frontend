import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect } from "react";
import styles from "./homeadmin.module.css";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const FaqAdmin = () => {
    const [faqData, setFaqData] = useState([]);
    const [newFaq, setNewFaq] = useState({
        faq_question: "",
        faq_answer: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedFaq, setSelectedFaq] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    useEffect(() => {
        const fetchFaqData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/faq`);
                if (response.ok) {
                    const data = await response.json();
                    setFaqData(data);
                } else {
                    setMessage("Failed to fetch FAQ data.");
                }
            } catch (error) {
                console.error("Error fetching FAQ data:", error);
                setMessage("Failed to fetch FAQ data.");
            } finally {
                setLoading(false);
            }
        };

        fetchFaqData();
    }, []);

    const addFaq = async () => {
        if (!newFaq.faq_question || !newFaq.faq_answer) {
            setMessage("Question and answer are required.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/faq`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newFaq),
            });

            if (response.ok) {
                setMessage("FAQ added successfully!");
                const data = await response.json();
                setFaqData([...faqData, data]);
                setNewFaq({
                    faq_question: "",
                    faq_answer: "",
                });
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to add FAQ: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error adding FAQ:", error);
            setMessage(`Failed to add FAQ: ${error.message}`);
        }
        setLoading(false);
    };

    const updateFaq = async () => {
        if (!newFaq.faq_question || !newFaq.faq_answer) {
            setMessage("Question and answer are required.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/faq/${selectedFaq.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newFaq),
            });

            if (response.ok) {
                setMessage("FAQ updated successfully!");
                const updatedData = await response.json();
                const updatedFaqData = faqData.map(faq =>
                    faq.id === updatedData.id ? updatedData : faq
                );
                setFaqData(updatedFaqData);
                setNewFaq({
                    faq_question: "",
                    faq_answer: "",
                });
                setSelectedFaq(null);
                setShowForm(false);
                setEditIndex(null);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update FAQ: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating FAQ:", error);
            setMessage(`Failed to update FAQ: ${error.message}`);
        }
        setLoading(false);
    };

    const deleteFaq = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this FAQ?");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/faq/${id}`, { method: "DELETE" });
            if (response.ok) {
                setMessage("FAQ deleted successfully!");
                setFaqData(faqData.filter(faq => faq.id !== id));
            } else {
                const errorData = await response.json();
                setMessage(`Failed to delete FAQ: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error deleting FAQ:", error);
            setMessage("Failed to delete FAQ.");
        }
        setLoading(false);
    };

    const handleUpload = () => {
        setNewFaq({ faq_question: "", faq_answer: "" });
        setSelectedFaq(null);
        setShowForm(true);
        setEditIndex(null);
    };

    const handleEdit = (faq, index) => {
        setSelectedFaq(faq);
        setNewFaq({
            faq_question: faq.faq_question,
            faq_answer: faq.faq_answer,
        });
        setEditIndex(index);
        setShowForm(true);
    };

    return (
        <section className={styles.adminContainer}>
            <h2>FAQ Admin</h2>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            <button onClick={handleUpload} className={styles.uploadButton}>Add FAQ</button>

            {showForm && editIndex === null && (
                <form className={styles.taglineForm} onSubmit={(e) => e.preventDefault()}>
                    <label htmlFor="faqQuestion">Question:</label>
                    <input
                        type="text"
                        id="faqQuestion"
                        placeholder="Question"
                        value={newFaq.faq_question}
                        onChange={(e) => setNewFaq({ ...newFaq, faq_question: e.target.value })}
                        className={styles.inputField}
                        required
                    />
                    <label htmlFor="faqAnswer">Answer:</label>
                    <ReactQuill
                        id="faqAnswer"
                        value={newFaq.faq_answer}
                        onChange={(content) => setNewFaq({ ...newFaq, faq_answer: content })}
                        modules={{
                            toolbar: [
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                ['link'],
                                ['clean']
                            ],
                        }}
                        formats={[
                            'bold', 'italic', 'underline', 'strike',
                            'list', 'bullet',
                            'link'
                        ]}
                        className={styles.inputField}
                        placeholder="Answer"
                        required
                    />

                    <button onClick={addFaq} disabled={loading} className={styles.actionButton}>
                        {loading ? "Adding..." : "Add FAQ"}
                    </button>
                    <button onClick={() => { setShowForm(false); setEditIndex(null); }} className={styles.cancelButton}>Cancel</button>
                </form>
            )}

            <div className={styles.taglineList}>
                {faqData.map((faq, index) => (
                    <div key={faq.id} className={styles.taglineItem}>
                        <div className={styles.taglineContent}>
                            <p><strong>{faq.faq_question}</strong></p>
                            <div dangerouslySetInnerHTML={{ __html: faq.faq_answer }} />
                        </div>
                        <div className={styles.taglineActions}>
                            <button onClick={() => handleEdit(faq, index)} className={styles.actionButton}>Edit</button>
                            <button onClick={() => deleteFaq(faq.id)} disabled={loading} className={styles.deleteButton}>Delete</button>
                        </div>
                        {showForm && editIndex === index && (
                            <form className={`${styles.taglineForm} ${styles.editForm}`} onSubmit={(e) => e.preventDefault()}>
                                <label htmlFor="editFaqQuestion">Question:</label>
                                <input
                                    type="text"
                                    id="editFaqQuestion"
                                    placeholder="Question"
                                    value={newFaq.faq_question}
                                    onChange={(e) => setNewFaq({ ...newFaq, faq_question: e.target.value })}
                                    className={styles.inputField}
                                    required
                                />
                                <label htmlFor="editFaqAnswer">Answer:</label>
                                <ReactQuill
                                    id="editFaqAnswer"
                                    value={newFaq.faq_answer}
                                    onChange={(content) => setNewFaq({ ...newFaq, faq_answer: content })}
                                    modules={{
                                        toolbar: [
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            ['link'],
                                            ['clean']
                                        ],
                                    }}
                                    formats={[
                                        'bold', 'italic', 'underline', 'strike',
                                        'list', 'bullet',
                                        'link'
                                    ]}
                                    className={styles.inputField}
                                    placeholder="Answer"
                                    required
                                />

                                <button onClick={updateFaq} disabled={loading} className={styles.actionButton}>
                                    {loading ? "Updating..." : "Update FAQ"}
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

export default FaqAdmin;