import { API_BASE } from '../../lib/apiBase.js';
import React, { useState, useEffect } from 'react';
import styles from './blogdetailcontent.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const BlogDetailContent = ({ blog }) => {
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const response = await fetch(`${API_BASE}/blogs/${blog.id}`);
        if (response.ok) {
          const data = await response.json();
          setBlogData(data);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching blog data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (blog.id) {
      fetchBlogData();
    }
  }, [blog.id]);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  if (loading) {
    return (
      <div className="loading-error-message loading">
        <p>Loading blog details...</p>
      </div>
    );
  }

  if (!blogData) {
    return null;
  }

  return (
    <div className={`${styles.blogDetailContainer} ${isLoaded ? styles.loaded : ''}`}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.blogTitle}>{blogData.title}</h1>
        <div className={styles.meta}>
          <p className={styles.author}>{blogData.author_name}</p>
          <p className={styles.date}>
            {new Date(blogData.published_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        {blogData.cover_image && (
          <img src={blogData.cover_image} alt={blogData.title} className={styles.coverImage} onClick={() => handleImageClick(blogData.cover_image)} />
        )}
        <div className={styles.blogContent} dangerouslySetInnerHTML={{ __html: blogData.content }} />
        {blogData.image_list && blogData.image_list.length > 0 && (
          <div className={styles.imageList}>
            {blogData.image_list.map((image, index) => (
              <div key={index} className={styles.imageItemWrapper}>
                <img src={image} alt={`Image ${index + 1}`} className={styles.imageItem} onClick={() => handleImageClick(image)} />
              </div>
            ))}
          </div>
        )}
      </div>
      {isPopupOpen && (
        <div className={styles.popup}>
          <img src={selectedImage} alt="Full Screen" className={styles.popupImage} />
          <FontAwesomeIcon icon={faTimes} onClick={handleClosePopup} className={styles.closeIcon} />
        </div>
      )}
    </div>
  );
};

export default BlogDetailContent;