import React from 'react';

const CourseFiles = ({ folder, onBack, onUpload, onDeleteFile }) => {
  
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      onUpload(folder.id, e.target.files[0]);
    }
  };

  return (
    <div className="file-container">
      <h2>Files in: {folder.name}</h2>

      {/* Upload Section */}
      <div className="upload-section">
        <p>Upload new file to this folder:</p>
        <input type="file" onChange={handleFileChange} className="input-file"/>
      </div>

      {/* Files List */}
      <div className="file-list">
        {folder.files && folder.files.length > 0 ? (
          folder.files.map((file) => (
            <div key={file.id} className="file-row">
              <a href={file.file} target="_blank" rel="noopener noreferrer" className="file-actual">
                📄 View Document
              </a>
              <button onClick={() => onDeleteFile(file.id)} className="file-delete">
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>This folder is empty.</p>
        )}
      </div>

      <button onClick={onBack} className="back-button-files">← Back to Folders</button>

    </div>
  );
};

export default CourseFiles;