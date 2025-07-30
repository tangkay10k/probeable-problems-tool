import React, { useEffect, useState } from "react";
import styles from "./list.module.css";
import useWithLoading from "@/hooks/useWithLoading.js";
import { getAllProblems } from "@/routes/problem-route.js";
import { useNavigate } from "react-router-dom";
import { FaCircleCheck as CompletedIcon } from "react-icons/fa6";
import AnimatedList from "@/components/list/animated-list/animated-list.jsx";
import { useUserProfile } from "@/context/user-context.jsx";
import { LANGUAGE_DISPLAY_NAMES } from "@/components/text-editor/data/constants.js";

export default function ProblemList() {
  const [_, withLoading] = useWithLoading();
  const [problems, setProblems] = useState([]);
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  const completedSet = new Set(profile?.problemsCompleted || []);

  useEffect(() => {
    withLoading(
      () => getAllProblems(),
      (problemList) => setProblems(problemList),
      console.error,
    );
  }, []);

  const onRowClick = (problem) => {
    navigate(`/problem/${problem.id}`);
  };

  if (!problems.length) {
    return <div className={styles.empty}>No problems to show.</div>;
  }

  const allItems = [{ isHeader: true }, ...problems];

  return (
    <div className={styles.problemListContainer}>
      <h1>Problems</h1>

      <AnimatedList
        items={allItems}
        className={styles.table}
        showGradients={true}
        enableArrowNavigation={true}
        displayScrollbar={true}
        onItemSelect={(item, idx) => {
          if (idx > 0) onRowClick(item);
        }}
        renderItem={(item, idx) =>
          item.isHeader ? (
            <div className={styles.headerRow}>
              <span className={styles.status}>
                <CompletedIcon color={"white"} />
              </span>
              <span className={styles.rowNumber}>#</span>
              <span className={styles.cell}>Problem Description</span>
              <span className={styles.problemLang}>Language</span>
              <span className={styles.problemType}>Type</span>
            </div>
          ) : (
            <div className={styles.row} onClick={() => onRowClick(item)}>
              <span className={styles.status}>
                {completedSet.has(item.id) && <CompletedIcon />}
              </span>
              <span className={styles.rowNumber}>{idx}.</span>
              <span className={styles.cell}>{item.problemStatement}</span>
              <span className={styles.problemLang}>
                {LANGUAGE_DISPLAY_NAMES[item.programLanguage]}
              </span>
              <span className={styles.problemType}>{item.problemType}</span>
            </div>
          )
        }
      />
    </div>
  );
}
