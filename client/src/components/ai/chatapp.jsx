import styles from "./ai.module.css";
import { FaRegPaperPlane as PlaneIcon } from "react-icons/fa";
import { useRef, useState } from "react";
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
import { handleBuggyProbeExecution } from "@/pages/question-setup/utils/buggy-solutions-setup-utils";
import { saveEquivalenceClass } from "@/routes/problem-attempt-route";

import useStickToBottom from "@/hooks/useStickToBottom.js";
import { AnimatePresence, motion } from "framer-motion";
import { NATURAL_LANGUAGE } from "@/constants/problem-constants";

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
  const endRef = useRef(null); // sentinel at bottom
  const typingTimerRef = useRef(null);
  const pendingIdRef = useRef(null); // stable key for pending→real
  const TYPING_DEBOUNCE_MS = 2000;

  const scrollToBottom = useStickToBottom(
    containerRef,
    endRef,
    [chatHistory?.messages?.length], // fire on real appends
    { threshold: 96, forceOnMount: true },
  );

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

  function makePendingAssistant() {
    const id = `pending-${Date.now()}`;
    pendingIdRef.current = id;
    return {
      id,
      role: "assistant",
      pending: true,
      content: { message: "" }, // rendered as typing bubble
      timestamp: new Date().toISOString(),
    };
  }

  const handleSend = () => {
    if (!userMessage || userMessage.trim().length === 0) return;
    if (isLoading) return;

    const message = userMessage;
    setUserMessage("");

    // Optimistic user + pending assistant
    const userMsg = {
      role: "user",
      content: { message },
      timestamp: new Date().toISOString(),
    };
    const pendingAssistant = makePendingAssistant();

    setChatHistory({
      ...chatHistory,
      messages: [...chatHistory.messages, userMsg, pendingAssistant],
    });

    // snap to bottom immediately after user hits enter.
    requestAnimationFrame(() => requestAnimationFrame(scrollToBottom));

    withLoading(
      async () => {
        let newHistory = await submitUserMessage(
          chatHistory.sessionId,
          problemAttempt.id,
          message,
        );

        const newMessages = newHistory.messages;
        const content = newMessages[newMessages.length - 1].content;

        if (!content.test_case) return newHistory;

        const res = await executeChatTestCaseSilently(
          problemAttempt?.problemLanguage,
          executeTemplate.template,
          content.test_case,
          problem.modelAnswer,
        );

        if (res.status === 429) {
          return clientTemporarilyUnavailable();
        }

        const execRes = res.data;
        if (!validateTestExecuted(execRes)) {
          return clientTemporarilyUnavailable();
        }

        const output = execRes.run.output;

        const buggyResult = await handleBuggyProbeExecution(
          problem,
          content.test_case,
        );

        await saveEquivalenceClass(
          problemAttempt.id,
          output,
          buggyResult,
          NATURAL_LANGUAGE,
        );

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
      (serverHistory) => {
        // Replace local pending with real assistant reply (keep same key/id)
        const finalMsgs = serverHistory.messages;
        const realAssistant = finalMsgs[finalMsgs.length - 1];

        setChatHistory((prev) => {
          const idx = prev.messages.findIndex(
            (m) => m.id === pendingIdRef.current,
          );
          if (idx === -1) {
            return serverHistory; // fallback
          }
          const merged = prev.messages.slice();
          merged[idx] = {
            ...realAssistant,
            id: pendingIdRef.current, // keep stable React key
            serverId: realAssistant.id,
            pending: false,
          };
          return { ...serverHistory, messages: merged };
        });

        // Ensure bottom snap even though length didn't change
        requestAnimationFrame(() => requestAnimationFrame(scrollToBottom));

        // Logging based on server truth
        const msgs = serverHistory.messages;
        addLog({
          component: Component.CHAT_APP,
          action: Action.SEND,
          input: msgs[msgs.length - 2]?.content?.message,
          output: msgs[msgs.length - 1]?.content?.message,
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
      content: { message: getRandomRateLimitText() },
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
        <div
          ref={containerRef}
          className={styles.chatBody}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {/* Always skip system message */}
            {chatHistory.messages?.slice(1).map((message, idx) => {
              const key = message.id ?? `${message.timestamp}-${idx}`;
              const initial = { y: 12, opacity: 0, filter: "blur(2px)" };
              const animate = { y: 0, opacity: 1, filter: "blur(0px)" };
              const exit = { y: 8, opacity: 0 };

              return (
                <motion.div
                  key={key}
                  layout="position" // smooth positional shifts
                  layoutId={key} // morph pending -> real reply
                  initial={initial}
                  animate={animate}
                  exit={exit}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 0.6,
                  }}
                >
                  {message.pending ? (
                    <LoadingBubble />
                  ) : (
                    <ChatBubble chatMessage={message} />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={endRef} aria-hidden="true" />
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
  const msg = testCase ? `${message}\n${testCase}` : message;

  return (
    <div className={styles.bubbleContainer}>
      {isAssistant && (
        <div className={styles.avatarContainer}>
          <img src={CLIENT_AVATAR} alt="Client" />
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
            padding: isAssistant ? "0.25rem 0 0 0.5rem" : "0.25rem 0.5rem 0 0",
            justifySelf: isAssistant ? "start" : "end",
          }}
        >
          Sent at: {time}
        </p>
      </section>

      {!isAssistant && (
        <div className={styles.avatarContainer}>
          <img src={userImage} referrerPolicy="no-referrer" alt="You" />
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
          style={{ padding: "0.25rem 0 0 0.5rem", justifySelf: "start" }}
        >
          Client is typing…
        </p>
      </section>
    </div>
  );
}
