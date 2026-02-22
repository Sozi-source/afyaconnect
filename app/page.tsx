import Link from 'next/link'
import { Button } from '@/app/components/ui/Buttons'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Ultra Minimal Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <span className="text-lg font-semibold text-teal-600">🌿 Afya</span>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-xs text-gray-500">Sign in</Link>
          <Link href="/register">
            <button className="text-xs bg-teal-50 text-teal-600 px-3 py-1.5 rounded-full">
              Join
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content - Tight Spacing */}
      <main className="px-4 py-6">
        {/* Hero - Compact */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Find Health Experts
          </h1>
          <p className="text-xs text-gray-500 mb-3">
            Connect with Kenya's top practitioners
          </p>
          
          {/* CTA Buttons - Side by side */}
          <div className="flex gap-2">
            <Link href="/register?role=client" className="flex-1">
              <button className="w-full bg-teal-500 text-white text-xs py-2.5 rounded-lg font-medium">
                Find Expert
              </button>
            </Link>
            <Link href="/about" className="flex-1">
              <button className="w-full bg-gray-50 text-gray-700 text-xs py-2.5 rounded-lg border border-gray-200">
                Learn
              </button>
            </Link>
          </div>
        </div>

        {/* Trust Badges - Ultra Compact */}
        <div className="flex gap-2 mb-5">
          <div className="flex-1 bg-teal-50 rounded-lg py-2 text-center">
            <div className="text-sm font-bold text-teal-600">500+</div>
            <div className="text-[10px] text-gray-500">Experts</div>
          </div>
          <div className="flex-1 bg-teal-50 rounded-lg py-2 text-center">
            <div className="text-sm font-bold text-teal-600">10k+</div>
            <div className="text-[10px] text-gray-500">Clients</div>
          </div>
        </div>

        {/* Steps Flow - Horizontal, Minimal, Small Font */}
        <div className="flex items-center justify-between mb-5">
          {/* Step 1 */}
          <div className="flex-1 text-center">
            <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <span className="text-teal-600 text-[10px] font-medium">1</span>
            </div>
            <div className="text-[9px] font-medium text-gray-700">Create Account</div>
          </div>
          
          {/* Arrow */}
          <ArrowRightIcon className="w-3 h-3 text-teal-300 flex-shrink-0" />
          
          {/* Step 2 */}
          <div className="flex-1 text-center">
            <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <span className="text-teal-600 text-[10px] font-medium">2</span>
            </div>
            <div className="text-[9px] font-medium text-gray-700">Find Providers</div>
          </div>
          
          {/* Arrow */}
          <ArrowRightIcon className="w-3 h-3 text-teal-300 flex-shrink-0" />
          
          {/* Step 3 */}
          <div className="flex-1 text-center">
            <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <span className="text-teal-600 text-[10px] font-medium">3</span>
            </div>
            <div className="text-[9px] font-medium text-gray-700">Get service</div>
          </div>
        </div>

        {/* Popular Specialties - No Overflow, Wrapped */}
        <div className="mb-5">
          <h2 className="text-[10px] font-medium text-gray-400 mb-2">POPULAR</h2>
          <div className="flex flex-wrap gap-1.5">
            {[
              '🥗 Nutrition',
              '🌾 Diet',
              '💪 Physio',
              '🧘 Wellness',
              '❤️ Heart',
              '🧠 Mental'
            ].map((item) => (
              <span key={item} className="px-2 py-1 bg-gray-50 rounded-full text-[9px] text-gray-600 border border-gray-100">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Features - Minimal Bullets */}
        <div className="bg-teal-50/50 rounded-lg p-3 mb-4">
          <div className="space-y-1.5">
            {[
              '✓ Verified practitioners',
              '✓ Book in seconds',
              '✓ Cancel anytime'
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <span className="text-teal-500 text-[10px]">●</span>
                <span className="text-[10px] text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA - Compact */}
        <div className="text-center">
          <p className="text-[9px] text-gray-400 mb-2">
            Join 10,000+ Kenyans
          </p>
          <Link href="/register">
            <button className="w-full bg-teal-500 text-white text-xs py-2.5 rounded-lg font-medium">
              Get Started Free
            </button>
          </Link>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-100 px-4 py-3">
        <div className="flex justify-center gap-3 text-[8px] text-gray-400">
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </footer>
    </div>
  )
}