'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { consultationsApi, reviewsApi } from '@/app/lib/api'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody } from '@/app/components/ui/Card'
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Consultation, Review } from '@/app/types'

export default function ConsultationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = parseInt(params.id as string)
  
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [consultationData, reviewsData] = await Promise.all([
          consultationsApi.getOne(id),
          consultationsApi.getReviews(id).catch(() => [])
        ])
        setConsultation(consultationData)
        setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData.results || [])
      } catch (error) {
        console.error('Failed to fetch consultation:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const updateStatus = async (status: Consultation['status']) => {
    if (!consultation) return
    setUpdating(true)
    try {
      const updated = await consultationsApi.updateStatus(id, status)
      setConsultation(updated)
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="flex justify-center p-8">Loading...</div>
  if (!consultation) return <div>Consultation not found</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold">Consultation Details</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold mb-4">Appointment Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span>
                    Practitioner: Dr. {consultation.practitioner?.first_name} {consultation.practitioner?.last_name}
                  </span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span>Date: {consultation.date}</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span>Time: {consultation.time}</span>
                </div>
                {consultation.duration_minutes && (
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span>Duration: {consultation.duration_minutes} minutes</span>
                  </div>
                )}
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    consultation.status === 'completed' ? 'bg-green-100 text-green-800' :
                    consultation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {consultation.status}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {consultation.client_notes && (
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold mb-4">Notes</h2>
                <p className="text-gray-700">{consultation.client_notes}</p>
              </CardBody>
            </Card>
          )}

          {reviews.length > 0 && (
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                {reviews.map((review) => (
                  <div key={review.id} className="border-b last:border-0 py-3">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-2">
                {consultation.status === 'booked' && (
                  <>
                    <Button 
                      fullWidth 
                      onClick={() => updateStatus('completed')}
                      disabled={updating}
                    >
                      Mark as Completed
                    </Button>
                    <Button 
                      variant="outline" 
                      fullWidth
                      onClick={() => updateStatus('cancelled')}
                      disabled={updating}
                    >
                      Cancel Consultation
                    </Button>
                  </>
                )}
                <Link href={`/dashboard/reviews/create?consultation=${consultation.id}`}>
                  <Button variant="outline" fullWidth>
                    Write a Review
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}