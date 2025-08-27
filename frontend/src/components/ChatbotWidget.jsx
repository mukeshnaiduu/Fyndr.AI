import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import { apiRequest } from 'utils/api.js';

const ChatbotWidget = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 'hello', role: 'model', content: "Hi! I'm your AI career coach. How can I help today?" }
    ]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isSending, open]);

    const send = async () => {
        const text = input.trim();
        if (!text || isSending) return;
        const userMsg = { id: Date.now().toString(), role: 'user', content: text };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsSending(true);
        try {
            const payload = {
                message: text,
                history: messages.map((m) => ({ role: m.role === 'model' ? 'model' : 'user', content: m.content })),
                context: {
                    page: window?.location?.pathname || 'unknown',
                    source: 'floating-widget',
                },
                conversation_id: conversationId,
            };
            const resp = await apiRequest('/auth/ai/chat/', 'POST', payload);
            const botMsg = { id: `${Date.now()}-bot`, role: 'model', content: resp.reply || '...' };
            setMessages((prev) => [...prev, botMsg]);
            if (resp?.conversation_id && !conversationId) {
                setConversationId(resp.conversation_id);
            }
        } catch (e) {
            const errMsg = { id: `${Date.now()}-err`, role: 'model', content: `Error: ${e.message}` };
            setMessages((prev) => [...prev, errMsg]);
        } finally {
            setIsSending(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            {/* Toggle Button */}
            <Button
                variant="default"
                size="icon"
                className={`h-12 w-12 rounded-full shadow-glassmorphic ${open ? 'ring-2 ring-primary/50' : ''}`}
                onClick={() => setOpen((v) => !v)}
                aria-label="Open AI Chatbot"
            >
                <Icon name={open ? 'X' : 'MessageSquare'} size={20} />
            </Button>

            {/* Panel */}
            {open && (
                <div className="mt-3 w-[360px] max-h-[65vh] bg-muted/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-glassmorphic-lg overflow-hidden">
                    <div className="p-3 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <Icon name="Bot" size={14} color="white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">Fyndr.AI Coach</p>
                                <p className="text-[11px] text-muted-foreground">Gemini powered</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
                            <Icon name="ChevronDown" size={16} />
                        </Button>
                    </div>

                    <div className="p-3 space-y-3 overflow-y-auto" style={{ maxHeight: '45vh' }}>
                        {messages.map((m) => (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] glassmorphic-card p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-primary/20 border-primary/30 rounded-tr-md' : 'bg-white/20 border-white/20 rounded-tl-md'
                                    }`}>
                                    <div className="prose prose-invert max-w-none text-foreground">
                                        <style>{`
                                            .prose table { width: 100%; border-collapse: collapse; border: 1px solid rgba(255,255,255,0.2); }
                                            .prose thead tr { background: rgba(255,255,255,0.06); }
                                            .prose th, .prose td { border: 1px solid rgba(255,255,255,0.2); padding: 0.5rem 0.75rem; }
                                        `}</style>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isSending && (
                            <div className="flex justify-start">
                                <div className="glassmorphic-card p-3 rounded-2xl rounded-tl-md">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 border-t border-white/10">
                        <div className="flex items-end space-x-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                placeholder={isSending ? 'Thinking…' : 'Ask about resume, jobs, interviews…'}
                                disabled={isSending}
                                rows={1}
                                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <Button variant="default" size="icon" disabled={!input.trim() || isSending} onClick={send} className="h-10 w-10 rounded-xl">
                                <Icon name="Send" size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatbotWidget;
