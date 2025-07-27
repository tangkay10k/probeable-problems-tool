import React, { useEffect, useState } from "react";
import styles from "./list.module.css";
import useWithLoading from "@/hooks/useWithLoading.js";
import { getAllProblems } from "@/routes/problem-route.js";
import { useNavigate } from "react-router-dom";
import { FaCircleCheck } from "react-icons/fa6";

export default function ProblemList() {
  const [_, withLoading] = useWithLoading();
  const [problems, setProblems] = useState([]);
  const navigate = useNavigate();

  function onRowClick(problem) {
    navigate(`/problem/${problem.id}`);
  }

  useEffect(() => {
    withLoading(
      () => getAllProblems(),
      (problemList) => setProblems(problemList),
      console.error,
    );
  }, []);

  if (!problems.length) {
    return <div className={styles.empty}>No problems to show.</div>;
  }

  return (
    <div className={styles.problemListContainer}>
      <h1>Problems</h1>
      <div className={styles.glow} />
      <ul className={`${styles.table}`}>
        <li className={styles.headerRow}>
          <span className={styles.status}>
            <FaCircleCheck />
          </span>
          <span className={styles.rowNumber}>#</span>
          <span className={styles.cell}>Problem Description</span>{" "}
          <span className={styles.problemLang}>Language</span>
          <span className={styles.problemType}>Type</span>
        </li>
        {problems.map((problem, idx) => (
          <li
            key={problem.id}
            className={styles.row}
            onClick={() => onRowClick(problem)}
          >
            <span className={styles.status}>
              <FaCircleCheck />
            </span>
            <span className={styles.rowNumber}>{idx + 1}.</span>
            <span className={styles.cell}>{problem.problemStatement}</span>
            <span className={styles.problemLang}>
              {problem.programLanguage}
            </span>
            <span className={styles.problemType}>{problem.problemType}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}