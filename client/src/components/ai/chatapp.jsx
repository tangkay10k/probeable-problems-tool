import styles from "./ai.module.css";
import { FaRegPaperPlane as PlaneIcon } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/button/button.jsx";
import { convertIsoStringToLocalTime } from "@/components/ai/chat-utils.js";
import useWithLoading from "@/hooks/useWithLoading.js";
import {
  replaceAssistantMessage,
  replaceWithOutputResponse,
  submitUserMessage,
} from "@/routes/problem-attempt-route.js";
import { useProblemAttemptContext } from "@/context/problem-attempt-context.js";
import Banner from "@/components/banner/banner.jsx";
import { useUserProfile } from "@/context/user-context.jsx";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { executeChatTestCaseSilently } from "@/routes/code-route.js";
import TextArea from "@/components/inputs/text-area.jsx";
import { useLogging } from "@/context/logging-context-provider.jsx";
import { Action, Component } from "@/constants/logConstants.js";
import { getRandomRateLimitText } from "@/utils/piston-utils.js";

const CLIENT_AVATAR = "/client.png";
const USER_FALLBACK_AVATAR = "/default-avatar.jpg";

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
  const { addLog } = useLogging();
  const containerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const TYPING_DEBOUNCE_MS = 2000;

  useEffect(() => {
    const el = containerRef.current;
    if (el && el.scrollHeight > el.clientHeight) {
      // only scroll if content is taller than container
      el.scrollTop = el.scrollHeight;
    }
  }, [chatHistory]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserMessage(value);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      addLog({
        component: Component.CHAT_APP,
        action: Action.TYPED,
        content: value,
      });
    }, TYPING_DEBOUNCE_MS);
  };

  const handleSend = () => {
    if (!userMessage || userMessage.trim().length === 0) return;
    if (isLoading) return;

    const message = userMessage;
    setChatHistory({
      ...chatHistory,
      messages: [
        ...chatHistory.messages,
        {
          role: "user",
          content: {
            message,
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });
    setUserMessage("");

    withLoading(
      async () => {
        let newHistory = await submitUserMessage(
          chatHistory.sessionId,
          problemAttempt.id,
          message,
        );

        const newMessages = newHistory.messages;
        const content = newMessages[newMessages.length - 1].content;

        if (!content.test_case) {
          return newHistory;
        }

        const res = await executeChatTestCaseSilently(
          problemAttempt?.problemLanguage,
          executeTemplate.template,
          content.test_case,
          problem.modelAnswer,
        );

        if (res.status === 429) {
          // If we get rate limited.
          return clientTemporarilyUnavailable();
        }

        const execRes = res.data;
        if (!validateTestExecuted(execRes)) {
          return clientTemporarilyUnavailable();
        }

        const output = execRes.run.output;
        const userQuestion =
          newMessages[newMessages.length - 2].content.message;

        return await replaceWithOutputResponse(
          chatHistory.sessionId,
          userQuestion,
          newMessages[newMessages.length - 1].content,
          output,
          content.test_case,
          problem.functionName,
        );
      },
      (newHistory) => {
        setChatHistory(newHistory);

        const messages = newHistory.messages;

        addLog({
          component: Component.CHAT_APP,
          action: Action.SEND,
          input: messages[messages.length - 2].content.message,
          output: messages[messages.length - 1].content.message,
        });
      },
      console.error,
    );
  };

  function validateTestExecuted(execution) {
    return !(execution.compile.code !== 0 || execution.run.code !== 0);
  }

  async function clientTemporarilyUnavailable() {
    return await replaceAssistantMessage(chatHistory.sessionId, {
      content: {
        message: getRandomRateLimitText(),
      },
    });
  }

  const rightIcon = (
    <>
      <div className={styles.status} />
      <div className={styles.clientAvatar}>
        <img src={CLIENT_AVATAR} alt={"Client"} />
      </div>
    </>
  );

  return (
    <div className={styles.chatWrapper}>
      <Banner
        header={"My Client"}
        subtext={"online now"}
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
          <TextArea
            rows={1}
            resizable={false}
            disabled={isLoading}
            onEnter={handleSend}
            placeholder={"Ask the client a question!"}
            onChange={handleInputChange}
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
  const userImage = profile?.userImage || USER_FALLBACK_AVATAR;
  const isAssistant = chatMessage.role === "assistant";

  const time = convertIsoStringToLocalTime(chatMessage.timestamp);

  const responseSchema = chatMessage.content;
  const message = responseSchema.message;
  const testCase = responseSchema.test_case;
  const msg = testCase
    ? `${message}
        ${testCase}`
    : message;

  return (
    <div className={styles.bubbleContainer}>
      {isAssistant && (
        <div className={styles.avatarContainer}>
          <img src={CLIENT_AVATAR} alt="Client"></img>
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
          <img src={userImage} referrerPolicy="no-referrer" alt="You"></img>
        </div>
      )}
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className={styles.bubbleContainer}>
      <div className={styles.avatarContainer}>
        <img src={CLIENT_AVATAR} alt="Client Logo" />
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
