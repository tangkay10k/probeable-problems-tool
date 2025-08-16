import Modal from "@/components/modal/modal.jsx";
import ButtonV2 from "@/components/button/buttonV2.jsx";
import styles from "@/pages/problem/problemPage.module.css";

export default function SubmitConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  numPassed,
  total,
}) {
  const allPassed = numPassed === total;
  return (
    <Modal
      title={"Are you sure you want to submit?"}
      isOpen={isOpen}
      setIsOpen={onClose}
      className={styles.confirmModal}
    >
      <p className={allPassed ? styles.success : styles.error}>
        You have passed{" "}
        <b>
          {numPassed} / {total}
        </b>{" "}
        test cases. <br />
      </p>
      <p>YOU WILL NOT BE ABLE TO RESUBMIT!</p>
      <section className={styles.modalBtns}>
        <ButtonV2 onClick={onClose}>No</ButtonV2>
        <ButtonV2 onClick={onConfirm}>Yes</ButtonV2>
      </section>
    </Modal>
  );
}
