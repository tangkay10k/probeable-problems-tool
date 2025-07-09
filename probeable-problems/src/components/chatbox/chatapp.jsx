import styles from "./chatapp.module.css";
import { IoChatbubbleEllipsesOutline as ChatIcon } from "react-icons/io5";
import { FaRegPaperPlane as PlaneIcon } from "react-icons/fa";
import Input from "@/components/inputs/text-input.jsx";
import { useState } from "react";
import Button from "@/components/button/button.jsx";

export default function ChatApp() {
  const [userMessage, setUserMessage] = useState("");

  const handleSend = () => {
    console.log("TODO");
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
      </div>

      <div className={styles.inputContainer}>
        <Input
          onEnter={handleSend}
          placeholder={"Ask the client!"}
          onChange={(e) => setUserMessage(e.target.value)}
          value={userMessage}
        />
        <Button onClick={handleSend}>
          <PlaneIcon size={18} />
        </Button>
      </div>
    </div>
  );
}
