'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  SparklesIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  CreditCardIcon,
  CalendarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Card, CardBody } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Buttons'

// FAQ data
const faqs = [
  {
    question: "How do I book a consultation?",
    answer: "Browse practitioners, select a time slot that works for you, and confirm your booking. You'll receive a confirmation email with video call details.",
    category: "bookings"
  },
  {
    question: "How do I join a video consultation?",
    answer: "Click the 'Join Call' button in your consultation details page 5 minutes before your scheduled time. Make sure your camera and microphone are enabled.",
    category: "consultations"
  },
  {
    question: "What is your cancellation policy?",
    answer: "Free cancellation up to 24 hours before your appointment. Late cancellations may incur a fee. Check our full policy for details.",
    category: "policies"
  },
  {
    question: "How do I leave a review?",
    answer: "After a completed consultation, you'll receive an email inviting you to leave a review. You can also visit your consultations page to leave feedback.",
    category: "reviews"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, M-PESA, and mobile money. Payment is processed securely before your consultation.",
    category: "payments"
  },
  {
    question: "Can I reschedule my appointment?",
    answer: "Yes, you can reschedule up to 24 hours before your appointment through your dashboard. Visit your consultations page to manage bookings.",
    category: "bookings"
  }
]

// Category data
const categories = [
  { id: "bookings", name: "Bookings & Scheduling", icon: CalendarIcon, color: "from-blue-500 to-blue-600", count: 12 },
  { id: "consultations", name: "Video Consultations", icon: VideoCameraIcon, color: "from-emerald-500 to-teal-500", count: 8 },
  { id: "payments", name: "Payments & Billing", icon: CreditCardIcon, color: "from-purple-500 to-pink-500", count: 6 },
  { id: "reviews", name: "Reviews & Feedback", icon: ChatBubbleLeftRightIcon, color: "from-amber-500 to-orange-500", count: 4 },
  { id: "account", name: "Account Settings", icon: UserGroupIcon, color: "from-indigo-500 to-purple-500", count: 10 },
  { id: "policies", name: "Policies & Security", icon: ShieldCheckIcon, color: "from-rose-500 to-red-500", count: 7 }
]

// Popular articles
const popularArticles = [
  { title: "Getting Started with Telehealth", views: "2.5k", href: "#" },
  { title: "How to Prepare for Your First Consultation", views: "1.8k", href: "#" },
  { title: "Understanding Your Consultation Summary", views: "1.2k", href: "#" },
  { title: "Troubleshooting Video Call Issues", views: "1.1k", href: "#" },
  { title: "Privacy and Data Protection", views: "980", href: "#" }
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const filteredFaqs = activeCategory
    ? faqs.filter(f => f.category === activeCategory)
    : faqs

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 text-teal-100 mb-4">
              <SparklesIcon className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Help Center</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-light mb-4">
              How can we <span className="font-semibold">help</span> you?
            </h1>
            <p className="text-lg text-teal-100 mb-8">
              Search our knowledge base or browse categories to find answers
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-slate-800 bg-white rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-300/50"
              />
              <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2">
                Search
              </Button>
            </div>

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <span className="text-sm text-teal-100">Popular:</span>
              {["booking", "video call", "payment", "cancellation"].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-slate-800 mb-8">Browse by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`border-2 transition-all cursor-pointer hover:shadow-lg ${
                      activeCategory === category.id 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-slate-200 hover:border-teal-200'
                    }`}
                    onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                  >
                    <CardBody className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-lg`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 mb-1">{category.name}</h3>
                          <p className="text-sm text-slate-500">{category.count} articles</p>
                        </div>
                        <ChevronRightIcon className={`h-5 w-5 transition-transform ${
                          activeCategory === category.id ? 'rotate-90 text-teal-600' : 'text-slate-400'
                        }`} />
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* FAQ List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-800">
                {activeCategory 
                  ? categories.find(c => c.id === activeCategory)?.name 
                  : "Frequently Asked Questions"}
              </h2>
              {activeCategory && (
                <button
                  onClick={() => setActiveCategory(null)}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  View All
                </button>
              )}
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-slate-200 hover:border-teal-200 transition-all">
                    <CardBody className="p-0">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full text-left p-5"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-medium text-slate-800 flex-1">{faq.question}</span>
                          <ChevronRightIcon className={`h-5 w-5 text-slate-400 transition-transform ${
                            expandedFaq === index ? 'rotate-90' : ''
                          }`} />
                        </div>
                      </button>
                      {expandedFaq === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-5 pb-5 text-slate-600 border-t border-slate-100 pt-3"
                        >
                          {faq.answer}
                        </motion.div>
                      )}
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Articles */}
            <Card className="border-slate-200 sticky top-24">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <BookOpenIcon className="h-5 w-5 text-teal-600" />
                  Popular Articles
                </h3>
              </div>
              <CardBody className="p-5">
                <div className="space-y-3">
                  {popularArticles.map((article, index) => (
                    <Link key={index} href={article.href}>
                      <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                        <span className="text-sm text-slate-600 group-hover:text-teal-600">
                          {article.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{article.views} views</span>
                          <ArrowRightIcon className="h-4 w-4 text-slate-300 group-hover:text-teal-500" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Contact Support */}
            <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
              <CardBody className="p-6">
                <h3 className="font-semibold text-slate-800 mb-2">Still need help?</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="space-y-3">
                  <Link href="/client/dashboard/help/contact">
                    <Button fullWidth className="bg-teal-600 hover:bg-teal-700 text-white">
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <PhoneIcon className="h-4 w-4" />
                    <span>+254 700 123 456</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <EnvelopeIcon className="h-4 w-4" />
                    <span>support@afyaconnect.com</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Quick Links */}
            <Card className="border-slate-200">
              <CardBody className="p-5">
                <h3 className="font-semibold text-slate-800 mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <Link href="/client/dashboard/help/guides">
                    <div className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-600">
                      <DocumentTextIcon className="h-4 w-4" />
                      User Guides
                    </div>
                  </Link>
                  <Link href="/client/dashboard/help/videos">
                    <div className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-600">
                      <VideoCameraIcon className="h-4 w-4" />
                      Video Tutorials
                    </div>
                  </Link>
                  <Link href="/client/dashboard/help/policies">
                    <div className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-600">
                      <ShieldCheckIcon className="h-4 w-4" />
                      Terms & Policies
                    </div>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Still Need Help Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-teal-600 to-teal-700 text-white border-none">
            <CardBody className="p-8 sm:p-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-semibold mb-2">Can't find what you're looking for?</h2>
                  <p className="text-teal-100">
                    Our support team is available 24/7 to assist you with any questions.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-white text-teal-700 hover:bg-teal-50">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}