'use client'

import { useState, useEffect } from 'react'
import { Upload, BookOpen, Brain, FileText, Video, CheckCircle, Clock } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import FileList from '@/components/FileList'
import StudyDashboard from '@/components/StudyDashboard'

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

export default function Home() {
  const [files, setFiles] = useState<File[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files/files')
      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Error fetching files:', error)
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    try {
      await fetchFiles()
      setSelectedFile(file)
    } catch (error) {
      console.error('Error handling file upload:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EduLense</h1>
                <p className="text-sm text-gray-600">AI-Powered Study Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <Clock className="inline h-4 w-4 mr-1" />
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!selectedFile ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Transform Your Study Materials
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Upload your PDFs and videos, and let AI create personalized study topics, 
                generate questions, and help you learn more effectively.
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <FileText className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">PDF Processing</h3>
                <p className="text-gray-600">Extract text and analyze content from your PDF documents</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <Video className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Video Analysis</h3>
                <p className="text-gray-600">Convert video content to text and generate study materials</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <Brain className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI-Powered Learning</h3>
                <p className="text-gray-600">Get personalized study topics and practice questions</p>
              </div>
            </div>

            {/* File Upload */}
            <FileUpload onFileUpload={handleFileUpload} />

            {/* File List */}
            {files.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Files</h3>
                <FileList 
                  files={files} 
                  onFileSelect={setSelectedFile}
                  onFileDelete={fetchFiles}
                />
              </div>
            )}
          </div>
        ) : (
          <StudyDashboard 
            file={selectedFile} 
            onBack={() => setSelectedFile(null)}
          />
        )}
      </main>
    </div>
  )
} 