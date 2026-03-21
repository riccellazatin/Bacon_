import React from 'react';

const CourseFiles = ({ folder, onBack, onUpload, onDeleteFile }) => {
  
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      onUpload(folder.id, e.target.files[0]);
    }
  };

  return (
    <div className="file-container">
      <button onClick={onBack} style={{ marginBottom: '20px' }}>← Back to Folders</button>
      <h2>Files in: {folder.name}</h2>

      {/* Upload Section */}
      <div className="upload-section" style={{ padding: '15px', border: '1px dashed #ccc' }}>
        <p>Upload new file to this folder:</p>
        <input type="file" onChange={handleFileChange} />
      </div>

      <hr />

      {/* Files List */}
      <div className="file-list">
        {folder.files && folder.files.length > 0 ? (
          folder.files.map((file) => (
            <div key={file.id} className="file-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
              <a href={file.file} target="_blank" rel="noopener noreferrer">
                📄 View Document
              </a>
              <button onClick={() => onDeleteFile(file.id)} style={{ color: 'red' }}>
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>This folder is empty.</p>
        )}
      </div>
    </div>
  );
};

export default CourseFiles;