'use client';

import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function I18nProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const locale = useMemo(() => {
    const seg = pathname?.split('/').filter(Boolean)[0];
    return seg === 'ar' ? 'ar' : 'en';
  }, [pathname]);

  const [messages, setMessages] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const mod = await import(`@/messages/${locale}.json`);
        if (active) setMessages(mod.default);
      } catch {
        if (active) setMessages({});
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [locale]);

  if (!messages) return null;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}


