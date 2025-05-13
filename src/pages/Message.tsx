import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
// import {  User, MessageSquare } from 'lucide-react';

import NavBar from '../components/NavBar';

// Define TypeScript interfaces
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// interface ChatProps {
//   username?: string;
//   handle?: string;
// }

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'Feed' | 'Explore'>('Feed');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Generate a unique ID for messages
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };
  
  // Handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: generateId(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setNewMessage('');
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      const botMessage: Message = {
        id: generateId(),
        text: `This is a response to: "${newMessage}"`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6 flex">
        {/* Top Bar */}
        <Navbar/>
        
        {/* Chat Area */}
        <div className="flex-1 bg-gray-50 p-4 overflow-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                          msg.sender === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <div 
                          className={`text-xs mt-1 ${
                            msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-center">
                  {activeTab === 'Feed' ? (
                    <div>
                      <p className="text-red-500 text-lg">Failed to load posts. Please try again later.</p>
                      <p className="mt-4">Start a new conversation by typing a message below</p>
                    </div>
                  ) : (
                    <p>Explore tab content would go here</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={newMessage.trim() === ''}
                  className="ml-2 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}