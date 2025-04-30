import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import chatService from '../services/ChatService';
import { User, MessageResponse, MessageRequest } from '../types/message';

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);

  useEffect(() => {
    // If we've been loading for too long without any users or errors, 
    // show a fallback message
    const timeoutId = setTimeout(() => {
      if (loading && !error && users.length === 0 && !fallbackTriggered) {
        console.log('Triggering fallback UI');
        setFallbackTriggered(true);
        setLoading(false);
        setError('No chat users found. Try starting a conversation first.');
      }
    }, 10000);
  
    return () => clearTimeout(timeoutId);
  }, [loading, error, users, fallbackTriggered]);

  // Check auth and get current user
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Fetch user info from API with proper error handling
    const fetchCurrentUser = async () => {
        try {
          console.log('Fetching current user data...');
          const response = await fetch('http://localhost:8084/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('User API response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('User data received:', data);
          
          // If userId is missing, use email as a fallback to get user data
          if (!data.userId && data.email) {
            console.log('userId missing, fetching user by email:', data.email);
            // Make an additional request to get user by email
            const userResponse = await fetch(`http://localhost:8084/api/user/by-email?email=${data.email}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              console.log('User data fetched by email:', userData);
              setCurrentUserId(userData.userId);
            } else {
              throw new Error('Could not fetch user details by email');
            }
          } else if (data.userId) {
            setCurrentUserId(data.userId);
          } else {
            throw new Error('User ID not available');
          }
        } catch (err) {
          console.error('Error fetching current user:', err);
          setError('Failed to load user data. Please login again.');
          setLoading(false);
          setTimeout(() => navigate('/login'), 3000);
        }
      };
    
    fetchCurrentUser();
    
    // Set a timeout to prevent infinite loading
    // const timeoutId = setTimeout(() => {
    //   if (loading) {
    //     console.log('Loading timeout reached');
    //     setLoading(false);
    //     setError('Loading timed out. Please try refreshing the page.');
    //   }
    // }, 15000);
    
    // return () => clearTimeout(timeoutId);
  }, [navigate]);

  // Connect to WebSocket
  useEffect(() => {
    if (!currentUserId) return;
    
    const initChatService = async () => {
      try {
        await chatService.connect();
        
        // Subscribe to personal message queue
        chatService.subscribe(`/user/${currentUserId}/queue/messages`, (message: MessageResponse) => {
          handleIncomingMessage(message);
        });
        
        // Subscribe to notifications
        chatService.subscribe(`/user/${currentUserId}/queue/notification`, (notification) => {
          console.log('New notification:', notification);
          // You could show a notification here
        });
        
        // Load chat users
        loadChatUsers();
      } catch (err) {
        console.error('Failed to initialize chat:', err);
        setError('Failed to connect to chat. Please try again later.');
      }
    };
    
    initChatService();
    
    // Cleanup function
    return () => {
      chatService.disconnect();
    };
  }, [currentUserId]);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load conversation when selected user changes
  useEffect(() => {
    if (selectedUser) {
      loadConversation(selectedUser.userId);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!currentUserId) return;
  
    const initChatService = async () => {
      try {
        await chatService.connect();
        chatService.subscribe(`/user/${currentUserId}/queue/messages`, handleIncomingMessage);
        chatService.subscribe(`/user/${currentUserId}/queue/notification`, console.log);
        loadAllUsers();
      } catch (err) {
        console.error('Failed to initialize chat:', err);
        setError('Failed to connect to chat.');
      }
    };
  
    initChatService();
    return () => chatService.disconnect();
  }, [currentUserId]);
  
  const loadAllUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await chatService.getAllUsers();
      const filteredUsers = allUsers.filter(u => u.userId !== currentUserId);
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Could not fetch users');
    } finally {
      setLoading(false);
    }
  };

  const loadChatUsers = async () => {
    try {
      setLoading(true);
      const users = await chatService.getChatUsers();
      setUsers(users);
      
      if (users.length > 0 && !selectedUser) {
        setSelectedUser(users[0]);
      }
    } catch (err) {
      console.error('Error loading chat users:', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (userId: number) => {
    try {
      setLoading(true);
      const conversationData = await chatService.getConversation(userId);
      setMessages(conversationData);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleIncomingMessage = (message: MessageResponse) => {
    if (selectedUser?.userId === message.senderId || selectedUser?.userId === message.receiverId) {
      setMessages(prevMessages => [...prevMessages, message]);
    } else {
      // Optional: refresh user list to reflect new message
      loadChatUsers(); // Optional enhancement
      console.log("New message from another user:", message);
    }
  
    // Acknowledge delivery
    chatService.send('/app/message/delivered', message.messageId);
  };
  

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!selectedUser || !messageText.trim() || currentUserId === null) return;
  
    const messageRequest: MessageRequest = {
      receiverId: selectedUser.userId,
      content: messageText.trim(),
    };
  
    try {
      await chatService.send('/app/chat', messageRequest);
  
      const localMessage: MessageResponse = {
        messageId: Date.now(), // temporary ID
        senderId: currentUserId,
        senderName: 'You',
        receiverId: selectedUser.userId,
        receiverName: selectedUser.userName,
        content: messageRequest.content,
        timestamp: new Date().toISOString()
      };
  
      setMessages(prev => [...prev, localMessage]);
      setMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };
  

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && !selectedUser) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar - Users list */}
      <div className="w-1/4 bg-white border-r border-gray-300">
        <div className="p-4 bg-indigo-600 text-white border-b border-gray-300">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        
        <div className="overflow-y-auto h-full">
          {users.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            <ul>
             {users.length === 0 ? (
  <div className="p-4 text-center text-gray-500">
    No users available to chat.
  </div>
) : (
  <ul>
    {users.map((user) => (
      <li 
        key={user.userId}
        className={`px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
          selectedUser?.userId === user.userId ? 'bg-indigo-100' : ''
        }`}
        onClick={() => setSelectedUser(user)}
      >
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
            {user.userName ? user.userName.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user.userName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </li>
    ))}
  </ul>
)}

            </ul>
          )}
        </div>
      </div>
      
      {/* Right side - Chat area */}
      <div className="flex flex-col w-3/4">
        {selectedUser ? (
          <>
            <div className="bg-white p-4 shadow flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {selectedUser.userName ? selectedUser.userName.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold">{selectedUser.userName}</h2>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.messageId}
                      className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === currentUserId 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 rounded-tl-none shadow'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.senderId === currentUserId ? 'text-indigo-100' : 'text-gray-500'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-300 p-4 bg-white">
              <form onSubmit={handleSendMessage} className="flex">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a contact to start chatting</p>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="absolute bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md flex items-center">
          <span>{error}</span>
          <button 
            className="ml-4 text-red-700 text-xl"
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default Chat;