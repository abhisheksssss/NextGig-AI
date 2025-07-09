// components/Footer.tsx
import Link from 'next/link'
import { FaLinkedin, FaTwitter, FaGithub, FaDiscord } from 'react-icons/fa'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">TalentMatch</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Connecting the best talent with the right opportunities through AI-powered matching.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                <FaGithub className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                <FaDiscord className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-gray-300 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-gray-300 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-gray-300 transition">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-gray-300 transition">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-gray-300 transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-gray-300 transition">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-gray-300 transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-gray-300 transition">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-gray-600 dark:text-gray-300">
                hello@talentmatch.com
              </li>
              <li className="text-gray-600 dark:text-gray-300">
                +1 (555) 123-4567
              </li>
              <li className="text-gray-600 dark:text-gray-300">
                123 Talent Street, San Francisco, CA 94107
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 dark:text-gray-400">
            © {currentYear} TalentMatch. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-gray-400 transition">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-gray-400 transition">
              Terms of Service
            </Link>
            <Link href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-gray-400 transition">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}