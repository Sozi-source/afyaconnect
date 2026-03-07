// app/components/consultation/CallControls.tsx
'use client'

import { MicrophoneIcon, VideoCameraIcon, PhoneXMarkIcon } from '@heroicons/react/24/outline'
import { MicrophoneIcon as MicrophoneIconSolid } from '@heroicons/react/24/solid'

interface CallControlsProps {
  isMuted: boolean
  isCameraOff: boolean
  onToggleMute: () => void
  onToggleCamera: () => void
  onEndCall: () => void
}

export default function CallControls({
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onEndCall
}: CallControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
      <button
        onClick={onToggleMute}
        className={`p-3 rounded-full transition-all ${
          isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isMuted ? (
          <MicrophoneIconSolid className="h-5 w-5" />
        ) : (
          <MicrophoneIcon className="h-5 w-5" />
        )}
      </button>

      <button
        onClick={onToggleCamera}
        className={`p-3 rounded-full transition-all ${
          isCameraOff ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <VideoCameraIcon className="h-5 w-5" />
      </button>

      <button
        onClick={onEndCall}
        className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all"
      >
        <PhoneXMarkIcon className="h-5 w-5" />
      </button>
    </div>
  )
}