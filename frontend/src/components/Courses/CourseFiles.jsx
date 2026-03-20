import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

function CourseFiles() {
    const { id } = useParams()
    const [files, setFiles] = useState([])
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchFiles()
    }, [id])

    const fetchFiles = async () => {
        const { data } = await axios.get(`/api/courses/folders/${id}/files/`)
        setFiles(data)
    }

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0]
        const formData = new FormData()
        formData.append('file', file)
        
        setUploading(true)
        try {
            await axios.post(`/api/courses/folders/${id}/files/`, formData)
            fetchFiles()
            setUploading(false)
        } catch (error) {
            setUploading(false)
        }
    }

    const deleteHandler = async (fileId) => {
        if (window.confirm('Are you sure you would like to delete this file?')) {
            await axios.delete(`/api/courses/files/delete/${fileId}/`)
            fetchFiles()
        }
    }

    return (
        <div>
            <input type="file" onChange={uploadFileHandler} />
            {uploading && <p>Uploading...</p>}
            
            {files.map(file => (
                <div key={file.id}>
                    <p>{file.file.split('/').pop()}</p>
                    <button onClick={() => deleteHandler(file.id)}>Delete</button>
                </div>
            ))}
        </div>
    )
}

export default CourseFiles