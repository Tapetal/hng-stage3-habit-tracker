'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SplashScreen from '@/components/shared/SplashScreen';
import { getSession } from '@/lib/auth';

export default function RootPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Show splash for at least 1000ms, max 2000ms — testable window
    const timer = setTimeout(() => {
      const session = getSession();
      if (session) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  if (!visible) return null;
  return <SplashScreen />;
}
