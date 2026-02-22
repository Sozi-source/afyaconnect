import Link from 'next/link'
import { Button } from '@/app/components/ui/Buttons'
import { 
  ArrowRightIcon, 
  ChevronRightIcon,
  UserGroupIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon
} from '@heroicons/react/24/outline'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header with Shadow */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl sm:text-2xl font-bold text-teal-600 group-hover:text-teal-700 transition">
                🌿 AfyaConnect
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/about" className="text-sm text-gray-600 hover:text-teal-600 transition font-medium">
                About
              </Link>
              <Link href="/practitioners" className="text-sm text-gray-600 hover:text-teal-600 transition font-medium">
                Practitioners
              </Link>
              <Link href="/how-it-works" className="text-sm text-gray-600 hover:text-teal-600 transition font-medium">
                How It Works
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-teal-600 transition font-medium">
                Contact
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link 
                href="/login" 
                className="hidden sm:block text-sm text-gray-600 hover:text-teal-600 transition font-medium px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link href="/register">
                <Button className="!px-4 !py-1.5 text-sm font-medium shadow-sm hover:shadow-md transition">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - With proper top padding for fixed header */}
      <main className="pt-14 sm:pt-16">
        {/* Hero Section - Quadrant 1 */}
        <section className="bg-gradient-to-br from-teal-50 via-white to-blue-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Column - Text Content */}
              <div className="text-center lg:text-left">
                <div className="inline-block px-3 py-1 bg-teal-100 rounded-full text-teal-700 text-xs font-medium mb-4">
                  🇰🇪 Kenya's Trusted Health Platform
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Connect with Kenya's Best{' '}
                  <span className="text-teal-600">Health Practitioners</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-xl lg:mx-0 mx-auto">
                  Find and book verified nutritionists, dietitians, physiotherapists, 
                  and wellness experts in one secure platform.
                </p>
                
                {/* Button Group */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link href="/register?role=client" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto !px-6 !py-3 text-sm sm:text-base shadow-md">
                      Find Your Expert
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/about" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto !px-6 !py-3 text-sm sm:text-base border-2">
                      Learn More
                    </Button>
                  </Link>
                </div>

                {/* Trust Indicators - Compact */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">500+ Experts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">10k+ Clients</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">98% Satisfied</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Stats Card */}
              <div className="hidden lg:block">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-teal-50 rounded-xl">
                      <UserGroupIcon className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-teal-600">500+</div>
                      <div className="text-xs text-gray-500">Practitioners</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <CalendarIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-blue-600">10k+</div>
                      <div className="text-xs text-gray-500">Appointments</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                      <StarIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-purple-600">4.9</div>
                      <div className="text-xs text-gray-500">Avg Rating</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <ShieldCheckIcon className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="text-xl font-bold text-green-600">100%</div>
                      <div className="text-xs text-gray-500">Verified</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quadrant 2: Steps + Specialties - 2 Column Layout */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left: How It Works */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  How It Works
                </h2>
                <div className="space-y-4">
                  {[
                    { num: '1', title: 'Create Account', desc: 'Sign up in 30 seconds', icon: '👤' },
                    { num: '2', title: 'Find Your Expert', desc: 'Browse by specialty', icon: '🔍' },
                    { num: '3', title: 'Book & Consult', desc: 'Meet virtually or in-person', icon: '📅' }
                  ].map((step) => (
                    <div key={step.num} className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-teal-600 text-lg font-bold">{step.num}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{step.icon}</span>
                          <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Popular Specialties */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  Popular Specialties
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '🥗', name: 'Nutritionist' },
                    { icon: '🌾', name: 'Dietitian' },
                    { icon: '💪', name: 'Physiotherapist' },
                    { icon: '🧘', name: 'Wellness Coach' },
                    { icon: '❤️', name: 'Cardiologist' },
                    { icon: '🧠', name: 'Therapist' }
                  ].map((item) => (
                    <div 
                      key={item.name} 
                      className="bg-gray-50 rounded-lg p-3 flex items-center gap-2 hover:shadow-sm transition border border-gray-100"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quadrant 3: Why Choose Us - 4 Column Feature Grid */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Why Choose AfyaConnect?
              </h2>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                We're committed to your health journey
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { icon: '✓', title: 'Verified Experts', desc: 'Thoroughly vetted' },
                { icon: '📅', title: 'Easy Booking', desc: 'Schedule in seconds' },
                { icon: '🔒', title: 'Secure Platform', desc: 'Data protected' },
                { icon: '🔄', title: 'Flexible Options', desc: 'Virtual or in-person' }
              ].map((item) => (
                <div 
                  key={item.title} 
                  className="bg-white rounded-lg p-4 text-center hover:shadow-md transition border border-gray-100"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quadrant 4: CTA + Quick Links - 2 Column Layout */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left: CTA */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Ready to Start?</h3>
                <p className="text-sm text-teal-100 mb-4">
                  Join thousands of Kenyans finding better health.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href="/register" className="flex-1">
                    <Button 
                      variant="secondary" 
                      className="w-full !px-4 !py-2 text-sm bg-white text-teal-600 hover:bg-gray-100"
                    >
                      Get Started Free
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/about" className="flex-1">
                    <Button 
                      variant="outline" 
                      className="w-full !px-4 !py-2 text-sm border-2 border-white text-white hover:bg-teal-600"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-teal-100 mt-3">
                  No credit card • Cancel anytime
                </p>
              </div>

              {/* Right: Quick Links */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Find Experts', href: '/search' },
                    { label: 'How It Works', href: '/how-it-works' },
                    { label: 'For Practitioners', href: '/join' },
                    { label: 'FAQ', href: '/faq' },
                    { label: 'About Us', href: '/about' },
                    { label: 'Contact', href: '/contact' }
                  ].map((link) => (
                    <Link 
                      key={link.label} 
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-teal-600 transition flex items-center gap-1"
                    >
                      <ChevronRightIcon className="w-3 h-3" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">For Clients</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/search" className="hover:text-teal-400">Find Experts</Link></li>
                <li><Link href="/how-it-works" className="hover:text-teal-400">How It Works</Link></li>
                <li><Link href="/faq" className="hover:text-teal-400">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">For Practitioners</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/join" className="hover:text-teal-400">Join as Expert</Link></li>
                <li><Link href="/pricing" className="hover:text-teal-400">Pricing</Link></li>
                <li><Link href="/resources" className="hover:text-teal-400">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/about" className="hover:text-teal-400">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-teal-400">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-teal-400">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/privacy" className="hover:text-teal-400">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-teal-400">Terms</Link></li>
                <li><Link href="/cookies" className="hover:text-teal-400">Cookies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} AfyaConnect. Made with ❤️ in Kenya.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}