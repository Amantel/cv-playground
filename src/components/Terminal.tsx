import React, { useState, useEffect, useRef } from 'react'

import { api } from '~/utils/api'
import AvatarBox from './AvatarBox'

const MAX_LINES = 15

type Command = {
  text: string;
  timestamp: number;
}

// eslint-disable-next-line no-unused-vars
enum Color { Red = 'red', Yellow = 'yellow', Grey = 'grey', Green = 'green' }

type LineElement = {
  text: string;
  timestamp: number;
  color: Color,
  isCommand: boolean,
  prefix: string,
}

type Toast = {
    text: string,
    timestamp: number
}

type TerminalProps = {
  setToast: React.Dispatch<React.SetStateAction<Toast | null>>;
  sessionId: string,
};

const Terminal: React.FC<TerminalProps> = ({ setToast, sessionId }) => {
  const [inputValue, setInputValue] = useState('')
  const [internalHistoryCounter, setInternalHistoryCounter] = useState(0)
  const [history, setHistory] = useState<Command[]>([])
  const [infoLines, setInfoLines] = useState<LineElement[]>([])
  const inputRef = useRef(null)

  const { data: sessionAvatars, refetch: refetchAvatar } = api.avatar.getAvatar.useQuery({ sessionId }, {
    enabled: !!sessionId,
  })
  const avatarUrl = sessionAvatars?.[sessionAvatars.length - 1]?.url || null

  const { mutate: generateAvatar, isLoading } = api.avatar.generate.useMutation({
    onSuccess () {
      return refetchAvatar()
    },
  })

  useEffect(() => {
    // Load history from local storage
    const savedHistory: string = localStorage.getItem('history') || '[]'
    const savedHistoryJson = JSON.parse(savedHistory) as Command[]
    setHistory(savedHistoryJson)
    setInfoLines(savedHistoryJson.map(historyItem => {
      return {
        ...historyItem,
        color: Color.Grey,
        isCommand: true,
        prefix: '$',
      }
    }))
  }, [])

  const handleKeyUp = (event: { key: string; }) => {
    if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return
    if (history.length === 0) return
    if (
      (internalHistoryCounter === 0 && event.key === 'ArrowDown') ||
      (internalHistoryCounter === history.length && event.key === 'ArrowUp')
    ) return

    const direction = event.key === 'ArrowDown' ? -1 : 1
    const historyItem = history[history.length - direction - internalHistoryCounter]

    if (historyItem) {
      setInputValue(historyItem.text)
      setInternalHistoryCounter(prevValue => prevValue + direction)
    }
  }

  const getCV = () => {
    const info = [
      'My CV',
      'you can download it from <a href="/cv.pdf" target="blank">here</a>',
    ].map((text, i) => {
      return {
        text,
        timestamp: new Date().getTime(),
        isCommand: false,
        prefix: !i ? '>' : '!',
        color: Color.Yellow,
      }
    })

    setInfoLines((prevLines) => [...prevLines, ...info])
  }

  const getAvatar = (inputPromt: string) => {
    const characterClass = inputPromt.split(' ')[1]?.toString() ?? 'random'

    const info = [
      'Generate DnD avatar',
      `For class: ${characterClass}`,
      'generating...',
    ].map((text, i) => {
      return {
        text,
        timestamp: new Date().getTime(),
        isCommand: false,
        prefix: i < 2 ? '>' : '',
        color: Color.Yellow,
      }
    })

    setInfoLines((prevLines) => [...prevLines, ...info])

    generateAvatar({
      characterClass,
      sessionId,
    })
  }

  const getHelp = () => {
    const info = [
      'List of commands',
      'help - this help',
      'clear - clear screen and history',
      'about - about this app',
      'cv - get my cv',
      'avatar [class] - generate dnd avatar with DALL·E 2',
    ].map((text, i) => {
      return {
        text,
        timestamp: new Date().getTime(),
        isCommand: false,
        prefix: !i ? '>' : '',
        color: Color.Yellow,
      }
    })

    setInfoLines((prevLines) => [...prevLines, ...info])
  }

  const getAbout = () => {
    const info = [
      'About this programm',
      '',
      'Build in May 2022',
      'In Haifa, Israel',
      '',
      'Tech used:',
      '***',
      'T3 Stack',
      'TRPC',
      'PRISMA',
      'DAISY',
      'DALL-E 2',
      'REACT',
      'ChatGPT',
      'Sweat and tears',
    ].map((text, i) => {
      return {
        text,
        timestamp: new Date().getTime() + Math.random(),
        isCommand: false,
        prefix: !i ? '>' : '',
        color: i < 4 && i > 0 ? Color.Green : Color.Yellow,
      }
    })

    setInfoLines((prevLines) => [...prevLines, ...info])
  }
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  const handleInputSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setInternalHistoryCounter(0)

    if (inputValue.trim() === '') {
      return
    }

    const timestamp = Date.now()
    const command = { text: inputValue.trim(), timestamp }
    setHistory((prevHistory) => [...prevHistory, command])
    setInfoLines((prevHistory) => [...prevHistory, {
      ...command,
      isCommand: true,
      color: Color.Grey,
      prefix: '$',
    }])

    localStorage.setItem('history', JSON.stringify([...history, command]))

    const inputPromt = inputValue.trim()
    switch (inputPromt) {
      case 'help':
        getHelp()
        break
      case 'clear':
        setHistory([])
        setInfoLines([])
        localStorage.removeItem('history')
        break
      case 'about':
        getAbout()
        break
      case 'cv':
        getCV()
        break
      default:
        if (inputPromt.startsWith('avatar')) {
          getAvatar(inputPromt)
        } else {
          console.log(`Unknown command: ${inputValue.trim()}`)
          setToast({ text: 'Unknown command. Try typing *help*', timestamp })
        }
        break
    }

    setInputValue('')
  }

  const terminalItems = infoLines.slice(-MAX_LINES).map(item => {
    const { timestamp, text, color, prefix } = item
    let className = ''
    switch (color) {
      case Color.Red:
        className = 'text-danger'
        break
      case Color.Yellow:
        className = 'text-warning'
        break
      case Color.Green:
        className = 'text-success'
        break
    }

    if (item.prefix === '!') {
      const parser = new DOMParser()
      const html = parser.parseFromString(item.text, 'text/html')
      const href = html.querySelector('a')?.getAttribute('href')
      return (

        <span key={`${text}${timestamp}`} className={className} data-prefix={''}><code>
          You can
          it by clicking this link: <a
            className={'link'}
            href={href || ''}
            target="_blank"
            rel="noopener noreferrer">
            download
          </a>
        </code></span>
      )
    }

    return <pre key={`${text}${timestamp}`} className={className} data-prefix={prefix}>
      <code className='whitespace-break-spaces'>{text}</code>
    </pre>
  })

  return (
    <div className="relative mockup-code mx-auto overflow-visible w-full max-w-screen-xl">
      <AvatarBox avatarUrl={avatarUrl} loading={isLoading} />
      {terminalItems}
      <pre data-prefix="$"><code>
        <form className='inline ml-[-16px]' onSubmit={handleInputSubmit}>
          <input
            ref={inputRef}
            onKeyUp={handleKeyUp}
            type="text"
            placeholder="Type here"
            id="terminal-input"
            value={inputValue}
            hidden={isLoading}
            onChange={handleInputChange}
            autoComplete="off"
            className="
              input input-ghost w-full
              bg-transparent border-none focus:outline-none
              text-white focus:text-white
            "
          />

        </form>
      </code>
      </pre>
    </div>
  )
}

export default Terminal
