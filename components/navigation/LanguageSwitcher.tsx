'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const current = pathname?.split('/').filter(Boolean)[0] === 'ar' ? 'ar' : 'en';
  const other = current === 'en' ? 'ar' : 'en';

  const switchLocale = () => {
    const parts = (pathname || '/').split('/');
    const segs = parts.filter(Boolean);

    if (segs.length === 0) {
      router.push(`/${other}`);
      return;
    }

    if (segs[0] === 'en' || segs[0] === 'ar') {
      segs[0] = other;
    } else {
      segs.unshift(other);
    }
    router.push('/' + segs.join('/'));
  };

  return (
    <button onClick={switchLocale} className="text-sm px-2 py-1 rounded border">
      {other.toUpperCase()}
    </button>
  );
}


