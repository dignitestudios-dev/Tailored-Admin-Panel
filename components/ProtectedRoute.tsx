'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { restoreSession } from '@/lib/slices/authSlice';
import { getStoredAuthSession } from '@/lib/api/auth.api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      const { token, email } = getStoredAuthSession();
      if (token) {
        dispatch(
          restoreSession({
            email: email ?? undefined,
            role: 'admin',
          })
        );
        return;
      }
      router.push('/auth/login');
    }
  }, [dispatch, isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
