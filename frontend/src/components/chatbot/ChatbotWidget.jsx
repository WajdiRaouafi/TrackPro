// src/components/ChatbotWidget.jsx
import React, { useState, useEffect } from 'react';
import { Button, Form, Card, ListGroup } from 'react-bootstrap';
import axios from 'axios';

const LOCAL_STORAGE_KEY = 'chatbot_messages';

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);

  // 🔁 Charger l'historique au montage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  // 💾 Sauvegarder les messages à chaque changement
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!question.trim()) return;

  const newMessages = [...messages, { role: 'user', content: question }];
  setMessages(newMessages);

  try {
    const res = await axios.post('http://localhost:3000/gpt/ask', { prompt: question });
    const reply = res.data.response; // ✅ on extrait le contenu texte
    setMessages([...newMessages, { role: 'assistant', content: reply }]);
    setQuestion('');
  } catch (err) {
    setMessages([...newMessages, { role: 'assistant', content: 'Erreur lors de la réponse du bot.' }]);
  }
};


  return (
    <>
      {open && (
        <Card
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '30px',
            width: '300px',
            zIndex: 9999,
          }}
        >
          <Card.Header className="d-flex justify-content-between align-items-center">
            <strong>🤖 Assistant</strong>
            <Button size="sm" variant="danger" onClick={() => setOpen(false)}>×</Button>
          </Card.Header>
          <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <ListGroup variant="flush">
              {messages.map((msg, idx) => (
                <ListGroup.Item key={idx} className={msg.role === 'user' ? 'text-end' : 'text-start'}>
                  <strong>{msg.role === 'user' ? 'Moi' : 'Bot'}:</strong> {msg.content}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
          <Card.Footer>
            <Form onSubmit={handleSubmit}>
              <Form.Control
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Pose ta question..."
              />
              <Button type="submit" variant="primary" className="w-100 mt-2">Envoyer</Button>
            </Form>
          </Card.Footer>
        </Card>
      )}

      <Button
        variant="primary"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          zIndex: 9999,
        }}
        onClick={() => setOpen(!open)}
      >
        💬
      </Button>
    </>
  );
}
