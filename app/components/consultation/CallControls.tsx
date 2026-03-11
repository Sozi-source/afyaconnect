// app/components/consultation/CallControls.tsx
'use client'

import { MicrophoneIcon, VideoCameraIcon, PhoneXMarkIcon } from '@heroicons/react/24/outline'
import { 
  MicrophoneIcon as MicrophoneIconSolid,
  VideoCameraIcon as VideoCameraIconSolid 
} from '@heroicons/react/24/solid'

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
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 sm:gap-4 bg-white/95 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-2xl border border-gray-200/50">
      {/* Mute Button */}
      <button
        onClick={onToggleMute}
        className={`p-2 sm:p-3 rounded-full transition-all transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isMuted 
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 focus:ring-red-400' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400'
        }`}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <MicrophoneIconSolid className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <MicrophoneIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </button>

      {/* Camera Button */}
      <button
        onClick={onToggleCamera}
        className={`p-2 sm:p-3 rounded-full transition-all transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isCameraOff 
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 focus:ring-red-400' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400'
        }`}
        aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
        title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
      >
        {isCameraOff ? (
          <VideoCameraIconSolid className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <VideoCameraIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </button>

      {/* End Call Button */}
      <button
        onClick={onEndCall}
        className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white 
                 hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-110 
                 active:scale-95 shadow-lg shadow-red-600/50 focus:outline-none focus:ring-2 
                 focus:ring-red-400 focus:ring-offset-2"
        aria-label="End call"
        title="End call"
      >
        <PhoneXMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </div>
  )
}