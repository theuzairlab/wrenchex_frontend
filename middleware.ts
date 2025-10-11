import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export const config = {
  matcher: [
    '/((?!_next|.*\\..*|favicon.ico|robots.txt|sitemap.xml|api).*)'
  ]
};


