import React, { useState } from 'react';
import './Courses.css'

const CourseFolders = ({ folders, onCreate, onDelete, onSelect }) => {
  const [newName, setNewName] = useState('');

  return (
    <div className="subject-folders-body">
      <div className="folder-input">
        <h2>My Folders</h2>

        <div className="create-folder-div">
          <input 
          value={newName} 
          onChange={(e) => setNewName(e.target.value)} 
          placeholder="New Folder Name"
          className="input-bar"
        />
        <button onClick={() => { onCreate(newName); setNewName(''); }} className="create-button">Create</button>
        </div>
      </div>
      
      <div className="folder-grid">
            {folders.map(folder => (
                <div key={folder.id} className="folder-card">
                    <div onClick={() => onSelect(folder)} style={{ cursor: 'pointer', marginBottom: '10px' }}>
                        <img 
                            src="/images/folder.png"
                            alt="folder icon" 
                            className="folder-image"
                        />
                        <div className="folder-name">{folder.name}</div>
                    </div>

                    <button 
                        onClick={() => onDelete(folder.id)} 
                        className="delete-button"
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};

export default CourseFolders;
