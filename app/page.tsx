'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowRightIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  StarIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/app/contexts/AuthContext'
import { Button } from '@/app/components/ui/Buttons'

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-primary-500 rounded-full filter blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 -translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-secondary-500 rounded-full filter blur-3xl opacity-20" />

        <div className="container-custom relative z-10 py-20 lg:py-32">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full px-4 py-2 mb-6"
            >
              <span className="text-sm font-medium">Trusted by 10,000+ nutrition experts</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Connect with Top
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                {" "}Nutrition Experts
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              Find, book, and consult with certified nutrition practitioners from around the world. 
              Get personalized guidance for your health journey.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="group">
                    Go to Dashboard
                    <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="group">
                      Get Started Free
                      <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
            >
              {[
                { label: 'Active Users', value: '10K+', icon: UserGroupIcon },
                { label: 'Consultations', value: '50K+', icon: CalendarIcon },
                { label: 'Expert Practitioners', value: '2K+', icon: StarIcon },
                { label: 'Satisfaction Rate', value: '98%', icon: ChartBarIcon },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Everything you need for
              <span className="text-primary-600 dark:text-primary-400"> better nutrition</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Connect, consult, and track your progress with our comprehensive platform
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: UserGroupIcon,
                title: 'Expert Practitioners',
                description: 'Connect with certified nutrition experts specializing in various fields',
                color: 'primary',
              },
              {
                icon: CalendarIcon,
                title: 'Easy Booking',
                description: 'Schedule consultations at your convenience with real-time availability',
                color: 'secondary',
              },
              {
                icon: ChartBarIcon,
                title: 'Track Progress',
                description: 'Monitor your nutrition goals with detailed analytics and insights',
                color: 'primary',
              },
              {
                icon: ShieldCheckIcon,
                title: 'Verified Experts',
                description: 'All practitioners are thoroughly vetted and certified',
                color: 'secondary',
              },
              {
                icon: ClockIcon,
                title: 'Flexible Hours',
                description: '24/7 availability to fit your schedule across time zones',
                color: 'primary',
              },
              {
                icon: CurrencyDollarIcon,
                title: 'Transparent Pricing',
                description: 'Clear rates with no hidden fees or surprises',
                color: 'secondary',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 bg-${feature.color}-100 dark:bg-${feature.color}-900/20 rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className={`h-7 w-7 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 dark:text-gray-300"
            >
              Get started in three simple steps
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Sign up for free and complete your profile to get started',
              },
              {
                step: '02',
                title: 'Find Expert',
                description: 'Browse practitioners, filter by specialty, and read reviews',
              },
              {
                step: '03',
                title: 'Book & Consult',
                description: 'Schedule a consultation and meet with your expert',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative"
              >
                <div className="text-6xl font-bold text-primary-200 dark:text-primary-900/30 mb-4">
                  {item.step}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {item.description}
                </p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary-200 dark:bg-primary-800" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              What Our Users Say
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 dark:text-gray-300"
            >
              Join thousands of satisfied users on their nutrition journey
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Wellness Seeker',
                content: 'Found an amazing nutritionist who helped me achieve my health goals. The platform is incredibly easy to use!',
                rating: 5,
              },
              {
                name: 'Dr. Michael Chen',
                role: 'Nutrition Practitioner',
                content: 'NutriConnect has transformed my practice. I can now reach clients worldwide and manage my schedule efficiently.',
                rating: 5,
              },
              {
                name: 'Emily Rodriguez',
                role: 'Fitness Enthusiast',
                content: 'The consultation was professional and insightful. My practitioner provided personalized advice that really works!',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-8"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center text-white"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl font-bold mb-4"
            >
              Ready to Transform Your Nutrition Journey?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
            >
              Join thousands of users who have already found their perfect nutrition expert
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary-600 hover:bg-gray-100 border-0"
                >
                  Get Started Now
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg" />
                <span className="text-xl font-bold">NutriConnect</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting you with certified nutrition experts for personalized health guidance.
              </p>
            </div>
            
            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'FAQ', 'Support'],
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Contact'],
              },
              {
                title: 'Legal',
                links: ['Privacy', 'Terms', 'Security', 'Cookies'],
              },
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} NutriConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}