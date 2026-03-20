'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  // Pages that render without auth check (public auth flow)
  const isLogin  = pathname.startsWith('/admin/login')
                || pathname.startsWith('/admin/forgot-password')
                || pathname.startsWith('/admin/reset-password');

  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState('');
  const [role,     setRole]     = useState<'admin' | 'editor' | ''>('');

  // Stable router ref — prevents router from being a useEffect dependency
  const routerRef = useRef(router);
  useEffect(() => { routerRef.current = router; });

  useEffect(() => {
    // On the login page: no auth check needed
    if (isLogin) {
      setChecking(false);
      return;
    }

    // Reset to loading state before every auth check
    setChecking(true);
    let cancelled = false;

    fetch('/api/check-auth.php', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.ok) {
          routerRef.current.replace('/admin/login');
        } else {
          setUsername(data.username ?? '');
          setRole(data.role ?? '');
          setChecking(false);
        }
      })
      .catch(() => {
        if (!cancelled) routerRef.current.replace('/admin/login');
      });

    return () => { cancelled = true; };
  }, [isLogin]); // router intentionally excluded via ref

  const handleLogout = async () => {
    await fetch('/api/logout.php', { method: 'POST', credentials: 'include' });
    routerRef.current.replace('/admin/login');
  };

  // Login page — render without chrome or auth spinner
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
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-gray-800">Admin — Nasello Cables</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/dashboard" className="text-gray-600 hover:text-black">Dashboard</Link>
            <Link href="/admin/products"  className="text-gray-600 hover:text-black">Productos</Link>
            <Link href="/admin/prices"    className="text-gray-600 hover:text-black">Precios</Link>
            <Link href="/admin/media"     className="text-gray-600 hover:text-black">Media</Link>
            {role === 'admin' && (
              <Link href="/admin/users" className="text-gray-600 hover:text-black">Usuarios</Link>
            )}
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
