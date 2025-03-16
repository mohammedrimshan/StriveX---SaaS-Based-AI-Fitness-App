"use client"

import Link from "next/link"
import { Dumbbell } from "lucide-react"
import { motion } from "framer-motion"
import { Instagram, Twitter, Facebook } from "lucide-react"

interface FooterLink {
  name: string
  href: string
}

interface FooterLinks {
  sitemap: FooterLink[]
  support: FooterLink[]
  legal: FooterLink[]
}

const footerLinks: FooterLinks = {
  sitemap: [
    { name: "About Us", href: "#" },
    { name: "Pricing", href: "#" },
    { name: "News & Blog", href: "#" },
    { name: "Help Center", href: "#" },
  ],
  support: [
    { name: "FAQ", href: "#" },
    { name: "Support Center", href: "#" },
  ],
  legal: [
    { name: "Terms of Service", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Cookie Policy", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-black text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold gradient-text">StriveX</span>
            </div>
            <p className="text-sm text-gray-400">
              Highlight benefits of each exercise with precise and effective metrics.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Sitemap</h3>
            <ul className="space-y-2">
              {footerLinks.sitemap.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Social Media</h3>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                whileHover={{ y: -3 }}
                className="bg-gray-800 p-2 rounded-full hover:bg-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ y: -3 }}
                className="bg-gray-800 p-2 rounded-full hover:bg-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ y: -3 }}
                className="bg-gray-800 p-2 rounded-full hover:bg-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </motion.a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} StriveX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

