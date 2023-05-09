import React, { useState, useEffect } from 'react'

type Toast = {
    text: string,
    timestamp: number
}

type ToasterInfoProps = {
    toast: Toast | null;
    soakMode: boolean
};

const ToasterInfo: React.FC<ToasterInfoProps> = ({ toast, soakMode }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const timeout = setTimeout(() => {
      setVisible(false)
    }, 2000)
    return () => clearTimeout(timeout)
  }, [toast])

  if (soakMode) return null
  if (!toast) return null
  if (!visible) return null

  return <div className="toast toast-top toast-end">
    <div className="alert alert-info">
      <div>
        <span>{toast.text}</span>
      </div>
    </div>
  </div>
}

export default React.memo(ToasterInfo)
