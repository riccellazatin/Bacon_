import React, { useState, useEffect } from 'react'
import axios from 'axios'

function CourseFolders() {
    const [folders, setFolders] = useState([]);

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const { data } = await axios.get('/api/folders/');
                setFolders(data);
            } catch (error) {
                console.error("API Error:", error.response);
            }
        };
        fetchFolders();
    }, []);

    if (folders.length === 0) return <div>No folders found or Loading...</div>;

    return (
        <div>
            {folders.map(folder => (
                <div key={folder.id}>{folder.name}</div>
            ))}
        </div>
    );
}

export default CourseFolders