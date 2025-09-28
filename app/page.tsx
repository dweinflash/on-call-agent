"use client";

import { useState, useRef } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageAvatar,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { SourceCitation, SourceSummary, type Source } from "@/components/ui/source-citation";
import type { UIMessage } from "ai";

interface ExtendedUIMessage extends UIMessage {
  sources?: Source[];
}

export default function Home() {
  const [messages, setMessages] = useState<ExtendedUIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (
    message: { text?: string; files?: any[] },
    event: React.FormEvent
  ) => {
    if (!message.text?.trim() || isLoading) return;

    // Clear the textarea input immediately
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }

    const userMessage: ExtendedUIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message.text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.text }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: ExtendedUIMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          sources: data.sources,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: ExtendedUIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-4xl mx-auto">
      <div className="border-b p-4">
        <h1 className="text-xl font-semibold">On-Call Incident Response Assistant</h1>
        <p className="text-sm text-gray-600 mt-1">
          Ask about system incidents, alerts, or troubleshooting procedures
        </p>
      </div>

      <Conversation className="flex-1">
        <ConversationContent className="space-y-4">
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Ready to help with incidents"
              description="Ask me about system alerts, troubleshooting steps, or incident response procedures!"
            />
          ) : (
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.content}
                  {message.role === "assistant" && (
                    <>
                      <SourceSummary sourceCount={message.sources?.length || 0} />
                      {message.sources && message.sources.length > 0 && (
                        <SourceCitation sources={message.sources} />
                      )}
                    </>
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {isLoading && (
            <Message from="assistant">
              <MessageContent>
                Thinking...
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
      </Conversation>

      <div className="p-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              ref={textareaRef}
              placeholder="Describe the incident or ask about troubleshooting procedures..."
            />
            <PromptInputToolbar>
              <div />
              <PromptInputSubmit status={isLoading ? "submitted" : undefined} />
            </PromptInputToolbar>
          </PromptInputBody>
        </PromptInput>
      </div>
    </div>
  );
}
