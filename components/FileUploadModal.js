import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'

export default function FileUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef(null)

  const allowedTypes = {
    'text/csv': '.csv',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/json': '.json'
  }

  const maxFileSize = 10 * 1024 * 1024 // 10MB

  if (!isOpen) return null

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const validateFile = (file) => {
    // Check file type
    if (!allowedTypes[file.type]) {
      toast.error('Invalid file type. Please upload CSV, Excel, or JSON files only.')
      return false
    }

    // Check file size
    if (file.size > maxFileSize) {
      toast.error('File size too large. Maximum size is 10MB.')
      return false
    }

    return true
  }

  const parseFileContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target.result
          let parsedData = []

          if (file.type === 'text/csv') {
            // Parse CSV
            Papa.parse(content, {
              header: true,
              complete: (results) => {
                parsedData = results.data
                resolve({ data: parsedData, type: 'csv' })
              },
              error: (error) => reject(error)
            })
          } else if (file.type.includes('sheet') || file.type.includes('excel')) {
            // Parse Excel
            const workbook = XLSX.read(content, { type: 'binary' })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            parsedData = XLSX.utils.sheet_to_json(worksheet)
            resolve({ data: parsedData, type: 'excel' })
          } else if (file.type === 'application/json') {
            // Parse JSON
            parsedData = JSON.parse(content)
            resolve({ data: parsedData, type: 'json' })
          }
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      
      if (file.type.includes('sheet') || file.type.includes('excel')) {
        reader.readAsBinaryString(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  const uploadToSupabase = async (file, parsedContent) => {
    try {
      console.log('🔄 Starting upload to Supabase storage...')
      
      // Upload file directly to Supabase storage (bucket should already exist)
      const fileName = `${Date.now()}-${file.name}`
      console.log(`📤 Uploading file: ${fileName} to client-files bucket`)
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('client-files')
        .upload(fileName, file)

      if (uploadError) {
        console.error('❌ Supabase storage upload failed:', uploadError)
        throw new Error(`Storage upload failed: ${uploadError.message}`)
      }

      console.log('✅ File uploaded to Supabase storage:', uploadData.path)
      
      // Insert file record into database
      console.log('💾 Saving file metadata to database...')
      const { data: fileRecord, error: dbError } = await supabase
        .from('uploaded_files')
        .insert({
          file_name: file.name,
          file_path: uploadData.path,
          file_type: file.type,
          file_size: file.size,
          client_id: 'demo-client-123', // Replace with actual client ID from auth
          status: 'pending',
          parsed_data: parsedContent.data
        })
        .select()
        .single()

      if (dbError) {
        console.error('❌ Database insert failed:', dbError)
        throw new Error(`Database error: ${dbError.message}`)
      }

      console.log('✅ File record saved to database:', fileRecord.id)
      return fileRecord

    } catch (error) {
      console.error('❌ Upload to Supabase failed:', error)
      throw error
    }
  }

  const sendToN8N = async (fileRecord, parsedContent) => {
    try {
      const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
      
      // If no webhook URL is configured, skip n8n integration
      if (!n8nWebhookUrl || n8nWebhookUrl.includes('your-n8n-instance')) {
        console.log('N8N webhook not configured, skipping...')
        return { success: true, message: 'No webhook configured, file processed locally' }
      }
      
      const payload = {
        file_id: fileRecord.id,
        file_name: fileRecord.file_name,
        client_id: fileRecord.client_id,
        file_type: parsedContent.type,
        data: parsedContent.data,
        upload_time: fileRecord.created_at
      }

      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        console.warn('N8N webhook failed, continuing without it')
        return { success: true, message: 'Webhook failed, file processed locally' }
      }

      return await response.json()
    } catch (error) {
      console.warn('N8N webhook error, continuing without it:', error)
      return { success: true, message: 'Webhook error, file processed locally' }
    }
  }

  const handleFileUpload = async (file) => {
    if (!validateFile(file)) return

    setUploading(true)
    setProgress(0)

    try {
      // Step 1: Parse file content (20%)
      toast.loading('Parsing file...', { id: 'upload' })
      setProgress(20)
      const parsedContent = await parseFileContent(file)

      // Step 2: Upload to Supabase (50%)
      toast.loading('Uploading to Supabase storage...', { id: 'upload' })
      setProgress(50)
      const fileRecord = await uploadToSupabase(file, parsedContent)
      console.log('📁 File uploaded to Supabase successfully:', fileRecord.file_path)

      // Step 3: Send to n8n (80%)
      toast.loading('Processing data...', { id: 'upload' })
      setProgress(80)
      await sendToN8N(fileRecord, parsedContent)

      // Step 4: Update status (100%)
      setProgress(100)
      
      // Try to update status in database
      try {
        await supabase
          .from('uploaded_files')
          .update({ status: 'processed' })
          .eq('id', fileRecord.id)
      } catch (updateError) {
        console.warn('Could not update file status in database:', updateError)
        // Continue anyway since the main processing is done
      }

      toast.success(`File "${file.name}" uploaded to Supabase and processed successfully!`, { id: 'upload' })
      
      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(fileRecord)
      }

      // Close modal after success
      setTimeout(() => {
        onClose()
        setProgress(0)
      }, 1000)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error(`Upload failed: ${error.message}`, { id: 'upload' })
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upload Client File</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={uploading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!uploading ? (
              <>
                <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-2">
                  Drag and drop your file here, or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-gray-500">
                  Supports CSV, Excel (.xls, .xlsx), and JSON files up to 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xls,.xlsx,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 mx-auto text-blue-600">
                  <svg className="animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-600 mb-2">Processing file...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{progress}% complete</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
