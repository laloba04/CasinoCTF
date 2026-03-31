import { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../../hooks/useSocket';

export default function ChatPanel() {
  const { chatMessages, sendChat } = useSocket();
  const [message, setMessage] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const send = (e) => {
    e.preventDefault();
    if (message.trim()) { sendChat(message.trim()); setMessage(''); }
  };

  return (
    <div className="chat-panel">
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem' }}>
        💬 Table Chat
      </div>
      <div className="chat-messages">
        {chatMessages.length === 0 && <p className="text-muted" style={{ fontSize: '0.8rem' }}>No messages yet...</p>}
        {chatMessages.map((msg, i) => (
          <div key={i} className="chat-msg">
            <span className="chat-user">{msg.username}: </span>
            <span>{msg.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="chat-input-area">
        <input className="input" placeholder="Type a message..."
          value={message} onChange={e => setMessage(e.target.value)} />
        <button className="btn btn-primary btn-sm" type="submit">Send</button>
      </form>
    </div>
  );
}
