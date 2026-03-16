'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const isLogin  = pathname.startsWith('/admin/login');

  const [checking,  setChecking]  = useState(!isLogin);
  const [username,  setUsername]  = useState('');

  useEffect(() => {
    if (isLogin) return;

    fetch('/api/check-auth.php', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) {
          router.replace('/admin/login');
        } else {
          setUsername(data.username ?? '');
          setChecking(false);
        }
      })
      .catch(() => router.replace('/admin/login'));
  }, [isLogin, router]);

  const handleLogout = async () => {
    await fetch('/api/logout.php', { method: 'POST', credentials: 'include' });
    router.replace('/admin/login');
  };

  // Login page — render without chrome
  if (isLogin) return <>{children}</>;

  // Auth check in progress
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Verificando sesión…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-gray-800">Admin — Nasello Cables</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/dashboard" className="text-gray-600 hover:text-black">Dashboard</Link>
            <Link href="/admin/products"  className="text-gray-600 hover:text-black">Productos</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{username}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-gray-700"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
