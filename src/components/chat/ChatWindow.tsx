
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { MessageCircle, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
}

const ChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const sessionId = useRef(uuidv4())

  // Fetch chat history for authenticated users
  useEffect(() => {
    const fetchMessages = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Error fetching messages:', error)
          return
        }

        // Ensure the role is correctly typed
        const typedMessages = data.map(msg => ({
          ...msg,
          role: msg.role as 'user' | 'assistant'
        }))

        setMessages(typedMessages)
      }
    }

    if (isOpen) {
      fetchMessages()
    }
  }, [user, isOpen])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: uuidv4(),
      content: input,
      role: 'user' as const,
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Save user message
      await supabase.from('chat_messages').insert({
        content: userMessage.content,
        role: userMessage.role,
        user_id: user?.id || null,
        session_id: user ? null : sessionId.current,
      })

      // Get AI response
      const response = await supabase.functions.invoke('chat', {
        body: { 
          messages: messages.concat(userMessage).map(m => ({ 
            role: m.role, 
            content: m.content 
          })),
          userId: user?.id,
          sessionId: user ? null : sessionId.current,
        },
      })

      if (response.error) throw new Error(response.error.message)

      const assistantMessage = {
        id: uuidv4(),
        content: response.data.reply,
        role: 'assistant' as const,
        created_at: new Date().toISOString(),
      }

      // Save assistant message
      await supabase.from('chat_messages').insert({
        content: assistantMessage.content,
        role: assistantMessage.role,
        user_id: user?.id || null,
        session_id: user ? null : sessionId.current,
      })

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full p-4 shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-10 w-10" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 sm:w-96 h-[500px] flex flex-col shadow-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">RewardHub Chat</h3>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground text-sm">
              👋 Hi! How can I help you today?
            </p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ChatWindow;
