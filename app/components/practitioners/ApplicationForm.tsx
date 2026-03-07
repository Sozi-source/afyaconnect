'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AcademicCapIcon,
  BriefcaseIcon,
  DocumentIcon,
  PhotoIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  LinkIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
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
  currentFile?: string
}

interface FilesState {
  id_document?: File
  certification_documents?: File
  profile_photo?: File
}

const steps = [
  { 
    id: 'professional', 
    title: 'Professional Info', 
    icon: AcademicCapIcon,
    description: 'Tell us about your professional background'
  },
  { 
    id: 'experience', 
    title: 'Experience', 
    icon: BriefcaseIcon,
    description: 'Share your qualifications and expertise'
  },
  { 
    id: 'documents', 
    title: 'Documents', 
    icon: DocumentIcon,
    description: 'Upload supporting documents'
  },
  { 
    id: 'review', 
    title: 'Review', 
    icon: CheckCircleIcon,
    description: 'Review and submit your application'
  }
]

export function ApplicationForm({ initialData, onSubmit, onCancel }: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
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

  const [uploadedFileNames, setUploadedFileNames] = useState<Record<string, string>>({
    id_document: initialData?.id_document || '',
    certification_documents: initialData?.certification_documents || '',
    profile_photo: initialData?.profile_photo || ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    // Clear error for this field if any
    if (error) setError('')
  }

  const handleFileChange = (field: keyof FilesState, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [field]: file || undefined
    }))
    if (file) {
      setUploadedFileNames(prev => ({
        ...prev,
        [field]: file.name
      }))
    }
  }

  const removeFile = (field: keyof FilesState) => {
    setFiles(prev => ({
      ...prev,
      [field]: undefined
    }))
    setUploadedFileNames(prev => ({
      ...prev,
      [field]: ''
    }))
  }

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 0:
        if (!formData.professional_title) {
          setError('Professional title is required')
          return false
        }
        break
      case 1:
        if (!formData.qualifications) {
          setError('Qualifications are required')
          return false
        }
        if (!formData.experience_description) {
          setError('Experience description is required')
          return false
        }
        if (formData.qualifications.length < 20) {
          setError('Qualifications should be at least 20 characters')
          return false
        }
        if (formData.experience_description.length < 50) {
          setError('Experience description should be at least 50 characters')
          return false
        }
        break
      case 3:
        if (!formData.terms_accepted || !formData.data_consent_given) {
          setError('You must accept the terms and consent to proceed')
          return false
        }
        break
    }
    return true
  }

  const handleNext = async () => {
    if (!validateStep()) return
    
    if (currentStep === steps.length - 1) {
      await handleSubmit()
    } else {
      setCurrentStep(prev => prev + 1)
      setError('')
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
    setError('')
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

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
        setSuccess('Uploading documents...')
        await apiClient.practitioners.applications.uploadDocuments({
          id_document: files.id_document,
          certification_documents: files.certification_documents,
          profile_photo: files.profile_photo
        })
      }

      // Submit if not already submitted
      if (!initialData) {
        setSuccess('Submitting application...')
        await apiClient.practitioners.applications.submit()
      }

      setSuccess('Application submitted successfully!')
      setTimeout(() => {
        onSubmit()
      }, 1500)
    } catch (err) {
      setError('Failed to submit application. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const CurrentStepIcon = steps[currentStep].icon

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Header with gradient */}
      <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <CurrentStepIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{steps[currentStep].title}</h2>
            <p className="text-sm text-emerald-50 mt-0.5">{steps[currentStep].description}</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            
            return (
              <div key={step.id} className="flex flex-col items-center relative flex-1">
                <div className="flex items-center justify-center w-full">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-all
                    ${isActive 
                      ? 'bg-emerald-600 text-white shadow-lg scale-110' 
                      : isCompleted
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-200 text-gray-400'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      flex-1 h-1 mx-2 rounded-full transition-all
                      ${index < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
                <span className={`
                  text-xs mt-2 font-medium hidden sm:block
                  ${isActive ? 'text-emerald-600' : isCompleted ? 'text-gray-600' : 'text-gray-400'}
                `}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <div className="p-1 bg-red-100 rounded-lg">
                <XMarkIcon className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-sm text-red-700 flex-1">{error}</p>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3"
            >
              <div className="p-1 bg-emerald-100 rounded-lg">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-sm text-emerald-700 flex-1">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Step 1: Professional Info */}
            {currentStep === 0 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Professional Title <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <AcademicCapIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="professional_title"
                        value={formData.professional_title}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="e.g., Clinical Nutritionist"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Specialized Areas
                    </label>
                    <div className="relative">
                      <BuildingOfficeIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="specialized_areas"
                        value={formData.specialized_areas}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="e.g., Weight Management, Sports Nutrition"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      LinkedIn URL
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        name="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Website URL
                    </label>
                    <div className="relative">
                      <GlobeAltIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        name="website_url"
                        value={formData.website_url}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Experience */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Qualifications <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({formData.qualifications.length}/20 min)
                    </span>
                  </label>
                  <div className="relative">
                    <DocumentTextIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="List your degrees, certifications, and qualifications..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <span className={`text-xs ${formData.qualifications.length < 20 ? 'text-red-500' : 'text-green-500'}`}>
                      {formData.qualifications.length}/20 characters
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Experience Description <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({formData.experience_description.length}/50 min)
                    </span>
                  </label>
                  <div className="relative">
                    <BriefcaseIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="experience_description"
                      value={formData.experience_description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Describe your relevant experience..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <span className={`text-xs ${formData.experience_description.length < 50 ? 'text-red-500' : 'text-green-500'}`}>
                      {formData.experience_description.length}/50 characters
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <ShieldCheckIcon className="w-4 h-4 inline-block mr-1 text-blue-500" />
                  Your documents are secure and encrypted. They'll only be used for verification.
                </p>
                
                <FileUpload
                  label="Profile Photo"
                  field="profile_photo"
                  accept=".jpg,.jpeg,.png"
                  icon={PhotoIcon}
                  onFileChange={(file) => handleFileChange('profile_photo', file)}
                  currentFile={uploadedFileNames.profile_photo}
                  onRemove={() => removeFile('profile_photo')}
                />

                <FileUpload
                  label="ID Document"
                  field="id_document"
                  accept=".pdf,.jpg,.jpeg,.png"
                  icon={DocumentIcon}
                  onFileChange={(file) => handleFileChange('id_document', file)}
                  currentFile={uploadedFileNames.id_document}
                  onRemove={() => removeFile('id_document')}
                />

                <FileUpload
                  label="Certification Documents"
                  field="certification_documents"
                  accept=".pdf,.jpg,.jpeg,.png"
                  icon={DocumentTextIcon}
                  onFileChange={(file) => handleFileChange('certification_documents', file)}
                  currentFile={uploadedFileNames.certification_documents}
                  onRemove={() => removeFile('certification_documents')}
                />
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900">Review Your Application</h3>
                
                <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Professional Title</p>
                      <p className="font-medium text-gray-900">{formData.professional_title || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Specialized Areas</p>
                      <p className="font-medium text-gray-900">{formData.specialized_areas || 'Not provided'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Qualifications</p>
                    <p className="text-sm text-gray-900 mt-1">{formData.qualifications}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="text-sm text-gray-900 mt-1">{formData.experience_description}</p>
                  </div>

                  {(formData.linkedin_url || formData.website_url) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                      {formData.linkedin_url && (
                        <div>
                          <p className="text-xs text-gray-500">LinkedIn</p>
                          <a href={formData.linkedin_url} target="_blank" rel="noopener noreferrer" 
                             className="text-sm text-emerald-600 hover:underline">
                            View Profile
                          </a>
                        </div>
                      )}
                      {formData.website_url && (
                        <div>
                          <p className="text-xs text-gray-500">Website</p>
                          <a href={formData.website_url} target="_blank" rel="noopener noreferrer"
                             className="text-sm text-emerald-600 hover:underline">
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Uploaded Documents</p>
                    <div className="space-y-1">
                      {uploadedFileNames.profile_photo && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <PhotoIcon className="w-4 h-4 text-gray-400" />
                          {uploadedFileNames.profile_photo}
                        </p>
                      )}
                      {uploadedFileNames.id_document && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <DocumentIcon className="w-4 h-4 text-gray-400" />
                          {uploadedFileNames.id_document}
                        </p>
                      )}
                      {uploadedFileNames.certification_documents && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                          {uploadedFileNames.certification_documents}
                        </p>
                      )}
                      {!uploadedFileNames.profile_photo && !uploadedFileNames.id_document && !uploadedFileNames.certification_documents && (
                        <p className="text-sm text-gray-400 italic">No documents uploaded</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="terms_accepted"
                      checked={formData.terms_accepted}
                      onChange={handleInputChange}
                      className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">
                      I confirm that all information provided is accurate and complete. 
                      I understand that providing false information may result in rejection or termination.
                    </span>
                  </label>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="data_consent_given"
                      checked={formData.data_consent_given}
                      onChange={handleInputChange}
                      className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">
                      I give consent for my data to be processed for verification purposes. 
                      My information will be handled according to the privacy policy.
                    </span>
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={currentStep === 0 ? onCancel : handleBack}
            className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </button>
          
          <button
            onClick={handleNext}
            disabled={loading || (currentStep === 3 && (!formData.terms_accepted || !formData.data_consent_given))}
            className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                {currentStep === steps.length - 1 ? 'Submit Application' : 'Continue'}
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function FileUpload({ label, field, accept, icon: Icon, onFileChange, currentFile, onRemove }: FileUploadProps & { icon: any; onRemove?: () => void }) {
  const [fileName, setFileName] = useState<string>(currentFile || '')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      setFileName(file.name)
      onFileChange(file)
    }
  }

  const handleRemove = () => {
    setFileName('')
    if (onRemove) onRemove()
    onFileChange(null)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-emerald-500 transition-colors">
        {fileName ? (
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700 truncate max-w-[200px]">{fileName}</span>
            </div>
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-red-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ) : (
          <label className="cursor-pointer block">
            <input
              type="file"
              accept={accept}
              onChange={handleChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2 py-3">
              <CloudArrowUpIcon className="h-8 w-8 text-gray-400" />
              <span className="text-sm font-medium text-emerald-600">Click to upload</span>
              <span className="text-xs text-gray-500">or drag and drop</span>
              <span className="text-xs text-gray-400 mt-1">{accept.replace(/,/g, ', ')}</span>
            </div>
          </label>
        )}
      </div>
    </div>
  )
}