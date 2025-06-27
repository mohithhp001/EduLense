'use client'

import { useState } from 'react'
import { FileText, Video, Calendar, Trash2, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface File {
  id: string
  original_name: string
  file_type: string
  file_size: number
  upload_date: string
  processing_status: string
  content_summary: string
  topics: any[]
}

interface FileListProps {
  files: File[]
  onFileSelect: (file: File) => void
  onFileDelete: () => void
}

export default function FileList({ files, onFileSelect, onFileDelete }: FileListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Ready'
      case 'processing':
        return 'Processing'
      case 'failed':
        return 'Failed'
      default:
        return 'Pending'
    }
  }

  const handleDelete = async (fileId: string) => {
    setDeletingId(fileId)
    try {
      const response = await fetch(`/api/files/files/${fileId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onFileDelete()
      } else {
        console.error('Failed to delete file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
    } finally {
      setDeletingId(null)
    }
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No files uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {file.file_type === 'pdf' ? (
                  <FileText className="h-10 w-10 text-blue-600" />
                ) : (
                  <Video className="h-10 w-10 text-purple-600" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {file.original_name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(file.processing_status)}
                    <span className="text-sm text-gray-600">
                      {getStatusText(file.processing_status)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(file.upload_date)}
                  </div>
                  <span>{formatFileSize(file.file_size)}</span>
                  <span className="capitalize">{file.file_type}</span>
                </div>

                {file.content_summary && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {file.content_summary}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onFileSelect(file)}
                disabled={file.processing_status !== 'completed'}
                className={`
                  flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${file.processing_status === 'completed'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <Eye className="h-4 w-4" />
                <span>Study</span>
              </button>
              
              <button
                onClick={() => handleDelete(file.id)}
                disabled={deletingId === file.id}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                {deletingId === file.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>

          {file.topics && file.topics.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Generated Topics:</h4>
              <div className="flex flex-wrap gap-2">
                {file.topics.slice(0, 3).map((topic: any, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {topic.name}
                  </span>
                ))}
                {file.topics.length > 3 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{file.topics.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 