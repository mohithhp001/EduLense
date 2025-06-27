# EduLense - AI-Powered Study Assistant

EduLense is an intelligent educational platform that transforms your study materials into personalized learning experiences. Upload PDFs and videos, and let AI create study topics, generate practice questions, and help you learn more effectively.

## 🚀 Features

- **📄 PDF Processing**: Extract and analyze text from PDF documents
- **🎥 Video Analysis**: Convert video content to text using speech recognition
- **🧠 AI-Powered Topics**: Automatically generate study topics from your content
- **❓ Smart Questions**: Create practice questions tailored to your material
- **📊 Study Dashboard**: Interactive learning interface with progress tracking
- **🎯 Personalized Learning**: Adaptive study sessions based on your content

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express** and **TypeScript**
- **SQLite** database (easily upgradable to PostgreSQL)
- **OpenAI API** for AI-powered features
- **LangChain** for RAG (Retrieval-Augmented Generation)
- **FFmpeg** for video processing
- **PDF-parse** for document processing

### Frontend
- **Next.js 14** with **TypeScript**
- **Tailwind CSS** for styling
- **React Dropzone** for file uploads
- **Lucide React** for icons
- **Framer Motion** for animations

## 📋 Prerequisites

- Node.js 18+ and npm
- FFmpeg installed on your system
- OpenAI API key

### Installing FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from [FFmpeg official website](https://ffmpeg.org/download.html)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EduLense
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy backend environment example
   cd backend
   cp env.example .env
   
   # Edit .env and add your OpenAI API key
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:3001
   - Frontend server on http://localhost:3000

## 📖 Usage

1. **Upload Files**: Drag and drop PDF or video files onto the upload area
2. **Wait for Processing**: The system will extract text and generate topics
3. **Study**: Click on any topic to generate practice questions
4. **Practice**: Answer questions and track your progress
5. **Review**: Get detailed explanations and study recommendations

## 🔧 API Endpoints

### File Management
- `POST /api/files/upload` - Upload and process files
- `GET /api/files/files` - Get all uploaded files
- `GET /api/files/files/:id` - Get specific file details
- `DELETE /api/files/files/:id` - Delete a file

### Study Features
- `GET /api/study/topics/:fileId` - Get topics for a file
- `POST /api/study/topics/:topicId/questions` - Generate questions for a topic
- `GET /api/study/topics/:topicId/questions` - Get questions for a topic
- `POST /api/study/sessions` - Create a study session
- `GET /api/study/sessions/:fileId` - Get study sessions for a file

### AI Features
- `POST /api/ai/ask` - Ask questions about your content
- `POST /api/ai/recommendations` - Get study recommendations
- `POST /api/ai/flashcards` - Generate flashcards
- `POST /api/ai/summarize` - Summarize content

## 🏗️ Project Structure

```
EduLense/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── database/       # Database initialization
│   │   └── index.ts        # Server entry point
│   ├── data/               # SQLite database files
│   ├── uploads/            # Uploaded files storage
│   └── package.json
├── frontend/               # Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   └── package.json
├── package.json           # Root package.json (workspaces)
└── README.md
```

## 🔒 Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=./data/edulense.db
MAX_FILE_SIZE=104857600
UPLOAD_DIR=./uploads
CORS_ORIGIN=http://localhost:3000
```

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Build both frontend and backend
npm run build

# Start production servers
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the AI capabilities
- LangChain for the RAG framework
- Next.js team for the amazing React framework
- Tailwind CSS for the utility-first CSS framework

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include your environment details and error logs

---

**Happy Learning! 🎓**