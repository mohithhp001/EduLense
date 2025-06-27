import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState('...');
  const [aiStatus, setAiStatus] = useState('...');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data.status || 'error'))
      .catch(() => setBackendStatus('error'));
    fetch('http://localhost:8001/api/ai/health')
      .then(res => res.json())
      .then(data => setAiStatus(data.status || 'error'))
      .catch(() => setAiStatus('error'));
  }, []);

  return (
    <div className="App" style={{ fontFamily: 'sans-serif', padding: 40 }}>
      <h1>EduLense Health Check</h1>
      <div style={{ marginTop: 32 }}>
        <div>
          <strong>Backend API:</strong> <span data-testid="backend-status">{backendStatus}</span>
        </div>
        <div>
          <strong>AI Service:</strong> <span data-testid="ai-status">{aiStatus}</span>
        </div>
      </div>
      <p style={{ marginTop: 40, color: '#888' }}>
        Edit <code>src/App.tsx</code> and save to reload.
      </p>
    </div>
  );
}

export default App;
