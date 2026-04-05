import { useState, type FormEvent } from "react";
import { useUsersList, useCreateUser, useDeleteUser } from "../hooks/useUsers.ts";
import { useRolesList } from "../hooks/useRoles.ts";
import PermissionGate from "../components/PermissionGate.tsx";
import type { UserItem } from "../types/users.ts";
import { getApiErrorMessage } from "../lib/apiErrors.ts";

const Users = () => {
  const { data: users, isLoading, isError, error: usersError, refetch } = useUsersList();
  const { data: roles } = useRolesList();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRoleId("");
    setError("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!roleId) {
      setError("Please select a role");
      return;
    }
    createUser.mutate(
      { name, email, password, roleId },
      {
        onSuccess: () => {
          resetForm();
          setShowModal(false);
        },
        onError: (err) => setError(getApiErrorMessage(err, "Failed to create user")),
      }
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    deleteUser.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        setDeleteError(null);
      },
      onError: (err) => setDeleteError(getApiErrorMessage(err, "Could not delete user")),
    });
  };
  return (
    <div className="p-4 space-y-5 sm:p-6">
      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-red-800">{getApiErrorMessage(usersError, "Could not load users.")}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Users</h1>
        <PermissionGate permission="users.write">
          <button
            onClick={() => { setShowModal(true); resetForm(); }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Add User
          </button>
        </PermissionGate>
      </div>

      {/* Users table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-[500px] w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading…</td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-red-600">Could not load users.</td>
              </tr>
            ) : !users?.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No users found</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.role ? (
                      <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {u.role.name}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.status === "ACTIVE"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <PermissionGate permission="users.write">
                      <button
                        onClick={() => setDeleteTarget(u)}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete user"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </PermissionGate>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create user modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-5 text-lg font-semibold text-gray-900">Create New User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                <select
                  required
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select a role…</option>
                  {roles?.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUser.isPending}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {createUser.isPending ? "Creating…" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDeleteTarget(null)}>
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="text-center text-lg font-semibold text-gray-900">Delete User</h3>
            <p className="mt-2 text-center text-sm text-gray-500">
              Are you sure you want to delete <span className="font-medium text-gray-700">{deleteTarget.name}</span>?
              This action cannot be undone.
            </p>
            {deleteError && (
              <p className="mt-3 text-center text-sm text-red-600">{deleteError}</p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteUser.isPending}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleteUser.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
