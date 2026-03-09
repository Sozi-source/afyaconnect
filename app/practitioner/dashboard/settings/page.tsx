// app/practitioner/dashboard/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeAltIcon,
  ClockIcon,
  CreditCardIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'
import type { Practitioner, UserProfile } from '@/app/types'
import { SaveIcon } from 'lucide-react'

// =============================================
// TYPES
// =============================================
interface NotificationSettings {
  email_consultation_booked: boolean
  email_consultation_cancelled: boolean
  email_consultation_reminder: boolean
  email_payment_received: boolean
  email_review_received: boolean
  email_weekly_summary: boolean
  sms_consultation_reminder: boolean
  sms_payment_notification: boolean
  browser_consultation_reminder: boolean
  browser_new_message: boolean
}

interface PrivacySettings {
  profile_visible: boolean
  show_email: boolean
  show_phone: boolean
  show_availability: boolean
  show_hourly_rate: boolean
  allow_reviews: boolean
  data_sharing: boolean
}

interface SecuritySettings {
  two_factor_enabled: boolean
  login_notifications: boolean
  session_timeout: number
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function PractitionerSettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'security' | 'billing'>('profile')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Profile state
  const [profile, setProfile] = useState<Practitioner | null>(null)
  const [editedProfile, setEditedProfile] = useState<Partial<Practitioner>>({})
  const [isEditing, setIsEditing] = useState(false)
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_consultation_booked: true,
    email_consultation_cancelled: true,
    email_consultation_reminder: true,
    email_payment_received: true,
    email_review_received: true,
    email_weekly_summary: false,
    sms_consultation_reminder: false,
    sms_payment_notification: true,
    browser_consultation_reminder: true,
    browser_new_message: true
  })
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profile_visible: true,
    show_email: false,
    show_phone: false,
    show_availability: true,
    show_hourly_rate: true,
    allow_reviews: true,
    data_sharing: false
  })
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    login_notifications: true,
    session_timeout: 30
  })
  
  // Password change
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  
  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  // Mount effect
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch practitioner profile
  useEffect(() => {
    if (isMounted && isAuthenticated && user) {
      fetchProfile()
    }
  }, [isMounted, isAuthenticated, user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await apiClient.practitioners.getMyProfile()
      setProfile(data)
      setEditedProfile(data)
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setError(null)
      await apiClient.practitioners.updateMyProfile(editedProfile)
      setProfile(editedProfile as Practitioner)
      setIsEditing(false)
      setSuccess('Profile updated successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setSaving(true)
      // API call to save notification settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setSuccess('Notification settings saved')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePrivacy = async () => {
    try {
      setSaving(true)
      // API call to save privacy settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setSuccess('Privacy settings saved')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSecurity = async () => {
    try {
      setSaving(true)
      // API call to save security settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setSuccess('Security settings saved')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setError('New passwords do not match')
      return
    }
    if (passwordData.new.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    try {
      setSaving(true)
      // API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setPasswordData({ current: '', new: '', confirm: '' })
      setSuccess('Password changed successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }
    try {
      setSaving(true)
      // API call to delete account
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
      router.push('/logout')
    } catch (err) {
      setError('Failed to delete account')
      setSaving(false)
    }
  }

  // =============================================
  // EARLY RETURNS
  // =============================================
  if (authLoading || !isMounted || loading) {
    return <LoadingSkeleton />
  }

  if (!isAuthenticated || !user) {
    router.push('/login')
    return null
  }

  // =============================================
  // RENDER
  // =============================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/practitioner/dashboard"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
              <p className="text-sm text-slate-500">Manage your account preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 max-w-md"
          >
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                <p className="text-sm text-emerald-700">{success}</p>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 max-w-md"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <XCircleIcon className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="border-slate-200 sticky top-24">
              <CardBody className="p-4">
                <nav className="space-y-1">
                  {[
                    { id: 'profile', label: 'Profile Information', icon: UserIcon },
                    { id: 'notifications', label: 'Notifications', icon: BellIcon },
                    { id: 'privacy', label: 'Privacy', icon: ShieldCheckIcon },
                    { id: 'security', label: 'Security', icon: LockClosedIcon },
                    { id: 'billing', label: 'Billing & Payments', icon: CreditCardIcon }
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          activeTab === item.id
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </button>
                    )
                  })}
                </nav>
              </CardBody>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="border-slate-200">
                    <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-800">Profile Information</h2>
                      {!isEditing ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsEditing(false)
                              setEditedProfile(profile || {})
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            {saving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                              <>
                                <SaveIcon className="h-4 w-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                    <CardBody className="p-6">
                      <div className="space-y-6">
                        {/* Basic Info */}
                        <div>
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Basic Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ProfileField
                              label="First Name"
                              value={profile?.first_name}
                              editing={isEditing}
                              onChange={(val) => setEditedProfile({ ...editedProfile, first_name: val })}
                              icon={UserIcon}
                            />
                            <ProfileField
                              label="Last Name"
                              value={profile?.last_name}
                              editing={isEditing}
                              onChange={(val) => setEditedProfile({ ...editedProfile, last_name: val })}
                              icon={UserIcon}
                            />
                            <ProfileField
                              label="Email"
                              value={user?.email}
                              type="email"
                              editing={false}
                              icon={EnvelopeIcon}
                            />
                            <ProfileField
                              label="Phone"
                              value={profile?.city ? `+254 ${profile.city}` : 'Not set'}
                              editing={isEditing}
                              onChange={(val) => setEditedProfile({ ...editedProfile, city: val.replace('+254 ', '') })}
                              icon={PhoneIcon}
                            />
                          </div>
                        </div>

                        {/* Professional Info */}
                        <div className="pt-6 border-t border-slate-200">
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Professional Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ProfileField
                              label="Professional Title"
                              value={profile?.first_name ? 'Doctor' : 'Not set'}
                              editing={isEditing}
                              onChange={(val) => {}}
                              icon={BriefcaseIcon}
                            />
                            <ProfileField
                              label="Years of Experience"
                              value={profile?.years_of_experience?.toString() || '0'}
                              editing={isEditing}
                              onChange={(val) => setEditedProfile({ 
                                ...editedProfile, 
                                years_of_experience: parseInt(val) || 0 
                              })}
                              icon={ClockIcon}
                            />
                            <ProfileField
                              label="Hourly Rate"
                              value={profile?.hourly_rate ? `$${profile.hourly_rate}` : 'Not set'}
                              editing={isEditing}
                              onChange={(val) => setEditedProfile({ 
                                ...editedProfile, 
                                hourly_rate: parseInt(val.replace('$', '')) || 0 
                              })}
                              icon={CurrencyDollarIcon}
                            />
                            <ProfileField
                              label="Currency"
                              value={profile?.currency || 'USD'}
                              editing={isEditing}
                              onChange={(val) => setEditedProfile({ ...editedProfile, currency: val })}
                              icon={GlobeAltIcon}
                            />
                          </div>
                        </div>

                        {/* Location */}
                        <div className="pt-6 border-t border-slate-200">
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Location</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ProfileField
                              label="City"
                              value={profile?.city || 'Not set'}
                              editing={isEditing}
                              onChange={(val) => setEditedProfile({ ...editedProfile, city: val })}
                              icon={MapPinIcon}
                            />
                          </div>
                        </div>

                        {/* Bio */}
                        <div className="pt-6 border-t border-slate-200">
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Bio</h3>
                          {isEditing ? (
                            <textarea
                              value={editedProfile.bio || ''}
                              onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                              rows={4}
                              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                              placeholder="Tell clients about yourself..."
                            />
                          ) : (
                            <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
                              {profile?.bio || 'No bio provided yet.'}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="border-slate-200">
                    <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-800">Notification Preferences</h2>
                      <Button
                        size="sm"
                        onClick={handleSaveNotifications}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <SaveIcon className="h-4 w-4 mr-2" />
                            Save Settings
                          </>
                        )}
                      </Button>
                    </div>
                    <CardBody className="p-6">
                      <div className="space-y-6">
                        {/* Email Notifications */}
                        <div>
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Email Notifications</h3>
                          <div className="space-y-3">
                            <ToggleOption
                              label="New consultation booked"
                              description="Get notified when a client books a consultation"
                              checked={notificationSettings.email_consultation_booked}
                              onChange={(checked) => setNotificationSettings({
                                ...notificationSettings,
                                email_consultation_booked: checked
                              })}
                            />
                            <ToggleOption
                              label="Consultation cancelled"
                              description="Receive notification when a client cancels"
                              checked={notificationSettings.email_consultation_cancelled}
                              onChange={(checked) => setNotificationSettings({
                                ...notificationSettings,
                                email_consultation_cancelled: checked
                              })}
                            />
                            <ToggleOption
                              label="Consultation reminders"
                              description="Get reminded 1 hour before consultations"
                              checked={notificationSettings.email_consultation_reminder}
                              onChange={(checked) => setNotificationSettings({
                                ...notificationSettings,
                                email_consultation_reminder: checked
                              })}
                            />
                            <ToggleOption
                              label="Payment received"
                              description="Notification when a payment is processed"
                              checked={notificationSettings.email_payment_received}
                              onChange={(checked) => setNotificationSettings({
                                ...notificationSettings,
                                email_payment_received: checked
                              })}
                            />
                            <ToggleOption
                              label="New review received"
                              description="Get notified when a client leaves a review"
                              checked={notificationSettings.email_review_received}
                              onChange={(checked) => setNotificationSettings({
                                ...notificationSettings,
                                email_review_received: checked
                              })}
                            />
                            <ToggleOption
                              label="Weekly summary"
                              description="Receive a weekly summary of your practice"
                              checked={notificationSettings.email_weekly_summary}
                              onChange={(checked) => setNotificationSettings({
                                ...notificationSettings,
                                email_weekly_summary: checked
                              })}
                            />
                          </div>
                        </div>

                        {/* SMS Notifications */}
                        <div className="pt-6 border-t border-slate-200">
                          <h3 className="text-sm font-medium text-slate-700 mb-4">SMS Notifications</h3>
                          <div className="space-y-3">
                            <ToggleOption
                              label="Consultation reminders"
                              description="Receive SMS reminders before consultations"
                              checked={notificationSettings.sms_consultation_reminder}
                              onChange={(checked) => setNotificationSettings({
                                ...notificationSettings,
                                sms_consultation_reminder: checked
                              })}
                            />
                            <ToggleOption
                              label="Payment notifications"
                              description="Get SMS when payments are processed"
                              checked={notificationSettings.sms_payment_notification}
                              onChange={(checked) => setNotificationSettings({
                                ...notificationSettings,
                                sms_payment_notification: checked
                              })}
                            />
                          </div>
                        </div>

                        {/* Browser Notifications */}
                        <div className="pt-6 border-t border-slate-200">
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Browser Notifications</h3>
                          <div className="space-y-3">
                            <ToggleOption
                              label="Consultation reminders"
                              description="Show browser alerts before consultations"
                              checked={notificationSettings.browser_consultation_reminder}
                              onChange={(checked) => setNotificationSettings({
                                ...notificationSettings,
                                browser_consultation_reminder: checked
                              })}
                            />
                            <ToggleOption
                              label="New messages"
                              description="Alert when you receive new messages"
                              checked={notificationSettings.browser_new_message}
                              onChange={(checked) => setNotificationSettings({
                                ...notificationSettings,
                                browser_new_message: checked
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="border-slate-200">
                    <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-800">Privacy Settings</h2>
                      <Button
                        size="sm"
                        onClick={handleSavePrivacy}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <SaveIcon className="h-4 w-4 mr-2" />
                            Save Settings
                          </>
                        )}
                      </Button>
                    </div>
                    <CardBody className="p-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Profile Visibility</h3>
                          <div className="space-y-3">
                            <ToggleOption
                              label="Profile visible to clients"
                              description="Allow clients to find and view your profile"
                              checked={privacySettings.profile_visible}
                              onChange={(checked) => setPrivacySettings({
                                ...privacySettings,
                                profile_visible: checked
                              })}
                            />
                            <ToggleOption
                              label="Show email address"
                              description="Display your email on your public profile"
                              checked={privacySettings.show_email}
                              onChange={(checked) => setPrivacySettings({
                                ...privacySettings,
                                show_email: checked
                              })}
                            />
                            <ToggleOption
                              label="Show phone number"
                              description="Display your phone on your public profile"
                              checked={privacySettings.show_phone}
                              onChange={(checked) => setPrivacySettings({
                                ...privacySettings,
                                show_phone: checked
                              })}
                            />
                            <ToggleOption
                              label="Show availability"
                              description="Display your available time slots"
                              checked={privacySettings.show_availability}
                              onChange={(checked) => setPrivacySettings({
                                ...privacySettings,
                                show_availability: checked
                              })}
                            />
                            <ToggleOption
                              label="Show hourly rate"
                              description="Display your consultation rates"
                              checked={privacySettings.show_hourly_rate}
                              onChange={(checked) => setPrivacySettings({
                                ...privacySettings,
                                show_hourly_rate: checked
                              })}
                            />
                          </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200">
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Reviews & Feedback</h3>
                          <div className="space-y-3">
                            <ToggleOption
                              label="Allow client reviews"
                              description="Let clients leave reviews after consultations"
                              checked={privacySettings.allow_reviews}
                              onChange={(checked) => setPrivacySettings({
                                ...privacySettings,
                                allow_reviews: checked
                              })}
                            />
                          </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200">
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Data Sharing</h3>
                          <div className="space-y-3">
                            <ToggleOption
                              label="Share anonymized data"
                              description="Help us improve by sharing anonymous usage data"
                              checked={privacySettings.data_sharing}
                              onChange={(checked) => setPrivacySettings({
                                ...privacySettings,
                                data_sharing: checked
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="border-slate-200">
                    <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-800">Security Settings</h2>
                      <Button
                        size="sm"
                        onClick={handleSaveSecurity}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <SaveIcon className="h-4 w-4 mr-2" />
                            Save Settings
                          </>
                        )}
                      </Button>
                    </div>
                    <CardBody className="p-6">
                      <div className="space-y-6">
                        {/* Two-Factor Authentication */}
                        <div>
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Two-Factor Authentication</h3>
                          <ToggleOption
                            label="Enable 2FA"
                            description="Add an extra layer of security to your account"
                            checked={securitySettings.two_factor_enabled}
                            onChange={(checked) => setSecuritySettings({
                              ...securitySettings,
                              two_factor_enabled: checked
                            })}
                          />
                        </div>

                        {/* Login Notifications */}
                        <div className="pt-6 border-t border-slate-200">
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Login Security</h3>
                          <ToggleOption
                            label="Login notifications"
                            description="Get notified of new logins to your account"
                            checked={securitySettings.login_notifications}
                            onChange={(checked) => setSecuritySettings({
                              ...securitySettings,
                              login_notifications: checked
                            })}
                          />
                          
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Session Timeout (minutes)
                            </label>
                            <select
                              value={securitySettings.session_timeout}
                              onChange={(e) => setSecuritySettings({
                                ...securitySettings,
                                session_timeout: parseInt(e.target.value)
                              })}
                              className="w-full md:w-48 px-4 py-2 border border-slate-200 rounded-lg text-sm"
                            >
                              <option value={15}>15 minutes</option>
                              <option value={30}>30 minutes</option>
                              <option value={60}>1 hour</option>
                              <option value={120}>2 hours</option>
                              <option value={240}>4 hours</option>
                            </select>
                          </div>
                        </div>

                        {/* Change Password */}
                        <div className="pt-6 border-t border-slate-200">
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Change Password</h3>
                          <div className="space-y-4 max-w-md">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Current Password
                              </label>
                              <div className="relative">
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  value={passwordData.current}
                                  onChange={(e) => setPasswordData({
                                    ...passwordData,
                                    current: e.target.value
                                  })}
                                  className="w-full px-4 py-2 border border-slate-200 rounded-lg pr-10"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                  {showPassword ? (
                                    <EyeSlashIcon className="h-4 w-4 text-slate-400" />
                                  ) : (
                                    <EyeIcon className="h-4 w-4 text-slate-400" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                New Password
                              </label>
                              <input
                                type="password"
                                value={passwordData.new}
                                onChange={(e) => setPasswordData({
                                  ...passwordData,
                                  new: e.target.value
                                })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Confirm New Password
                              </label>
                              <input
                                type="password"
                                value={passwordData.confirm}
                                onChange={(e) => setPasswordData({
                                  ...passwordData,
                                  confirm: e.target.value
                                })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                              />
                            </div>
                            <Button
                              onClick={handleChangePassword}
                              disabled={saving || !passwordData.current || !passwordData.new || !passwordData.confirm}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              Update Password
                            </Button>
                          </div>
                        </div>

                        {/* Delete Account */}
                        <div className="pt-6 border-t border-slate-200">
                          <h3 className="text-sm font-medium text-slate-700 mb-4 text-red-600">Danger Zone</h3>
                          {!showDeleteConfirm ? (
                            <Button
                              variant="outline"
                              onClick={() => setShowDeleteConfirm(true)}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Delete Account
                            </Button>
                          ) : (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                              <div className="flex items-start gap-3 mb-4">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <h4 className="font-medium text-red-800">Are you absolutely sure?</h4>
                                  <p className="text-sm text-red-600 mt-1">
                                    This action cannot be undone. All your data will be permanently deleted.
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  placeholder='Type "DELETE" to confirm'
                                  value={deleteConfirmation}
                                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                                  className="w-full px-4 py-2 border border-red-200 rounded-lg bg-white"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleDeleteAccount}
                                    disabled={saving || deleteConfirmation !== 'DELETE'}
                                    className="bg-red-600 hover:bg-red-700 text-white flex-1"
                                  >
                                    {saving ? 'Deleting...' : 'Permanently Delete Account'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setShowDeleteConfirm(false)
                                      setDeleteConfirmation('')
                                    }}
                                    className="border-slate-200"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="border-slate-200">
                    <div className="border-b border-slate-200 px-6 py-4">
                      <h2 className="text-lg font-semibold text-slate-800">Billing & Payments</h2>
                    </div>
                    <CardBody className="p-6">
                      <div className="space-y-6">
                        {/* Payment Methods */}
                        <div>
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Payment Methods</h3>
                          <div className="space-y-3">
                            <Card className="border-slate-200 bg-slate-50">
                              <CardBody className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg">
                                      <CreditCardIcon className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-800">VISA •••• 4242</p>
                                      <p className="text-xs text-slate-500">Expires 12/25</p>
                                    </div>
                                  </div>
                                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                    Default
                                  </span>
                                </div>
                              </CardBody>
                            </Card>
                            
                            <Button variant="outline" className="w-full border-dashed">
                              <CreditCardIcon className="h-4 w-4 mr-2" />
                              Add Payment Method
                            </Button>
                          </div>
                        </div>

                        {/* Payout Settings */}
                        <div className="pt-6 border-t border-slate-200">
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Payout Settings</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Payout Method
                              </label>
                              <select className="w-full px-4 py-2 border border-slate-200 rounded-lg">
                                <option>Bank Transfer (3-5 days)</option>
                                <option>M-PESA (Instant)</option>
                                <option>PayPal (2-3 days)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Payout Schedule
                              </label>
                              <select className="w-full px-4 py-2 border border-slate-200 rounded-lg">
                                <option>Weekly</option>
                                <option>Bi-weekly</option>
                                <option>Monthly</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Tax Information */}
                        <div className="pt-6 border-t border-slate-200">
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Tax Information</h3>
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                            <div className="flex items-start gap-3">
                              <ShieldCheckIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
                              <p className="text-sm text-amber-700">
                                Tax information is required for payouts. Please complete your tax profile.
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" className="border-indigo-200 text-indigo-600">
                            Complete Tax Information
                          </Button>
                        </div>

                        {/* Transaction History */}
                        <div className="pt-6 border-t border-slate-200">
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Recent Transactions</h3>
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                  <p className="text-sm font-medium text-slate-800">Consultation #{i}2345</p>
                                  <p className="text-xs text-slate-500">March {i}, 2024</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-slate-800">$150.00</p>
                                  <p className="text-xs text-emerald-600">Completed</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Link
                            href="/practitioner/dashboard/earnings"
                            className="block text-center text-sm text-indigo-600 hover:text-indigo-700 mt-4"
                          >
                            View All Transactions →
                          </Link>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================
// HELPER COMPONENTS
// =============================================

interface ProfileFieldProps {
  label: string
  value?: string
  type?: string
  editing: boolean
  onChange?: (value: string) => void
  icon: any
}

function ProfileField({ label, value, type = 'text', editing, onChange, icon: Icon }: ProfileFieldProps) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      {editing && onChange ? (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      ) : (
        <div className="flex items-center gap-2 text-sm text-slate-800">
          <Icon className="h-4 w-4 text-slate-400" />
          <span>{value || 'Not set'}</span>
        </div>
      )}
    </div>
  )
}

interface ToggleOptionProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleOption({ label, description, checked, onChange }: ToggleOptionProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-indigo-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Skeleton */}
          <div className="w-64 flex-shrink-0">
            <Card className="border-slate-200">
              <CardBody className="p-4">
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1">
            <Card className="border-slate-200">
              <div className="border-b border-slate-200 px-6 py-4">
                <div className="h-6 w-48 bg-slate-200 rounded animate-pulse"></div>
              </div>
              <CardBody className="p-6">
                <div className="space-y-6">
                  <div className="h-20 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-20 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-20 bg-slate-200 rounded animate-pulse"></div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}