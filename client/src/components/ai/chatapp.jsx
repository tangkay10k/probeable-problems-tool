import styles from "./ai.module.css";
import { IoChatbubbleEllipsesOutline as ChatIcon } from "react-icons/io5";
import { FaRegPaperPlane as PlaneIcon } from "react-icons/fa";
import Input from "@/components/inputs/text-input.jsx";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/button/button.jsx";
import { convertIsoStringToLocalTime } from "@/components/ai/chat-utils.js";
import useWithLoading from "@/hooks/useWithLoading.js";
import {
  submitUserMessage,
  replaceWithOutputReponse,
} from "@/routes/problem-attempt-route.js";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import Banner from "@/components/banner/banner.jsx";
import { useUserProfile } from "@/context/user-context.jsx";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { executeOraclePistonDirect } from "@/routes/code-route.js";

export default function ChatApp() {
  const {
    chatHistory,
    setChatHistory,
    executeTemplate,
    problemAttempt,
    problem,
  } = useProblemAttemptContext();
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
      async () => {
        let newHistory = await submitUserMessage(
          chatHistory.sessionId,
          message,
        );

        const newMessages = newHistory.messages;
        const content = JSON.parse(newMessages[newMessages.length - 1].content);

        if (content.asked_expected_output && content.test_case) {
          const executionResult = await executeOraclePistonDirect(
            problemAttempt?.problemLanguage,
            executeTemplate.template,
            content.test_case,
            problem.modelAnswer,
          );
          const output = executionResult.run.output;

          newHistory = await replaceWithOutputReponse(
            chatHistory.sessionId,
            output,
          );
        }

        return newHistory;
      },
      (newHistory) => setChatHistory(newHistory),
      console.error,
    );
  };

  const leftIcon = (
    <div className={styles.icon}>
      <ChatIcon size={35} color={"white"} />
    </div>
  );

  const rightIcon = (
    <>
      <div className={styles.status} />
      <div className={styles.clientAvatar}>
        <img src={"/default-avatar.jpg"} alt={"Client"} />
      </div>
    </>
  );

  return (
    <div className={styles.chatWrapper}>
      <Banner
        header={"My Client"}
        subtext={"online now"}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
      />

      <div className={styles.chatApp}>
        <div ref={containerRef} className={styles.chatBody}>
          {/*Always skip system message*/}
          {chatHistory.messages?.slice(1).map((message, idx) => (
            <ChatBubble key={idx + message.timestamp} chatMessage={message} />
          ))}

          {isLoading && <LoadingBubble />}
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
    </div>
  );
}

function ChatBubble({ chatMessage }) {
  const { profile } = useUserProfile();
  const userImage = profile?.userImage || "/default-avatar.jpg";
  const isAssistant = chatMessage.role === "assistant";
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
      {isAssistant && (
        <div className={styles.avatarContainer}>
          <img src={"/default-avatar.jpg"} alt="Client Logo"></img>
        </div>
      )}

      <section className={styles.chatBubble}>
        <div
          className={`${styles.chatMessage} ${isAssistant ? styles.assistant : styles.user}`}
        >
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{msg}</ReactMarkdown>
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
      </section>

      {!isAssistant && (
        <div className={styles.avatarContainer}>
          <img src={userImage} alt="Client Logo"></img>
        </div>
      )}
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className={styles.bubbleContainer}>
      <div className={styles.avatarContainer}>
        <img src={"/default-avatar.jpg"} alt="Client Logo" />
      </div>

      <section className={styles.chatBubble}>
        <div className={`${styles.chatMessage} ${styles.assistant}`}>
          <div className={styles.typing}>
            <span />
            <span />
            <span />
          </div>
        </div>

        <p
          className={styles.chatTimestamp}
          style={{
            padding: "0.25rem 0 0 0.5rem",
            justifySelf: "start",
          }}
        >
          Client is typing…
        </p>
      </section>
    </div>
  );
}
