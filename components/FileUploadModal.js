import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function FileUploadModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first')
      return
    }

    try {
      setUploading(true)
      setMessage('')

      // ---- 1️⃣ Upload to Supabase storage ----
      const filePath = `uploads/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('client-files') // make sure bucket exists
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // ---- 2️⃣ Insert metadata into uploaded_files ----
      const { data: fileRecord, error: insertError } = await supabase
        .from('uploaded_files')
        .insert([
          {
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            client_id: 'demo-client-123', // replace with supabase.auth.user later
            status: 'pending',
            parsed_data: {} // put parsed content if needed
          }
        ])
        .select()
        .single()

      if (insertError) throw insertError

      // ---- 3️⃣ Call API to update status & log workflow ----
      const res = await fetch('/api/updateFileStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id: fileRecord.id,
          status: 'processed', // or "failed" if needed
          n8n_response: { msg: 'File uploaded via FileUploadModal' }
        })
      })

      if (!res.ok) {
        throw new Error('Failed to update file status in API')
      }

      const result = await res.json()

      setMessage(`✅ File uploaded & processed: ${result.file.file_name}`)
      setFile(null)

    } catch (err) {
      console.error('Upload failed:', err.message)
      setMessage(`❌ Error: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Upload File</h2>
        <input type="file" onChange={handleFileChange} />
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </div>
  )
}
