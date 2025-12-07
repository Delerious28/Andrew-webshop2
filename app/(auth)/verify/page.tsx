'use client';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
  const [message, setMessage] = useState('Verifying your email...');
  const router = useRouter();

  useEffect(() => {
    const verifyAndLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      
      if (!token) {
        setMessage('Missing verification token');
        return;
      }
      
      try {
        // Step 1: Verify email
        const verifyRes = await fetch('/api/auth/verify', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }) 
        });
        const verifyData = await verifyRes.json();
        
        if (!verifyData.success || !verifyData.autoLoginToken) {
          setMessage(verifyData.message || 'Verification failed');
          return;
        }
        
        setMessage('✓ Email verified! Logging you in...');
        
        // Step 2: Auto-login with the token
        const loginRes = await fetch('/api/auth/auto-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: verifyData.autoLoginToken })
        });
        const loginData = await loginRes.json();
        
        if (loginData.success && loginData.user) {
          // Sign in using NextAuth with the user's email
          await signIn('credentials', {
            email: loginData.user.email,
            autoLogin: 'true',
            redirect: false
          });
          
          setMessage('✓ Success! Redirecting to home...');
          
          // Redirect after a short delay
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 1500);
        } else {
          setMessage('Email verified! Please sign in with your credentials.');
        }
      } catch (error) {
        setMessage('Unable to verify account. Please try again.');
      }
    };
    
    verifyAndLogin();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">
            {message.includes('✓') ? '✅' : '📧'}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Email Verification
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-lg">{message}</p>
        {message.includes('Logging') && (
          <div className="mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}
