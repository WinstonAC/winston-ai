import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import UserFlowAssistant from '@/components/UserFlowAssistant';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/landing');
  }, [router]);

  return null;
}