export function withLocale(path: string, locale: 'en' | 'ar') {
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `/${locale}/${clean}`;
}


