import styles from './button.module.css'
import { SpinnerCircular } from 'spinners-react'

export default function Button({ onClick, children, disabled = false }) {
  return (
    <button className={styles.button} onClick={onClick} disabled={disabled}>
      {children}
      {disabled && (
        <SpinnerCircular
          size={20}
          thickness={100}
          speed={100}
          color="rgba(57, 140, 172, 0.62)"
          secondaryColor="rgba(57, 111, 172, 0.12)"
        />
      )}
    </button>
  )
}
