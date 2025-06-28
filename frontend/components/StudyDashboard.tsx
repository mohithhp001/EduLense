'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Brain, MessageCircle, BookOpen, Target, Clock, Star } from 'lucide-react'

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

interface StudyDashboardProps {
  file: File
  onBack: () => void
}

export default function StudyDashboard({ file, onBack }: StudyDashboardProps) {
  const [topics, setTopics] = useState<any[]>([])
  const [selectedTopic, setSelectedTopic] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (file.topics && file.topics.length > 0) {
      setTopics(file.topics)
    }
  }, [file])

  const generateQuestions = async (topic: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/study/topics/${topic.id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicName: topic.name,
          fileId: file.id,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setQuestions(data.questions)
        setSelectedTopic(topic)
        setCurrentQuestion(0)
        setScore(0)
        setShowAnswer(false)
      }
    } catch (error) {
      console.error('Error generating questions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSubmit = () => {
    const currentQ = questions[currentQuestion]
    if (userAnswer.toLowerCase().includes(currentQ.answer.toLowerCase())) {
      setScore(score + 1)
    }
    setShowAnswer(true)
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setUserAnswer('')
      setShowAnswer(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Files</span>
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900">{file.original_name}</h1>
          <p className="text-gray-600">Study Dashboard</p>
        </div>
      </div>

      {/* Content Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Content Summary</h2>
        <p className="text-gray-700 leading-relaxed">{file.content_summary}</p>
      </div>

      {/* Topics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => generateQuestions(topic)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
                {topic.difficulty}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{topic.name}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{topic.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {topic.estimatedTime} min
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Target className="h-4 w-4 mr-1" />
                {topic.keyConcepts?.length || 0} concepts
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Star className="h-4 w-4 mr-1" />
                {Math.round(topic.confidence * 100)}% confidence
              </div>
            </div>

            {topic.keyConcepts && topic.keyConcepts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Key Concepts:</h4>
                <div className="flex flex-wrap gap-1">
                  {topic.keyConcepts.slice(0, 3).map((concept: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Questions Section */}
      {selectedTopic && questions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Practice Questions: {selectedTopic.name}
            </h2>
            <div className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Generating questions...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {questions[currentQuestion]?.question}
                </h3>

                {questions[currentQuestion]?.type === 'multiple_choice' && (
                  <div className="space-y-3">
                    {questions[currentQuestion]?.options?.map((option: string, idx: number) => (
                      <label key={idx} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="answer"
                          value={option}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {questions[currentQuestion]?.type === 'short_answer' && (
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                )}

                {!showAnswer && (
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={!userAnswer.trim()}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Answer
                  </button>
                )}
              </div>

              {showAnswer && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Answer:</h4>
                  <p className="text-gray-700 mb-4">{questions[currentQuestion]?.answer}</p>
                  
                  {currentQuestion < questions.length - 1 ? (
                    <button
                      onClick={nextQuestion}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Next Question
                    </button>
                  ) : (
                    <div className="text-center">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Quiz Complete!</h4>
                      <p className="text-gray-600 mb-4">
                        Your score: {score} out of {questions.length} ({Math.round((score / questions.length) * 100)}%)
                      </p>
                      <button
                        onClick={() => {
                          setSelectedTopic(null)
                          setQuestions([])
                          setCurrentQuestion(0)
                          setScore(0)
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Try Another Topic
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 