import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '../../data/edulense.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new sqlite3.Database(dbPath);

export async function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create files table
      db.run(`
        CREATE TABLE IF NOT EXISTS files (
          id TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          original_name TEXT NOT NULL,
          file_type TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          processing_status TEXT DEFAULT 'pending',
          content_summary TEXT,
          topics TEXT,
          metadata TEXT
        )
      `);

      // Create study_sessions table
      db.run(`
        CREATE TABLE IF NOT EXISTS study_sessions (
          id TEXT PRIMARY KEY,
          file_id TEXT NOT NULL,
          session_name TEXT NOT NULL,
          created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
          progress_data TEXT,
          FOREIGN KEY (file_id) REFERENCES files (id)
        )
      `);

      // Create topics table
      db.run(`
        CREATE TABLE IF NOT EXISTS topics (
          id TEXT PRIMARY KEY,
          file_id TEXT NOT NULL,
          topic_name TEXT NOT NULL,
          topic_description TEXT,
          confidence_score REAL,
          created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (file_id) REFERENCES files (id)
        )
      `);

      // Create questions table
      db.run(`
        CREATE TABLE IF NOT EXISTS questions (
          id TEXT PRIMARY KEY,
          topic_id TEXT NOT NULL,
          question_text TEXT NOT NULL,
          answer_text TEXT,
          question_type TEXT DEFAULT 'multiple_choice',
          difficulty_level TEXT DEFAULT 'medium',
          created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (topic_id) REFERENCES topics (id)
        )
      `);

      // Create embeddings table for RAG
      db.run(`
        CREATE TABLE IF NOT EXISTS embeddings (
          id TEXT PRIMARY KEY,
          file_id TEXT NOT NULL,
          chunk_text TEXT NOT NULL,
          embedding_vector TEXT NOT NULL,
          chunk_index INTEGER NOT NULL,
          created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (file_id) REFERENCES files (id)
        )
      `);

      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database tables created successfully');
          resolve();
        }
      });
    });
  });
}

export function closeDatabase(): void {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
  });
} 