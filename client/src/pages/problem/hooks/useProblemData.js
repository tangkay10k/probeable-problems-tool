import { useEffect, useState } from "react";
import { getProblem } from "@/routes/problem-route.js";
import { getSubmissionTemplate } from "@/routes/template-route.js";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

export default function useProblemData() {
  const { problemId } = useParams();
  const [problem, setProblem] = useState({});
  const [template, setTemplate] = useState("");
  const [defaultEditorSrc, setDefaultEditorSrc] = useState("");

  useEffect(() => {
    getProblem(problemId)
      .then((p) => {
        setProblem(p);
        setDefaultEditorSrc(p.editorDefaultComment);
        return getSubmissionTemplate(p.programLanguage);
      })
      .then((tmpl) => setTemplate(tmpl))
      .catch((err) => toast.error(err));
  }, [problemId]);

  return { problem, template, defaultEditorSrc };
}
