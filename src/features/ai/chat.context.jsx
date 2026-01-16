import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { getGeminiResponse, startChatSession } from "./gemini.service";
import { useAuth } from "../auth/auth.context";

const ChatContext = createContext();

export const useChat = () => {
    return useContext(ChatContext);
};

const INITIAL_MESSAGE = {
    _id: 1,
    text: "Hello! I'm Peace AI, your mindful companion. How are you feeling today?",
    createdAt: new Date(),
    user: {
        _id: 2,
        name: "Peace AI",
    },
};

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const { user } = useAuth();
    
    // We can use a ref to track if session is initialized if we want strict control,
    // but gemini.service handles singleton limits or we can just call it once here.
    const sessionInitialized = useRef(false);

    useEffect(() => {
        if (!sessionInitialized.current) {
            startChatSession();
            sessionInitialized.current = true;
        }
    }, []);

    const initGreeting = () => {
        if (messages.length === 0 && !isTyping) {
            setIsTyping(true);
            setTimeout(() => {
                setMessages((prev) => prev.length === 0 ? [INITIAL_MESSAGE] : prev);
                setIsTyping(false);
            }, 1800);
        }
    };

    const sendMessage = async (inputText) => {
        if (!inputText.trim()) return;

        const userMsg = {
            _id: Math.round(Math.random() * 1000000),
            text: inputText,
            createdAt: new Date(),
            user: {
                _id: 1,
                name: user ? user.name : "User",
            },
        };

        setMessages((prev) => [userMsg, ...prev]);
        setIsTyping(true);

        try {
            const responseText = await getGeminiResponse(userMsg.text);

            const aiMsg = {
                _id: Math.round(Math.random() * 1000000),
                text: responseText,
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: "Peace AI",
                },
            };
            setMessages((prev) => [aiMsg, ...prev]);
        } catch (e) {
            console.error("Chat Error:", e);
            // Optionally add an error message to chat
        } finally {
            setIsTyping(false);
        }
    };

    const value = {
        messages,
        isTyping,
        sendMessage,
        initGreeting,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
