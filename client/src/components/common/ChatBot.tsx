import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, User, Bot, Sparkles, Heart, Leaf, Star } from "lucide-react";
import { io, Socket } from "socket.io-client";
import type { RootState } from "@/store/store";
import ReactMarkdown from "react-markdown";

let socket: Socket;

type BotMessage = {
  id: string;
  from: "bot";
  text: string;
  source: "gemini" | "fallback";
  timestamp: Date;
};

type UserMessage = {
  id: string;
  from: "user";
  text: string;
  timestamp: Date;
};

type ChatMessage = UserMessage | BotMessage;

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

const Chatbot = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      from: "bot",
      text: "Welcome to StriveX! I'm here to help with your fitness, nutrition, and wellness journey. How can I assist you today?",
      source: "gemini",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentTheme, setCurrentTheme] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const client = useSelector((state: RootState) => state.client.client);
  const clientId = client?.clientId;
  const userProfileImage = client?.profileImage;

  const themes = [
    {
      name: "workout",
      primary: "#7c3aed",
      secondary: "#a78bfa",
      bg: "#ddd6fe",
      accent: "#4c1d95",
      light: "#f3f0ff",
    },
    {
      name: "diet",
      primary: "#e11d48",
      secondary: "#fb7185",
      bg: "#fecdd3",
      accent: "#9f1239",
      light: "#fff7f7",
    },
    {
      name: "mindfulness",
      primary: "#0ea5e9",
      secondary: "#7dd3fc",
      bg: "#e0f2fe",
      accent: "#0369a1",
      light: "#f0f9ff",
    },
  ];

  const themeData = themes[currentTheme];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    socket = io("https://api.strivex.rimshan.in"); 

    socket.on("connect", () => {
      console.log("Connected to Chatbot");
    });

    socket.on("response", (response: { message: string; source: "gemini" | "fallback" }) => {
      setIsTyping(false);
      const botMessage: BotMessage = {
        id: Date.now().toString(),
        from: "bot",
        text: response.message,
        source: response.source,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, botMessage]);
    });

    const newParticles = Array(8)
      .fill(null)
      .map((_, index) => ({
        id: index,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 2,
      }));
    setParticles(newParticles);

    const themeInterval = setInterval(() => {
      setCurrentTheme((prev) => (prev + 1) % themes.length);
    }, 4000);

    return () => {
      socket.disconnect();
      clearInterval(themeInterval);
    };
  }, []);

  const handleChatSubmit = (e: React.FormEvent | React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!chatInput.trim() || !clientId) return;

    const userMessage: UserMessage = {
      id: Date.now().toString(),
      from: "user",
      text: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    socket.emit("message", { doubt: chatInput, clientId });
    setChatInput("");
  };

  const floatingButtonVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      boxShadow: `0 8px 25px ${themeData.primary}40`,
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      boxShadow: `0 12px 35px ${themeData.primary}60`,
    },
    tap: { scale: 0.95 },
  };

  const chatVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      rotateX: -15,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      rotateX: 15,
      transition: {
        duration: 0.2,
      },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  return (
    <>
      <motion.button
        variants={floatingButtonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full text-white font-semibold z-50 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${themeData.primary}, ${themeData.secondary})`,
        }}
        aria-label="Open chat"
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: `linear-gradient(135deg, ${themeData.secondary}, ${themeData.primary})` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: themeData.primary }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="relative z-10 flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          <Sparkles className="h-4 w-4" />
        </div>
      </motion.button>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-6 right-6 w-[calc(100vw-3rem)] max-w-sm md:w-96 h-[75vh] md:h-[32rem] rounded-2xl shadow-2xl border-0 overflow-hidden z-50 flex flex-col"
            style={{
              background: `linear-gradient(135deg, ${themeData.light}, white)`,
              backdropFilter: "blur(20px)",
              border: `1px solid ${themeData.bg}`,
            }}
            role="dialog"
            aria-label="Chat with StriveX AI"
          >
            <div
              className="p-4 text-white relative overflow-hidden flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${themeData.primary}, ${themeData.secondary})` }}
            >
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute rounded-full bg-white opacity-20"
                  style={{
                    width: particle.size,
                    height: particle.size,
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                  }}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.1, 0.3, 0.1],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 2,
                    repeat: Infinity,
                    delay: particle.delay,
                    ease: "easeInOut",
                  }}
                />
              ))}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: themeData.accent }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Bot className="h-5 w-5 relative z-10" />
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: themeData.secondary }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg">StriveX AI</h3>
                    <div className="flex items-center gap-1">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-green-400"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <p className="text-sm opacity-90">Always here for you</p>
                    </div>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              {[Heart, Leaf, Star].map((Icon, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 text-white opacity-60"
                  style={{
                    top: "50%",
                    left: "25%",
                  }}
                  animate={{
                    x: Math.sin((i * 120 * Math.PI) / 180) * 30,
                    y: Math.cos((i * 120 * Math.PI) / 180) * 15,
                    rotate: 360,
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: "linear",
                  }}
                >
                  <Icon size={16} />
                </motion.div>
              ))}
            </div>

           <div
  className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar"
  style={{
    background: `linear-gradient(to bottom, ${themeData.light}40, white)`,
  }}
