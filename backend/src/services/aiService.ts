import { OpenAI } from 'openai';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from 'langchain/prompts';
import { StringOutputParser } from 'langchain/schema/output_parser';
import { RunnableSequence } from 'langchain/schema/runnable';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0.7,
});

export async function generateTopics(content: string): Promise<any[]> {
  try {
    console.log('🧠 Generating topics from content...');
    
    const prompt = PromptTemplate.fromTemplate(`
      Analyze the following educational content and identify the main study topics. 
      For each topic, provide:
      1. A clear, concise topic name
      2. A brief description of what the topic covers
      3. Key concepts or subtopics within this topic
      4. Difficulty level (beginner, intermediate, advanced)
      5. Estimated study time in minutes
      
      Content: {content}
      
      Return the response as a JSON array with the following structure:
      [
        {
          "id": "unique-id",
          "name": "Topic Name",
          "description": "Topic description",
          "keyConcepts": ["concept1", "concept2", "concept3"],
          "difficulty": "beginner|intermediate|advanced",
          "estimatedTime": 30,
          "confidence": 0.95
        }
      ]
      
      Focus on extracting 3-8 main topics that would be most helpful for students studying this material.
    `);

    const chain = RunnableSequence.from([
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({ content: content.substring(0, 4000) });
    
    // Parse the JSON response
    const topics = JSON.parse(result);
    
    console.log(`✅ Generated ${topics.length} topics`);
    
    return topics;
  } catch (error) {
    console.error('❌ Topic generation error:', error);
    // Return a fallback topic if AI generation fails
    return [{
      id: uuidv4(),
      name: 'General Content',
      description: 'Main content from the uploaded material',
      keyConcepts: ['content analysis', 'study material'],
      difficulty: 'intermediate',
      estimatedTime: 60,
      confidence: 0.8
    }];
  }
}

export async function generateQuestions(topicId: string, topicName: string, content: string): Promise<any[]> {
  try {
    console.log(`❓ Generating questions for topic: ${topicName}`);
    
    const prompt = PromptTemplate.fromTemplate(`
      Create 5 study questions for the topic "{topicName}" based on the following content.
      
      Content: {content}
      
      Generate a mix of question types:
      - Multiple choice questions
      - True/False questions
      - Short answer questions
      
      Return the response as a JSON array with the following structure:
      [
        {
          "id": "unique-id",
          "question": "Question text",
          "answer": "Correct answer",
          "type": "multiple_choice|true_false|short_answer",
          "difficulty": "easy|medium|hard",
          "options": ["option1", "option2", "option3", "option4"] // for multiple choice
        }
      ]
      
      Make sure the questions are relevant to the topic and content provided.
    `);

    const chain = RunnableSequence.from([
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({ 
      topicName, 
      content: content.substring(0, 3000) 
    });
    
    const questions = JSON.parse(result);
    
    console.log(`✅ Generated ${questions.length} questions for topic: ${topicName}`);
    
    return questions;
  } catch (error) {
    console.error('❌ Question generation error:', error);
    return [];
  }
}

export async function answerQuestion(question: string, fileId: string): Promise<string> {
  try {
    console.log(`🤔 Answering question: ${question}`);
    
    // Get file content from database
    const fileContent = await getFileContent(fileId);
    
    if (!fileContent) {
      throw new Error('File content not found');
    }
    
    const prompt = PromptTemplate.fromTemplate(`
      Answer the following question based on the provided educational content.
      Provide a clear, educational response that helps the student understand the concept.
      
      Content: {content}
      
      Question: {question}
      
      Answer the question in a helpful, educational manner. If the answer cannot be found in the content, say so clearly.
    `);

    const chain = RunnableSequence.from([
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({ 
      question, 
      content: fileContent.substring(0, 4000) 
    });
    
    console.log('✅ Question answered successfully');
    
    return result;
  } catch (error) {
    console.error('❌ Question answering error:', error);
    throw new Error(`Failed to answer question: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getFileContent(fileId: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT content_summary FROM files WHERE id = ?', [fileId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.content_summary : null);
      }
    });
  });
}

export async function createStudySession(fileId: string, sessionName: string): Promise<string> {
  const sessionId = uuidv4();
  
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO study_sessions (id, file_id, session_name)
      VALUES (?, ?, ?)
    `;
    
    db.run(query, [sessionId, fileId, sessionName], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(sessionId);
      }
    });
  });
}

export async function getStudySessions(fileId: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT id, session_name, created_date, last_accessed, progress_data
      FROM study_sessions
      WHERE file_id = ?
      ORDER BY last_accessed DESC
    `;
    
    db.all(query, [fileId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
} 