"use client";

import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Wrench } from "lucide-react";
import { Button } from "../ui/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";


export function Footer() {
  const pathname = usePathname();
  const currentLocale = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const t = useTranslations('common.footer');
  return (
    <div className="bg-white">
      {/* Comprehensive Footer */}
      <footer className="bg-[#121212] text-white rounded-tl-[3rem] rounded-tr-[3rem] md:rounded-tl-[6rem] md:rounded-tr-[6rem] lg:rounded-tl-[9rem] lg:rounded-tr-[9rem]">

        <div className="container-responsive px-6 sm:px-8 md:px-12 py-16">

          <div className={`grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12 ${currentLocale === 'ar' ? 'rtl' : 'ltr'}`}>
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className={`flex items-center gap-3`}>
                <div className="w-10 h-10 bg-wrench-accent rounded-lg flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-black" />
                </div>
                <span className="text-2xl font-bold">WrenchEX</span>
              </div>

              <p className={`text-gray-300 max-w-md`}>
                {t('tagline1')}
                <br />
                {t('tagline2')}
              </p>

              <div className={`flex gap-6`}>
                <Link href="#" className="text-gray-400 hover:text-wrench-accent transition-colors p-1">
                  <Facebook className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-wrench-accent transition-colors p-1">
                  <Twitter className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-wrench-accent transition-colors p-1">
                  <Instagram className="h-6 w-6" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-wrench-accent transition-colors p-1">
                  <Linkedin className="h-6 w-6" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className={`font-semibold mb-6 ${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>{t('quickLinks')}</h3>
              <ul className={`space-y-4 text-gray-300 ${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>
                <li><Link href={`/${currentLocale}/about`} className="hover:text-wrench-accent transition-colors block py-2 px-1">{t('aboutUs')}</Link></li>
                <li><Link href={`/${currentLocale}/how-it-works`} className="hover:text-wrench-accent transition-colors block py-2 px-1">{t('howItWorks')}</Link></li>
                <li><Link href={`/${currentLocale}/pricing`} className="hover:text-wrench-accent transition-colors block py-2 px-1">{t('pricing')}</Link></li>
              </ul>
            </div>

            <div className={`space-y-6 ${currentLocale === 'ar' ? 'text-left' : ''}`}>
              <div className={`flex items-center gap-3 py-2`}>
                <Phone className="h-5 w-5 text-wrench-accent flex-shrink-0" />
                <span dir="ltr" className="text-sm">+971 4 123 4567</span>
              </div>
              <div className={`flex items-center gap-3 py-2`}>
                <Mail className="h-5 w-5 text-wrench-accent flex-shrink-0" />
                <span dir="ltr" className="text-sm">support@wrenchex.com</span>
              </div>
              <div className={`flex items-center gap-3 py-2`}>
                <MapPin className="h-5 w-5 text-wrench-accent flex-shrink-0" />
                <span dir="ltr" className="text-sm">Dubai, United Arab Emirates</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={`border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 ${currentLocale === 'ar' ? 'rtl' : 'ltr'}`}>
            <div className={`text-gray-400 text-sm ${currentLocale === 'ar' ? 'text-right' : 'text-left'}`}>{t('copyright')}</div>
            <div className={`flex gap-6 text-sm text-gray-400 ${currentLocale === 'ar' ? 'flex-row-reverse ' : ''}`}>
              <Link href={`/${currentLocale}/privacy`} className="hover:text-wrench-accent transition-colors py-1">{t('privacy')}</Link>
              <Link href={`/${currentLocale}/terms`} className="hover:text-wrench-accent transition-colors py-1">{t('terms')}</Link>
              <Link href={`/${currentLocale}/cookies`} className="hover:text-wrench-accent transition-colors py-1">{t('cookies')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
