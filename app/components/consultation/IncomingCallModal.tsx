// app/components/consultation/IncomingCallModal.tsx
'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { PhoneIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface IncomingCallModalProps {
  isOpen: boolean
  callerName: string
  onAccept: () => void
  onDecline: () => void
}

export default function IncomingCallModal({ isOpen, callerName, onAccept, onDecline }: IncomingCallModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onDecline}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 text-center">
                  Incoming Call
                </Dialog.Title>
                
                <div className="mt-4 text-center">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-4">
                    <PhoneIcon className="h-10 w-10 text-white animate-pulse" />
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-1">Call from</p>
                  <p className="text-xl font-semibold text-gray-900 mb-2">{callerName}</p>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Incoming call...</span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={onDecline}
                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl 
                             transition-all transform hover:scale-105 flex items-center justify-center gap-2
                             focus:outline-none focus:ring-4 focus:ring-red-200"
                  >
                    <XMarkIcon className="h-5 w-5" />
                    Decline
                  </button>
                  
                  <button
                    onClick={onAccept}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 
                             hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl 
                             transition-all transform hover:scale-105 flex items-center justify-center gap-2
                             focus:outline-none focus:ring-4 focus:ring-emerald-200"
                  >
                    <PhoneIcon className="h-5 w-5" />
                    Accept
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}