import Link from 'next/link'
import { Button } from '@/app/components/ui/Buttons'
import { Card, CardBody } from '@/app/components/ui/Card'
import { 
  UserGroupIcon, 
  CalendarIcon, 
  ShieldCheckIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

export default function PublicPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">AfyaConnect</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Sign In
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Connect with Health
              <span className="text-blue-600"> Practitioners</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Book consultations with verified nutritionists, dietitians, and wellness experts. 
              Your journey to better health starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register?role=client">
                <Button size="lg" className="w-full sm:w-auto">
                  Find a Practitioner
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register?role=practitioner">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Join as Practitioner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose AfyaConnect?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make it easy to find and book appointments with trusted health professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardBody className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Verified Experts</h3>
                <p className="text-gray-600 text-sm">
                  All practitioners are thoroughly vetted and verified before joining
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Easy Booking</h3>
                <p className="text-gray-600 text-sm">
                  Schedule appointments instantly with real-time availability
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure Platform</h3>
                <p className="text-gray-600 text-sm">
                  Your data and privacy are protected with enterprise-grade security
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Flexible Scheduling</h3>
                <p className="text-gray-600 text-sm">
                  Choose times that work best for you, including evenings and weekends
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Account</h3>
              <p className="text-gray-600">
                Sign up as a client or practitioner in minutes
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Find Your Match</h3>
              <p className="text-gray-600">
                Search for practitioners by specialty, location, or availability
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Book & Consult</h3>
              <p className="text-gray-600">
                Schedule your appointment and meet virtually or in person
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* For Practitioners Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Are you a health practitioner?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Join our platform to grow your practice, manage appointments, and connect with clients seeking your expertise.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckBadgeIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Reach more clients in your area</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckBadgeIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Simplify scheduling and payments</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckBadgeIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Build your reputation with client reviews</span>
                </li>
              </ul>
              <Link href="/register?role=practitioner">
                <Button size="lg">
                  Join as Practitioner
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="bg-blue-50 rounded-2xl p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                  <span>Set your own rates</span>
                </div>
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 text-blue-600" />
                  <span>Flexible working hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-5 w-5 text-blue-600" />
                  <span>Offer virtual or in-person consultations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start your health journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of clients and practitioners already using AfyaConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=client">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto">
                Find a Practitioner
              </Button>
            </Link>
            <Link href="/register?role=practitioner">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700 w-full sm:w-auto">
                Join as Practitioner
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">AfyaConnect</h3>
              <p className="text-sm">
                Connecting you with trusted health practitioners for better wellness.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Clients</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/search" className="hover:text-white">Find Practitioners</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Practitioners</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/join" className="hover:text-white">Join as Practitioner</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            © {new Date().getFullYear()} AfyaConnect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}