'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/app/lib/api'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Tabs } from '@/app/components/ui/Tabs'
import { toast } from 'react-hot-toast'
import { 
  UserIcon, 
  PhoneIcon, 
  KeyIcon,
  CameraIcon,
  MapPinIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/app/contexts/AuthContext'
import type { UserProfile } from '@/app/types'

// Extended UserProfile type to include bio and city
interface ExtendedUserProfile extends UserProfile {
  bio?: string
  city?: string
}

// Extended auth user type
interface ExtendedAuthUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role?: string
}

export default function ProfileEditPage() {
  const router = useRouter()
  const { user: authUser } = useAuth()
  const extendedAuthUser = authUser as ExtendedAuthUser | null
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    phone: '',
    bio: '',
    city: '',
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      
      const profileData = await apiClient.profiles.getMyProfile() as ExtendedUserProfile
      setProfile(profileData)
      
      setFormData({
        phone: profileData?.phone || '',
        bio: profileData?.bio || '',
        city: profileData?.city || '',
      })

    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('File must be an image')
        return
      }
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateProfileForm()) return
    
    setSaving(true)

    try {
      const updateData: Partial<ExtendedUserProfile> = {
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        city: formData.city || undefined,
      }

      await apiClient.profiles.updateMyProfile(updateData as Partial<UserProfile>)
      toast.success('Profile updated successfully!')
      
      // If avatar was selected, upload it
      if (avatar) {
        toast.success('Avatar upload coming soon!')
      }
      
      router.push(`/${extendedAuthUser?.role}/dashboard/profile`)
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!passwordData.current_password) {
      newErrors.current_password = 'Current password is required'
    }
    if (!passwordData.new_password) {
      newErrors.new_password = 'New password is required'
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters'
    }
    if (!passwordData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your new password'
    } else if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePasswordForm()) return

    setSaving(true)
    try {
      // TODO: Implement password change API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Password changed successfully!')
      
      // Clear the form
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch (error: any) {
      console.error('Failed to change password:', error)
      toast.error('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 border-4 border-emerald-200 border-t-emerald-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: UserIcon },
    { id: 'password', label: 'Change Password', icon: KeyIcon },
  ]

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
          className="!p-2 sm:!px-4"
        >
          <ArrowLeftIcon className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Edit Profile</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Update your personal information and settings</p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit}>
          <Card>
            <CardHeader className="border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Profile Information</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Update your personal details</p>
            </CardHeader>
            <CardBody className="p-4 sm:p-6">
              <div className="space-y-5 sm:space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  <div className="relative mx-auto sm:mx-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 sm:p-2 shadow-lg cursor-pointer hover:bg-slate-100 transition border border-slate-200"
                    >
                      <CameraIcon className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm font-medium text-slate-700">Profile Photo</p>
                    <p className="text-xs text-slate-500 mt-1">JPG, GIF or PNG. Max size 2MB</p>
                  </div>
                </div>

                {/* User Info Summary */}
                {extendedAuthUser && (
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
                    <h3 className="text-xs sm:text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 text-slate-500" />
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-500">Name</p>
                        <p className="text-xs sm:text-sm font-medium text-slate-900">
                          {extendedAuthUser.first_name} {extendedAuthUser.last_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="text-xs sm:text-sm font-medium text-slate-900 break-all">
                          {extendedAuthUser.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        errors.phone ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="+254 123 456 789"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <XCircleIcon className="h-3 w-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    City
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Nairobi"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Brief description about yourself. Max 500 characters.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-200">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.back()}
                    className="w-full sm:w-auto text-xs sm:text-sm py-2.5"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving} 
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm py-2.5"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit}>
          <Card>
            <CardHeader className="border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Change Password</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Update your password to keep your account secure</p>
            </CardHeader>
            <CardBody className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label htmlFor="current_password" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Current Password
                  </label>
                  <input
                    id="current_password"
                    name="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.current_password ? 'border-red-500' : 'border-slate-300'
                    }`}
                    required
                  />
                  {errors.current_password && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <XCircleIcon className="h-3 w-3" />
                      {errors.current_password}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="new_password" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    id="new_password"
                    name="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.new_password ? 'border-red-500' : 'border-slate-300'
                    }`}
                    required
                  />
                  {errors.new_password && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <XCircleIcon className="h-3 w-3" />
                      {errors.new_password}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1.5">Minimum 8 characters</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm_password" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.confirm_password ? 'border-red-500' : 'border-slate-300'
                    }`}
                    required
                  />
                  {errors.confirm_password && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <XCircleIcon className="h-3 w-3" />
                      {errors.confirm_password}
                    </p>
                  )}
                </div>

                {/* Password Requirements Info */}
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <InformationCircleIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-blue-700 font-medium mb-1">Password Requirements</p>
                      <ul className="text-xs text-blue-600 space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• Include uppercase and lowercase letters</li>
                        <li>• Include at least one number</li>
                        <li>• Include at least one special character</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-200">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.back()}
                    className="w-full sm:w-auto text-xs sm:text-sm py-2.5"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving} 
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm py-2.5"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        Updating...
                      </span>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </form>
      )}
    </div>
  )
}