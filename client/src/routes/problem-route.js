import axios from "axios"

export const submitProblem = async (problem) => {
  const response = await axios.post("api/problems", problem)
  return response.data
}

export const getAllProblemsForStudent = async () => {
  const response = await axios.get("api/problems/all?isStudent=true")
  return response.data
}

export const getAllProblemsForLecturer = async () => {
  const response = await axios.get("api/problems/all")
  return response.data
}
