import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./worksadmin.module.css";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const BlogsAdmin = () => {
    const [blogsData, setBlogsData] = useState([]);
    const [newBlog, setNewBlog] = useState({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        author_name: "",
        author_contact: "",
        published_at: "",
        is_published: false,
        cover_image: null,
        image_list: [],
        is_pinned: false,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [imageListPreviews, setImageListPreviews] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [imageInputs, setImageInputs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editItemId, setEditItemId] = useState(null);

    const fetchBlogsData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/blogs`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to fetch: ${errorData.error || response.statusText}`);
            }
            const data = await response.json();
            setBlogsData(data);
        } catch (error) {
            console.error("Error fetching Blogs data:", error);
            setMessage(`Failed to fetch Blogs data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleApiError = useCallback(async (response, successMessage) => {
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed: ${errorData.error || response.statusText}`);
        }
        setMessage(successMessage);
    }, []);

    const addBlog = useCallback(async () => {
        if (!newBlog.title || !newBlog.content) {
            setMessage("Title and content are required.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            Object.keys(newBlog).forEach((key) => {
                if (key === "image_list") {
                    newBlog.image_list.forEach((file) => {
                        if (file) {
                            formData.append("image_list", file);
                        }
                    });
                } else if (newBlog[key] !== null && newBlog[key] !== undefined) {
                    formData.append(key, newBlog[key]);
                } else {
                    formData.append(key, "");
                }
            });

            const response = await fetch(`${API_BASE}/blogs`, {
                method: "POST",
                body: formData,
            });

            await handleApiError(response, "Blog added successfully!");
            const data = await response.json();
            setBlogsData([...blogsData, data[0]]);
            resetForm();
        } catch (error) {
            console.error("Error adding Blog:", error);
            setMessage(`Failed to add Blog: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [newBlog, blogsData, handleApiError]);

    const updateBlog = useCallback(async () => {
        if (!newBlog.title || !newBlog.content) {
            setMessage("Title and content are required.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            Object.keys(newBlog).forEach((key) => {
                if (key === "image_list") {
                    newBlog.image_list.forEach((item) => {
                        if (item instanceof File) {
                            formData.append("image_list", item);
                        } else if (typeof item === 'string') {
                            formData.append("image_list_url", item);
                        }
                    });
                } else if (newBlog[key] !== null && newBlog[key] !== undefined) {
                    formData.append(key, newBlog[key]);
                } else {
                    formData.append(key, "");
                }
            });

            const response = await fetch(`${API_BASE}/blogs/${selectedBlog.id}`, {
                method: "PUT",
                body: formData,
            });

            await handleApiError(response, "Blog updated successfully!");
            const updatedData = await response.json();
            const updatedBlogsData = blogsData.map((blog) =>
                blog.id === updatedData[0].id ? updatedData[0] : blog
            );
            setBlogsData(updatedBlogsData);
            resetForm();
        } catch (error) {
            console.error("Error updating Blog:", error);
            setMessage(`Failed to update Blog: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [newBlog, blogsData, selectedBlog, handleApiError]);

    const deleteBlog = useCallback(async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this Blog?");
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/blogs/${id}`, { method: "DELETE" });
            await handleApiError(response, "Blog deleted successfully!");
            setBlogsData(blogsData.filter((blog) => blog.id !== id));
        } catch (error) {
            console.error("Error deleting Blog:", error);
            setMessage(`Failed to delete Blog: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [blogsData, handleApiError]);

    const handleCoverImageChange = useCallback((e) => {
        const file = e.target.files[0];
        setNewBlog({ ...newBlog, cover_image: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setCoverImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setCoverImagePreview(selectedBlog?.cover_image || null);
        }
    }, [newBlog, selectedBlog]);

    const handleImageListChange = useCallback((e, index) => {
        const file = e.target.files[0];
        const updatedImages = [...newBlog.image_list];
        updatedImages[index] = file;
        setNewBlog({ ...newBlog, image_list: updatedImages });

        const updatedPreviews = [...imageListPreviews];
        updatedPreviews[index] = URL.createObjectURL(file);
        setImageListPreviews(updatedPreviews);
    }, [newBlog, imageListPreviews]);

    const handleAddImageInput = useCallback(() => {
        setImageInputs([...imageInputs, imageInputs.length]);
        setNewBlog({ ...newBlog, image_list: [...newBlog.image_list, null] });
        setImageListPreviews([...imageListPreviews, null]);
    }, [newBlog, imageInputs, imageListPreviews]);

    const handleRemoveImageInput = useCallback((index) => {
        setImageInputs(imageInputs.filter((i) => i !== index));
        const updatedImages = [...newBlog.image_list];
        updatedImages.splice(index, 1);
        setNewBlog({ ...newBlog, image_list: updatedImages });

        const updatedPreviews = [...imageListPreviews];
        updatedPreviews.splice(index, 1);
        setImageListPreviews(updatedPreviews);
    }, [newBlog, imageInputs, imageListPreviews]);

    const handleUpload = useCallback(() => {
        resetForm();
        setShowForm(true);
    }, []);

    const handleEdit = useCallback((blog, index) => {
        setSelectedBlog(blog);
        setNewBlog({
            title: blog.title || "",
            slug: blog.slug || "",
            content: blog.content || "",
            excerpt: blog.excerpt || "",
            author_name: blog.author_name || "",
            author_contact: blog.author_contact || "",
            published_at: blog.published_at || "",
            is_published: blog.is_published || false,
            cover_image: null,
            image_list: blog.image_list || [],
            is_pinned: blog.is_pinned || false,
        });
        setCoverImagePreview(blog.cover_image);
        setImageListPreviews(blog.image_list || []);
        setEditIndex(index);
        setShowForm(true);
        setImageInputs(blog.image_list ? blog.image_list.map((_, i) => i) : []);
        setEditItemId(blog.id);
    }, []);

    const resetForm = useCallback(() => {
        setNewBlog({
            title: "",
            slug: "",
            content: "",
            excerpt: "",
            author_name: "",
            author_contact: "",
            published_at: "",
            is_published: false,
            cover_image: null,
            image_list: [],
            is_pinned: false,
        });
        setSelectedBlog(null);
        setCoverImagePreview(null);
        setImageListPreviews([]);
        setShowForm(false);
        setEditIndex(null);
        setImageInputs([]);
        setEditItemId(null);
    }, []);

    useEffect(() => {
        fetchBlogsData();
    }, [fetchBlogsData]);

    const filteredBlogsData = useMemo(() => {
        return blogsData.filter(
            (blog) =>
                blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                blog.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                blog.author_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, blogsData]);

    return (
        <section className={styles.adminContainer}>
            <h2><a href="/adminonlydama/homedama/">Blogs Admin</a></h2>

            <div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
    Note: blogs banner 1200x600, blogs image 500x500
</div>
            {message && <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>{message}</p>}
            <input type="text" placeholder="Search Blogs" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} />
            <button onClick={handleUpload} className={styles.uploadButton}>Add Blog</button>
            {showForm && editItemId === null && (
                <form className={styles.workForm}>
                    <label htmlFor="title">Title:</label>
                    <input type="text" id="title" placeholder="Title" value={newBlog.title} onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })} className={styles.inputField} />
                    <label htmlFor="slug">Slug:</label>
                    <input type="text" id="slug" placeholder="Slug" value={newBlog.slug} onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value })} className={styles.inputField} />
                    <label htmlFor="content">Content:</label>
                    <ReactQuill
                        id="content"
                        value={newBlog.content}
                        onChange={(content) => setNewBlog({ ...newBlog, content: content })}
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
                    <label htmlFor="excerpt">Excerpt:</label>
                    <textarea id="excerpt" placeholder="Excerpt" value={newBlog.excerpt} onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })} className={styles.inputField} />
                    <label htmlFor="author_name">Author Name:</label>
                    <input type="text" id="author_name" placeholder="Author Name" value={newBlog.author_name} onChange={(e) => setNewBlog({ ...newBlog, author_name: e.target.value })} className={styles.inputField} />
                    <label htmlFor="author_contact">Author Contact:</label>
                    <input type="text" id="author_contact" placeholder="Author Contact" value={newBlog.author_contact} onChange={(e) => setNewBlog({ ...newBlog, author_contact: e.target.value })} className={styles.inputField} />
                    <label htmlFor="published_at">Published At:</label>
                    <input type="datetime-local" id="published_at" value={newBlog.published_at} onChange={(e) => setNewBlog({ ...newBlog, published_at: e.target.value })} className={styles.inputField} />
                    <label htmlFor="is_pinned">Is Pinned:</label>
                    <select id="is_pinned" value={newBlog.is_pinned} onChange={(e) => setNewBlog({ ...newBlog, is_pinned: e.target.value === "true" })} className={styles.inputField}>
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                    <div className={styles.imageUploadContainer}>
                        <div className={styles.imageUploadBox}>
                            <input type="file" accept="image/*" onChange={handleCoverImageChange} id="coverImageUpload" style={{ display: "none" }} />
                            <label htmlFor="coverImageUpload" className={styles.imageUploadLabel}>Upload Cover Image</label>
                            {coverImagePreview && <img src={coverImagePreview} alt="Cover Preview" className={styles.imagePreview} />}
                        </div>
                    </div>
                    <div className={styles.imageListContainer}>
                        {imageListPreviews.map((preview, index) => (
                            <div key={index} className={styles.imageItemContainer}>
                                {preview && <img src={preview} alt={`Image Preview ${index}`} className={styles.imageItemPreview} />}
                                <label htmlFor={`imageListUpload${index}`} className={styles.imageItemLabel}>Image {index + 1}</label>
                                <input type="file" accept="image/*" onChange={(e) => handleImageListChange(e, index)} id={`imageListUpload${index}`} style={{ display: "none" }} />
                                <button type="button" onClick={() => handleRemoveImageInput(index)} className={styles.removeButton}>Remove</button>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddImageInput} className={styles.addButton}>Add Image</button>
                    </div>
                    <button onClick={selectedBlog ? updateBlog : addBlog} disabled={loading} className={styles.actionButton}>
                        {loading ? (selectedBlog ? "Updating..." : "Adding...") : selectedBlog ? "Update Blog" : "Add Blog"}
                    </button>
                    <button onClick={() => { setShowForm(false); setEditIndex(null); setEditItemId(null); }} className={styles.cancelButton}>Cancel</button>
                </form>
            )}
            <div className={styles.workList}>
                {filteredBlogsData.map((blog, index) => (
                    <div key={blog.id} className={styles.workItem}>
                        <div className={styles.workContent}>
                            <h3>{blog.title}</h3>
                            <p>{blog.author_name}</p>
                        </div>
                        <div className={styles.workActions}>
                            <button onClick={() => handleEdit(blog, index)} className={styles.actionButton}>Edit</button>
                            <button onClick={() => deleteBlog(blog.id)} disabled={loading} className={styles.deleteButton}>Delete</button>
                        </div>
                        {editItemId === blog.id && showForm && (
                            <form className={styles.workForm}>
                                <label htmlFor="title">Title:</label>
                                <input type="text" id="title" placeholder="Title" value={newBlog.title} onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })} className={styles.inputField} />
                                <label htmlFor="slug">Slug:</label>
                                <input type="text" id="slug" placeholder="Slug" value={newBlog.slug} onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value })} className={styles.inputField} />
                                <label htmlFor="content">Content:</label>
                                <ReactQuill
                                    id="content"
                                    value={newBlog.content}
                                    onChange={(content) => setNewBlog({ ...newBlog, content: content })}
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
                                <label htmlFor="excerpt">Excerpt:</label>
                                <textarea id="excerpt" placeholder="Excerpt" value={newBlog.excerpt} onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })} className={styles.inputField} />
                                <label htmlFor="author_name">Author Name:</label>
                                <input type="text" id="author_name" placeholder="Author Name" value={newBlog.author_name} onChange={(e) => setNewBlog({ ...newBlog, author_name: e.target.value })} className={styles.inputField} />
                                <label htmlFor="author_contact">Author Contact:</label>
                                <input type="text" id="author_contact" placeholder="Author Contact" value={newBlog.author_contact} onChange={(e) => setNewBlog({ ...newBlog, author_contact: e.target.value })} className={styles.inputField} />
                                <label htmlFor="published_at">Published At:</label>
                                <input type="datetime-local" id="published_at" value={newBlog.published_at} onChange={(e) => setNewBlog({ ...newBlog, published_at: e.target.value })} className={styles.inputField} />
                                <label htmlFor="is_pinned">Is Pinned:</label>
                                <select id="is_pinned" value={newBlog.is_pinned} onChange={(e) => setNewBlog({ ...newBlog, is_pinned: e.target.value === "true" })} className={styles.inputField}>
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                </select>
                                <div className={styles.imageUploadContainer}>
                                    <div className={styles.imageUploadBox}>
                                        <input type="file" accept="image/*" onChange={handleCoverImageChange} id="coverImageUpload" style={{ display: "none" }} />
                                        <label htmlFor="coverImageUpload" className={styles.imageUploadLabel}>Upload Cover Image</label>
                                        {coverImagePreview && <img src={coverImagePreview} alt="Cover Preview" className={styles.imagePreview} />}
                                    </div>
                                </div>
                                <div className={styles.imageListContainer}>
                                    {imageListPreviews.map((preview, index) => (
                                        <div key={index} className={styles.imageItemContainer}>
                                            {preview && <img src={preview} alt={`Image Preview ${index}`} className={styles.imageItemPreview} />}
                                            <label htmlFor={`imageListUpload${index}`} className={styles.imageItemLabel}>Image {index + 1}</label>
                                            <input type="file" accept="image/*" onChange={(e) => handleImageListChange(e, index)} id={`imageListUpload${index}`} style={{ display: "none" }} />
                                            <button type="button" onClick={() => handleRemoveImageInput(index)} className={styles.removeButton}>Remove</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={handleAddImageInput} className={styles.addButton}>Add Image</button>
                                </div>

                                <button onClick={selectedBlog ? updateBlog : addBlog} disabled={loading} className={styles.actionButton}>
                                    {loading ? (selectedBlog ? "Updating..." : "Adding...") : selectedBlog ? "Update Blog" : "Add Blog"}
                                </button>
                                <button onClick={() => { setShowForm(false); setEditIndex(null); setEditItemId(null); }} className={styles.cancelButton}>Cancel</button>
                            </form>

                        )}
                        
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BlogsAdmin;