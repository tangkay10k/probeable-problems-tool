import { executeCodePistonDirect } from "@/routes/code-route.js";
import { toast } from "react-toastify";
import { SPLIT_STRING } from "@/constants/setup-constants";

async function fetchPublicText(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
    return res.text();
}

function extractFunctionName(explicitName, modelAnswer) {
    if (explicitName && typeof explicitName === "string" && explicitName.trim()) {
        return explicitName.trim();
    }

    const m = modelAnswer?.match(/\b[A-Za-z_]\w*\s+([A-Za-z_]\w*)\s*\(/);
    if (m) return m[1];
    throw new Error(
        "Could not determine function name from problem.functionName or modelAnswer",
    );
}

function renameFunctionCalls(code, baseName, suffixIndex) {
    const callRe = new RegExp(`\\b${baseName}\\s*\\(`, "g");
    return code.replace(callRe, `${baseName}_${suffixIndex}(`);
}

function buildBuggyBlock(problem) {
    const arr = Array.isArray(problem.buggy_codes) ? problem.buggy_codes : [];
    return arr
        .map((b) => (b?.code ?? "").trim())
        .filter(Boolean)
        .join("\n\n");
}

function buildSwitchCasesC(problem, codeToRun, baseName) {
    const arr = Array.isArray(problem.buggy_codes) ? problem.buggy_codes : [];
    if (arr.length === 0) return "// (no buggy solutions available)";
    return arr
        .map((_, i) => {
            const mutated = renameFunctionCalls(codeToRun, baseName, i+1).trim();
            return `case ${i+1}: {\n${mutated}\n    break;\n}`;
        })
        .join("\n\n");
}

async function buildFilledTemplateC(problem, probe) {
    const template = await fetchPublicText("/template.txt");

    const fnName = extractFunctionName(problem.functionName, problem.modelAnswer);
    const buggyBlock = buildBuggyBlock(problem);
    const codeToRun = (probe || "").trim();
    const switchCases = buildSwitchCasesC(problem, codeToRun, fnName);

    const num = (Array.isArray(problem.buggy_codes)
        ? problem.buggy_codes.length
        : 0
    ).toString();

    return template
        .replace("//VAR_BUGGY_IMPLEMENTATION", buggyBlock)
        .replace("//VAR_SWITCH_BUGGY_IMPLEMENTATIONS", switchCases)
        .replace("//VAR_NUM_BUGGY_IMPLEMENTATIONS", num)
        .replace("//VAR_SPLIT", SPLIT_STRING);
}


// Java (TODO)
async function buildFilledTemplateJava() {
    throw new Error("TODO: Java probe builder not implemented yet.");
}


export async function buildFilledTemplateByLanguage(problem, probe) {
    switch ((problem.programLanguage || "").toLowerCase()) {
        case "c":
            return buildFilledTemplateC(problem, probe);
        case "java":
            return buildFilledTemplateJava(problem);
        default:
            throw new Error(
                `Unsupported language '${problem.programLanguage}'. Only 'c' and 'java' are handled.`,
            );
    }
}

export async function handleBuggyProbeExecution(problem, probe) {
    try {
        const source = await buildFilledTemplateByLanguage(problem, probe);
        const execResult = await executeCodePistonDirect(
            problem.programLanguage,
            source,
        );

        const parts = execResult.run.stdout.split(SPLIT_STRING);

        return parts;
    } catch (err) {
        toast.error(err?.message || String(err));
        throw err;
    }
}
