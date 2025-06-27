import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processVideo(filePath: string): Promise<string> {
  try {
    console.log(`🎥 Starting video processing: ${filePath}`);
    
    // Extract audio from video
    const audioPath = await extractAudio(filePath);
    
    // Convert audio to text using OpenAI Whisper
    const text = await transcribeAudio(audioPath);
    
    // Clean up temporary audio file
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
    
    console.log(`✅ Video processed successfully: ${filePath}`);
    console.log(`🎤 Extracted ${text.length} characters from audio`);
    
    return text;
  } catch (error) {
    console.error('❌ Video processing error:', error);
    throw new Error(`Failed to process video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function extractAudio(videoPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const audioPath = videoPath.replace(/\.[^/.]+$/, '.mp3');
    
    ffmpeg(videoPath)
      .toFormat('mp3')
      .audioCodec('libmp3lame')
      .audioChannels(1)
      .audioFrequency(16000)
      .on('end', () => {
        console.log(`🎵 Audio extracted: ${audioPath}`);
        resolve(audioPath);
      })
      .on('error', (err) => {
        console.error('❌ Audio extraction error:', err);
        reject(err);
      })
      .save(audioPath);
  });
}

async function transcribeAudio(audioPath: string): Promise<string> {
  try {
    const audioFile = fs.createReadStream(audioPath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
    });
    
    return transcription;
  } catch (error) {
    console.error('❌ Transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function extractVideoMetadata(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          duration: metadata.format.duration,
          size: metadata.format.size,
          bitrate: metadata.format.bit_rate,
          format: metadata.format.format_name,
          streams: metadata.streams.map(stream => ({
            type: stream.codec_type,
            codec: stream.codec_name,
            duration: stream.duration
          }))
        });
      }
    });
  });
} 