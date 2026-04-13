import { useState, useRef, useEffect } from 'react';
import { useChatMutation } from '@/store/api/aiTutorApi';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Sparkles, Lightbulb, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  hintLevel?: number;
  suggestedAction?: string;
}

interface AITutorPanelProps {
  courseId: string;
  conceptId: string | null;
  conceptTitle?: string;
}

export default function AITutorPanel({ courseId, conceptId, conceptTitle }: AITutorPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [chat, { isLoading }] = useChatMutation();

  useEffect(() => {
    // Reset chat when concept changes
    setMessages([]);
    setSessionId(undefined);
  }, [conceptId]);

  useEffect(() => {
    // Auto scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !conceptId || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);

    try {
      const result = await chat({
        courseId,
        conceptId: conceptId!,
        query: userMsg,
        sessionId,
      }).unwrap();

      setSessionId(result.sessionId);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.message,
          hintLevel: result.hintLevel,
          suggestedAction: result.suggestedAction,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    }
  };

  const quickPrompts = [
    { label: 'Explain this', prompt: 'Can you explain this concept in simple terms?' },
    { label: 'Give example', prompt: 'Can you give me a real-world example?' },
    { label: "Why it matters", prompt: 'Why is this concept important?' },
    { label: 'Quiz me', prompt: 'Can you quiz me on this concept?' },
  ];

  if (!conceptId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
        <Bot className="h-12 w-12 mb-3 text-primary/30" />
        <h3 className="font-medium text-sm">AI Tutor</h3>
        <p className="text-xs text-center mt-1">Select a concept to start a Socratic learning conversation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Tutor</h3>
            {conceptTitle && (
              <p className="text-xs text-muted-foreground truncate">{conceptTitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-full bg-primary/10 shrink-0">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  Hi! I'm your AI tutor. I use the <strong>Socratic method</strong> to help you deeply understand{' '}
                  <strong>{conceptTitle || 'this concept'}</strong>.
                </p>
                <p className="mt-2">Ask me anything or try one of the prompts below!</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {quickPrompts.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => {
                    setInput(qp.prompt);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn('flex items-start gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              <div
                className={cn(
                  'p-1.5 rounded-full shrink-0',
                  msg.role === 'user' ? 'bg-secondary' : 'bg-primary/10'
                )}
              >
                {msg.role === 'user' ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <Bot className="h-3.5 w-3.5 text-primary" />
                )}
              </div>
              <div
                className={cn(
                  'rounded-lg px-3 py-2 text-sm max-w-[85%]',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose dark:prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}

                {msg.hintLevel !== undefined && msg.hintLevel > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Lightbulb className="h-3 w-3" />
                    Hint level {msg.hintLevel}/4
                  </div>
                )}

                {msg.suggestedAction && (
                  <div className="mt-2 text-xs text-primary font-medium">
                    Suggested: {msg.suggestedAction}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-full bg-primary/10 shrink-0">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="ai-typing-indicator flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI tutor..."
            disabled={isLoading || !conceptId}
            className="text-sm"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
