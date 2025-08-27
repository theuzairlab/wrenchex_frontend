import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Wrench } from "lucide-react";
import { Button } from "../ui/Button";
import Link from "next/link";


export function Footer() {
  return (
    <div>
       {/* Comprehensive Footer */}
       <footer className="bg-[#121212] text-white">
        <div className="container-responsive py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-wrench-accent rounded-lg flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-black" />
                </div>
                <span className="text-2xl font-bold">WrenchEX</span>
              </div>
              
              <p className="text-gray-300 max-w-md">
                The Middle East's leading marketplace for automobile spare parts and services. 
                Connecting car owners with trusted sellers and expert service providers.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-wrench-accent" />
                  <span>+971 4 123 4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-wrench-accent" />
                  <span>support@wrenchex.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-wrench-accent" />
                  <span>Dubai, United Arab Emirates</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/about" className="hover:text-wrench-accent transition-colors">About Us</Link></li>
                <li><Link href="/how-it-works" className="hover:text-wrench-accent transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-wrench-accent transition-colors">Pricing</Link></li>
                <li><Link href="/blog" className="hover:text-wrench-accent transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-wrench-accent transition-colors">Careers</Link></li>
              </ul>
            </div>

            {/* For Buyers */}
            <div>
              <h3 className="font-semibold mb-4">For Buyers</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/browse-parts" className="hover:text-wrench-accent transition-colors">Browse Parts</Link></li>
                <li><Link href="/find-services" className="hover:text-wrench-accent transition-colors">Find Services</Link></li>
                <li><Link href="/buyer-protection" className="hover:text-wrench-accent transition-colors">Buyer Protection</Link></li>
                <li><Link href="/mobile-app" className="hover:text-wrench-accent transition-colors">Mobile App</Link></li>
                <li><Link href="/help-center" className="hover:text-wrench-accent transition-colors">Help Center</Link></li>
              </ul>
            </div>

            {/* For Sellers */}
            <div>
              <h3 className="font-semibold mb-4">For Sellers</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/sell-parts" className="hover:text-wrench-accent transition-colors">Sell Parts</Link></li>
                <li><Link href="/offer-services" className="hover:text-wrench-accent transition-colors">Offer Services</Link></li>
                <li><Link href="/seller-tools" className="hover:text-wrench-accent transition-colors">Seller Tools</Link></li>
                <li><Link href="/success-stories" className="hover:text-wrench-accent transition-colors">Success Stories</Link></li>
                <li><Link href="/seller-support" className="hover:text-wrench-accent transition-colors">Seller Support</Link></li>
              </ul>
            </div>
          </div>

          {/* Social Media & Newsletter */}
          <div className="border-t border-gray-800 pt-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-wrench-accent transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-wrench-accent transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-wrench-accent transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-wrench-accent transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>

              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <span className="text-gray-300">Subscribe to our newsletter:</span>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-wrench-accent"
                  />
                  <Button className="rounded-l-none">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2025 WrenchEX. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-wrench-accent transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-wrench-accent transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-wrench-accent transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
