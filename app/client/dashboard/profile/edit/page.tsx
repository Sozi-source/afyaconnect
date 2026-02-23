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
  ArrowLeftIcon
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
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updateData: Partial<ExtendedUserProfile> = {
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        city: formData.city || undefined,
      }

      if (profile?.id) {
        await apiClient.profiles.update(profile.id, updateData as Partial<UserProfile>)
        toast.success('Profile updated successfully!')
      } else {
        await apiClient.profiles.create(updateData as Partial<UserProfile>)
        toast.success('Profile created successfully!')
      }
      
      router.push('/client/dashboard/profile')
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setSaving(true)
    try {
      toast.success('Password changed successfully!')
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch (error: any) {
      console.error('Failed to change password:', error)
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: UserIcon },
    { id: 'password', label: 'Change Password', icon: KeyIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.back()}
            className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          >
            <ArrowLeftIcon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Edit Profile
          </h1>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit}>
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CardHeader>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Update your personal details</p>
              </CardHeader>
              <CardBody className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="relative mx-auto sm:mx-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center overflow-hidden">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                        )}
                      </div>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1.5 sm:p-2 shadow-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <CameraIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-300" />
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
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Profile Photo</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">JPG, GIF or PNG. Max size 2MB</p>
                    </div>
                  </div>

                  {/* User Info Summary */}
                  {extendedAuthUser && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Account Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Name</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {extendedAuthUser.first_name} {extendedAuthUser.last_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Email</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                            {extendedAuthUser.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-500" />
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-9 sm:pl-10 p-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div>
                      <label htmlFor="city" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <div className="relative">
                        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-500" />
                        <input
                          id="city"
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full pl-9 sm:pl-10 p-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Your city"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label htmlFor="bio" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full p-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.back()}
                      className="w-full sm:w-auto border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saving} 
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 text-sm"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CardHeader>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Change Password</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Update your password</p>
              </CardHeader>
              <CardBody className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="current_password" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <input
                      id="current_password"
                      name="current_password"
                      type="password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      className="w-full p-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="new_password" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <input
                      id="new_password"
                      name="new_password"
                      type="password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      className="w-full p-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Minimum 8 characters</p>
                  </div>

                  <div>
                    <label htmlFor="confirm_password" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      className="w-full p-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.back()}
                      className="w-full sm:w-auto border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saving} 
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 text-sm"
                    >
                      {saving ? 'Updating...' : 'Change Password'}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </form>
        )}
      </div>
    </div>
  )
}