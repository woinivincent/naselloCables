'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await fetch('/api/forgot-password.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      // Always show success — don't reveal if the email exists
      setSent(true);
    } catch {
      setError('No se pudo conectar con el servidor. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-lg p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Recuperar contraseña</h1>

        {sent ? (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-6">
              Si el mail está registrado, vas a recibir un enlace para restablecer tu contraseña.
              Revisá tu bandeja de entrada (y la carpeta de spam).
            </p>
            <Link
              href="/admin/login"
              className="text-sm text-gray-500 hover:text-black underline"
            >
              ← Volver al login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Ingresá tu mail corporativo y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mail corporativo
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="usuario@nasellocables.com"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white rounded px-4 py-2 text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'Enviando…' : 'Enviar enlace'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/admin/login" className="text-sm text-gray-500 hover:text-black underline">
                ← Volver al login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
