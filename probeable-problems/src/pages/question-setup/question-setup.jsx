import Dropdown from "@/components/dropdown/dropdown.jsx";
import Instruction from "@/components/instruction/instruction";
import {
  CONSTRAINTS_INSTRUCTION,
  MODEL_SOLUTION_INSTRUCTION,
  TEST_CASES_INSTRUCTION,
} from "./data/instructions";
import { CODE_SNIPPETS } from "@/components/text-editor/data/constants.js";
import styles from "./question-setup.module.css";
import { TextEditor } from "@/components/text-editor/text-editor.jsx";
import { useState, useRef } from "react";
import Button from "../../components/button/button";
import TextArea from "@/components/inputs/text-area.jsx";
import Terminal from "@/components/text-editor/terminal.jsx";

export default function QuestionSetup() {
  const [language, setLanguage] = useState("C");
  const [src, setSource] = useState(CODE_SNIPPETS["C"]);
  const editorRef = useRef(null);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.outerContainer}>
        <div className={styles.innerContainer}>
          <ModelSolution
            language={language}
            setLanguage={setLanguage}
            editorRef={editorRef}
            src={src}
            setSource={setSource}
            instruction={MODEL_SOLUTION_INSTRUCTION}
          />
          <Constraints />
        </div>
      </div>
      <div className={styles.outerContainer}>
        <div className={styles.innerContainer}>
          <TextEditor
            editorRef={editorRef}
            language={language}
            setLanguage={setLanguage}
            src={src}
            setSource={setSource}
          />
          <Terminal />
          <div className={styles.buttonContainer}>
            <Button>Save</Button>
            <Button>Execute Test Suite</Button>
          </div>

          <Instruction
            heading="2. Test Suite Generation"
            instruction={TEST_CASES_INSTRUCTION}
          />
          <TextArea rows={2} />
          <div className={styles.buttonContainer}>
            <Button>Save</Button>
            <Button>Generate Problem Statement</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelSolution({
  language,
  setLanguage,
  editorRef,
  src,
  setSource,
  instruction,
}) {
  return (
    <>
      <Instruction heading="Question Creator" instruction={instruction} />
      <Dropdown label="Question Type:" options={["Single Function", "OOP"]} />
      <TextEditor
        editorRef={editorRef}
        language={language}
        setLanguage={setLanguage}
        src={src}
        setSource={setSource}
      />
      <div className={styles.buttonContainer}>
        <Button>Save</Button>
        <Button>Generate Constraints</Button>
      </div>
    </>
  );
}

function Constraints() {
  return (
    <>
      <Instruction
        heading={"1. Constraint Generation"}
        instruction={CONSTRAINTS_INSTRUCTION}
      />
      <TextArea rows={10} />
      <div className={styles.buttonContainer}>
        <Button>Save</Button>
        <Button>Generate Tests</Button>
      </div>
    </>
  );
}
