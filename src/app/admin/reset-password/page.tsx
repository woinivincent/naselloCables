'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get('token') ?? '';

  const [validating,  setValidating]  = useState(true);
  const [tokenValid,  setTokenValid]  = useState(false);
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [done,        setDone]        = useState(false);
  const [error,       setError]       = useState('');

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidating(false);
      return;
    }
    fetch(`/api/verify-reset-token.php?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => {
        setTokenValid(d.ok === true);
        setValidating(false);
      })
      .catch(() => setValidating(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch('/api/reset-password.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Error al restablecer la contraseña.');
        return;
      }
      setDone(true);
      setTimeout(() => router.replace('/admin/login'), 3000);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // ── States ────────────────────────────────────────────────────────────────

  if (validating) {
    return (
      <p className="text-gray-400 text-sm">Verificando enlace…</p>
    );
  }

  if (!token || !tokenValid) {
    return (
      <div>
        <p className="text-red-600 text-sm mb-4">
          El enlace es inválido o ya expiró. Solicitá uno nuevo.
        </p>
        <Link href="/admin/forgot-password" className="text-sm text-gray-500 hover:text-black underline">
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <p className="text-green-700 text-sm mb-2">
          ¡Contraseña actualizada correctamente!
        </p>
        <p className="text-gray-500 text-sm">Redirigiendo al login…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nueva contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar contraseña
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Repetí la contraseña"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white rounded px-4 py-2 text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? 'Guardando…' : 'Restablecer contraseña'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-lg p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Nueva contraseña</h1>
        {/* useSearchParams requires Suspense boundary */}
        <Suspense fallback={<p className="text-gray-400 text-sm">Cargando…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
