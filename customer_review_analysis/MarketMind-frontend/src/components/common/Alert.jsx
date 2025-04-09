"use client"

import { useEffect, useState } from "react"
import "./Alert.css"

function Alert({ message, type }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return <div className={`alert ${type}`}>{message}</div>
}

export default Alert
