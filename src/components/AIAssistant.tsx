/* eslint-disable react-hooks/immutability */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Hobby, ActivityLog } from '@/lib/storage';
import { Bot, Send, Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  isStreaming?: boolean;
}

interface AIAssistantProps {
  hobbies: Hobby[];
  logs: ActivityLog[];
  onApplyMicroGoal?: (hobbyTitle: string, microGoal: string) => void;
}

export default function AIAssistant({ hobbies, logs, onApplyMicroGoal }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Stella, your hobby planning advisor 🌟\n\nI can help you reflect on your progress, bust through decision paralysis, and plan bite-sized 5-minute goals so you never lose momentum.\n\nWhat are you working on today? Try one of the quick suggestions below, or just ask me anything!"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedReasoningIndex, setExpandedReasoningIndex] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setInputValue('');

    // 1. Add user message
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);

    // 2. Add empty assistant placeholder message
    const streamMessageIndex = newMessages.length;
    setMessages(prev => [...prev, { role: 'assistant', content: '', reasoning: '', isStreaming: true }]);
    
    // Automatically expand the reasoning block of the streaming message
    setExpandedReasoningIndex(streamMessageIndex);

    try {
      // 3. Post to API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userMessage: text,
          hobbiesContext: hobbies,
          logsContext: logs
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to contact AI Assistant: ${response.statusText}`);
      }

      // 4. Stream response using SSE reader
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      // Use a mutable accumulator object to avoid react-hooks/immutability lint error
      const acc = { content: '', reasoning: '' };

      if (!reader) {
        throw new Error("Unable to read response stream.");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') continue;

            try {
              const dataObj = JSON.parse(dataStr);
              // Check if OpenRouter format or simulator format
              const delta = dataObj.choices?.[0]?.delta;
              if (delta) {
                if (delta.reasoning_content) {
                  acc.reasoning += delta.reasoning_content;
                }
                if (delta.content) {
                  acc.content += delta.content;
                }

                // Update the messages list
                setMessages(prev => {
                  const updated = [...prev];
                  updated[streamMessageIndex] = {
                    role: 'assistant',
                    content: acc.content,
                    reasoning: acc.reasoning,
                    isStreaming: true
                  };
                  return updated;
                });
              }
            } catch {
              // Ignore lines that are partial JSON or metadata
            }
          }
        }
      }

      // Finalize message state
      setMessages(prev => {
        const updated = [...prev];
        updated[streamMessageIndex] = {
          role: 'assistant',
          content: acc.content,
          reasoning: acc.reasoning,
          isStreaming: false
        };
        return updated;
      });

    } catch (error: unknown) {
      console.error(error);
      const errMsg = error instanceof Error ? error.message : String(error);
      setMessages(prev => {
        const updated = [...prev];
        updated[streamMessageIndex] = {
          role: 'assistant',
          content: `⚠️ Error loading assistant: ${errMsg}. Please verify your API Key setting or check your connection.`,
          isStreaming: false
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  // Helper to extract micro-goal from AI output text for the "Apply" feature
  const handleApplyClick = (text: string) => {
    if (!onApplyMicroGoal) return;

    // Match the text against actual hobby titles from the user's real hobby list
    const lowerText = text.toLowerCase();
    const matchedHobby = hobbies.find(h =>
      lowerText.includes(h.title.toLowerCase()) ||
      lowerText.includes(h.category.toLowerCase())
    ) || hobbies.find(h => h.is_daily_focus) || hobbies[0];

    if (matchedHobby) {
      // Try to extract a micro-goal sentence from the AI response
      const goalMatch = text.match(/["\u201c]([^"\u201d]{10,})["\u201d]/); // quoted strings
      const extractedGoal = goalMatch ? goalMatch[1] : matchedHobby.micro_goal || 'Complete the AI suggested step.';
      onApplyMicroGoal(matchedHobby.title, extractedGoal);
      alert(`Applied suggestion to "${matchedHobby.title}":\n"${extractedGoal}"`);
    }
  };

  // Build dynamic quick-suggestions based on user's real data
  const dailyFocusHobbies = hobbies.filter(h => h.is_daily_focus);
  const firstHobby = dailyFocusHobbies[0] || hobbies[0];

  const suggestions = [
    {
      label: "What to focus today?",
      query: dailyFocusHobbies.length > 0
        ? `My daily focus is ${dailyFocusHobbies.map(h => h.title).join(' and ')}. What should I work on first and how?`
        : "I'm not sure what to work on today. Which of my hobbies should I focus on and why?"
    },
    {
      label: "Review my progress",
      query: hobbies.length > 0
        ? `Can you review my progress across all my hobbies and tell me which ones need more attention?`
        : "I haven't added any hobbies yet. What's a good way to get started?"
    },
    {
      label: "Generate micro-goal",
      query: firstHobby
        ? `Help me create a 5-minute micro-goal for ${firstHobby.title}. My current state: "${firstHobby.last_brain_dump}".`
        : "Help me create a micro-goal for one of my hobbies."
    }
  ];

  return (
    <div className="flex flex-col h-[520px] rounded-3xl border border-season-border bg-season-card shadow-md overflow-hidden glass-panel relative">
      {/* Title Header */}
      <div className="p-4 border-b border-season-border bg-season-bg/30 flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-season-accent/15 text-season-accent">
          <Bot className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="font-bold text-xs text-season-text flex items-center gap-1.5">
            Stella
            <span className="text-[9px] font-bold text-season-accent bg-season-accent-light/40 border border-season-accent/10 px-1 rounded-sm">BETA</span>
          </h3>
          <p className="text-[10px] text-season-muted font-medium">Your hobby planning advisor</p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isAssistant = msg.role === 'assistant';
          const showReasoning = isAssistant && msg.reasoning;
          const isReasoningOpen = expandedReasoningIndex === idx;

          return (
            <div key={idx} className={`flex items-start gap-2.5 ${!isAssistant ? 'justify-end' : ''}`}>
              {/* Bot Icon */}
              {isAssistant && (
                <div className="p-2 rounded-xl bg-season-bg border border-season-border text-season-accent flex-shrink-0 mt-0.5 shadow-xs">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}

              {/* Message Bubble */}
              <div className="max-w-[85%] space-y-2">
                {/* Reasoning Accordion (Strips and renders separately) */}
                {showReasoning && (
                  <div className="rounded-xl border border-dashed border-season-border bg-season-bg/40 overflow-hidden text-[10px] font-semibold text-season-muted">
                    <button
                      type="button"
                      onClick={() => setExpandedReasoningIndex(isReasoningOpen ? null : idx)}
                      className="w-full px-3 py-2 flex items-center justify-between hover:bg-season-bg/60 transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-season-accent animate-pulse" />
                        AI Reasoning Steps
                      </span>
                      {isReasoningOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    
                    {isReasoningOpen && (
                      <div className="px-3 pb-2.5 pt-1 border-t border-dashed border-season-border/50 font-mono whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto bg-season-card/30">
                        {msg.reasoning}
                        {msg.isStreaming && !msg.content && (
                          <span className="inline-block w-1.5 h-3 bg-season-accent animate-pulse ml-0.5" />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Final Content bubble */}
                {(msg.content || !msg.reasoning) && (
                  <div className={`
                    p-3.5 rounded-2xl text-xs font-semibold leading-relaxed whitespace-pre-line border
                    ${isAssistant 
                      ? 'bg-season-card border-season-border text-season-text' 
                      : 'bg-season-accent/10 border-season-accent/20 text-season-text'
                    }
                  `}>
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="inline-block w-1 h-3 bg-season-accent animate-pulse ml-1" />
                    )}
                    
                    {/* Inline action to apply micro goal if suggestions were generated */}
                    {isAssistant && !msg.isStreaming && idx > 0 && onApplyMicroGoal && (
                      <button
                        onClick={() => handleApplyClick(msg.content)}
                        className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-season-accent border border-season-accent/30 hover:bg-season-accent/15 px-2 py-1 rounded-lg bg-season-accent-light/20 transition-all cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" />
                        Apply suggestion as micro-goal
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions row */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-season-border/50 bg-season-bg/20">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(s.query)}
              className="text-[10px] font-bold text-season-muted border border-season-border hover:border-season-accent hover:text-season-accent bg-season-card px-2.5 py-1.5 rounded-full transition-all cursor-pointer shadow-xs"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleFormSubmit} className="p-3 border-t border-season-border bg-season-bg/25 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isLoading ? "Stella is thinking..." : "Ask Stella about your hobbies..."}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-2xl border border-season-border bg-season-card text-xs font-semibold focus:outline-hidden focus:border-season-accent disabled:opacity-50 text-season-text"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="p-2.5 rounded-2xl bg-season-accent text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-season-accent/20 cursor-pointer"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
}
