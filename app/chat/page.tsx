// "use client";

// import type React from "react";

// import { useState } from "react";
// import { useChat } from "@ai-sdk/react";
// import { NavBar } from "@/components/nav-bar";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { readStreamableValue } from 'ai/rsc';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Send, Bot, User } from "lucide-react";
// import { useAuth } from "@/contexts/auth-context";

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

// export default function ChatPage() {
//   const { user } = useAuth();
//   const {
//     messages,
//     input,
//     handleInputChange,
//     handleSubmit,
//     isLoading,
//     status,
//   } = useChat({});
//   const [error, setError] = useState("");
//   // const [generation, setGeneration] = useState<string>('');
//   const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError("");

//     if (!input.trim()) {
//       setError("Please enter a message");
//       return;
//     }

//     if (input.length > 500) {
//       setError("Message is too long (maximum 500 characters)");
//       return;
//     }

//     handleSubmit(e);
//   };

//   return (
//     <main className="flex min-h-screen flex-col">
//       {/* <NavBar /> */}

//       <div className="flex-1 p-4 md:p-8">
//         <div className="max-w-3xl mx-auto">
//           <h1 className="text-2xl font-bold mb-2">MediBot Chat Assistant</h1>
//           <p className="text-muted-foreground mb-6">
//             Ask questions about medications, their uses, side effects, and
//             general health advice.
//           </p>

//           <Card className="mb-4">
//             <CardHeader className="pb-2 ">
//               <CardTitle>Important Information</CardTitle>
//               <CardDescription>
//                 MediBot provides general information only and is not a
//                 substitute for professional medical advice.
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ul className="list-disc pl-5 space-y-1 text-sm">
//                 <li>
//                   Always consult a healthcare professional for medical advice
//                 </li>
//                 <li>
//                   In case of emergency, call emergency services immediately
//                 </li>
//                 <li>Information provided may not be complete or up-to-date</li>
//               </ul>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="p-4">
//               <div className="h-[50vh] overflow-y-auto mb-4 space-y-4 p-1">
//                 {messages.length === 0 ? (
//                   <div className="text-center text-muted-foreground py-8">
//                     <Bot className="mx-auto h-12 w-12 mb-2 opacity-50" />
//                     {
//                       user?.name && <p>Hi { user.name}</p>
//                     }

//                     <p>How can I help you today?</p>
//                     <div className="mt-4  grid grid-cols-1  md:grid-cols-2 gap-2   mx-auto">
//                       {[
//                         "What are the side effects of paracetamol?",
//                         "How should I store my medications?",
//                         "What is the difference between generic and brand medications?",
//                         "How do I know if my medicine has expired?",
//                       ].map((suggestion) => (
//                         <Button
//                           key={suggestion}
//                           variant="outline"
//                           className="text-sm h-fit cursor-pointer break-words whitespace-normal  py-2 justify-start"
//                           onClick={() => {
//                             handleInputChange({
//                               target: { value: suggestion },
//                             } as any);
//                             setTimeout(() => {
//                               const form = document.getElementById("chat-form");
//                               if (form)
//                                 (form as HTMLFormElement).requestSubmit();
//                             }, 100);
//                           }}
//                         >
//                           {suggestion}
//                         </Button>
//                       ))}
//                     </div>
//                   </div>
//                 ) : (
//                   messages.map((message) => (
//                     <div
//                       key={message.id}
//                       className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
//                     >
//                       <div
//                         className={`rounded-lg px-4 py-2 max-w-[80%] flex items-start gap-3 ${
//                           message.role === "user"
//                             ? "bg-primary text-primary-foreground"
//                             : "bg-muted"
//                         }`}
//                       >
//                         {message.role !== "user" && (
//                           <Bot className="h-5 w-5 mt-1 flex-shrink-0" />
//                         )}
//                         <div className="overflow-hidden">
//                           <p className="whitespace-pre-wrap break-words">
//                             {message.content}
//                           </p>
//                         </div>
//                         {message.role === "user" && (
//                           <User className="h-5 w-5 mt-1 flex-shrink-0" />
//                         )}
//                       </div>
//                     </div>
//                   ))
//                 )}
//                 {status === "streaming" && (
//                   <div className="flex justify-start">
//                     <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted flex items-center gap-2">
//                       <Bot className="h-5 w-5" />
//                       <div className="flex space-x-1">
//                         <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
//                         <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
//                         <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <form id="chat-form" onSubmit={onSubmit} className="relative">
//                 <Input
//                   value={input}
//                   onChange={handleInputChange}
//                   placeholder="Type your message..."
//                   className="pr-12"
//                   disabled={status === "streaming"}
//                 />
//                 <Button
//                   type="submit"
//                   size="icon"
//                   className="absolute cursor-pointer right-1 top-1 h-8 w-8"
//                   disabled={status === "streaming"}
//                 >
//                   <Send className="h-4 w-4"  />
//                 </Button>
//                 {error && (
//                   <p className="text-destructive text-xs mt-1">{error}</p>
//                 )}
//                 <p className="text-xs text-muted-foreground mt-2">
//                   {500 - input.length} characters remaining
//                 </p>
//               </form>
//             </CardContent>
//             <CardFooter className="border-t px-4 py-3 text-xs text-muted-foreground">
//               {user
//                 ? "Your chat history will be saved"
//                 : "Sign in to save your chat history"}
//             </CardFooter>
//           </Card>
//         </div>
//       </div>
//     </main>
//   );
// }

"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';


type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export default function ChatPage() {
  const ScrollArea = dynamic(
  () => import('@/components/ui/scroll-area').then((mod) => mod.ScrollArea),
  { ssr: false }
);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to MediBot! I'm here to help you with medicine information, health questions, and guide you through using MediFind Ghana. What would you like to know?",
      timestamp: new Date(0).toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages
            .map((msg) => ({
              role: msg.role,
              content: msg.content,
            }))
            .concat([{ role: "user", content: userMessage.content }]),
          context: "User is on MediFind Ghana chat page",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm sorry, I'm having trouble responding right now. Please try again later or contact our support team.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "How do I search for medicines?",
    "What should I do if a medicine is out of stock?",
    "How can pharmacies register on the platform?",
    "What are common side effects of paracetamol?",
    "How do I report medicine availability?",
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold">MediBot</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your AI assistant for medicine information and health guidance. Ask
            me anything about medicines, health topics, or how to use MediFind
            Ghana.
          </p>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat with MediBot
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
              <div className="space-y-6 py-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-4",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-3",
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      )}
                    >
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                      {/* <div
                        className={cn(
                          "text-xs mt-2 opacity-70",
                          message.role === "user"
                            ? "text-blue-100"
                            : "text-gray-500"
                        )}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div> */}
                      <div
                        className={cn(
                          "text-xs mt-2 opacity-70",
                          message.role === "user"
                            ? "text-blue-100"
                            : "text-gray-500"
                        )}
                      >
                        {typeof window !== "undefined"
                          ? new Date(message.timestamp).toLocaleTimeString()
                          : new Date(message.timestamp).toISOString()}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 text-gray-700 rounded-lg px-4 py-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      MediBot is thinking...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {messages.length === 1 && (
              <div className="px-6 pb-4">
                <div className="text-sm text-gray-600 mb-3">
                  Quick questions to get started:
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickQuestion(question)}
                      className="text-xs"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t p-6">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about medicines, health, or our platform..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
