import React, {useEffect, useState} from "react"
import {Spinner} from "react-bootstrap"

export function Loading() {
    const [dots, setDots] = useState("")

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length < 3 ? prev + "." : ""))
        }, 500)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="d-flex align-items-center">
            <Spinner animation="border" role="status" size="sm" className="me-2"/>
            <span>Executing{dots}</span>
        </div>
    )
}
