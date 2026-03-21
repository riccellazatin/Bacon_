import React, { useState, useEffect } from 'react';
import CourseFolders from '../../components/Courses/CourseFolders';
import CourseFiles from '../../components/Courses/CourseFiles';
import api from '../../api/axios';

const CourseFolderScreen = () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);

  const fetchFolders = async () => {
    try {
      const res = await api.get('courses/folders/'); 
      setFolders(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleCreateFolder = async (name) => {
    try {
      await api.post('courses/folders/', { name: name });
      fetchFolders(); 
    } catch (err) {
      console.error("Create error:", err);
    }
  };

  const handleDeleteFolder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this folder and all its files?")) {
        return;
    }

    try {
        await api.delete(`courses/folders/${id}/`);
        
        fetchFolders();
    } catch (err) {
        console.error("Delete folder error:", err);
        alert("Failed to delete folder.");
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) {
        return;
    }

    try {
        await api.delete(`courses/files/${fileId}/`);
        const response = await api.get(`courses/folders/${selectedFolder.id}/`);
        setSelectedFolder(response.data);
    } catch (err) {
        console.error("Delete file error:", err);
    }
  };

  const handleUploadFile = async (folderId, fileObject) => {
    const formData = new FormData();
    formData.append('file', fileObject);
    formData.append('folder', folderId);

    try {
      await api.post('courses/files/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const response = await api.get(`courses/folders/${folderId}/`);
      
      setSelectedFolder(response.data); 
      
      alert("Upload successful!");
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <div className="course-container">
      {selectedFolder ? (
        <CourseFiles 
          folder={selectedFolder}
          onBack={() => setSelectedFolder(null)}
          onUpload={handleUploadFile}
          onDeleteFile={handleDeleteFile}
        />
      ) : (
        <CourseFolders 
          folders={folders} 
          onCreate={handleCreateFolder}
          onDelete={handleDeleteFolder}
          onSelect={setSelectedFolder}
        />
      )}
    </div>
  );
};

export default CourseFolderScreen;