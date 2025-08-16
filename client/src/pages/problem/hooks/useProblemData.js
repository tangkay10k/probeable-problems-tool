import { useEffect, useState } from "react";
import { getProblem } from "@/routes/problem-route.js";
import { getTestTemplate } from "@/routes/template-route.js";
import { toast } from "react-toastify";

export default function useProblemData(problemId) {
  const [problem, setProblem] = useState(null);
  const [template, setTemplate] = useState("");
  const [defaultEditorSrc, setDefaultEditorSrc] = useState("");

  useEffect(() => {
    let mounted = true;
    getProblem(problemId)
      .then((p) => {
        if (!mounted) return;
        setProblem(p);
        setDefaultEditorSrc(p.editorDefaultComment);
        return getTestTemplate(p.programLanguage);
      })
      .then((tmpl) => mounted && setTemplate(tmpl))
      .catch((err) => toast.error(err));
    return () => (mounted = false);
  }, [problemId]);

  return { problem, template, defaultEditorSrc };
}
