import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect, useCallback } from "react";
import styles from "./worksadmin.module.css";

const WorkPageAdmin = () => {
    const [work_pages, setWorkPages] = useState([]);
    const [newWorkPage, setNewWorkPage] = useState({
        work_page_title: "",
        work_page_subtitle: "",
        work_page_img: null,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedWorkPage, setSelectedWorkPage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [editItemId, setEditItemId] = useState(null);

    const fetchWorkPages = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/work_page`);
            if (response.ok) {
                const data = await response.json();
                setWorkPages(data);
            } else {
                setMessage("Failed to fetch work pages.");
            }
        } catch (error) {
            console.error("Error fetching work pages:", error);
            setMessage("Failed to fetch work pages.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkPages();
    }, [fetchWorkPages]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setMessage("Image size exceeds 5MB.");
                return;
            }

            if (!file.type.startsWith("image/")) {
                setMessage("Invalid file type. Please upload an image.");
                return;
            }

            setNewWorkPage({ ...newWorkPage, work_page_img: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const updateWorkPage = async () => {
        if (!newWorkPage.work_page_title) {
            setMessage("Work page text is required.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("work_page_title", newWorkPage.work_page_title);
            formData.append("work_page_subtitle", newWorkPage.work_page_subtitle);
            if (newWorkPage.work_page_img) {
                formData.append("work_page_img", newWorkPage.work_page_img);
            }

            const response = await fetch(`${API_BASE}/work_page/${selectedWorkPage.id}`, {
                method: "PUT",
                body: formData,
            });

            if (response.ok) {
                setMessage("Work page updated successfully!");
                const updatedData = await response.json();
                const updatedWorkPages = work_pages.map((work_page) =>
                    work_page.id === updatedData.id ? updatedData : work_page
                );
                setWorkPages(updatedWorkPages);
                setNewWorkPage({
                    work_page_title: "",
                    work_page_subtitle: "",
                    work_page_img: null,
                });
                setImagePreview(null);
                setShowForm(false);
            } else {
                const errorData = await response.json();
                setMessage(`Failed to update work page: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error updating work page:", error);
            setMessage(`Failed to update work page: ${error.message}`);
        }
        setLoading(false);
    };

    const handleEdit = (work_page, index) => {
        setSelectedWorkPage(work_page);
        setNewWorkPage({
            work_page_title: work_page.work_page_title || "",
            work_page_subtitle: work_page.work_page_subtitle || "",
            work_page_img: null,
        });
        setImagePreview(work_page.work_page_img);
        setEditIndex(index);
        setShowForm(true);
        setEditItemId(work_page.id);
    };

    const resetForm = () => {
        setNewWorkPage({
            work_page_title: "",
            work_page_subtitle: "",
            work_page_img: null,
        });
        setSelectedWorkPage(null);
        setImagePreview(null);
        setShowForm(false);
        setEditIndex(null);
        setEditItemId(null);
    };

    return (
        <section className={styles.adminContainer}>
            <h2>Work Page Admin</h2>

            <div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
    Note: work banner 1200x400, work item 500x500
</div>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            {work_pages.map((work_page, index) => (
                <div key={work_page.id} className={styles.workItem}>
                    <div className={styles.workContent}>
                        <img src={work_page.work_page_img} alt={work_page.work_page_title} className={styles.workImage} />
                        <div>
                            <h3>{work_page.work_page_title}</h3>
                            <p>{work_page.work_page_subtitle}</p>
                        </div>
                    </div>
                    <div className={styles.workActions}>
                        <button onClick={() => handleEdit(work_page, index)} className={styles.actionButton}>Edit</button>
                    </div>
                    {editItemId === work_page.id && showForm && (
                        <form className={styles.workForm}>
                            <label htmlFor="workPageTitle">Work Page Title:</label>
                            <input
                                type="text"
                                id="workPageTitle"
                                placeholder="Work Page Title"
                                value={newWorkPage.work_page_title}
                                onChange={(e) => setNewWorkPage({ ...newWorkPage, work_page_title: e.target.value })}
                                className={styles.inputField}
                            />
                            <label htmlFor="workPageSubtitle">Work Page Subtitle:</label>
                            <input
                                type="text"
                                id="workPageSubtitle"
                                placeholder="Work Page Subtitle"
                                value={newWorkPage.work_page_subtitle}
                                onChange={(e) => setNewWorkPage({ ...newWorkPage, work_page_subtitle: e.target.value })}
                                className={styles.inputField}
                            />
                            <div className={styles.imageUploadContainer}>
                                <div className={styles.imageUploadBox}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        id="mainImageUpload"
                                        style={{ display: "none" }}
                                    />
                                    <label htmlFor="mainImageUpload" className={styles.imageUploadLabel}>Upload Main Image</label>
                                    {selectedWorkPage && selectedWorkPage.work_page_img && (
                                        <img src={selectedWorkPage.work_page_img} alt="Main Preview" className={styles.imagePreview} />
                                    )}
                                </div>
                            </div>
                            <button onClick={updateWorkPage} disabled={loading} className={styles.actionButton}>
                                {loading ? "Updating..." : "Update Work Page"}
                            </button>
                            <button onClick={() => { resetForm(); }} className={styles.cancelButton}>Cancel</button>
                        </form>
                    )}
                </div>
            ))}
        </section>
    );
};

export default WorkPageAdmin;