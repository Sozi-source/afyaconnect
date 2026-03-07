// app/components/consultation/IncomingCallModal.tsx
'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { PhoneIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/app/components/ui/Buttons'

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
          <div className="fixed inset-0 bg-black/25" />
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
                  <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <PhoneIcon className="h-8 w-8 text-primary-600 animate-pulse" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Call from</p>
                  <p className="text-lg font-semibold text-gray-900">{callerName}</p>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    fullWidth
                    variant="danger"
                    onClick={onDecline}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button
                    fullWidth
                    onClick={onAccept}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}