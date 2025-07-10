import styles from "./chatapp.module.css";
import { IoChatbubbleEllipsesOutline as ChatIcon } from "react-icons/io5";
import { FaRegPaperPlane as PlaneIcon } from "react-icons/fa";
import Input from "@/components/inputs/text-input.jsx";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/button/button.jsx";
import { convertIsoStringToLocalTime } from "@/components/chatbox/chat-utils.js";
import useWithLoading from "@/hooks/useWithLoading.js";
import { submitUserMessage } from "@/routes/problem-attempt-route.js";

export default function ChatApp({ sessionId = "1", messageList = [] }) {
  const [chatHistory, setChatHistory] = useState({
    sessionId: sessionId,
    messages: messageList,
  });

  const [userMessage, setUserMessage] = useState("");
  const [isLoading, withLoading] = useWithLoading();
  const containerRef = useRef(null);

  useEffect(() => {
    const element = containerRef.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = () => {
    if (userMessage.length === 0) {
      return;
    }

    // Render first on FE
    const message = userMessage;
    setChatHistory({
      ...chatHistory,
      messages: [
        ...chatHistory.messages,
        {
          role: "user",
          content: message,
          timestamp: new Date().toISOString(),
        },
      ],
    });
    setUserMessage("");

    withLoading(
      () => submitUserMessage(sessionId, message),
      (newHistory) => setChatHistory(newHistory),
      console.error,
    );
  };

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.chatApp}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <ChatIcon size={45} />
          </div>

          <div className={styles.headerText}>
            <h2>My Client</h2>
            <p>online now</p>
          </div>

          <div className={styles.status} />
          <div className={styles.clientAvatar}>
            <img src={"/client.svg"} alt={"Client"} />
          </div>
        </div>

        <div ref={containerRef} className={styles.chatBody}>
          {/*Always skip system message*/}
          {chatHistory.messages.slice(1).map((message, idx) => (
            <ChatBubble key={idx + message.timestamp} chatMessage={message} />
          ))}
        </div>
      </div>

      <div className={styles.inputContainer}>
        <Input
          onEnter={handleSend}
          placeholder={"Ask the client a question!"}
          onChange={(e) => setUserMessage(e.target.value)}
          value={userMessage}
        />
        <Button onClick={handleSend} disabled={isLoading}>
          {!isLoading && <PlaneIcon size={18} />}
        </Button>
      </div>
    </div>
  );
}

function ChatBubble({ chatMessage }) {
  let msg;
  const time = convertIsoStringToLocalTime(chatMessage.timestamp);
  if (chatMessage.role === "assistant") {
    const responseSchema = JSON.parse(chatMessage.content);
    msg = responseSchema.message;
  } else {
    msg = chatMessage.content;
  }

  return (
    <div className={styles.bubbleContainer}>
      <div
        className={styles.chatMessage}
        style={{
          justifySelf: chatMessage.role === "assistant" ? "start" : "end",
          background:
            chatMessage.role === "assistant"
              ? "linear-gradient(to right, #BB94FF, #CA43FF)"
              : "white",
        }}
      >
        {msg}
      </div>
      <p
        className={styles.chatTimestamp}
        style={{
          padding:
            chatMessage.role === "assistant"
              ? "0.25rem 0 0 0.5rem"
              : "0.25rem 0.5rem 0 0",
          justifySelf: chatMessage.role === "assistant" ? "start" : "end",
        }}
      >
        Sent at: {time}
      </p>
    </div>
  );
}
