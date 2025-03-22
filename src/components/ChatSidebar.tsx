
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizontal, Loader2 } from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger
} from '@/components/ui/sidebar';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatSidebarProps {
  hypothesis: {
    title: string;
    description: string;
  } | null;
  onSendMessage: (message: string) => Promise<boolean>;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ hypothesis, onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add initial system message
    if (hypothesis) {
      setMessages([
        {
          id: 'welcome',
          content: `I've generated a research paper based on the hypothesis: "${hypothesis.title}". You can ask me to modify or improve specific parts of the paper.`,
          sender: 'ai',
          timestamp: new Date()
        }
      ]);
    }
  }, [hypothesis]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isProcessing) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      content: messageInput,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setIsProcessing(true);
    
    // Add typing indicator
    setMessages(prev => [...prev, {
      id: 'typing',
      content: 'Processing your request...',
      sender: 'ai' as const,
      timestamp: new Date()
    }]);
    
    try {
      const success = await onSendMessage(messageInput);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      if (success) {
        const aiResponse = {
          id: `ai-${Date.now()}`,
          content: "I've updated the research paper based on your request. You can see the changes in the editor.",
          sender: 'ai' as const,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        const errorResponse = {
          id: `ai-error-${Date.now()}`,
          content: "I had trouble updating the paper. Please try a different request or rephrase your instructions.",
          sender: 'ai' as const,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      const errorResponse = {
        id: `ai-error-${Date.now()}`,
        content: "Sorry, I encountered an error processing your request. Please try again.",
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader className="border-b py-4 px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Research Assistant</h2>
            <SidebarTrigger />
          </div>
          {hypothesis && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-800 text-sm">Working on Hypothesis:</h3>
              <p className="text-sm text-blue-700 mt-1">{hypothesis.title}</p>
            </div>
          )}
        </SidebarHeader>
        
        <SidebarContent className="px-4 py-4">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div className={`
                    inline-block max-w-[85%] px-4 py-3 rounded-lg
                    ${message.sender === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }
                    ${message.id === 'typing' ? 'italic opacity-70' : ''}
                  `}>
                    {message.content}
                    {message.id === 'typing' && (
                      <Loader2 className="inline ml-2 h-4 w-4 animate-spin" />
                    )}
                  </div>
                  <div className="text-xs mt-1 text-gray-500">
                    {message.id !== 'typing' && message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </SidebarContent>
        
        <SidebarFooter className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to modify the paper..."
              className="min-h-[80px] resize-none flex-1"
              disabled={isProcessing}
            />
            <Button 
              className="self-end"
              size="icon"
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SendHorizontal className="h-5 w-5" />
              )}
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default ChatSidebar;
