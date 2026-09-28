import { API_BASE } from '../lib/apiBase.js';
import { asList } from '../lib/asList.js';
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./worksadmin.module.css";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import tema snow

const WorksAdmin = () => {
    const [worksData, setWorksData] = useState([]);
    const [newWork, setNewWork] = useState({
        work_title: "",
        work_subtitle: "",
        work_desc: "",
        work_detail: "",
        work_people: "",
        work_category: "",
        work_main_img: null,
        work_logo_img: null,
        work_img: [],
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedWork, setSelectedWork] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [logoImagePreview, setLogoImagePreview] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [workImageInputs, setWorkImageInputs] = useState([]);
    const [workImagesPreview, setWorkImagesPreview] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editItemId, setEditItemId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const VALID_WORK_CATEGORIES = [
        "Start Up Package",
        "Brand Management",
        "Brand Consultation",
        "Collection Development",
        "TikTok Management",
        "Social Media Management",
        "Styling & Creative Direction",
        "Fabric Sourcing & Consulting"
    ];

    const fetchWorksData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/works`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to fetch: ${errorData.error || response.statusText}`);
            }
            const data = await response.json();
            setWorksData(data.map((work) => ({ ...work, work_img: asList(work.work_img) })));
        } catch (error) {
            console.error("Error fetching Works data:", error);
            setMessage(`Failed to fetch Works data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleApiError = useCallback(async (response, successMessage) => {
        let responseData;
        try {
            responseData = await response.json();
        } catch (error) {
            console.warn("Failed to parse JSON in handleApiError:", error);
            if (!response.ok) {
                throw new Error(`Failed: ${response.statusText}`);
            }
            setMessage(successMessage);
            return null; // Or handle cases where JSON is not expected on success
        }

        if (!response.ok) {
            throw new Error(`Failed: ${responseData.error || response.statusText}`);
        }
        setMessage(successMessage);
        return responseData;
    }, []);

    const addWork = useCallback(async () => {
        if (!newWork.work_title || !newWork.work_desc || !newWork.work_category) {
            setMessage("Title, description, and category are required.");
            return;
        }

        if (!VALID_WORK_CATEGORIES.includes(newWork.work_category)) {
            setMessage("Invalid work category.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            Object.keys(newWork).forEach((key) => {
                if (key === "work_img") {
                    newWork.work_img.forEach((file) => {
                        if (file) {
                            formData.append("work_img", file);
                        }
                    });
                } else if (key === "work_main_img" || key === "work_logo_img"){
                    if(newWork[key]){
                        formData.append(key, newWork[key]);
                    }
                } else if (newWork[key] !== null && newWork[key] !== undefined) {
                    formData.append(key, newWork[key]);
                } else {
                    formData.append(key, "");
                }
            });

            const response = await fetch(`${API_BASE}/works`, {
                method: "POST",
                body: formData,
            });

            const responseData = await handleApiError(response, `Work "${newWork.work_title}" added successfully!`);
            if (responseData && responseData.length > 0) {
                const created = { ...responseData[0], work_img: asList(responseData[0].work_img) };
                setWorksData([...worksData, created]);
                resetForm();
            }
        } catch (error) {
            console.error("Error adding Work:", error);
            setMessage(`Failed to add Work: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [newWork, worksData, handleApiError]);

    const updateWork = useCallback(async () => {
        if (!newWork.work_title || !newWork.work_desc || !newWork.work_category) {
            setMessage("Title, description, and category are required.");
            return;
        }

        if (!VALID_WORK_CATEGORIES.includes(newWork.work_category)) {
            setMessage("Invalid work category.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            Object.keys(newWork).forEach((key) => {
                if (key === "work_img") {
                    newWork.work_img.forEach((item) => {
                        if (item instanceof File) {
                            formData.append("work_img", item);
                        }
                    });
                    const existingWorkImageUrls = newWork.work_img.filter(item => typeof item === 'string');
                    existingWorkImageUrls.forEach((url, index) => {
                        formData.append(`work_img_url[${index}]`, url);
                    });
                } else if (key === "work_main_img" || key === "work_logo_img") {
                    if (newWork[key] instanceof File) {
                        formData.append(key, newWork[key]);
                    }
                } else if (newWork[key] !== null && newWork[key] !== undefined) {
                    formData.append(key, newWork[key]);
                } else {
                    formData.append(key, "");
                }
            });

            const response = await fetch(`${API_BASE}/works/${selectedWork.id}`, {
                method: "PUT",
                body: formData,
            });

            const responseData = await handleApiError(response, `Work "${newWork.work_title}" updated successfully!`);
            if (responseData && responseData.length > 0) {
                const updated = { ...responseData[0], work_img: asList(responseData[0].work_img) };
                const updatedWorksData = worksData.map((work) =>
                    work.id === updated.id ? updated : work
                );
                setWorksData(updatedWorksData);
                resetForm();
            }
        } catch (error) {
            console.error("Error updating Work:", error);
            setMessage(`Failed to update Work: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [newWork, worksData, selectedWork, handleApiError]);

    const deleteWork = useCallback(async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this Work?");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/works/${id}`, { method: "DELETE" });
            await handleApiError(response, `Work with ID ${id} deleted successfully!`);
            setWorksData(worksData.filter((work) => work.id !== id));
        } catch (error) {
            console.error("Error deleting Work:", error);
            setMessage(`Failed to delete Work: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [worksData, handleApiError]);

    const handleMainImageChange = useCallback((e) => {
        const file = e.target.files[0];
        setNewWork({ ...newWork, work_main_img: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setMainImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setMainImagePreview(selectedWork?.work_main_img || null);
        }
    }, [newWork, selectedWork]);

    const handleLogoImageChange = useCallback((e) => {
        const file = e.target.files[0];
        setNewWork({ ...newWork, work_logo_img: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setLogoImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setLogoImagePreview(selectedWork?.work_logo_img || null);
        }
    }, [newWork, selectedWork]);

    const handleWorkImageChange = useCallback((e, index) => {
        const file = e.target.files[0];
        const updatedImages = [...newWork.work_img];
        if (file) {
            updatedImages[index] = file;
        }
        setNewWork({ ...newWork, work_img: updatedImages });

        const updatedPreviews = [...workImagesPreview];
        if (file) {
            updatedPreviews[index] = URL.createObjectURL(file);
        } else if (selectedWork?.work_img?.[index] && !newWork.work_img[index]) {
            updatedPreviews[index] = selectedWork.work_img[index];
        }
        setWorkImagesPreview(updatedPreviews);
    }, [newWork, workImagesPreview, selectedWork]);

    const handleAddWorkImageInput = useCallback(() => {
        setWorkImageInputs([...workImageInputs, workImageInputs.length]);
        setNewWork({ ...newWork, work_img: [...newWork.work_img, null] });
        setWorkImagesPreview([...workImagesPreview, null]);
    }, [newWork, workImageInputs, workImagesPreview]);

    const handleRemoveWorkImageInput = useCallback((index) => {
        setWorkImageInputs(workImageInputs.filter((i) => i !== index));
        const updatedImages = [...newWork.work_img];
        updatedImages.splice(index, 1);
        setNewWork({ ...newWork, work_img: updatedImages });

        const updatedPreviews = [...workImagesPreview];
        updatedPreviews.splice(index, 1);
        setWorkImagesPreview(updatedPreviews);
    }, [newWork, workImageInputs, workImagesPreview]);

    const handleUpload = useCallback(() => {
        resetForm();
        setShowAddForm(true);
        setShowForm(true);
        setEditItemId(null);
    }, []);

    const handleEdit = useCallback((work, index) => {
        const images = asList(work.work_img);
        setSelectedWork(work);
        setNewWork({
            work_title: work.work_title || "",
            work_subtitle: work.work_subtitle || "",
            work_desc: work.work_desc || "",
            work_detail: work.work_detail || "",
            work_people: work.work_people || "",
            work_category: work.work_category || "",
            work_main_img: null,
            work_logo_img: null,
            work_img: images,
        });
        setMainImagePreview(work.work_main_img);
        setLogoImagePreview(work.work_logo_img);
        setWorkImagesPreview(images);
        setEditIndex(index);
        setShowForm(true);
        setWorkImageInputs(images.map((_, i) => i));
        setEditItemId(work.id);
        setShowAddForm(false);
    }, []);

    const resetForm = useCallback(() => {
        setNewWork({
            work_title: "",
            work_subtitle: "",
            work_desc: "",
            work_detail: "",
            work_people: "",
            work_category: "",
            work_main_img: null,
            work_logo_img: null,
            work_img: [],
        });
        setSelectedWork(null);
        setMainImagePreview(null);
        setLogoImagePreview(null);
        setWorkImagesPreview([]);
        setShowForm(false);
        setEditIndex(null);
        setWorkImageInputs([]);
        setEditItemId(null);
        setShowAddForm(false);
    }, []);

    useEffect(() => {
        fetchWorksData();
    }, [fetchWorksData]);

    useEffect(() => {
        return () => {
            workImagesPreview.forEach(preview => {
                if (preview && typeof preview !== 'string') {
                    URL.revokeObjectURL(preview);
                }
            });
            if (mainImagePreview && typeof mainImagePreview !== 'string') {
                URL.revokeObjectURL(mainImagePreview);
            }
            if (logoImagePreview && typeof logoImagePreview !== 'string') {
                URL.revokeObjectURL(logoImagePreview);
            }
        };
    }, [workImagesPreview, mainImagePreview, logoImagePreview]);

    const filteredWorksData = useMemo(() => {
        return worksData.filter(work =>
            work.work_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            work.work_subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            work.work_desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
            work.work_category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, worksData]);

    return (
        <section className={styles.adminContainer}>
            <h2><a href="/adminonlydama/homedama/">Works Admin</a></h2>

            <div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
    Note: work banner 1200x400, work item 500x500
</div>
            {message && (
                <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
                    {message}
                </p>
            )}

            <input
                type="text"
                placeholder="Search Works"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
            />

            <button onClick={handleUpload} className={styles.uploadButton}>Add Work</button>

            {showAddForm && showForm && !editItemId && (
                <form className={styles.workForm}>
                    <label htmlFor="workTitle">Title:</label>
                    <input
                        type="text"
                        id="workTitle"
                        placeholder="Title"
                        value={newWork.work_title}
                        onChange={(e) => setNewWork({ ...newWork, work_title: e.target.value })}
                        className={styles.inputField}
                    />
                    <label htmlFor="workSubtitle">Subtitle:</label>
                    <input
                        type="text"
                        id="workSubtitle"
                        placeholder="Subtitle"
                        value={newWork.work_subtitle}
                        onChange={(e) => setNewWork({ ...newWork, work_subtitle: e.target.value })}
                        className={styles.inputField}
                    />
                    <label htmlFor="workDesc">Description:</label>
                    <ReactQuill
                        value={newWork.work_desc}
                        onChange={(content) => setNewWork({ ...newWork, work_desc: content })}
                        modules={{
                            toolbar: [
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                ['clean']
                            ],
                        }}
                        formats={[
                            'bold', 'italic', 'underline', 'strike',
                            'list', 'bullet'
                        ]}
                        className={styles.inputField}
                    />
                    <label htmlFor="workDetail">Detail:</label>
                    <textarea
                        id="workDetail"
                        placeholder="Detail"
                        value={newWork.work_detail}
                        onChange={(e) => setNewWork({ ...newWork, work_detail: e.target.value })}
                        className={styles.inputField}
                    />
                    <label htmlFor="workPeople">Brand Name:</label>
                    <input
                        type="text"
                        id="workPeople"
                        placeholder="People"
                        value={newWork.work_people}
                        onChange={(e) => setNewWork({ ...newWork, work_people: e.target.value })}
                        className={styles.inputField}
                    />
                    <label htmlFor="workCategory">Category:</label>
                    <select
                        id="workCategory"
                        value={newWork.work_category}
                        onChange={(e) => setNewWork({ ...newWork, work_category: e.target.value })}
                        className={styles.inputField}
                    >
                        <option value="">Select Category</option>
                        {VALID_WORK_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>

                    <div className={styles.imageUploadContainer}>
                        <div className={styles.imageUploadBox}>
                        <input
                                type="file"
                                accept="image/*"
                                onChange={handleMainImageChange}
                                id="mainImageUpload"
                                style={{ display: "none" }}
                            />
                            <label htmlFor="mainImageUpload" className={styles.imageUploadLabel}>Upload Main Image</label>
                            {mainImagePreview && (
                                <img src={mainImagePreview} alt="Main Preview" className={styles.imagePreview} />
                            )}
                        </div>

                        <div className={styles.imageUploadBox}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoImageChange}
                                id="logoImageUpload"
                                style={{ display: "none" }}
                            />
                            <label htmlFor="logoImageUpload" className={styles.imageUploadLabel}>Upload Logo Image</label>
                            {logoImagePreview && (
                                <img src={logoImagePreview} alt="Logo Preview" className={styles.imagePreview} />
                            )}
                        </div>
                    </div>

                    <div className={styles.imageListContainer}>
                        {workImagesPreview.map((preview, index) => (
                            <div key={index} className={styles.imageItemContainer}>
                                {preview && typeof preview === 'string' && (
                                    <img src={preview} alt={`Work Preview ${index}`} className={styles.imageItemPreview} />
                                )}
                                {preview && typeof preview !== 'string' && (
                                    <img src={URL.createObjectURL(preview)} alt={`Work Preview ${index}`} className={styles.imageItemPreview} />
                                )}
                                <label htmlFor={`editWorkImageUpload${index}`} className={styles.imageItemLabel}>
                                    Work Image {index + 1}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleWorkImageChange(e, index)}
                                    id={`editWorkImageUpload${index}`}
                                    style={{ display: "none" }}
                                />
                                <button type="button" onClick={() => handleRemoveWorkImageInput(index)} className={styles.removeButton}>Remove</button>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddWorkImageInput} className={styles.addButton}>Add Work Image</button>
                    </div>

                    <button onClick={addWork} disabled={loading} className={styles.actionButton}>
                        {loading ? "Adding..." : "Add Work"}
                    </button>
                    <button onClick={() => { setShowForm(false); setShowAddForm(false); }} className={styles.cancelButton}>Cancel</button>
                </form>
            )}

            <div className={styles.workList}>
                {filteredWorksData.map((work, index) => (
                    <div key={work.id} className={styles.workItem}>
                        <div className={styles.workContent}>
                            <h3>{work.work_title}</h3>
                            <p>{work.work_category}</p>
                            <p>{work.work_subtitle}</p>
                            {/* Menggunakan dangerouslySetInnerHTML untuk menampilkan format HTML dari Quill */}
                            <p dangerouslySetInnerHTML={{ __html: work.work_desc }}></p>
                            <p>{work.work_detail}</p>
                            <p>{work.work_people}</p>
                            <div className={styles.workImageContainer}>
                                {asList(work.work_img).map((img, imgIndex) => (
                                    <img key={imgIndex} src={img} alt={`Work Image ${imgIndex}`} className={styles.workImage} />
                                ))}
                                {work.work_main_img && <img src={work.work_main_img} alt="Main" className={styles.workImage} />}
                                {work.work_logo_img && <img src={work.work_logo_img} alt="Logo" className={styles.workImage} />}
                            </div>
                        </div>
                        <div className={styles.workActions}>
                            <button onClick={() => handleEdit(work, index)} className={styles.actionButton}>Edit</button>
                            <button onClick={() => deleteWork(work.id)} disabled={loading} className={styles.deleteButton}>Delete</button>
                        </div>
                        {editItemId === work.id && showForm && (
                            <form className={styles.workForm}>
                                <label htmlFor="workTitle">Title:</label>
                                <input
                                    type="text"
                                    id="workTitle"
                                    placeholder="Title"
                                    value={newWork.work_title}
                                    onChange={(e) => setNewWork({ ...newWork, work_title: e.target.value })}
                                    className={styles.inputField}
                                />
                                <label htmlFor="workSubtitle">Subtitle:</label>
                                <input
                                    type="text"
                                    id="workSubtitle"
                                    placeholder="Subtitle"
                                    value={newWork.work_subtitle}
                                    onChange={(e) => setNewWork({ ...newWork, work_subtitle: e.target.value })}
                                    className={styles.inputField}
                                />
                                <label htmlFor="workDesc">Description:</label>
                                <ReactQuill
                                    value={newWork.work_desc}
                                    onChange={(content) => setNewWork({ ...newWork, work_desc: content })}
                                    modules={{
                                        toolbar: [
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                            ['clean']
                                        ],
                                    }}
                                    formats={[
                                        'bold', 'italic', 'underline', 'strike',
                                        'list', 'bullet'
                                    ]}
                                    className={styles.inputField}
                                />
                                <label htmlFor="workDetail">Detail:</label>
                                <textarea
                                    id="workDetail"
                                    placeholder="Detail"
                                    value={newWork.work_detail}
                                    onChange={(e) => setNewWork({ ...newWork, work_detail: e.target.value })}
                                    className={styles.inputField}
                                />
                                <label htmlFor="workPeople">Brand Name:</label>
                                <input
                                    type="text"
                                    id="workPeople"
                                    placeholder="People"
                                    value={newWork.work_people}
                                    onChange={(e) => setNewWork({ ...newWork, work_people: e.target.value })}
                                    className={styles.inputField}
                                />
                                <label htmlFor="workCategory">Category:</label>
                                <select
                                    id="workCategory"
                                    value={newWork.work_category}
                                    onChange={(e) => setNewWork({ ...newWork, work_category: e.target.value })}
                                    className={styles.inputField}
                                >
                                    <option value="">Select Category</option>
                                    {VALID_WORK_CATEGORIES.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>

                                <div className={styles.imageUploadContainer}>
                                    <div className={styles.imageUploadBox}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleMainImageChange}
                                            id="mainImageUpload"
                                            style={{ display: "none" }}
                                        />
                                        <label htmlFor="mainImageUpload" className={styles.imageUploadLabel}>Upload Main Image</label>
                                        {mainImagePreview && (
                                            <img src={mainImagePreview} alt="Main Preview" className={styles.imagePreview} />
                                        )}
                                    </div>

                                    <div className={styles.imageUploadBox}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoImageChange}
                                            id="logoImageUpload"
                                            style={{ display: "none" }}
                                        />
                                        <label htmlFor="logoImageUpload" className={styles.imageUploadLabel}>Upload Logo Image</label>
                                        {logoImagePreview && (
                                            <img src={logoImagePreview} alt="Logo Preview" className={styles.imagePreview} />
                                        )}
                                    </div>
                                </div>

                                <div className={styles.imageListContainer}>
                                    {workImagesPreview.map((preview, index) => (
                                        <div key={index} className={styles.imageItemContainer}>
                                            {preview && typeof preview === 'string' && (
                                                <img src={preview} alt={`Work Preview ${index}`} className={styles.imageItemPreview} />
                                            )}
                                            {preview && typeof preview !== 'string' && (
                                                <img src={URL.createObjectURL(preview)} alt={`Work Preview ${index}`} className={styles.imageItemPreview} />
                                            )}
                                            <label htmlFor={`editWorkImageUpload${index}`} className={styles.imageItemLabel}>
                                                Work Image {index + 1}
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleWorkImageChange(e, index)}
                                                id={`editWorkImageUpload${index}`}
                                                style={{ display: "none" }}
                                            />
                                            <button type="button" onClick={() => handleRemoveWorkImageInput(index)} className={styles.removeButton}>Remove</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={handleAddWorkImageInput} className={styles.addButton}>Add Work Image</button>
                                </div>

                                <button onClick={updateWork} disabled={loading} className={styles.actionButton}>
                                    {loading ? "Updating..." : "Update Work"}
                                </button>
                                <button onClick={() => { setShowForm(false); setEditIndex(null); setEditItemId(null);}} className={styles.cancelButton}>Cancel</button>
                            </form>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WorksAdmin;