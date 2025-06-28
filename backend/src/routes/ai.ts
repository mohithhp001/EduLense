import express from 'express';
import { answerQuestion } from '../services/aiService';

const router = express.Router();

// Answer questions using RAG
router.post('/ask', async (req, res) => {
  try {
    const { question, fileId } = req.body;

    if (!question || !fileId) {
      return res.status(400).json({ error: 'Question and file ID are required' });
    }

    const answer = await answerQuestion(question, fileId);

    res.json({
      success: true,
      question,
      answer,
      fileId
    });

  } catch (error) {
    console.error('Question answering error:', error);
    res.status(500).json({ 
      error: 'Failed to answer question',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get AI-powered study recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { fileId, userProgress } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    // This would integrate with a more sophisticated recommendation system
    // For now, we'll return basic recommendations
    const recommendations = {
      nextTopics: ['Continue with the next topic in your study plan'],
      practiceAreas: ['Focus on areas where you scored lower'],
      studyTips: ['Review the material regularly', 'Take practice quizzes', 'Create flashcards'],
      estimatedTime: '30-45 minutes'
    };

    res.json({
      success: true,
      recommendations
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Generate flashcards from content
router.post('/flashcards', async (req, res) => {
  try {
    const { fileId, topicName } = req.body;

    if (!fileId || !topicName) {
      return res.status(400).json({ error: 'File ID and topic name are required' });
    }

    // This would use AI to generate flashcards
    // For now, return a placeholder response
    const flashcards = [
      {
        id: '1',
        front: 'What is the main concept of this topic?',
        back: 'The main concept will be generated based on the content.',
        difficulty: 'medium'
      },
      {
        id: '2',
        front: 'Key terms to remember',
        back: 'Important terms will be extracted from the content.',
        difficulty: 'easy'
      }
    ];

    res.json({
      success: true,
      flashcards,
      topicName
    });

  } catch (error) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

// Summarize content
router.post('/summarize', async (req, res) => {
  try {
    const { fileId, length = 'medium' } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    // This would use AI to generate a summary
    // For now, return a placeholder response
    const summary = {
      short: 'Brief summary of the key points.',
      medium: 'Detailed summary covering main concepts and important details.',
      long: 'Comprehensive summary with examples and explanations.'
    };

    res.json({
      success: true,
      summary: summary[length as keyof typeof summary] || summary.medium,
      length
    });

  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

export { router as aiRoutes }; 