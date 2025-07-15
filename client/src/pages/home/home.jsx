import styles from "./home.module.css";
import useWithLoading from "@/hooks/useWithLoading.js";
import { useEffect, useState } from "react";
import { getAllProblems } from "@/routes/problem-route.js";
import ProblemList from "@/components/list/list.jsx";
export default function Home() {
  return (
    <div className={styles.homePageContainer}>
      <ProblemList />
    </div>
  );
}
