"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type WorkSession = {
  id: string;
  date: string; // YYYY-MM-DD
  startAt: string;
  endAt?: string | null;
  durationSeconds?: number | null;
  device?: string | null;
  notes?: string | null;
  // status?: "active" | "disabled"; // nếu muốn dùng
};

function toVNDateStr(date = new Date()) {
  const tzDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );
  const y = tzDate.getFullYear();
  const m = String(tzDate.getMonth() + 1).padStart(2, "0");
  const d = String(tzDate.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatHMS(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function shorten(s?: string | null, n = 20) {
  if (!s) return "-";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export default function HomePage() {
  const [today, setToday] = useState<string>(toVNDateStr());
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkSession | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [notes, setNotes] = useState<string>("");
  const [showNoteField, setShowNoteField] = useState(false);

  // menu state
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const loadToday = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sessions?date=${today}`, { cache: "no-store" });
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentSession && !currentSession.endAt) {
      const tick = () => {
        const start = new Date(currentSession.startAt).getTime();
        setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
      };
      tick();
      timerRef.current = window.setInterval(tick, 1000);
      return () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
      };
    } else {
      setElapsed(0);
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
  }, [currentSession]);

  useEffect(() => {
    setToday(toVNDateStr());
    loadToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const active = sessions.find((s) => !s.endAt);
    setCurrentSession(active ?? null);
  }, [sessions]);

  const hasActive = !!currentSession && !currentSession.endAt;

  const startSession = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device: "dell", date: today, notes }),
      });
      if (!res.ok) throw new Error("Cannot start session");
      await loadToday();
      setNotes("");
      setShowNoteField(false);
    } catch (e) {
      alert((e as Error).message || "Cannot start session");
    } finally {
      setIsStarting(false);
    }
  };

  const stopSession = async () => {
    if (!currentSession || isStopping) return;
    setIsStopping(true);
    try {
      const res = await fetch(`/api/sessions/${currentSession.id}/stop`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Cannot stop session");
      await loadToday();
    } catch (e) {
      alert((e as Error).message || "Cannot stop session");
    } finally {
      setIsStopping(false);
    }
  };

  const deleteSession = async (id: string) => {
    setMenuOpenId(null);
    if (!confirm("Delete this session? (soft delete)")) return;
    try {
      const res = await fetch(`/api/sessions/${id}/delete`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Cannot delete session");
      }
      await loadToday();
    } catch (e) {
      alert((e as Error).message || "Cannot delete session");
    }
  };

  const totalToday = useMemo(() => {
    const done = sessions
      .filter((s) => s.endAt && s.durationSeconds)
      .reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
    return hasActive ? done + elapsed : done;
  }, [sessions, elapsed, hasActive]);

  // close menu on outside click / esc
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.("[data-row-menu]")) setMenuOpenId(null);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpenId(null);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6">
      {/* H1 centered */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-center">
        Today: <span className="text-gray-800">{today}</span>
      </h1>

      {/* Row 1: Start/Stop + Timer + Total */}
      <div className="flex items-center gap-3 h-10">
        {!hasActive ? (
          <button
            onClick={startSession}
            disabled={isStarting}
            className="inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed min-w-[160px]"
          >
            {isStarting ? <Spinner /> : <span>▶</span>}
            <span>{isStarting ? "Starting..." : "Start"}</span>
          </button>
        ) : (
          <button
            onClick={stopSession}
            disabled={isStopping}
            className="inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed min-w-[160px]"
          >
            {isStopping ? <Spinner /> : <span>■</span>}
            <span>{isStopping ? "Stopping..." : "Stop"}</span>
          </button>
        )}

        <span className="text-lg font-mono tabular-nums min-w-[88px] text-center" aria-live="polite">
          {formatHMS(elapsed)}
        </span>

        <div className="ml-auto text-sm">
          Total today: <span className="font-semibold">{formatHMS(totalToday)}</span>
        </div>
      </div>

      {/* Note input */}
      <div className="mt-2 mb-6">
        <button
          type="button"
          className="text-sm text-gray-600 hover:underline"
          onClick={() => setShowNoteField((v) => !v)}
        >
          {showNoteField ? "Hide note" : "Add note (optional)"}
        </button>

        {showNoteField && (
          <div className="mt-2">
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isStarting}
              className="w-full rounded-md border px-3 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Quick note for this session..."
              maxLength={500}
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-4 py-2 text-left">Start</th>
              <th className="px-3 sm:px-4 py-2 text-left hidden sm:table-cell">End</th>
              <th className="px-3 sm:px-4 py-2 text-right">Duration</th>
              <th className="px-3 sm:px-4 py-2 text-left hidden sm:table-cell">Device</th>
              <th className="px-3 sm:px-4 py-2 text-left">Notes</th>
              <th className="px-3 sm:px-4 py-2 text-right w-10">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr className="odd:bg-white even:bg-gray-50">
                <td colSpan={6} className="px-3 sm:px-4 py-6 text-center text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="w-4 h-4" /> Loading sessions...
                  </span>
                </td>
              </tr>
            )}

            {!isLoading && sessions.length === 0 && (
              <tr className="odd:bg-white even:bg-gray-50">
                <td colSpan={6} className="px-3 sm:px-4 py-6 text-center text-gray-500">
                  No sessions today.
                </td>
              </tr>
            )}

            {!isLoading &&
              sessions.map((s) => {
                const isRunningRow = !s.endAt && s.id === currentSession?.id;

                const start = new Date(s.startAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  timeZone: "Asia/Ho_Chi_Minh",
                });

                const end = s.endAt
                  ? new Date(s.endAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      timeZone: "Asia/Ho_Chi_Minh",
                    })
                  : isRunningRow
                  ? "Running..."
                  : "-";

                const duration =
                  s.durationSeconds != null
                    ? formatHMS(s.durationSeconds)
                    : isRunningRow
                    ? formatHMS(elapsed)
                    : "-";

                const isMenuOpen = menuOpenId === s.id;

                return (
                  <tr
                    key={s.id}
                    className={[
                      "border-t",
                      isRunningRow ? "bg-orange-50" : "odd:bg-white even:bg-gray-50",
                    ].join(" ")}
                  >
                    {/* Start */}
                    <td className="px-3 sm:px-4 py-2 relative">
                      {isRunningRow && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-orange-400" />
                      )}
                      {start}
                    </td>

                    {/* End */}
                    <td className="px-3 sm:px-4 py-2 hidden sm:table-cell">
                      {isRunningRow ? (
                        <span className="text-orange-700 font-medium">Running...</span>
                      ) : (
                        end
                      )}
                    </td>

                    {/* Duration */}
                    <td className="px-3 sm:px-4 py-2 text-right font-mono tabular-nums">
                      {duration}
                    </td>

                    {/* Device */}
                    <td className="px-3 sm:px-4 py-2 hidden sm:table-cell">
                      {s.device ?? "-"}
                    </td>

                    {/* Notes */}
                    <td className="px-3 sm:px-4 py-2">
                      <span title={s.notes || ""}>{shorten(s.notes, 20)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 sm:px-4 py-2 text-right relative select-none" data-row-menu>
                      <button
                        type="button"
                        onClick={() => setMenuOpenId((v) => (v === s.id ? null : s.id))}
                        className="inline-grid place-items-center w-6 h-6 rounded hover:bg-gray-100"
                        aria-haspopup="menu"
                        aria-expanded={isMenuOpen}
                        aria-label="Open row menu"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-600">
                          <path fill="currentColor" d="M12 8a2 2 0 1 0 0-4a2 2 0 0 0 0 4m0 6a2 2 0 1 0 0-4a2 2 0 0 0 0 4m0 6a2 2 0 1 0 0-4a2 2 0 0 0 0 4"/>
                        </svg>
                      </button>

                      {isMenuOpen && (
                        <div
                          role="menu"
                          className="absolute right-2 bottom-8 z-20 w-36 rounded-md border bg-white shadow-lg py-1 text-sm"
                        >
                          <button
                            role="menuitem"
                            onClick={() => deleteSession(s.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-red-600"
                          >
                            {/* trash icon */}
                            <svg viewBox="0 0 24 24" className="w-4 h-4">
                              <path fill="currentColor" d="M9 3h6v2h5v2H4V5h5zm1 6h2v8h-2zm4 0h2v8h-2z"/>
                            </svg>
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
    </main>
  );
}

/** Simple spinner icon */
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
