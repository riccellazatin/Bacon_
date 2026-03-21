import React, { useState } from 'react';

const CourseFolders = ({ folders, onCreate, onDelete, onSelect }) => {
  const [newName, setNewName] = useState('');

  return (
    <div>
      <h3>My Courses</h3>
      <div className="folder-input">
        <input 
          value={newName} 
          onChange={(e) => setNewName(e.target.value)} 
          placeholder="New Folder Name"
        />
        <button onClick={() => { onCreate(newName); setNewName(''); }}>Create</button>
      </div>
      <div className="folder-grid">
        {folders.map(folder => (
          <div key={folder.id} className="folder-card">
            <span onClick={() => onSelect(folder)}>{folder.name}</span>
            <button onClick={() => onDelete(folder.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseFolders;