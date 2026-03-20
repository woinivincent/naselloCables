'use client';

import { useEffect, useState } from 'react';

type User = {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'editor';
  created_at: string;
};

type FormState = {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'editor';
};

const EMPTY_FORM: FormState = { username: '', email: '', password: '', role: 'editor' };

export default function UsersPage() {
  const [users,       setUsers]       = useState<User[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [currentUser, setCurrentUser] = useState('');

  // Create form
  const [showCreate,  setShowCreate]  = useState(false);
  const [createForm,  setCreateForm]  = useState<FormState>(EMPTY_FORM);
  const [createError, setCreateError] = useState('');
  const [creating,    setCreating]    = useState(false);

  // Edit form
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [editForm,    setEditForm]    = useState<FormState>(EMPTY_FORM);
  const [editError,   setEditError]   = useState('');
  const [saving,      setSaving]      = useState(false);

  // Delete confirm
  const [deletingId,  setDeletingId]  = useState<number | null>(null);

  const loadUsers = () => {
    setLoading(true);
    fetch('/api/users.php', { credentials: 'include' })
      .then((r) => r.json())
      .then((data: User[]) => { setUsers(data); setLoading(false); })
      .catch(() => { setError('Error al cargar usuarios'); setLoading(false); });
  };

  useEffect(() => {
    loadUsers();
    fetch('/api/check-auth.php', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.username ?? ''));
  }, []);

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const res = await fetch('/api/user-create.php', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error ?? 'Error'); return; }
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      loadUsers();
    } catch {
      setCreateError('Error de conexión');
    } finally {
      setCreating(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const startEdit = (u: User) => {
    setEditingId(u.id);
    setEditForm({ username: u.username, email: u.email, password: '', role: u.role });
    setEditError('');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setEditError('');
    setSaving(true);
    try {
      const res = await fetch('/api/user-update.php', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({
          id:       editingId,
          username: editForm.username  || undefined,
          email:    editForm.email     || undefined,
          password: editForm.password  || undefined,
          role:     editForm.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.error ?? 'Error'); return; }
      setEditingId(null);
      loadUsers();
    } catch {
      setEditError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch('/api/user-delete.php', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ id, requester_username: currentUser }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Error al eliminar'); return; }
      setDeletingId(null);
      loadUsers();
    } catch {
      setError('Error de conexión');
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) return <p className="text-gray-400">Cargando usuarios…</p>;
  if (error)   return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
        {users.length < 5 && !showCreate && (
          <button
            onClick={() => { setShowCreate(true); setCreateError(''); setCreateForm(EMPTY_FORM); }}
            className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
          >
            + Nuevo usuario
          </button>
        )}
      </div>

      {/* ── Create form ─────────────────────────────────────────────────────── */}
      {showCreate && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Nuevo usuario</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Usuario</label>
              <input
                value={createForm.username}
                onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="nombre_usuario"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mail corporativo</label>
              <input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="usuario@nasellocables.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contraseña</label>
              <input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value as 'admin' | 'editor' }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="editor">Editor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            {createError && <p className="sm:col-span-2 text-red-500 text-sm">{createError}</p>}
            <div className="sm:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50"
              >
                {creating ? 'Creando…' : 'Crear usuario'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── User table ──────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Usuario</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Mail</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Creado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                {editingId === u.id ? (
                  /* ── Inline edit row ── */
                  <td colSpan={5} className="px-4 py-4">
                    <form onSubmit={handleEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Usuario</label>
                        <input
                          value={editForm.username}
                          onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Mail corporativo</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Nueva contraseña (opcional)</label>
                        <input
                          type="password"
                          value={editForm.password}
                          onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                          placeholder="dejar vacío para no cambiar"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Rol</label>
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as 'admin' | 'editor' }))}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="editor">Editor</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                      {editError && <p className="sm:col-span-2 text-red-500 text-xs">{editError}</p>}
                      <div className="sm:col-span-2 flex gap-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-3 py-1 bg-black text-white text-xs rounded hover:bg-gray-800 disabled:opacity-50"
                        >
                          {saving ? 'Guardando…' : 'Guardar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 border border-gray-300 text-xs rounded hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </td>
                ) : (
                  /* ── Normal row ── */
                  <>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {u.username}
                      {u.username === currentUser && (
                        <span className="ml-2 text-xs text-gray-400">(vos)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role === 'admin' ? 'Administrador' : 'Editor'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(u.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(u)}
                          className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Editar
                        </button>
                        {deletingId === u.id ? (
                          <span className="flex gap-1 items-center">
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeletingId(u.id)}
                            disabled={u.username === currentUser}
                            className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {users.length >= 5 && (
          <p className="px-4 py-3 text-xs text-gray-400 border-t border-gray-100">
            Límite de 5 usuarios alcanzado.
          </p>
        )}
      </div>
    </div>
  );
}
