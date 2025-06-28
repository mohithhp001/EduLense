'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Video, AlertCircle, CheckCircle } from 'lucide-react'

interface FileUploadProps {
  onFileUpload: (file: any) => void
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)
    setUploadStatus('idle')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadStatus('success')
        setStatusMessage('File uploaded and processed successfully!')
        onFileUpload(data)
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      setUploadStatus('error')
      setStatusMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv']
    },
    maxFiles: 1,
    disabled: uploading
  })

  const getFileIcon = (fileType: string) => {
    return fileType === 'pdf' ? (
      <FileText className="h-8 w-8 text-blue-600" />
    ) : (
      <Video className="h-8 w-8 text-purple-600" />
    )
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Processing your file...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your file here' : 'Upload your study material'}
              </p>
              <p className="text-gray-600 mt-1">
                Drag and drop a PDF or video file, or click to browse
              </p>
            </div>
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                PDF
              </div>
              <div className="flex items-center">
                <Video className="h-4 w-4 mr-1" />
                Video
              </div>
            </div>
          </div>
        )}
      </div>

      {uploadStatus !== 'idle' && (
        <div className={`
          flex items-center space-x-2 p-4 rounded-lg
          ${uploadStatus === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
          }
        `}>
          {uploadStatus === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  )
} 