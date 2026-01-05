import avatar from '../public/avatar.png'
import Image from 'next/image'

export default function Side() {
  return (
    <div>
      <div className="p-4">
        <Image
          src={avatar}
          alt="avatar"
          className="h-72 w-full object-cover rounded-2xl"
        />
      </div>
    </div>
  )
}
