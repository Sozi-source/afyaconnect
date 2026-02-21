'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Buttons'
import { apiClient } from '@/app/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') || 'client'
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    role: defaultRole,
    phone: '',
    bio: '',
    city: '',
    hourly_rate: '',
    years_of_experience: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await apiClient.auth.register({
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        role: formData.role as 'client' | 'practitioner',
        phone: formData.phone,
        ...(formData.role === 'practitioner' && {
          bio: formData.bio,
          city: formData.city,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
          years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : undefined
        })
      })

      localStorage.setItem('authToken', response.token)
      localStorage.setItem('user', JSON.stringify(response))
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                I want to join as
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="client">Client</option>
                <option value="practitioner">Practitioner</option>
              </select>
            </div>

            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+254712345678"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirm_password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Practitioner-only fields */}
            {formData.role === 'practitioner' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Professional Bio
                  </label>
                  <textarea
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Tell us about your experience..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Nairobi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Years Experience
                    </label>
                    <input
                      type="number"
                      name="years_of_experience"
                      value={formData.years_of_experience}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hourly Rate (KES)
                  </label>
                  <input
                    type="number"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="1500"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}