"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// ===== Types =====
type Status = "active" | "disabled";

type HealthLog = {
  id: string;
  date: string; // YYYY-MM-DD
  weekday?: string | null;
  weight?: string | null; // Decimal -> nhận string
  morning?: string | null;
  gym?: string | null;
  afternoon?: string | null;
  noEatAfter?: string | null;
  calories?: number | null;
  goutTreatment?: number | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
};

// ===== Helpers =====
function toVNDateStr(date = new Date()) {
  const tzDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );
  const y = tzDate.getFullYear();
  const m = String(tzDate.getMonth() + 1).padStart(2, "0");
  const d = String(tzDate.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function shorten(s?: string | null, n = 18) {
  if (!s) return "-";
  return s.length > n ? s.slice(0, n) + "…" : s;
}
function addDays(yyyyMmDd: string, delta: number) {
  const [y, m, d] = yyyyMmDd.split("-").map((v) => +v);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

// ===== Page =====
export default function HealthLogPage() {
  const [date, setDate] = useState<string>(toVNDateStr());
  const [items, setItems] = useState<HealthLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add form state
  const [form, setForm] = useState({
    weight: "",
    morning: "",
    gym: "",
    afternoon: "",
    noEatAfter: "",
    calories: "",
    goutTreatment: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  // Edit modal state
  const [editing, setEditing] = useState<HealthLog | null>(null);
  const [editForm, setEditForm] = useState({
    date: "",
    weight: "",
    morning: "",
    gym: "",
    afternoon: "",
    noEatAfter: "",
    calories: "",
    goutTreatment: "",
    status: "active" as Status,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Menu state (per-row action menu)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Load data
  const load = async (targetDate = date) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/healthlog?date=${targetDate}`, { cache: "no-store" });
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close menus by outside click / ESC
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.("[data-row-menu]")) setMenuOpenId(null);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpenId(null);
        setEditing(null);
      }
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Actions
  const createItem = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const payload = {
        date,
        weight: form.weight ? Number(form.weight).toFixed(2) : null,
        morning: form.morning || null,
        gym: form.gym || null,
        afternoon: form.afternoon || null,
        noEatAfter: form.noEatAfter || null,
        calories: form.calories ? Number(form.calories) : null,
        goutTreatment: form.goutTreatment ? Number(form.goutTreatment) : null,
      };
      const res = await fetch("/api/healthlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Cannot create");
      }
      await load(date);
      // reset lightweight
      setForm({
        weight: "",
        morning: "",
        gym: "",
        afternoon: "",
        noEatAfter: "",
        calories: "",
        goutTreatment: "",
      });
    } catch (e) {
      alert((e as Error).message || "Cannot create");
    } finally {
      setIsCreating(false);
    }
  };

  const openEdit = (item: HealthLog) => {
    setEditing(item);
    setEditForm({
      date: item.date || date,
      weight: item.weight ?? "",
      morning: item.morning ?? "",
      gym: item.gym ?? "",
      afternoon: item.afternoon ?? "",
      noEatAfter: item.noEatAfter ?? "",
      calories: item.calories != null ? String(item.calories) : "",
      goutTreatment: item.goutTreatment != null ? String(item.goutTreatment) : "",
      status: item.status,
    });
  };

  const updateItem = async () => {
    if (!editing || isUpdating) return;
    setIsUpdating(true);
    try {
      const payload: any = {
        date: editForm.date,
        weight: editForm.weight ? Number(editForm.weight).toFixed(2) : null,
        morning: editForm.morning || null,
        gym: editForm.gym || null,
        afternoon: editForm.afternoon || null,
        noEatAfter: editForm.noEatAfter || null,
        calories: editForm.calories ? Number(editForm.calories) : null,
        goutTreatment: editForm.goutTreatment
          ? Number(editForm.goutTreatment)
          : null,
        status: editForm.status,
      };
      const res = await fetch(`/api/healthlog/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Cannot update");
      }
      setEditing(null);
      await load(date);
    } catch (e) {
      alert((e as Error).message || "Cannot update");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteItem = async (id: string) => {
    setMenuOpenId(null);
    if (!confirm("Delete this entry? (soft delete)")) return;
    try {
      const res = await fetch(`/api/healthlog/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Cannot delete");
      }
      await load(date);
    } catch (e) {
      alert((e as Error).message || "Cannot delete");
    }
  };

  const onPrev = async () => {
    const d = addDays(date, -1);
    setDate(d);
    await load(d);
  };
  const onNext = async () => {
    const d = addDays(date, +1);
    setDate(d);
    await load(d);
  };
  const onJump = async (d: string) => {
    setDate(d);
    await load(d);
  };

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Health Log</h1>

        <div className="sm:ml-auto flex items-center gap-2">
          <button
            onClick={onPrev}
            className="px-2 py-1 rounded-md border hover:bg-gray-50"
            aria-label="Previous day"
            title="Previous day"
          >
            ‹
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => onJump(e.target.value)}
            className="px-2 py-1 rounded-md border text-sm"
          />
          <button
            onClick={onNext}
            className="px-2 py-1 rounded-md border hover:bg-gray-50"
            aria-label="Next day"
            title="Next day"
          >
            ›
          </button>
        </div>
      </div>

      {/* Add form */}
      <div className="rounded-md border bg-white p-3 sm:p-4 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
          <div className="col-span-1">
            <label className="block text-xs text-gray-600 mb-1">Weight (kg)</label>
            <input
              value={form.weight}
              onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
              placeholder="58.0"
              className="w-full rounded-md border px-2 py-1 text-sm"
              inputMode="decimal"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs text-gray-600 mb-1">Calories</label>
            <input
              value={form.calories}
              onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))}
              placeholder="1700"
              className="w-full rounded-md border px-2 py-1 text-sm"
              inputMode="numeric"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs text-gray-600 mb-1">Gout</label>
            <input
              value={form.goutTreatment}
              onChange={(e) =>
                setForm((f) => ({ ...f, goutTreatment: e.target.value }))
              }
              placeholder="0-3"
              className="w-full rounded-md border px-2 py-1 text-sm"
              inputMode="numeric"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs text-gray-600 mb-1">Morning</label>
            <input
              value={form.morning}
              onChange={(e) => setForm((f) => ({ ...f, morning: e.target.value }))}
              placeholder="Tập bóng..."
              className="w-full rounded-md border px-2 py-1 text-sm"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs text-gray-600 mb-1">Gym</label>
            <input
              value={form.gym}
              onChange={(e) => setForm((f) => ({ ...f, gym: e.target.value }))}
              placeholder=""
              className="w-full rounded-md border px-2 py-1 text-sm"
            />
          </div>
          <div className="col-span-2 sm:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Afternoon</label>
            <input
              value={form.afternoon}
              onChange={(e) => setForm((f) => ({ ...f, afternoon: e.target.value }))}
              placeholder="Đá bóng..."
              className="w-full rounded-md border px-2 py-1 text-sm"
            />
          </div>
          <div className="col-span-2 sm:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">No eat after 18:30</label>
            <input
              value={form.noEatAfter}
              onChange={(e) =>
                setForm((f) => ({ ...f, noEatAfter: e.target.value }))
              }
              placeholder="Ok"
              className="w-full rounded-md border px-2 py-1 text-sm"
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={createItem}
            disabled={isCreating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-green-600 bg-green-500 text-white hover:bg-green-600 active:bg-green-700 disabled:opacity-60"
          >
            {isCreating ? <Spinner className="w-4 h-4 text-white" /> : <PlusIcon />}
            <span>{isCreating ? "Saving..." : "Add entry"}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-4 py-2 text-left">Date</th>
              <th className="px-3 sm:px-4 py-2 text-right">Weight</th>
              <th className="px-3 sm:px-4 py-2 text-left hidden md:table-cell">Morning</th>
              <th className="px-3 sm:px-4 py-2 text-left hidden md:table-cell">Gym</th>
              <th className="px-3 sm:px-4 py-2 text-left">Afternoon</th>
              <th className="px-3 sm:px-4 py-2 text-left hidden md:table-cell">NoEat18:30</th>
              <th className="px-3 sm:px-4 py-2 text-right">Kcal</th>
              <th className="px-3 sm:px-4 py-2 text-right">Gout</th>
              <th className="px-3 sm:px-4 py-2 text-right w-12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={9} className="px-3 sm:px-4 py-6 text-center text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="w-4 h-4" /> Loading...
                  </span>
                </td>
              </tr>
            )}

            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 sm:px-4 py-6 text-center text-gray-500">
                  No data for this day.
                </td>
              </tr>
            )}

            {!isLoading &&
              items.map((it) => {
                const isMenuOpen = menuOpenId === it.id;
                return (
                  <tr
                    key={it.id}
                    className={[
                      "border-t",
                      it.status === "disabled"
                        ? "bg-gray-100 text-gray-500"
                        : "odd:bg-white even:bg-gray-50",
                    ].join(" ")}
                  >
                    <td className="px-3 sm:px-4 py-2">{it.date}</td>
                    <td className="px-3 sm:px-4 py-2 text-right">
                      {it.weight ? Number(it.weight).toFixed(2) : "-"}
                    </td>
                    <td className="px-3 sm:px-4 py-2 hidden md:table-cell">
                      <span title={it.morning || ""}>{shorten(it.morning, 20)}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-2 hidden md:table-cell">
                      <span title={it.gym || ""}>{shorten(it.gym, 16)}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-2">
                      <span title={it.afternoon || ""}>{shorten(it.afternoon, 18)}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-2 hidden md:table-cell">
                      <span title={it.noEatAfter || ""}>{shorten(it.noEatAfter, 10)}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-right">
                      {it.calories ?? "-"}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-right">
                      {it.goutTreatment ?? "-"}
                    </td>

                    <td
                      className="px-3 sm:px-4 py-2 text-right relative select-none"
                      data-row-menu
                    >
                      <button
                        type="button"
                        onClick={() => setMenuOpenId((v) => (v === it.id ? null : it.id))}
                        className="inline-grid place-items-center w-7 h-7 rounded hover:bg-gray-100"
                        aria-haspopup="menu"
                        aria-expanded={isMenuOpen}
                        aria-label="Open row menu"
                      >
                        <DotsIcon />
                      </button>

                      {isMenuOpen && (
                        <div
                          role="menu"
                          className="absolute right-2 bottom-8 z-20 w-36 rounded-md border bg-white shadow-lg py-1 text-sm"
                        >
                          <button
                            role="menuitem"
                            onClick={() => {
                              setMenuOpenId(null);
                              openEdit(it);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
                          >
                            <EditIcon className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            role="menuitem"
                            onClick={() => deleteItem(it.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-red-600"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div
          className="fixed inset-0 z-30 bg-black/30 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Edit entry</h2>
              <button
                onClick={() => setEditing(null)}
                className="w-8 h-8 inline-grid place-items-center rounded hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="w-full rounded-md border px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Weight</label>
                <input
                  value={editForm.weight}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, weight: e.target.value }))
                  }
                  className="w-full rounded-md border px-2 py-1 text-sm"
                  inputMode="decimal"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Calories</label>
                <input
                  value={editForm.calories}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, calories: e.target.value }))
                  }
                  className="w-full rounded-md border px-2 py-1 text-sm"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Gout</label>
                <input
                  value={editForm.goutTreatment}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, goutTreatment: e.target.value }))
                  }
                  className="w-full rounded-md border px-2 py-1 text-sm"
                  inputMode="numeric"
                />
              </div>

              <div className="col-span-2 sm:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Morning</label>
                <input
                  value={editForm.morning}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, morning: e.target.value }))
                  }
                  className="w-full rounded-md border px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Gym</label>
                <input
                  value={editForm.gym}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, gym: e.target.value }))
                  }
                  className="w-full rounded-md border px-2 py-1 text-sm"
                />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Afternoon</label>
                <input
                  value={editForm.afternoon}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, afternoon: e.target.value }))
                  }
                  className="w-full rounded-md border px-2 py-1 text-sm"
                />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">No eat after 18:30</label>
                <input
                  value={editForm.noEatAfter}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, noEatAfter: e.target.value }))
                  }
                  className="w-full rounded-md border px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, status: e.target.value as Status }))
                  }
                  className="w-full rounded-md border px-2 py-1 text-sm"
                >
                  <option value="active">active</option>
                  <option value="disabled">disabled</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-md border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateItem}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-blue-600 bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 disabled:opacity-60"
              >
                {isUpdating ? <Spinner className="w-4 h-4 text-white" /> : <SaveIcon />}
                <span>{isUpdating ? "Saving..." : "Save changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ===== Icons & Spinner =====
function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4z"
      />
    </svg>
  );
}
function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-600">
      <path
        fill="currentColor"
        d="M12 8a2 2 0 1 0 0-4a2 2 0 0 0 0 4m0 6a2 2 0 1 0 0-4a2 2 0 0 0 0 4m0 6a2 2 0 1 0 0-4a2 2 0 0 0 0 4"
      />
    </svg>
  );
}
function EditIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm14.71-9.04c.39-.39.39-1.02 0-1.41l-2.51-2.51a.9959.9959 0 1 0-1.41 1.41l2.51 2.51c.4.39 1.03.39 1.41 0Z"
      />
    </svg>
  );
}
function TrashIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="currentColor"
        d="M9 3h6v2h5v2H4V5h5zm1 6h2v8h-2zm4 0h2v8h-2z"
      />
    </svg>
  );
}
function PlusIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
    </svg>
  );
}
function SaveIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M17 3H5a2 2 0 0 0-2 2v14l4-4h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
    </svg>
  );
}
