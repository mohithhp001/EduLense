import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init';
import { processPDF } from '../services/pdfProcessor';
import { processVideo } from '../services/videoProcessor';
import { generateTopics } from '../services/aiService';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and video files are allowed.'));
    }
  }
});

// Upload file endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileId = uuidv4();
    const { originalname, filename, size, mimetype } = req.file;
    
    // Determine file type
    const fileType = mimetype.startsWith('application/pdf') ? 'pdf' : 'video';
    
    // Save file metadata to database
    const insertQuery = `
      INSERT INTO files (id, filename, original_name, file_type, file_size, processing_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(insertQuery, [fileId, filename, originalname, fileType, size, 'processing'], async function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to save file metadata' });
      }

      try {
        let contentSummary = '';
        let extractedText = '';

        // Process file based on type
        if (fileType === 'pdf') {
          extractedText = await processPDF(path.join(__dirname, '../../uploads', filename));
        } else {
          extractedText = await processVideo(path.join(__dirname, '../../uploads', filename));
        }

        contentSummary = extractedText.substring(0, 500) + '...';

        // Generate topics using AI
        const topics = await generateTopics(extractedText);

        // Update database with processing results
        const updateQuery = `
          UPDATE files 
          SET processing_status = ?, content_summary = ?, topics = ?
          WHERE id = ?
        `;

        db.run(updateQuery, ['completed', contentSummary, JSON.stringify(topics), fileId], function(err) {
          if (err) {
            console.error('Update error:', err);
            return res.status(500).json({ error: 'Failed to update file processing results' });
          }

          res.json({
            success: true,
            fileId,
            filename: originalname,
            fileType,
            contentSummary,
            topics,
            message: 'File uploaded and processed successfully'
          });
        });

      } catch (processingError) {
        console.error('Processing error:', processingError);
        
        // Update status to failed
        db.run('UPDATE files SET processing_status = ? WHERE id = ?', ['failed', fileId]);
        
        res.status(500).json({ 
          error: 'File processing failed',
          details: processingError instanceof Error ? processingError.message : 'Unknown error'
        });
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Get all files
router.get('/files', (req, res) => {
  const query = `
    SELECT id, original_name, file_type, file_size, upload_date, processing_status, content_summary, topics
    FROM files
    ORDER BY upload_date DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch files' });
    }

    res.json({
      files: rows.map(row => ({
        ...row,
        topics: row.topics ? JSON.parse(row.topics) : []
      }))
    });
  });
});

// Get file by ID
router.get('/files/:fileId', (req, res) => {
  const { fileId } = req.params;

  const query = `
    SELECT id, original_name, file_type, file_size, upload_date, processing_status, content_summary, topics
    FROM files
    WHERE id = ?
  `;

  db.get(query, [fileId], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch file' });
    }

    if (!row) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      ...row,
      topics: row.topics ? JSON.parse(row.topics) : []
    });
  });
});

// Delete file
router.delete('/files/:fileId', (req, res) => {
  const { fileId } = req.params;

  // First get file info to delete from filesystem
  db.get('SELECT filename FROM files WHERE id = ?', [fileId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch file info' });
    }

    if (!row) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete from filesystem
    const filePath = path.join(__dirname, '../../uploads', row.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    db.run('DELETE FROM files WHERE id = ?', [fileId], function(err) {
      if (err) {
        console.error('Delete error:', err);
        return res.status(500).json({ error: 'Failed to delete file' });
      }

      res.json({ success: true, message: 'File deleted successfully' });
    });
  });
});

export { router as fileUploadRoutes }; 