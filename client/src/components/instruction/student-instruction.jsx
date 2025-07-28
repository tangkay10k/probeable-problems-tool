import { STAGE_ONE } from "@/pages/problem/data/instructions.js";

export default function StudentInstruction() {
  return (
    <div>
      <p>{STAGE_ONE[0].content}</p>
    </div>
  );
}