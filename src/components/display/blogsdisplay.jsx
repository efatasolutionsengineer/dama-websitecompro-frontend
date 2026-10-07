import { API_BASE } from '../../lib/apiBase.js';
import { slugify } from '../../lib/slugify.js';
import React, { useState, useEffect } from "react";
import styles from "./blogsdisplay.module.css";

const BlogsDisplay = () => {
  const [blogsData, setBlogsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchBlogsData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/blogs`);
        if (response.ok) {
          const data = await response.json();
          setBlogsData(data);
        }
      } catch (error) {
        console.error("Error fetching blogs data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogsData();
  }, []);

  const filteredBlogs = blogsData.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pinnedBlogs = filteredBlogs.filter((blog) => blog.is_pinned);
  const unpinnedBlogs = filteredBlogs.filter((blog) => !blog.is_pinned);

  const sortBlogs = (blogs) => {
    return [...blogs].sort((a, b) => {
      const dateA = new Date(a.published_at);
      const dateB = new Date(b.published_at);
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
  };

  const sortedPinnedBlogs = sortBlogs(pinnedBlogs);
  const sortedUnpinnedBlogs = sortBlogs(unpinnedBlogs);

  if (loading) {
    return (
      <div className="loading-error-message loading">
        <p>Loading blogs...</p>
      </div>
    );
  }

  return (
    <div className={styles.blogsDisplayContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchBar}
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.sortBy}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {sortedPinnedBlogs.length > 0 && (
          <div className={styles.pinnedBlogsList}>
            <h2 className={styles.sectionTitle}>Pinned Blogs</h2>
            {sortedPinnedBlogs.map((blog) => (
              <div key={blog.id} className={styles.blogItem}>
                <a href={`/blogs/${slugify(blog.slug || blog.title)}`}>
                  <div className={styles.blogContent}>
                    <h3 className={styles.blogTitle}>{blog.title}</h3>
                    <p className={styles.excerpt}>{blog.excerpt}</p>
                    <div className={styles.meta}>
                      <p className={styles.author}>{blog.author_name}</p>
                      <p className={styles.date}>
                        {new Date(blog.published_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {blog.cover_image && (
                    <img src={blog.cover_image} alt={blog.title} className={styles.coverImage} />
                  )}
                </a>
              </div>
            ))}
          </div>
        )}

        <div className={styles.blogsList}>
          {sortedUnpinnedBlogs.length > 0 && <h2 className={styles.sectionTitle}>Blogs</h2>}
          {sortedUnpinnedBlogs.map((blog) => (
            <div key={blog.id} className={styles.blogItem}>
              <a href={`/blogs/${slugify(blog.slug || blog.title)}`}>
                <div className={styles.blogContent}>
                  <h3 className={styles.blogTitle}>{blog.title}</h3>
                  <p className={styles.excerpt}>{blog.excerpt}</p>
                  <div className={styles.meta}>
                    <p className={styles.author}>{blog.author_name}</p>
                    <p className={styles.date}>
                      {new Date(blog.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {blog.cover_image && (
                  <img src={blog.cover_image} alt={blog.title} className={styles.coverImage} />
                )}
              </a>
            </div>
          ))}
          {sortedUnpinnedBlogs.length === 0 && searchTerm && <p>Blog tidak ditemukan.</p>}
        </div>
      </div>
    </div>
  );
};

export default BlogsDisplay;