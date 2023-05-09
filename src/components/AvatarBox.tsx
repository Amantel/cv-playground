import Image from 'next/image'
import React from 'react'

type sessionAvatar = {
  url: string
}

type AvatarBoxProps = {
  sessionAvatars: sessionAvatar[]
  loading: boolean
};

const AvatarBox: React.FC<AvatarBoxProps> = ({ sessionAvatars, loading }) => {
  if (!sessionAvatars || !sessionAvatars.length) return null
  const sessionAvatar = sessionAvatars[sessionAvatars.length - 1]

  const url = loading ? '/img/loader.gif' : sessionAvatar?.url || '/img/loader.gif'

  return <div className='absolute -top-10 -right-5'>
    <Image
      alt="avatar"
      width="256"
      height="256"
      className="mask mask-hexagon-2 w-24"
      src={url} />
  </div>
}

export default React.memo(AvatarBox)
