"use client";

import React, { useCallback, useEffect, useRef } from "react";

interface Message {
  role: string;
  content: string;
}

interface ChatProps {
  message: string;
  setMessage: (message: string) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function Chat({ message, setMessage, messages, setMessages }: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!message.trim()) return;

      // Add user message
      const userMessage: Message = { role: "user", content: message };
      setMessages((prev) => [...prev, userMessage]);
      setMessage("");

      // TODO: Add API call here to get response
      // For now, just add a placeholder response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "This is a placeholder response. Connect your API here." },
        ]);
      }, 500);
    },
    [message, setMessage, setMessages]
  );

  return (
    <div className="flex flex-col bg-white h-full">
      {/* Chat Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white h-14">
        <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
        <div></div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-lg px-4">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-800 text-xl font-semibold mb-3">
                Simplify Your PDF Text
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-left bg-gray-50 rounded-lg p-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium mb-1">Select text from the PDF</p>
                    <p className="text-gray-500 text-sm">
                      Click and drag to select any text from the PDF on the left
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-left bg-gray-50 rounded-lg p-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium mb-1">Text appears automatically</p>
                    <p className="text-gray-500 text-sm">
                      The selected text will appear in the input box below
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-left bg-gray-50 rounded-lg p-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium mb-1">Click Simplify</p>
                    <p className="text-gray-500 text-sm">
                      Press the Simplify button to get an easier-to-understand version
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Or type your message directly in the input box below
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`group mb-6 ${
                  msg.role === "user" ? "flex justify-end" : "flex justify-start"
                }`}
              >
                <div className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === "user" 
                      ? "bg-blue-500" 
                      : "bg-gray-200"
                  }`}>
                    {msg.role === "user" ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-tr-sm"
                      : "bg-gray-100 text-gray-900 rounded-tl-sm"
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="relative">
            <div className="flex items-end gap-2 bg-white rounded-2xl border border-gray-300 shadow-sm hover:shadow-md transition-shadow focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Message..."
                className="flex-1 resize-none border-0 rounded-2xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 text-[15px] leading-relaxed"
                rows={3}
                style={{
                  minHeight: "80px",
                  maxHeight: "200px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                }}
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="mb-2 mr-2 p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                title="Send message"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

