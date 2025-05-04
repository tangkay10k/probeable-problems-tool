import axios from "axios"

export const submitProblem = async (problem) => {
  const response = await axios.post("api/problems", problem)
  return response.data
}