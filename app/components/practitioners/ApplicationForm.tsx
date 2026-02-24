'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AcademicCapIcon,
  BriefcaseIcon,
  LinkIcon,
  DocumentIcon,
  PhotoIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { PractitionerApplicationData } from '@/app/types'

interface ApplicationFormProps {
  initialData?: any
  onSubmit: () => void
  onCancel?: () => void
}

interface FileUploadProps {
  label: string
  field: string
  accept: string
  multiple?: boolean
  onFileChange: (file: File | null) => void
}

interface FilesState {
  id_document?: File
  certification_documents?: File
  profile_photo?: File
}

const steps = [
  { id: 'professional', title: 'Professional Info', icon: AcademicCapIcon },
  { id: 'experience', title: 'Experience', icon: BriefcaseIcon },
  { id: 'documents', title: 'Documents', icon: DocumentIcon },
  { id: 'review', title: 'Review', icon: CheckCircleIcon }
]

export function ApplicationForm({ initialData, onSubmit, onCancel }: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [formData, setFormData] = useState<PractitionerApplicationData>({
    professional_title: initialData?.professional_title || '',
    qualifications: initialData?.qualifications || '',
    experience_description: initialData?.experience_description || '',
    specialized_areas: initialData?.specialized_areas || '',
    linkedin_url: initialData?.linkedin_url || '',
    website_url: initialData?.website_url || '',
    terms_accepted: initialData?.terms_accepted || false,
    data_consent_given: initialData?.data_consent_given || false
  })

  const [files, setFiles] = useState<FilesState>({
    id_document: undefined,
    certification_documents: undefined,
    profile_photo: undefined
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleFileChange = (field: keyof FilesState, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [field]: file || undefined
    }))
  }

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      await handleSubmit()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')

      // Create or update application
      let application
      if (initialData) {
        application = await apiClient.practitioners.applications.update(formData)
      } else {
        application = await apiClient.practitioners.applications.create(formData)
      }

      // Upload files if any
      const hasFiles = Object.values(files).some(f => f instanceof File)
      if (hasFiles) {
        await apiClient.practitioners.applications.uploadDocuments({
          id_document: files.id_document,
          certification_documents: files.certification_documents,
          profile_photo: files.profile_photo
        })
      }

      // Submit if not already submitted
      if (!initialData) {
        await apiClient.practitioners.applications.submit()
      }

      onSubmit()
    } catch (err) {
      setError('Failed to submit application. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardBody className="p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative flex-1">
                <div className={`flex items-center justify-center w-full`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= currentStep 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      index < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
                <span className="text-xs mt-2 font-medium">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          {/* Step 1: Professional Info */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Professional Information</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Professional Title *
                </label>
                <input
                  type="text"
                  name="professional_title"
                  value={formData.professional_title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Clinical Nutritionist"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Specialized Areas
                </label>
                <input
                  type="text"
                  name="specialized_areas"
                  value={formData.specialized_areas}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Weight Management, Sports Nutrition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Experience & Qualifications</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Qualifications *
                </label>
                <textarea
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="List your degrees, certifications, and qualifications"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Experience Description *
                </label>
                <textarea
                  name="experience_description"
                  value={formData.experience_description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Describe your relevant experience"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Supporting Documents</h3>
              <p className="text-sm text-gray-500">
                Upload any relevant documents (optional)
              </p>
              
              <FileUpload
                label="ID Document"
                field="id_document"
                accept=".pdf,.jpg,.jpeg,.png"
                onFileChange={(file) => handleFileChange('id_document', file)}
              />

              <FileUpload
                label="Certification Documents"
                field="certification_documents"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple={false}
                onFileChange={(file) => handleFileChange('certification_documents', file)}
              />

              <FileUpload
                label="Profile Photo"
                field="profile_photo"
                accept=".jpg,.jpeg,.png"
                onFileChange={(file) => handleFileChange('profile_photo', file)}
              />
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Review & Submit</h3>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Professional Title:</span> {formData.professional_title}</p>
                <p><span className="font-medium">Specialized Areas:</span> {formData.specialized_areas || 'Not specified'}</p>
                <p><span className="font-medium">Qualifications:</span> {formData.qualifications}</p>
                <p><span className="font-medium">Experience:</span> {formData.experience_description}</p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="terms_accepted"
                    checked={formData.terms_accepted}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span className="text-sm">
                    I confirm that all information provided is accurate and complete *
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="data_consent_given"
                    checked={formData.data_consent_given}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span className="text-sm">
                    I give consent for my data to be processed for verification purposes *
                  </span>
                </label>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onCancel : handleBack}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={loading || (currentStep === 3 && (!formData.terms_accepted || !formData.data_consent_given))}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                {currentStep === steps.length - 1 ? 'Submit Application' : 'Continue'}
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}

function FileUpload({ label, field, accept, multiple, onFileChange }: FileUploadProps) {
  const [fileName, setFileName] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setFileName(file.name)
      onFileChange(file)
    } else {
      setFileName('')
      onFileChange(null)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="border-2 border-dashed rounded-lg p-4 text-center">
        <input
          type="file"
          id={field}
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        <label
          htmlFor={field}
          className="cursor-pointer inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
        >
          <DocumentIcon className="h-5 w-5" />
          <span>Choose file</span>
        </label>
        {fileName && (
          <p className="mt-2 text-sm text-gray-600">{fileName}</p>
        )}
      </div>
    </div>
  )
}