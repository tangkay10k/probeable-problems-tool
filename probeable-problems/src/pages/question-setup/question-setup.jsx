import Dropdown from '@/components/dropdown/dropdown.jsx'
import Instruction from '@/components/instruction/instruction'
import { MODEL_SOLUTION_INSTRUCTION } from './data/instructions'
import { CODE_SNIPPETS } from '@/components/text-editor/data/constants.js'
import styles from './question-setup.module.css'
import { TextEditor } from '@/components/text-editor/text-editor.jsx'
import { useState, useRef } from 'react'
import Button from '../../components/button/button'

export default function QuestionSetup() {
  const [language, setLanguage] = useState('C')
  const [src, setSource] = useState(CODE_SNIPPETS['C'])
  const editorRef = useRef(null)

  return (
    <div className={styles.pageContainer}>
      <div className={styles.outerContainer}>
        <div className={styles.innerContainer}>
          <Instruction
            heading={'Question Creator'}
            instruction={MODEL_SOLUTION_INSTRUCTION}
          />
          <Dropdown
            label={'Question Type: '}
            options={['Single Function', 'OOP']}
          />
          <TextEditor
            editorRef={editorRef}
            language={language}
            setLanguage={setLanguage}
            setSource={setSource}
            src={src}
          />
          <div className={styles.buttonContainer}>
            <Button>Save</Button>
            <Button>Generate Constraints</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
