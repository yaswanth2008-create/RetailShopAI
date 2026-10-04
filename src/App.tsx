import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { CustomerApp } from '@/pages/customer/CustomerApp';
import { OwnerApp } from '@/pages/owner/OwnerApp';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { toasts, showToast, dismiss } = useToast();

  return (
    <>
      {mode === 'login' ? (
        <Login onSwitchToSignup={() => setMode('signup')} showToast={showToast} />
      ) : (
        <Signup onSwitchToLogin={() => setMode('login')} showToast={showToast} />
      )}
      <Toast toasts={toasts} onDismiss={dismiss} />
    </>
  );
}

function AppContent() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading RetailMind AI...</p>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return <AuthScreen />;
  }

  if (profile.role === 'owner') {
    return <OwnerApp />;
  }

  return <CustomerApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
