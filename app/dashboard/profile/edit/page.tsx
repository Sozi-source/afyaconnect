'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { profilesApi, authApi } from '@/app/lib/api'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody, CardHeader } from '@/app/components/ui/Card'
import { Tabs } from '@/app/components/ui/Tabs'
import { toast } from 'react-hot-toast'
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  KeyIcon,
  CameraIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/app/contexts/AuthContext'
import { UserProfile, UpdateProfileData, ChangePasswordData } from '@/app/types'

export default function ProfileEditPage() {
  const router = useRouter()
  const { user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

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
      
      // Fetch profile using token authentication
      const profileData = await profilesApi.getMyProfile()
      setProfile(profileData)
      
      // Update form data with fetched values
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
      const updateData: UpdateProfileData = {
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        city: formData.city || undefined,
      }

      if (profile?.id) {
        await profilesApi.update(profile.id, updateData)
      } else {
        await profilesApi.create(updateData)
      }

      toast.success('Profile updated successfully!')
      router.push('/dashboard/profile')
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords
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
      const passwordChangeData: ChangePasswordData = {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      }
      
      await authApi.changePassword(passwordChangeData)
      toast.success('Password changed successfully!')
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch (error: any) {
      console.error('Failed to change password:', error)
      
      if (error.response?.data?.current_password) {
        toast.error(error.response.data.current_password[0])
      } else if (error.response?.data?.new_password) {
        toast.error(error.response.data.new_password[0])
      } else {
        toast.error(error.response?.data?.message || 'Failed to change password')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: UserIcon },
    { id: 'password', label: 'Change Password', icon: KeyIcon },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit}>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <p className="text-sm text-gray-500">Update your personal details</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="h-12 w-12 text-white" />
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <CameraIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Photo</p>
                    <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size 2MB</p>
                  </div>
                </div>

                {/* User Info Summary - Read Only */}
                {authUser && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-medium">{authUser.first_name} {authUser.last_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium">{authUser.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">
                    City
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full pl-10 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      placeholder="Your city"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="submit" disabled={saving}>
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
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Change Password</h2>
              <p className="text-sm text-gray-500">Update your password</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label htmlFor="current_password" className="block text-sm font-medium mb-1">
                    Current Password
                  </label>
                  <input
                    id="current_password"
                    name="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium mb-1">
                    New Password
                  </label>
                  <input
                    id="new_password"
                    name="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Updating...' : 'Change Password'}
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