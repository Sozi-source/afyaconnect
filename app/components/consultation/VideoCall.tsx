// app/components/consultation/VideoCall.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
import CallControls from './CallControls'
import { VideoCameraIcon } from '@heroicons/react/24/outline'

interface VideoCallProps {
  roomId: string
  userId: string
  userName: string
  userRole: 'client' | 'practitioner'
  onLeave?: () => void
}

export default function VideoCall({ roomId, userId, userName, userRole, onLeave }: VideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const zpRef = useRef<any>(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [containerCreated, setContainerCreated] = useState(false)

  // First, ensure the container is created
  useEffect(() => {
    if (containerRef.current) {
      setContainerCreated(true)
    } else {
      // Check again after a short delay
      const timer = setTimeout(() => {
        if (containerRef.current) {
          setContainerCreated(true)
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  // Initialize call only when container is created
  useEffect(() => {
    if (!containerCreated) return

    let isMounted = true

    const initializeCall = async () => {
      try {
        const appID = process.env.NEXT_PUBLIC_ZEGO_APP_ID
        const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET

        if (!appID || !serverSecret) {
          throw new Error('ZegoCloud configuration is missing')
        }

        if (!containerRef.current) {
          throw new Error('Video container not found')
        }

        // Create a unique room ID
        const zegoRoomId = `room_${roomId.replace(/[^a-zA-Z0-9]/g, '_')}`

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          Number(appID),
          serverSecret,
          zegoRoomId,
          userId,
          userName
        )

        const zpInstance = ZegoUIKitPrebuilt.create(kitToken)
        zpRef.current = zpInstance

        if (!isMounted) return

        await zpInstance.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showPreJoinView: false,
          showRoomDetailsButton: false,
          showUserList: false,
          showTextChat: false,
          showScreenSharingButton: false,
          onJoinRoom: () => {
            if (isMounted) {
              setIsConnecting(false)
            }
          },
          onLeaveRoom: () => {
            if (isMounted) {
              onLeave?.()
            }
          }
        })

      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to connect to call')
          setIsConnecting(false)
        }
      }
    }

    initializeCall()

    return () => {
      isMounted = false
      if (zpRef.current) {
        try {
          zpRef.current.leaveRoom()
          zpRef.current.destroy()
        } catch (err) {
          // Silently ignore cleanup errors
        }
      }
    }
  }, [containerCreated, roomId, userId, userName, onLeave])

  const handleToggleMute = () => {
    if (zpRef.current) {
      const newMuteState = !isMuted
      zpRef.current.setMicrophoneOn(!newMuteState)
      setIsMuted(newMuteState)
    }
  }

  const handleToggleCamera = () => {
    if (zpRef.current) {
      const newCameraState = !isCameraOff
      zpRef.current.setCameraOn(!newCameraState)
      setIsCameraOff(newCameraState)
    }
  }

  const handleEndCall = () => {
    if (zpRef.current) {
      zpRef.current.leaveRoom()
      zpRef.current.destroy()
    }
    onLeave?.()
  }

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* The container div */}
      <div 
        ref={containerRef} 
        className="absolute inset-0"
        style={{ backgroundColor: '#1a1a1a' }}
      />
      
      {/* Controls */}
      {!error && !isConnecting && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <CallControls
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            onToggleMute={handleToggleMute}
            onToggleCamera={handleToggleCamera}
            onEndCall={handleEndCall}
          />
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
          <div className="text-center p-6 max-w-md">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-red-600 text-3xl">📞</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Connection Failed</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleEndCall}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Connecting overlay */}
      {isConnecting && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6" />
              <div className="absolute inset-0 flex items-center justify-center">
                <VideoCameraIcon className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Connecting to call...</h3>
            <p className="text-gray-400 text-sm">Please wait while we establish the connection</p>
          </div>
        </div>
      )}
    </div>
  )
}