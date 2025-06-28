import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init';
import { generateQuestions, createStudySession, getStudySessions } from '../services/aiService';

const router = express.Router();

// Get topics for a file
router.get('/topics/:fileId', (req, res) => {
  const { fileId } = req.params;

  const query = `
    SELECT id, file_id, topic_name, topic_description, confidence_score, created_date
    FROM topics
    WHERE file_id = ?
    ORDER BY confidence_score DESC
  `;

  db.all(query, [fileId], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch topics' });
    }

    res.json({ topics: rows || [] });
  });
});

// Generate questions for a topic
router.post('/topics/:topicId/questions', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { topicName, fileId } = req.body;

    if (!topicName || !fileId) {
      return res.status(400).json({ error: 'Topic name and file ID are required' });
    }

    // Get file content for question generation
    db.get('SELECT content_summary FROM files WHERE id = ?', [fileId], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch file content' });
      }

      if (!row) {
        return res.status(404).json({ error: 'File not found' });
      }

      try {
        const questions = await generateQuestions(topicId, topicName, row.content_summary);
        
        // Save questions to database
        const insertPromises = questions.map(question => {
          return new Promise((resolve, reject) => {
            const query = `
              INSERT INTO questions (id, topic_id, question_text, answer_text, question_type, difficulty_level)
              VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            db.run(query, [
              question.id,
              topicId,
              question.question,
              question.answer,
              question.type,
              question.difficulty
            ], function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            });
          });
        });

        await Promise.all(insertPromises);

        res.json({ 
          success: true, 
          questions,
          message: `Generated ${questions.length} questions for topic: ${topicName}`
        });

      } catch (error) {
        console.error('Question generation error:', error);
        res.status(500).json({ error: 'Failed to generate questions' });
      }
    });

  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get questions for a topic
router.get('/topics/:topicId/questions', (req, res) => {
  const { topicId } = req.params;

  const query = `
    SELECT id, question_text, answer_text, question_type, difficulty_level, created_date
    FROM questions
    WHERE topic_id = ?
    ORDER BY created_date DESC
  `;

  db.all(query, [topicId], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }

    res.json({ questions: rows || [] });
  });
});

// Create a new study session
router.post('/sessions', async (req, res) => {
  try {
    const { fileId, sessionName } = req.body;

    if (!fileId || !sessionName) {
      return res.status(400).json({ error: 'File ID and session name are required' });
    }

    const sessionId = await createStudySession(fileId, sessionName);

    res.json({
      success: true,
      sessionId,
      message: 'Study session created successfully'
    });

  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Failed to create study session' });
  }
});

// Get study sessions for a file
router.get('/sessions/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const sessions = await getStudySessions(fileId);

    res.json({ sessions });

  } catch (error) {
    console.error('Session fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch study sessions' });
  }
});

// Update study session progress
router.put('/sessions/:sessionId/progress', (req, res) => {
  const { sessionId } = req.params;
  const { progressData } = req.body;

  if (!progressData) {
    return res.status(400).json({ error: 'Progress data is required' });
  }

  const query = `
    UPDATE study_sessions 
    SET progress_data = ?, last_accessed = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [JSON.stringify(progressData), sessionId], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update progress' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Study session not found' });
    }

    res.json({
      success: true,
      message: 'Progress updated successfully'
    });
  });
});

// Get study statistics
router.get('/stats/:fileId', (req, res) => {
  const { fileId } = req.params;

  const query = `
    SELECT 
      COUNT(DISTINCT t.id) as total_topics,
      COUNT(DISTINCT q.id) as total_questions,
      COUNT(DISTINCT s.id) as total_sessions,
      AVG(t.confidence_score) as avg_confidence
    FROM files f
    LEFT JOIN topics t ON f.id = t.file_id
    LEFT JOIN questions q ON t.id = q.topic_id
    LEFT JOIN study_sessions s ON f.id = s.file_id
    WHERE f.id = ?
  `;

  db.get(query, [fileId], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }

    res.json({
      stats: {
        totalTopics: row?.total_topics || 0,
        totalQuestions: row?.total_questions || 0,
        totalSessions: row?.total_sessions || 0,
        averageConfidence: row?.avg_confidence || 0
      }
    });
  });
});

export { router as studyRoutes }; 