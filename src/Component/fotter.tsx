// components/Footer.tsx
import Link from 'next/link'
import { FaLinkedin, FaTwitter, FaGithub, FaDiscord } from 'react-icons/fa'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
   <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
  <div className="container mx-auto px-6 py-8">
    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
      {/* Brand & Social */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="text-center md:text-left">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">NextGig</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Connect. Apply. Succeed.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition" aria-label="LinkedIn">
            <FaLinkedin className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition" aria-label="Twitter">
            <FaTwitter className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition" aria-label="GitHub">
            <FaGithub className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition" aria-label="Discord">
            <FaDiscord className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Links */}
      <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
        <Link href="#" className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition">
          About
        </Link>
        <Link href="#" className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition">
          Help Center
        </Link>
        <Link href="#" className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition">
          Privacy
        </Link>
        <Link href="#" className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition">
          Terms
        </Link>
        <a href="mailto:nextgig@nextgig.com" className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition">
          Contact
        </a>
      </div>

      {/* Copyright */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        © {currentYear} NextGig
      </div>
    </div>
  </div>
</footer>
  )
}