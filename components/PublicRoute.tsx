'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { restoreSession } from '@/lib/slices/authSlice';
import { getStoredAuthSession } from '@/lib/api/auth.api';

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
      return;
    }

    const { token, email } = getStoredAuthSession();
    if (token) {
      dispatch(
        restoreSession({
          email: email ?? undefined,
          role: 'admin',
        })
      );
      router.push('/dashboard');
    }
  }, [dispatch, isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
