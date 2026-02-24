'use client'

import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'

interface ApplicationStatusProps {
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'info_needed'
  professionalTitle?: string
  submittedAt?: string
  canEdit?: boolean
  rejectionReason?: string
}

export function ApplicationStatus({ 
  status, 
  professionalTitle, 
  submittedAt, 
  canEdit,
  rejectionReason 
}: ApplicationStatusProps) {
  
  const statusConfig = {
    draft: {
      icon: DocumentTextIcon,
      title: 'Application Draft',
      message: 'Your application is in draft mode. Complete and submit it for review.',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      buttonText: 'Continue Application',
      buttonColor: 'bg-gray-600 hover:bg-gray-700'
    },
    pending: {
      icon: ClockIcon,
      title: 'Under Review',
      message: 'Your application has been submitted and is being reviewed by our team.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      buttonText: 'Check Status',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
    },
    approved: {
      icon: CheckCircleIcon,
      title: 'Application Approved!',
      message: 'Congratulations! You can now start accepting clients and managing consultations.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      buttonText: 'Go to Dashboard',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700'
    },
    rejected: {
      icon: XCircleIcon,
      title: 'Application Not Approved',
      message: rejectionReason || 'Your application was not approved. Please contact support for more information.',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      buttonText: 'Contact Support',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    info_needed: {
      icon: ExclamationCircleIcon,
      title: 'Additional Information Required',
      message: 'Our team needs more information to process your application.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      buttonText: 'Update Application',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    }
  }

  const config = statusConfig[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card>
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${config.bgColor}`}>
              <config.icon className={`h-6 w-6 ${config.color}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{config.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {config.message}
              </p>
              
              {professionalTitle && (
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-medium">Professional Title:</span> {professionalTitle}
                </p>
              )}
              
              {submittedAt && (
                <p className="text-sm text-gray-500 mb-4">
                  <span className="font-medium">Submitted:</span> {new Date(submittedAt).toLocaleDateString()}
                </p>
              )}

              <Link href={getActionLink(status)}>
                <Button className={config.buttonColor}>
                  {config.buttonText}
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  )
}

function getActionLink(status: string): string {
  switch (status) {
    case 'draft':
    case 'info_needed':
      return '/practitioner/application'
    case 'pending':
      return '/practitioner/dashboard'
    case 'approved':
      return '/practitioner/dashboard'
    case 'rejected':
      return '/support'
    default:
      return '/practitioner/application'
  }
}