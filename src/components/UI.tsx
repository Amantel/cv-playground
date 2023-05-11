import React, { useState, useEffect } from 'react'
import { v4 as uuid } from 'uuid'

import Terminal from './Terminal'
import ToasterInfo from './ToasterInfo'

type Toast = {
    text: string,
    timestamp: number
}

const UI: React.FC = () => {
  const [toast, setToast] = useState<Toast | null>(null)
  const [wrongInputNumber, setWrongInputNumber] = useState(0)
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    const sessionId: string = localStorage.getItem('mmSessionId') || ''
    if (!sessionId) {
      const id: string = uuid()
      localStorage.setItem('mmSessionId', id)
    }

    setSessionId(sessionId)
  }, [])

  useEffect(() => {
    if (!toast) return
    setWrongInputNumber(prevValue => prevValue + 1)
  }, [toast])

  const soakMode = wrongInputNumber > 5
  return <>
    <Terminal setToast={setToast} sessionId={sessionId}/>
    <h4 className='kbd'>Start with typing  *<b>help</b>*</h4>
    <ToasterInfo toast={toast} soakMode={soakMode}/>
  </>
}

export default UI
