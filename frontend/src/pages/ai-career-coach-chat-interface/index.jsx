import React, { useState, useEffect, useRef } from 'react';
import MainLayout from 'components/layout/MainLayout';
import SidebarLayout from 'components/layout/SidebarLayout';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import PromptSuggestions from './components/PromptSuggestions';
import ChatHistory from './components/ChatHistory';
import { apiRequest } from 'utils/api.js';
import ConversationExport from './components/ConversationExport';
const AICareerCoachChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversationTitle, setCurrentConversationTitle] = useState('AI Career Coach');
  const [showPrompts, setShowPrompts] = useState(true);
  const messagesEndRef = useRef(null);
  const initialLoadRef = useRef(true);

  const [conversations, setConversations] = useState([]);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await apiRequest('/auth/ai/chat/conversations/');
        const mapped = (res.conversations || []).map(c => ({
          id: c.id,
          title: c.title || 'Conversation',
          category: 'career',
          lastMessage: c.last_message || '',
          lastActivity: c.last_activity ? new Date(c.last_activity) : new Date(),
          messageCount: c.message_count ?? 0,
          hasUnread: false,
        }));
        setConversations(mapped);
        if (mapped.length > 0) {
          selectConversation(mapped[0].id);
        } else {
          // show welcome
          setMessages([{
            id: 'welcome', type: 'text', isUser: false, timestamp: new Date(),
            content: `Hello! I'm your AI Career Coach. Ask about resume, jobs, skills, or interviews.`
          }]);
          setCurrentConversationId(null);
          setCurrentConversationTitle('New Conversation');
        }
      } catch {
        // unauthenticated fallback welcome
        setMessages([{
          id: 'welcome', type: 'text', isUser: false, timestamp: new Date(),
          content: `Hello! I'm your AI Career Coach. Sign in to save chat history.`
        }]);
        setCurrentConversationId(null);
        setCurrentConversationTitle('Guest Session');
      }
    };
    loadConversations();
  }, []);

  // Scroll helper and auto-scroll
  const scrollToBottom = (smooth = false) => {
    const el = messagesEndRef.current;
    if (!el) return;
    try {
      el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    } catch { }
  };
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return; // don't auto-scroll on first load
    }
    scrollToBottom(true);
  }, [messages, isTyping]);
  const ensureConversation = async (titleSeed) => {
    if (currentConversationId) return currentConversationId;
    try {
      const title = (titleSeed && titleSeed.length > 0) ? (titleSeed.length > 48 ? `${titleSeed.slice(0, 48)}…` : titleSeed) : 'Conversation';
      const created = await apiRequest('/auth/ai/chat/conversations/', 'POST', { title });
      if (created?.id) {
        setCurrentConversationId(created.id);
        setCurrentConversationTitle(created.title || 'Conversation');
        // Prepend to conversation list
        setConversations(prev => [{
          id: created.id,
          title: created.title || title,
          category: 'career',
          lastMessage: '',
          lastActivity: created.last_activity ? new Date(created.last_activity) : new Date(),
          messageCount: 0,
          hasUnread: false,
        }, ...prev]);
        return created.id;
      }
    } catch (e) {
      // Likely unauthenticated; continue without persistence
    }
    return null;
  };

  const handleSendMessage = async (messageText) => {
    const userMessage = {
      id: Date.now(),
      type: 'text',
      content: messageText,
      timestamp: new Date(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const convId = await ensureConversation(messageText);
      // Build history for backend (last 15 messages)
      const history = messages.slice(-15).map(m => ({
        role: m.isUser ? 'user' : 'model',
        content: m.content,
      }));

      const payload = {
        message: messageText,
        history,
        context: {
          conversationId: currentConversationId,
          page: 'ai-career-coach',
        },
        conversation_id: convId || currentConversationId,
      };

      const resp = await apiRequest('/auth/ai/chat/', 'POST', payload);

      const aiResponse = {
        id: Date.now() + 1,
        type: 'text',
        content: resp?.reply || 'Sorry, I could not generate a response.',
        timestamp: new Date(),
        isUser: false,
      };
      setMessages(prev => [...prev, aiResponse]);
      // Refresh conversations to update last message preview and counts
      try {
        const res = await apiRequest('/auth/ai/chat/conversations/');
        const mapped = (res.conversations || []).map(c => ({
          id: c.id,
          title: c.title || 'Conversation',
          category: 'career',
          lastMessage: c.last_message || '',
          lastActivity: c.last_activity ? new Date(c.last_activity) : new Date(),
          messageCount: c.message_count ?? 0,
          hasUnread: false,
        }));
        setConversations(mapped);
      } catch { }
      if (resp?.conversation_id && !currentConversationId) {
        setCurrentConversationId(resp.conversation_id);
        // Keep title if already set via ensureConversation; otherwise derive
        if (!currentConversationTitle || currentConversationTitle === 'New Conversation' || currentConversationTitle === 'Guest Session') {
          setCurrentConversationTitle(messageText.length > 48 ? `${messageText.slice(0, 48)}…` : messageText);
        }
        // refresh conversation list
        try {
          const res = await apiRequest('/auth/ai/chat/conversations/');
          const mapped = (res.conversations || []).map(c => ({
            id: c.id,
            title: c.title || 'Conversation',
            category: 'career',
            lastMessage: c.last_message || '',
            lastActivity: c.last_activity ? new Date(c.last_activity) : new Date(),
            messageCount: c.message_count ?? 0,
            hasUnread: false,
          }));
          setConversations(mapped);
        } catch { }
      }
    } catch (e) {
      const errMessage = {
        id: Date.now() + 2,
        type: 'text',
        content: `AI error: ${e.message}`,
        timestamp: new Date(),
        isUser: false,
      };
      setMessages(prev => [...prev, errMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptSelect = (prompt) => {
    handleSendMessage(prompt);
  };

  const handleVoiceRecord = (isRecording) => {
    console.log('Voice recording:', isRecording);
    // Voice recording logic would go here
  };

  // Feedback feature disabled for now

  const handleAnalyzeResume = async () => {
    // Insert a system-like message to indicate parsing started
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'text',
      content: 'Analyzing your uploaded resume…',
      timestamp: new Date(),
      isUser: false
    }]);
    setIsTyping(true);
    try {
      const res = await apiRequest('/auth/resume/parse/', 'POST');
      const parsed = res?.parsed;
      const readiness = res?.readiness;
      let summary = '';
      if (parsed) {
        const name = parsed.name || '';
        const title = parsed.title || parsed.target_title || '';
        const years = parsed.years_of_experience || parsed.experience_years || '';
        const skills = Array.isArray(parsed.skills) ? parsed.skills : [];
        const topSkills = skills
          .map(s => typeof s === 'string' ? s : (s?.name || s?.skill || s?.title || ''))
          .filter(Boolean)
          .slice(0, 10)
          .join(', ');
        const roles = (parsed.suited_roles || [])
          .map(r => typeof r === 'string' ? r : (r?.role || r?.name || ''))
          .filter(Boolean)
          .slice(0, 5)
          .join(', ');
        summary = [
          name && `Name: ${name}`,
          title && `Target/Title: ${title}`,
          years && `Experience: ${years} years`,
          topSkills && `Top skills: ${topSkills}`,
          roles && `Suited roles: ${roles}`,
        ].filter(Boolean).join('\n');
      }
      const readinessLine = readiness?.score ? `Readiness score: ${readiness.score}/100` : '';
      const content = summary || readinessLine ? `${summary}${summary && readinessLine ? '\n' : ''}${readinessLine}` : 'Resume analyzed.';
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'text',
        content,
        timestamp: new Date(),
        isUser: false
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        type: 'text',
        content: `Could not analyze resume: ${e.message}`,
        timestamp: new Date(),
        isUser: false
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const selectConversation = async (conversationId) => {
    try {
      const res = await apiRequest(`/auth/ai/chat/conversations/${conversationId}/messages/`);
      const msgs = (res.messages || []).map(m => ({
        id: m.id,
        type: 'text',
        content: m.content,
        timestamp: new Date(m.created_at),
        isUser: m.role === 'user',
      }));
      setMessages(msgs);
      setCurrentConversationId(conversationId);
      setCurrentConversationTitle(res?.conversation?.title || 'Conversation');
      setShowHistory(false);
      // After loading messages, refresh conversation list for accurate counts
      try {
        const list = await apiRequest('/auth/ai/chat/conversations/');
        const mapped = (list.conversations || []).map(c => ({
          id: c.id,
          title: c.title || 'Conversation',
          category: 'career',
          lastMessage: c.last_message || '',
          lastActivity: c.last_activity ? new Date(c.last_activity) : new Date(),
          messageCount: c.message_count ?? 0,
          hasUnread: false,
        }));
        setConversations(mapped);
      } catch { }
    } catch (e) {
      console.error('Failed to load conversation', e);
    }
  };

  const handleConversationSelect = (conversationId) => selectConversation(conversationId);

  const handleExport = async (exportData) => {
    try {
      const { format, title, messages } = exportData;
      const safeTitle = (title || 'conversation').replace(/[^a-z0-9\-_]+/gi, '_').slice(0, 50);
      const download = (filename, content, mime = 'text/plain;charset=utf-8') => {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      };
      if (format === 'json') {
        const content = JSON.stringify({ title, messages }, null, 2);
        download(`${safeTitle}.json`, content, 'application/json');
        return;
      }
      if (format === 'txt') {
        const lines = messages.map(m => `${m.isUser ? 'User' : 'Assistant'}: ${m.content}`);
        download(`${safeTitle}.txt`, lines.join('\n\n'));
        return;
      }
      if (format === 'email') {
        const body = encodeURIComponent(messages.map(m => `${m.isUser ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n'));
        window.location.href = `mailto:?subject=${encodeURIComponent('Conversation - ' + title)}&body=${body}`;
        return;
      }
      const fallback = messages.map(m => `${m.isUser ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');
      download(`${safeTitle}.txt`, fallback);
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await apiRequest(`/auth/ai/chat/conversations/${conversationId}/`, 'DELETE');
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversationId === conversationId) {
        // Reset view when deleting the active conversation
        setCurrentConversationId(null);
        setCurrentConversationTitle('New Conversation');
        setMessages([]);
        setShowPrompts(true);
      }
    } catch (e) {
      console.error('Failed to delete conversation', e);
    }
  };

  const currentConversation = {
    id: currentConversationId || 'current',
    title: currentConversationTitle,
    messages: messages
  };

  return (
    <MainLayout
      title="AI Career Coach"
      description="Get personalized career guidance with AI-powered coaching. Resume reviews, job search strategies, and skill development recommendations."
      noPadding
      fullWidth
      hideFloatingChat
    >
      <div className="h-screen overflow-hidden bg-white dark:bg-background no-scrollbar">
        <SidebarLayout
          sidebar={
            <ChatHistory
              conversations={conversations}
              onSelectConversation={handleConversationSelect}
              currentConversationId={currentConversationId}
              onDeleteConversation={handleDeleteConversation}
              onNewChat={async () => {
                try {
                  const created = await apiRequest('/auth/ai/chat/conversations/', 'POST', { title: 'New Conversation' });
                  if (created?.id) {
                    setConversations(prev => [{
                      id: created.id,
                      title: created.title || 'New Conversation',
                      category: 'career',
                      lastMessage: '',
                      lastActivity: created.last_activity ? new Date(created.last_activity) : new Date(),
                      messageCount: 0,
                      hasUnread: false,
                    }, ...prev]);
                    setCurrentConversationId(created.id);
                    setCurrentConversationTitle(created.title || 'New Conversation');
                  } else {
                    setCurrentConversationId(null);
                    setCurrentConversationTitle('New Conversation');
                  }
                } catch {
                  setCurrentConversationId(null);
                  setCurrentConversationTitle('New Conversation');
                } finally {
                  setMessages([]);
                  setShowHistory(false);
                  setTimeout(() => scrollToBottom(false), 0);
                }
              }}
              className="h-full"
            />
          }
          sidebarWidth={320}
          collapsible
          contentClassName="overflow-hidden"
        >

          {/* Main Chat Interface */}
          <div className="flex-1 h-full flex flex-col overflow-hidden no-scrollbar pt-3 sm:pt-4">
            {/* Chat Header */}
            <div className="glassmorphic-card px-5 py-3 border-b border-white/20 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(!showHistory)}
                  className="lg:hidden hover:bg-white/10"
                >
                  <Icon name="Menu" size={18} />
                </Button>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Icon name="Bot" size={16} color="white" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-foreground">{currentConversation.title || 'AI Career Coach'}</h1>
                    <p className="text-xs text-muted-foreground">
                      {isTyping ? 'Typing...' : 'Online'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Export control */}
                <div className="flex items-center">
                  <ConversationExport
                    conversation={currentConversation}
                    onExport={handleExport}
                  />
                </div>
                {/* 3-dots menu removed */}
              </div>
            </div>

            {/* Quick Start (now always visible, positioned above input) */}

            {/* Messages Area (only this scrolls) */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 scrollbar-slim">
              {messages.map((message) => (
                <div key={message.id}>
                  <ChatMessage
                    message={message}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
                  {/* Feedback removed per request */}
                </div>
              ))}

              {isTyping && (
                <ChatMessage
                  message={{}}
                  isUser={false}
                  timestamp={new Date()}
                  isTyping={true}
                />
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Start suggestions (always visible) */}
            <PromptSuggestions
              onSelectPrompt={handlePromptSelect}
              onAnalyzeResume={handleAnalyzeResume}
            />

            {/* Chat Input (fixed at bottom of column) */}
            <ChatInput
              onSendMessage={handleSendMessage}
              onVoiceRecord={handleVoiceRecord}
              disabled={isTyping}
            />
          </div>

          {/* Mobile Chat History Overlay */}
          {showHistory && (
            <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40">
              <div className="w-80 h-full glassmorphic border-r border-white/20">
                <ChatHistory
                  conversations={conversations}
                  onSelectConversation={handleConversationSelect}
                  currentConversationId={currentConversationId}
                  onDeleteConversation={handleDeleteConversation}
                  onNewChat={async () => {
                    try {
                      const created = await apiRequest('/auth/ai/chat/conversations/', 'POST', { title: 'New Conversation' });
                      if (created?.id) {
                        setConversations(prev => [{
                          id: created.id,
                          title: created.title || 'New Conversation',
                          category: 'career',
                          lastMessage: '',
                          lastActivity: created.last_activity ? new Date(created.last_activity) : new Date(),
                          messageCount: 0,
                          hasUnread: false,
                        }, ...prev]);
                        setCurrentConversationId(created.id);
                        setCurrentConversationTitle(created.title || 'New Conversation');
                      } else {
                        setCurrentConversationId(null);
                        setCurrentConversationTitle('New Conversation');
                      }
                    } catch {
                      setCurrentConversationId(null);
                      setCurrentConversationTitle('New Conversation');
                    } finally {
                      setMessages([]);
                      setShowHistory(false);
                      setTimeout(() => scrollToBottom(false), 0);
                    }
                  }}
                  className="h-full"
                />
              </div>
            </div>
          )}
        </SidebarLayout>
      </div>
    </MainLayout>
  );
};

export default AICareerCoachChatInterface;