>
  <AnimatePresence mode="popLayout">
    {chatMessages.map((message, index) => (
      <motion.div
        key={message.id}
        variants={messageVariants}
        initial="hidden"
        animate="visible"
        layout
        className={`flex gap-3 ${message.from === "user" ? "justify-end" : "justify-start"}`}
      >
        {message.from === "bot" && (
          <motion.div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden"
            style={{ backgroundColor: themeData.bg }}
            whileHover={{ scale: 1.1 }}
          >
            <Bot className="h-4 w-4" style={{ color: themeData.primary }} />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: themeData.secondary }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.1,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}
        <motion.div
          className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm relative overflow-hidden ${
            message.from === "user" ? "text-white rounded-br-md" : "text-gray-800 rounded-bl-md border-0"
          }`}
          style={{
            background:
              message.from === "user"
                ? `linear-gradient(135deg, ${themeData.primary}, ${themeData.secondary})`
                : `linear-gradient(135deg, white, ${themeData.light}60)`,
            backdropFilter: "blur(10px)",
            border: message.from === "bot" ? `1px solid ${themeData.bg}` : "none",
          }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Updated rendering for bot messages using ReactMarkdown */}
          {message.from === "bot" ? (
            
            <ReactMarkdown children={message.text} />
          ) : (
            <p className="break-words relative z-10">{message.text}</p>
          )}
          {message.from === "bot" && "source" in message && (
            <motion.div
              className="mt-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  message.source === "gemini" ? "text-blue-700" : "text-amber-700"
                }`}
                style={{
                  backgroundColor: message.source === "gemini" ? "#dbeafe" : "#fef3c7",
                }}
              >
                {message.source === "gemini" ? "🤖 AI Powered" : "⚡ Quick Response"}
              </span>
            </motion.div>
          )}
          {message.from === "user" && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${themeData.secondary}, ${themeData.primary})`,
              }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>
        {message.from === "user" && (
          <motion.div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden relative"
            style={{ backgroundColor: themeData.bg }}
            whileHover={{ scale: 1.1 }}
          >
            {userProfileImage ? (
              <img src={userProfileImage} alt="User" className="w-full h-full object-cover" />
            ) : (
              <User className="h-4 w-4" style={{ color: themeData.primary }} />
            )}
          </motion.div>
        )}
      </motion.div>
    ))}
    {isTyping && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex gap-3 justify-start"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: themeData.bg }}
        >
          <Bot className="h-4 w-4" style={{ color: themeData.primary }} />
        </div>
        <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ backgroundColor: themeData.light }}>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: themeData.secondary }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
  <div ref={messagesEndRef} />
</div>

            <form
              onSubmit={handleChatSubmit}
              className="p-4 border-t-0 relative flex-shrink-0"
              style={{
                background: `linear-gradient(to top, white, ${themeData.light}40)`,
                borderTop: `1px solid ${themeData.bg}`,
              }}
            >
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    id="chatInput"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChatSubmit(e)}
                    placeholder="Share your fitness goals..."
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 pr-12"
                    style={{
                      backgroundColor: themeData.light,
                      border: `2px solid ${themeData.bg}`,
                      color: themeData.accent,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = themeData.primary;
                      e.target.style.boxShadow = `0 0 0 3px ${themeData.primary}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = themeData.bg;
                      e.target.style.boxShadow = "none";
                    }}
                    autoComplete="off"
                    aria-label="Type your message"
                  />
                  <motion.div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-4 w-4" style={{ color: themeData.secondary }} />
                  </motion.div>
                </div>
                <motion.button
                  type="submit"
                  disabled={!chatInput.trim() || !clientId}
                  className="p-3 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${themeData.primary}, ${themeData.secondary})`,
                  }}
                  whileHover={{
                    scale: chatInput.trim() && clientId ? 1.05 : 1,
                    boxShadow: `0 8px 25px ${themeData.primary}40`,
                  }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4 relative z-10" />
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${themeData.secondary}, ${themeData.primary})`,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;