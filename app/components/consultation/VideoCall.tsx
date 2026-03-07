// app/components/consultation/VideoCall.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
import CallControls from './CallControls'

interface VideoCallProps {
  roomId: string
  userId: string
  userName: string
  userRole: 'client' | 'practitioner'
  onLeave?: () => void
}

export default function VideoCall({ roomId, userId, userName, userRole, onLeave }: VideoCallProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [zp, setZp] = useState<any>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)

  useEffect(() => {
    const initCall = async () => {
      if (!containerRef.current) return

      const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        userId,
        userName
      )

      const zpInstance = ZegoUIKitPrebuilt.create(kitToken)
      setZp(zpInstance)

      // Join room with valid configuration only
      zpInstance.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall, // or GroupCall for group consultations
        },
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        showPreJoinView: false, // Skip the pre-join screen
        onLeaveRoom: () => {
          onLeave?.()
        },
        // Remove onUserEnter - it's not a valid property
        // ZEGO handles user join/leave automatically
      })
    }

    initCall()

    // Cleanup on unmount
    return () => {
      if (zp) {
        zp.leaveRoom()
      }
    }
  }, [roomId, userId, userName, onLeave])

  const handleToggleMute = () => {
    if (zp) {
      zp.setMicrophoneOn(!isMuted)
      setIsMuted(!isMuted)
    }
  }

  const handleToggleCamera = () => {
    if (zp) {
      zp.setCameraOn(!isCameraOff)
      setIsCameraOff(!isCameraOff)
    }
  }

  const handleEndCall = () => {
    if (zp) {
      zp.leaveRoom()
      onLeave?.()
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* ZEGO UIKit container */}
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Custom controls overlay */}
      <CallControls
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        onToggleMute={handleToggleMute}
        onToggleCamera={handleToggleCamera}
        onEndCall={handleEndCall}
      />
    </div>
  )
}