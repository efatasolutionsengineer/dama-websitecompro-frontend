import { API_BASE } from '../lib/apiBase.js';
import { slugify } from '../lib/slugify.js';
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import styles from "./worksadmin.module.css";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const quillModules = {
    toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean'],
    ],
};

const quillFormats = ['bold', 'italic', 'underline', 'strike', 'list'];

function editorText(html) {
    return String(html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
}

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
    const editorRef = useRef(null);

    const readContent = useCallback(() => {
        const live = editorRef.current?.getEditor?.()?.root?.innerHTML || '';
        if (editorText(live)) return live;
        return newBlog.content;
    }, [newBlog.content]);

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
        const content = readContent();
        const title = newBlog.title.trim();
        if (!title || !editorText(content)) {
            setMessage("Title and content are required.");
            return;
        }

        setLoading(true);
        try {
            const blogToSave = {
                ...newBlog,
                title,
                content,
                slug: newBlog.slug.trim() || slugify(title),
            };
            const formData = new FormData();
            Object.keys(blogToSave).forEach((key) => {
                if (key === "image_list") {
                    blogToSave.image_list.forEach((file) => {
                        if (file) {
                            formData.append("image_list", file);
                        }
                    });
                } else if (key === "published_at" && !blogToSave.published_at) {
                    return;
                } else if (key === "cover_image" && !(blogToSave.cover_image instanceof File)) {
                    return;
                } else if (blogToSave[key] !== null && blogToSave[key] !== undefined) {
                    formData.append(key, blogToSave[key]);
                }
            });

            const response = await fetch(`${API_BASE}/blogs`, {
                method: "POST",
                body: formData,
            });

            await handleApiError(response, "Blog added successfully!");
            resetForm();
            await fetchBlogsData();
        } catch (error) {
            console.error("Error adding Blog:", error);
            setMessage(`Failed to add Blog: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [newBlog, handleApiError, readContent, fetchBlogsData]);

    const updateBlog = useCallback(async () => {
        const content = readContent();
        const title = newBlog.title.trim();
        if (!title || !editorText(content)) {
            setMessage("Title and content are required.");
            return;
        }

        setLoading(true);
        try {
            const blogToSave = {
                ...newBlog,
                title,
                content,
                slug: newBlog.slug.trim() || slugify(title),
            };
            const formData = new FormData();
            Object.keys(blogToSave).forEach((key) => {
                if (key === "image_list") {
                    blogToSave.image_list.forEach((item) => {
                        if (item instanceof File) {
                            formData.append("image_list", item);
                        } else if (typeof item === 'string') {
                            formData.append("image_list_url", item);
                        }
                    });
                } else if (key === "published_at" && !blogToSave.published_at) {
                    return;
                } else if (key === "cover_image" && !(blogToSave.cover_image instanceof File)) {
                    return;
                } else if (blogToSave[key] !== null && blogToSave[key] !== undefined) {
                    formData.append(key, blogToSave[key]);
                }
            });

            const response = await fetch(`${API_BASE}/blogs/${selectedBlog.id}`, {
                method: "PUT",
                body: formData,
            });

            await handleApiError(response, "Blog updated successfully!");
            resetForm();
            await fetchBlogsData();
        } catch (error) {
            console.error("Error updating Blog:", error);
            setMessage(`Failed to update Blog: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [newBlog, selectedBlog, handleApiError, readContent, fetchBlogsData]);

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
        setNewBlog((current) => ({ ...current, cover_image: file || null }));
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setCoverImagePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setCoverImagePreview(selectedBlog?.cover_image || null);
        }
    }, [selectedBlog]);

    const handleImageListChange = useCallback((e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        setNewBlog((current) => {
            const updatedImages = [...current.image_list];
            updatedImages[index] = file;
            return { ...current, image_list: updatedImages };
        });
        setImageListPreviews((current) => {
            const updatedPreviews = [...current];
            updatedPreviews[index] = URL.createObjectURL(file);
            return updatedPreviews;
        });
    }, []);

    const handleAddImageInput = useCallback(() => {
        setImageInputs((current) => [...current, current.length]);
        setNewBlog((current) => ({ ...current, image_list: [...current.image_list, null] }));
        setImageListPreviews((current) => [...current, null]);
    }, []);

    const handleRemoveImageInput = useCallback((index) => {
        setImageInputs((current) => current.filter((item) => item !== index));
        setNewBlog((current) => {
            const updatedImages = [...current.image_list];
            updatedImages.splice(index, 1);
            return { ...current, image_list: updatedImages };
        });
        setImageListPreviews((current) => {
            const updatedPreviews = [...current];
            updatedPreviews.splice(index, 1);
            return updatedPreviews;
        });
    }, []);

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
        const query = searchTerm.toLowerCase();
        return blogsData.filter((blog) =>
            [blog.title, blog.slug, blog.content, blog.author_name]
                .some((value) => String(value || '').toLowerCase().includes(query))
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
                <form className={styles.workForm} onSubmit={(e) => e.preventDefault()}>
                    <label htmlFor="title">Title:</label>
                    <input type="text" id="title" placeholder="Title" value={newBlog.title} onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })} className={styles.inputField} />
                    <label htmlFor="slug">Slug:</label>
                    <input type="text" id="slug" placeholder="Slug" value={newBlog.slug} onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value })} className={styles.inputField} />
                    <label htmlFor="content">Content:</label>
                    <ReactQuill
                        ref={editorRef}
                        id="content"
                        value={newBlog.content}
                        onChange={(content) => setNewBlog((current) => ({ ...current, content }))}
                        modules={quillModules}
                        formats={quillFormats}
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
                    <button type="button" onClick={selectedBlog ? updateBlog : addBlog} disabled={loading} className={styles.actionButton}>
                        {loading ? (selectedBlog ? "Updating..." : "Adding...") : selectedBlog ? "Update Blog" : "Add Blog"}
                    </button>
                    <button type="button" onClick={() => { setShowForm(false); setEditIndex(null); setEditItemId(null); }} className={styles.cancelButton}>Cancel</button>
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
                            <form className={styles.workForm} onSubmit={(e) => e.preventDefault()}>
                                <label htmlFor="title">Title:</label>
                                <input type="text" id="title" placeholder="Title" value={newBlog.title} onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })} className={styles.inputField} />
                                <label htmlFor="slug">Slug:</label>
                                <input type="text" id="slug" placeholder="Slug" value={newBlog.slug} onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value })} className={styles.inputField} />
                                <label htmlFor="content">Content:</label>
                                <ReactQuill
                                    ref={editorRef}
                                    id="content"
                                    value={newBlog.content}
                                    onChange={(content) => setNewBlog((current) => ({ ...current, content }))}
                                    modules={quillModules}
                                    formats={quillFormats}
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

                                <button type="button" onClick={selectedBlog ? updateBlog : addBlog} disabled={loading} className={styles.actionButton}>
                                    {loading ? (selectedBlog ? "Updating..." : "Adding...") : selectedBlog ? "Update Blog" : "Add Blog"}
                                </button>
                                <button type="button" onClick={() => { setShowForm(false); setEditIndex(null); setEditItemId(null); }} className={styles.cancelButton}>Cancel</button>
                            </form>

                        )}
                        
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BlogsAdmin;