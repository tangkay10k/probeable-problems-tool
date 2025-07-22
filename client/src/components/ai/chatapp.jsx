import styles from "./ai.module.css";
import { IoChatbubbleEllipsesOutline as ChatIcon } from "react-icons/io5";
import { FaRegPaperPlane as PlaneIcon } from "react-icons/fa";
import Input from "@/components/inputs/text-input.jsx";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/button/button.jsx";
import { convertIsoStringToLocalTime } from "@/components/ai/chat-utils.js";
import useWithLoading from "@/hooks/useWithLoading.js";
import { submitUserMessage } from "@/routes/problem-attempt-route.js";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import Banner from "@/components/banner/banner.jsx";

export default function ChatApp() {
  const { chatHistory, setChatHistory } = useProblemAttemptContext();
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, withLoading] = useWithLoading();
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el && el.scrollHeight > el.clientHeight) {
      // only scroll if content is taller than container
      el.scrollTop = el.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = () => {
    if (!userMessage) return;

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
      () => submitUserMessage(chatHistory.sessionId, message),
      (newHistory) => setChatHistory(newHistory),
      console.error,
    );
  };

  const leftIcon = (
    <div className={styles.icon}>
      <ChatIcon size={35} />
    </div>
  );

  const rightIcon = (
    <>
      <div className={styles.status} />
      <div className={styles.clientAvatar}>
        <img src={"/client.svg"} alt={"Client"} />
      </div>
    </>
  );

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.chatApp}>
        <Banner
          header={"My Client"}
          subtext={"online now"}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
        />

        <div ref={containerRef} className={styles.chatBody}>
          {/*Always skip system message*/}
          {chatHistory.messages?.slice(1).map((message, idx) => (
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
          <PlaneIcon size={18} />
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
        className={`${styles.chatMessage} ${chatMessage.role === "assistant" ? styles.assistant : styles.user}`}
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
