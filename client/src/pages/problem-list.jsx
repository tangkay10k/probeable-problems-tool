import { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import { getAllProblemsForStudent } from '../routes/problem-route'
import { useNavigate } from 'react-router-dom'

export function ProblemList() {
  const [problems, setProblems] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchProblems() {
      const problems = await getAllProblemsForStudent()
      console.log(problems)
      setProblems(problems)
    }
    fetchProblems()
  }, [])

  return (
    <Table>
      <tbody>
        {problems?.map((problem) => (
          <tr
            key={problem.id}
            onClick={() =>
              navigate(`/problem/${problem.id}`, {
                state: { problem: problem },
              })
            }
          >
            <td>{problem.title}</td>
            <td>{problem.description}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
