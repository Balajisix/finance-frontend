import { useState, type FormEvent } from "react";
import {
  useRolesList,
  usePermissionsList,
  useCreateRole,
  useDeleteRole,
  useAttachPermission,
  useDetachPermission,
  useRoleMembers,
  useAssignMember,
  useRevokeMember,
} from "../hooks/useRoles.ts";
import { useUsersList } from "../hooks/useUsers.ts";
import type { Role } from "../types/roles.ts";
import { getApiErrorMessage } from "../lib/apiErrors.ts";

const closeCreateDialog = (
  setOpen: (v: boolean) => void,
  reset: () => void
) => {
  setOpen(false);
  reset();
};

const Roles = () => {
  const { data: roles, isLoading, isError, error: rolesError, refetch } = useRolesList();
  const { data: allPermissions, isError: permError, error: permErr, refetch: refetchPerm } =
    usePermissionsList();
  const { data: allUsers, isError: usersErr, error: usersListErr, refetch: refetchUsers } =
    useUsersList();
  const createRole = useCreateRole();
  const deleteRole = useDeleteRole();
  const attachPermission = useAttachPermission();
  const detachPermission = useDetachPermission();
  const assignMember = useAssignMember();
  const revokeMember = useRevokeMember();

  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Create role form state
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [createError, setCreateError] = useState("");

  const resetCreate = () => { setSlug(""); setName(""); setDesc(""); setCreateError(""); };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    setCreateError("");
    createRole.mutate(
      { slug, name, ...(desc.trim() ? { description: desc.trim() } : {}) },
      {
        onSuccess: () => { resetCreate(); setShowCreate(false); },
        onError: (err) =>
          setCreateError(getApiErrorMessage(err, "Failed to create role")),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteRole.mutate(id, {
      onSuccess: () => { setDeleteConfirm(null); if (expanded === id) setExpanded(null); },
    });
  };

  const listError =
    isError || permError || usersErr
      ? getApiErrorMessage(rolesError ?? permErr ?? usersListErr, "Could not load roles data.")
      : null;

  return (
    <div className="p-4 space-y-5 sm:p-6">
      {listError && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-red-800">{listError}</p>
          <div className="flex flex-wrap gap-2">
            {isError && (
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-lg bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800"
              >
                Retry roles
              </button>
            )}
            {permError && (
              <button
                type="button"
                onClick={() => refetchPerm()}
                className="rounded-lg bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800"
              >
                Retry permissions
              </button>
            )}
            {usersErr && (
              <button
                type="button"
                onClick={() => refetchUsers()}
                className="rounded-lg bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800"
              >
                Retry users
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Roles &amp; Permissions</h1>
        <button
          type="button"
          onClick={() => {
            resetCreate();
            setShowCreate(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Create Role
        </button>
      </div>

      {/* Create role dialog */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => closeCreateDialog(setShowCreate, resetCreate)}
          role="presentation"
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-role-title"
          >
            <h2 id="create-role-title" className="text-lg font-semibold text-gray-900">
              New role
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Slug must start with a letter and use lowercase letters, numbers, underscores, or hyphens.
            </p>

            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              {createError && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{createError}</div>
              )}
              <div>
                <label htmlFor="role-slug" className="mb-1 block text-sm font-medium text-gray-700">
                  Slug
                </label>
                <input
                  id="role-slug"
                  type="text"
                  required
                  pattern="^[a-z][a-z0-9_-]*$"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. manager"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label htmlFor="role-name" className="mb-1 block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="role-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Manager"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label htmlFor="role-desc" className="mb-1 block text-sm font-medium text-gray-700">
                  Description <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="role-desc"
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="What this role is for…"
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => closeCreateDialog(setShowCreate, resetCreate)}
                  disabled={createRole.isPending}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRole.isPending}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {createRole.isPending ? "Creating…" : "Create role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      ) : isError ? (
        <p className="py-12 text-center text-red-600">Could not load roles.</p>
      ) : !roles?.length ? (
        <p className="py-12 text-center text-gray-400">No roles found</p>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              isExpanded={expanded === role.id}
              onToggle={() => setExpanded(expanded === role.id ? null : role.id)}
              onDelete={() => setDeleteConfirm(role.id)}
              allPermissions={allPermissions ?? []}
              allUsers={allUsers ?? []}
              attachPermission={attachPermission}
              detachPermission={detachPermission}
              assignMember={assignMember}
              revokeMember={revokeMember}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-gray-900">Delete Role</h3>
            <p className="mt-2 text-sm text-gray-500">This will remove the role from all assigned users. Continue?</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteRole.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleteRole.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ──────────────────────── Role Card ──────────────────────── */

type RoleCardProps = {
  role: Role;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  allPermissions: { id: string; slug: string; name: string }[];
  allUsers: { id: string; name: string; email: string }[];
  attachPermission: ReturnType<typeof useAttachPermission>;
  detachPermission: ReturnType<typeof useDetachPermission>;
  assignMember: ReturnType<typeof useAssignMember>;
  revokeMember: ReturnType<typeof useRevokeMember>;
};

const RoleCard = ({
  role, isExpanded, onToggle, onDelete,
  allPermissions, allUsers,
  attachPermission, detachPermission,
  assignMember, revokeMember,
}: RoleCardProps) => {
  const assignedSlugs = new Set(role.permissions.map((p) => p.permission.slug));
  const unassignedPerms = allPermissions.filter((p) => !assignedSlugs.has(p.slug));

  const [permToAdd, setPermToAdd] = useState("");
  const [userToAssign, setUserToAssign] = useState("");

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between px-5 py-4"
        onClick={onToggle}
      >
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{role.name}</h3>
          <p className="text-xs text-gray-500">
            {role.slug} &middot; {role.permissions.length} permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
          <svg
            className={`h-4 w-4 text-gray-400 transition ${isExpanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-5">
          {role.description && <p className="text-sm text-gray-500">{role.description}</p>}

          {/* Permissions section */}
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Permissions</h4>
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((rp) => (
                <span key={rp.permission.id} className="group flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {rp.permission.slug}
                  <button
                    onClick={() => detachPermission.mutate({ roleId: role.id, permissionId: rp.permission.id })}
                    className="ml-0.5 hidden rounded-full p-0.5 text-blue-400 hover:bg-blue-100 hover:text-blue-600 group-hover:inline-block"
                    title="Remove"
                  >
                    &times;
                  </button>
                </span>
              ))}
              {role.permissions.length === 0 && (
                <span className="text-xs text-gray-400">No permissions assigned</span>
              )}
            </div>
            {unassignedPerms.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <select
                  value={permToAdd}
                  onChange={(e) => setPermToAdd(e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-xs outline-none focus:border-blue-500"
                >
                  <option value="">Add permission…</option>
                  {unassignedPerms.map((p) => (
                    <option key={p.id} value={p.slug}>{p.slug}</option>
                  ))}
                </select>
                <button
                  disabled={!permToAdd || attachPermission.isPending}
                  onClick={() => {
                    if (!permToAdd) return;
                    attachPermission.mutate({ roleId: role.id, permissionSlug: permToAdd }, {
                      onSuccess: () => setPermToAdd(""),
                    });
                  }}
                  className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Members section */}
          <MembersSection
            roleId={role.id}
            allUsers={allUsers}
            assignMember={assignMember}
            revokeMember={revokeMember}
            userToAssign={userToAssign}
            setUserToAssign={setUserToAssign}
          />
        </div>
      )}
    </div>
  );
};

/* ──────────────────────── Members Section ──────────────────────── */

type MembersSectionProps = {
  roleId: string;
  allUsers: { id: string; name: string; email: string }[];
  assignMember: ReturnType<typeof useAssignMember>;
  revokeMember: ReturnType<typeof useRevokeMember>;
  userToAssign: string;
  setUserToAssign: (v: string) => void;
};

const MembersSection = ({
  roleId, allUsers, assignMember, revokeMember, userToAssign, setUserToAssign,
}: MembersSectionProps) => {
  const { data: members, isLoading } = useRoleMembers(roleId);

  const memberUserIds = new Set(members?.map((m) => m.userId) ?? []);
  const unassignedUsers = allUsers.filter((u) => !memberUserIds.has(u.id));

  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Members</h4>
      {isLoading ? (
        <p className="text-xs text-gray-400">Loading…</p>
      ) : !members?.length ? (
        <p className="text-xs text-gray-400">No members assigned</p>
      ) : (
        <div className="space-y-1">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-gray-800">{m.user.name}</p>
                <p className="text-xs text-gray-500">{m.user.email}</p>
              </div>
              <button
                onClick={() => revokeMember.mutate({ userId: m.userId, roleId })}
                className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}
      {unassignedUsers.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <select
            value={userToAssign}
            onChange={(e) => setUserToAssign(e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1 text-xs outline-none focus:border-blue-500"
          >
            <option value="">Assign user…</option>
            {unassignedUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
          <button
            disabled={!userToAssign || assignMember.isPending}
            onClick={() => {
              if (!userToAssign) return;
              assignMember.mutate({ userId: userToAssign, roleId }, {
                onSuccess: () => setUserToAssign(""),
              });
            }}
            className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Assign
          </button>
        </div>
      )}
    </div>
  );
};

export default Roles;
