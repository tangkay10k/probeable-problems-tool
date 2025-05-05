import axios from "axios"

export const submitProblem = async (problem) => {
  const response = await axios.post("api/problems", problem)
  return response.data
}

export const getAllProblems = async () => {
  const response = await axios.get("api/problems/all")
  return response.data
}