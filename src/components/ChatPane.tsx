import React, { useEffect, useState } from 'react';
import ChatService, {
  MessageResponse,
  ChatNotification
} from '../services/ChatService';

interface ChatPaneProps {
  chatWithUserId: number;
}

const ChatPane: React.FC<ChatPaneProps> = ({ chatWithUserId }) => {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    // connect once
    ChatService.connect();

    // load history
    ChatService.fetchHistory(chatWithUserId)
      .then(setMessages)
      .catch(console.error);

    // new message handler
    const handleMsg = (msg: MessageResponse) => {
      setMessages(prev => [...prev, msg]);
      ChatService.markDelivered(msg.messageId);
    };
    ChatService.onMessage(handleMsg);

    // notification handler (optional)
    const handleNotif = (notif: ChatNotification) => {
      console.log('Notif:', notif.message);
    };
    ChatService.onNotification(handleNotif);

    return () => {
      ChatService.disconnect();
    };
  }, [chatWithUserId]);

  const send = () => {
    if (!draft.trim()) return;
    ChatService.sendMessage(chatWithUserId, draft.trim());
    setDraft('');
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ minHeight: 300, border: '1px solid #ddd', padding: 10 }}>
        {messages.map(m => (
          <div key={m.messageId} style={{ marginBottom: 8 }}>
            <strong>{m.senderName}:</strong> {m.content}
            <div style={{ fontSize: '0.8em', color: '#666' }}>
              {new Date(m.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <textarea
        style={{ width: '100%', height: 60, marginTop: 10 }}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="Type a message…"
      />
      <button onClick={send} style={{ marginTop: 5 }}>
        Send
      </button>
    </div>
  );
};

export default ChatPane;
