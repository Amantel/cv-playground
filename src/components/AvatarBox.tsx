import Image from 'next/image'
import React from 'react'

type AvatarBoxProps = {
  avatarUrl: string | null
  loading: boolean
};

const AvatarBox: React.FC<AvatarBoxProps> = ({ avatarUrl, loading }) => {
  if (!avatarUrl) return null

  const url = loading ? '/img/loader.gif' : avatarUrl || '/img/loader.gif'

  return <div className='absolute -top-10 -right-5'>
    <Image
      alt="avatar"
      width="256"
      height="256"
      className="mask mask-hexagon-2 w-24"
      src={url}
    />
  </div>
}

export default React.memo(AvatarBox)
