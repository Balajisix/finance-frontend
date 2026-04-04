import { useState, useMemo } from "react";
import { useRecordsList, useCreateRecord, useUpdateRecord, useDeleteRecord } from "../hooks/useRecords.ts";
import { useAuthContext } from "../context/AuthContext.tsx";
import PermissionGate from "../components/PermissionGate.tsx";
import RecordFormModal from "../components/RecordFormModal.tsx";
import { CATEGORIES } from "../constants/categories.ts";
import type { FinancialRecord, FinancialRecordType, RecordFilters } from "../types/records.ts";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const Records = () => {
  const { hasPermission } = useAuthContext();

  const [filters, setFilters] = useState<RecordFilters>({ page: 1, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<FinancialRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useRecordsList(filters);

  const filteredRows = useMemo(() => {
    if (!data?.data) return [];
    if (!search.trim()) return data.data;
    const q = search.toLowerCase();
    return data.data.filter(
      (r) =>
        r.category.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q) ||
        String(r.amount).includes(q)
    );
  }, [data?.data, search]);
  const createRecord = useCreateRecord();
  const updateRecord = useUpdateRecord();
  const deleteRecord = useDeleteRecord();

  const openAdd = () => {
    setEditRecord(null);
    setModalOpen(true);
  };

  const openEdit = (record: FinancialRecord) => {
    setEditRecord(record);
    setModalOpen(true);
  };

  const handleSubmit = (payload: Parameters<typeof createRecord.mutate>[0]) => {
    if (editRecord) {
      updateRecord.mutate(
        { id: editRecord.id, data: payload },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      createRecord.mutate(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  const handleDelete = (id: string) => {
    deleteRecord.mutate(id, { onSuccess: () => setDeleteConfirm(null) });
  };

  const updateFilter = (patch: Partial<RecordFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  };

  const meta = data?.meta;

  return (
    <div className="p-4 space-y-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Financial Records</h1>
        <PermissionGate permission="records.write">
          <button
            onClick={openAdd}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Add Record
          </button>
        </PermissionGate>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search by category, notes, or amount…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Type</label>
            <select
              value={filters.type ?? ""}
              onChange={(e) => updateFilter({ type: (e.target.value || undefined) as FinancialRecordType | undefined })}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Category</label>
            <select
              value={filters.category ?? ""}
              onChange={(e) => updateFilter({ category: e.target.value || undefined })}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">From</label>
            <input
              type="date"
              value={filters.startDate ?? ""}
              onChange={(e) => updateFilter({ startDate: e.target.value || undefined })}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">To</label>
            <input
              type="date"
              value={filters.endDate ?? ""}
              onChange={(e) => updateFilter({ endDate: e.target.value || undefined })}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => { setFilters({ page: 1, pageSize: 10 }); setSearch(""); }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-[700px] w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Notes</th>
              {(hasPermission("records.write") || hasPermission("records.delete")) && (
                <th className="px-4 py-3 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : !filteredRows.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  {search ? "No records match your search" : "No records found"}
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.type === "INCOME"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}>
                      {r.type}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${r.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                    {r.type === "INCOME" ? "+" : "-"}{fmt(r.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{r.notes ?? "—"}</td>
                  {(hasPermission("records.write") || hasPermission("records.delete")) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <PermissionGate permission="records.write">
                          <button
                            onClick={() => openEdit(r)}
                            className="rounded px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                          >
                            Edit
                          </button>
                        </PermissionGate>
                        <PermissionGate permission="records.delete">
                          <button
                            onClick={() => setDeleteConfirm(r.id)}
                            className="rounded px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </PermissionGate>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex flex-col items-center gap-2 border-t border-gray-200 px-4 py-3 sm:flex-row sm:justify-between">
            <p className="text-xs text-gray-500">
              Showing {(meta.page - 1) * meta.pageSize + 1}–{Math.min(meta.page * meta.pageSize, meta.total)} of {meta.total}
            </p>
            <div className="flex gap-1">
              <button
                disabled={!meta.hasPreviousPage}
                onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
              >
                Prev
              </button>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  const gap = prev !== undefined && p - prev > 1;
                  return (
                    <span key={p} className="flex items-center">
                      {gap && <span className="px-1 text-gray-400">…</span>}
                      <button
                        onClick={() => setFilters((f) => ({ ...f, page: p }))}
                        className={`rounded-lg px-3 py-1 text-sm ${
                          p === meta.page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}
              <button
                disabled={!meta.hasNextPage}
                onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      <RecordFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isPending={createRecord.isPending || updateRecord.isPending}
        record={editRecord}
      />

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-gray-900">Delete Record</h3>
            <p className="mt-2 text-sm text-gray-500">Are you sure? This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteRecord.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleteRecord.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;
