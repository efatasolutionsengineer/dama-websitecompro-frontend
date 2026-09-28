import { API_BASE } from '../lib/apiBase.js';
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./worksadmin.module.css";

const ToWorksAdmin = () => {
  const [toWorksData, setToWorksData] = useState([]);
  const [newToWork, setNewToWork] = useState({
    toworks_text: "",
    toworks_sub_text: "",
    one_img: null,
    two_img: null,
    three_img: null,
    one_name: "",
    two_name: "",
    three_name: "",
    one_link: "",
    two_link: "",
    three_link: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedToWork, setSelectedToWork] = useState(null);
  const [oneImagePreview, setOneImagePreview] = useState(null);
  const [twoImagePreview, setTwoImagePreview] = useState(null);
  const [threeImagePreview, setThreeImagePreview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  const fetchToWorksData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/toworks`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch: ${errorData.error || response.statusText}`);
      }
      const data = await response.json();
      setToWorksData(data);
    } catch (error) {
      console.error("Error fetching ToWorks data:", error);
      setMessage(`Failed to fetch ToWorks data: ${error.message}`);
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
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed: ${responseData.error || response.statusText}`);
    }
    setMessage(successMessage);
    return responseData;
  }, []);

  const updateToWork = useCallback(async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(newToWork).forEach((key) => {
        if (newToWork[key]) {
          formData.append(key, newToWork[key]);
        }
      });

      const response = await fetch(`${API_BASE}/toworks/${selectedToWork.id}`, {
        method: "PUT",
        body: formData,
      });

      const responseData = await handleApiError(response, `ToWork "${newToWork.toworks_text}" updated successfully!`);
      if (responseData && responseData.length > 0) {
        const updatedToWorksData = toWorksData.map((toWork) =>
          toWork.id === responseData[0].id ? responseData[0] : toWork
        );
        setToWorksData(updatedToWorksData);
        resetForm();
      }
    } catch (error) {
      console.error("Error updating ToWork:", error);
      setMessage(`Failed to update ToWork: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [newToWork, toWorksData, selectedToWork, handleApiError]);

  const handleOneImageChange = useCallback((e) => {
    const file = e.target.files[0];
    setNewToWork({ ...newToWork, one_img: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setOneImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setOneImagePreview(selectedToWork?.one_img || null);
    }
  }, [newToWork, selectedToWork]);

  const handleTwoImageChange = useCallback((e) => {
    const file = e.target.files[0];
    setNewToWork({ ...newToWork, two_img: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTwoImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setTwoImagePreview(selectedToWork?.two_img || null);
    }
  }, [newToWork, selectedToWork]);

  const handleThreeImageChange = useCallback((e) => {
    const file = e.target.files[0];
    setNewToWork({ ...newToWork, three_img: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setThreeImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setThreeImagePreview(selectedToWork?.three_img || null);
    }
  }, [newToWork, selectedToWork]);

  const handleEdit = useCallback((toWork) => {
    setSelectedToWork(toWork);
    setNewToWork({
      toworks_text: toWork.toworks_text || "",
      toworks_sub_text: toWork.toworks_sub_text || "",
      one_img: null,
      two_img: null,
      three_img: null,
      one_name: toWork.one_name || "",
      two_name: toWork.two_name || "",
      three_name: toWork.three_name || "",
      one_link: toWork.one_link || "",
      two_link: toWork.two_link || "",
      three_link: toWork.three_link || "",
    });
    setOneImagePreview(toWork.one_img);
    setTwoImagePreview(toWork.two_img);
    setThreeImagePreview(toWork.three_img);
    setShowForm(true);
    setEditItemId(toWork.id);
  }, []);

  const resetForm = useCallback(() => {
    setNewToWork({
      toworks_text: "",
      toworks_sub_text: "",
      one_img: null,
      two_img: null,
      three_img: null,
      one_name: "",
      two_name: "",
      three_name: "",
      one_link: "",
      two_link: "",
      three_link: "",
    });
    setSelectedToWork(null);
    setOneImagePreview(null);
    setTwoImagePreview(null);
    setThreeImagePreview(null);
    setShowForm(false);
    setEditItemId(null);
  }, []);

  useEffect(() => {
    fetchToWorksData();
  }, [fetchToWorksData]);

  useEffect(() => {
    return () => {
      if (oneImagePreview && typeof oneImagePreview !== 'string') {
        URL.revokeObjectURL(oneImagePreview);
      }
      if (twoImagePreview && typeof twoImagePreview !== 'string') {
        URL.revokeObjectURL(twoImagePreview);
      }
      if (threeImagePreview && typeof threeImagePreview !== 'string') {
        URL.revokeObjectURL(threeImagePreview);
      }
    };
  }, [oneImagePreview, twoImagePreview, threeImagePreview]);

  const filteredToWorksData = useMemo(() => {
    return toWorksData;
  }, [toWorksData]);

  return (
    <section className={styles.adminContainer}>
      <h2><a href="/adminonlydama/homedama">To Works Admin</a></h2>

      <div style={{ fontSize: '0.8em', color: 'red',textAlign: 'left', marginBottom: '5px' }}>
    Note: image size 300x500
</div>
      {message && (
        <p className={`${styles.message} ${message.startsWith("Failed") ? styles.error : styles.success}`}>
          {message}
        </p>
      )}

      <div className={styles.workList}>
        {filteredToWorksData.map((item) => (
          <div key={item.id} className={styles.workItem}>
            <div className={styles.workContent}>
              <h3>{item.toworks_text}</h3>
              <p dangerouslySetInnerHTML={{ __html: item.toworks_sub_text }}></p>
              <div className={styles.workImageContainer}>
                {item.one_img && <img src={item.one_img} alt={item.one_name} className={styles.workImage} />}
                {item.two_img && <img src={item.two_img} alt={item.two_name} className={styles.workImage} />}
                {item.three_img && <img src={item.three_img} alt={item.three_name} className={styles.workImage} />}
              </div>
            </div>
            <div className={styles.workActions}>
              <button onClick={() => handleEdit(item)} className={styles.actionButton}>Edit</button>
            </div>
            {editItemId === item.id && showForm && (
              <form className={styles.workForm}>
                <label htmlFor="toworks_text">Text:</label>
                <input type="text" id="toworks_text" placeholder="Text" value={newToWork.toworks_text} onChange={(e) => setNewToWork({ ...newToWork, toworks_text: e.target.value })} className={styles.inputField} />
                <label htmlFor="toworks_sub_text">Sub Text:</label>
                <textarea id="toworks_sub_text" placeholder="Sub Text" value={newToWork.toworks_sub_text} onChange={(e) => setNewToWork({ ...newToWork, toworks_sub_text: e.target.value })} className={styles.inputField} />

                <label htmlFor="one_name">Image 1 Name:</label>
                <input type="text" id="one_name" placeholder="Image 1 Name" value={newToWork.one_name} onChange={(e) => setNewToWork({ ...newToWork, one_name: e.target.value })} className={styles.inputField} />
                <label htmlFor="one_link">Image 1 Link:</label>
                <input type="text" id="one_link" placeholder="Image 1 Link" value={newToWork.one_link} onChange={(e) => setNewToWork({ ...newToWork, one_link: e.target.value })} className={styles.inputField} />

                <label htmlFor="two_name">Image 2 Name:</label>
                <input type="text" id="two_name" placeholder="Image 2 Name" value={newToWork.two_name} onChange={(e) => setNewToWork({ ...newToWork, two_name: e.target.value })} className={styles.inputField} />
                <label htmlFor="two_link">Image 2 Link:</label>
                <input type="text" id="two_link" placeholder="Image 2 Link" value={newToWork.two_link} onChange={(e) => setNewToWork({ ...newToWork, two_link: e.target.value })} className={styles.inputField} />

                <label htmlFor="three_name">Image 3 Name:</label>
                <input type="text" id="three_name" placeholder="Image 3 Name" value={newToWork.three_name} onChange={(e) => setNewToWork({ ...newToWork, three_name: e.target.value })} className={styles.inputField} />
                <label htmlFor="three_link">Image 3 Link:</label>
                <input type="text" id="three_link" placeholder="Image 3 Link" value={newToWork.three_link} onChange={(e) => setNewToWork({ ...newToWork, three_link: e.target.value })} className={styles.inputField} />

                <div className={styles.imageUploadContainer}>
                  <div className={styles.imageUploadBox}>
                    <label htmlFor="oneImageUpload" className={styles.imageUploadLabel}>Image 1</label>
                    <input type="file" accept="image/*" onChange={handleOneImageChange} id="oneImageUpload" style={{ display: "none" }} />
                    <label htmlFor="oneImageUpload" className={styles.imageUploadButton}>Choose File</label>
                    {oneImagePreview && <img src={oneImagePreview} alt="Image 1 Preview" className={styles.imagePreview} />}
                  </div>

                  <div className={styles.imageUploadBox}>
                    <label htmlFor="twoImageUpload" className={styles.imageUploadLabel}>Image 2</label>
                    <input type="file" accept="image/*" onChange={handleTwoImageChange} id="twoImageUpload" style={{ display: "none" }} />
                    <label htmlFor="twoImageUpload" className={styles.imageUploadButton}>Choose File</label>
                    {twoImagePreview && <img src={twoImagePreview} alt="Image 2 Preview" className={styles.imagePreview} />}
                  </div>

                  <div className={styles.imageUploadBox}>
                    <label htmlFor="threeImageUpload" className={styles.imageUploadLabel}>Image 3</label>
                    <input type="file" accept="image/*" onChange={handleThreeImageChange} id="threeImageUpload" style={{ display: "none" }} />
                    <label htmlFor="threeImageUpload" className={styles.imageUploadButton}>Choose File</label>
                    {threeImagePreview && <img src={threeImagePreview} alt="Image 3 Preview" className={styles.imagePreview} />}
                  </div>
                </div>

                <button onClick={updateToWork} disabled={loading} className={styles.actionButton}>
                  {loading ? "Updating..." : "Update To Work"}
                </button>
                <button onClick={() => { setShowForm(false); setEditItemId(null); }} className={styles.cancelButton}>Cancel</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ToWorksAdmin;