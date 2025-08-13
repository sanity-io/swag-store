'use client';

import {setMarketoValue} from '@/app/_lib/marketo-tracking';
import {usePathname, useSearchParams} from 'next/navigation';
import {useEffect, useRef} from 'react';

const thirtyDays = 30 * 24 * 60 * 60 * 1000;

const utmSearchParams = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
];

export function MarketoTracking() {
  const history = useRef<string[]>([]);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (!document.referrer) return;
    setMarketoValue('most_recent_referrer_url', document.referrer);
  }, []);

  useEffect(() => {
    utmSearchParams.forEach((param) => {
      const value = searchParams?.get(param);
      if (!value) return;
      setMarketoValue(param, value, thirtyDays);
    });

    if (location.href) {
      setMarketoValue('website_form_submission_url', location.href);
    }

    if (history.current.at(-1) !== location.href) {
      history.current.push(location.href);
    }

    const previousUrl = history.current.at(-2);

    if (previousUrl) {
      setMarketoValue('most_recent_website_referrer_url', previousUrl);
    }
  }, [pathname, searchParams]);

  return null;
}
