import { API_BASE } from '../../lib/apiBase.js';
import { asList } from '../../lib/asList.js';
import React, { useState, useEffect } from 'react';
import styles from './workdetailcontent.module.css';

const WorkDetailContent = ({ work }) => {
  const [workData, setWorkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchWorkData = async () => {
      try {
        const response = await fetch(`${API_BASE}/works/${work.id}`);
        if (response.ok) {
          const data = await response.json();
          const images = asList(data.work_img);
          setWorkData({ ...data, work_img: images });
          if (images.length > 0) {
            setSelectedImage(images[0]);
          }
        } else {
          console.error('Failed to fetch work data:', response.status);
          setWorkData(null);
        }
      } catch (error) {
        console.error('Error fetching work data:', error);
        setWorkData(null);
      } finally {
        setLoading(false);
      }
    };

    if (work && work.id) {
      fetchWorkData();
    }
  }, [work ? work.id : null]);

  if (loading) {
    return (
      <div className="loading-error-message loading">
        <p>Loading work details...</p>
      </div>
    );
  }

  if (!workData) {
    return (
      <div className="loading-error-message error">
        <p>Failed to load work details.</p>
      </div>
    );
  }

  return (
    <>
      <section className={styles['workdetailcontent']}>

        <section className={styles['section-1']} style={{ backgroundImage: `url(${workData.work_main_img})` }}>
          <h1>{workData.work_title}</h1>
          <h2>{workData.work_subtitle}</h2>
        </section>

        <section className={styles['section-main']}>

          <section className={styles['section-3']}>

            <div className={styles['section-3-right']}>
              {/* Menggunakan dangerouslySetInnerHTML */}
              <p dangerouslySetInnerHTML={{ __html: workData.work_desc }}></p>
              <p> {workData.work_detail}</p>
        
              <p><strong>Category:</strong> {workData.work_category}</p>
            </div>

            <div className={styles['section-3-left']}>
              <img src={selectedImage} alt="Selected Work Image" />
            </div>

            <div className={styles['section-2']}>
              {workData.work_img && workData.work_img.map((img) => (
                <img
                  key={img}
                  src={img}
                  alt="Work Image"
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>

          </section>

        </section>

      </section>
    </>
  );
};

export default WorkDetailContent;