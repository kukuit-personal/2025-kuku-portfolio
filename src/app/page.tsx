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

export default function HomePage() {
  const [today, setToday] = useState<string>(toVNDateStr());
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkSession | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const loadToday = async () => {
    const res = await fetch(`/api/sessions?date=${today}`, { cache: "no-store" });
    const data = await res.json();
    setSessions(data.sessions ?? []);
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
  }, []);

  useEffect(() => {
    const active = sessions.find((s) => !s.endAt);
    setCurrentSession(active ?? null);
  }, [sessions]);

  const hasActive = !!currentSession && !currentSession.endAt;

  const startSession = async () => {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device: "dell", date: today }),
    });
    if (res.ok) await loadToday();
    else alert("Cannot start session");
  };

  const stopSession = async () => {
    if (!currentSession) return;
    const res = await fetch(`/api/sessions/${currentSession.id}/stop`, {
      method: "POST",
    });
    if (res.ok) await loadToday();
    else alert("Cannot stop session");
  };

  const totalToday = useMemo(() => {
    const done = sessions
      .filter((s) => s.endAt && s.durationSeconds)
      .reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
    return hasActive ? done + elapsed : done;
  }, [sessions, elapsed, hasActive]);

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* <h1 className="text-2xl font-semibold mb-2">KUKU • Worklog</h1> */}
      <p className="text-sm text-gray-600 mb-4">
        Today: <span className="font-medium">{today}</span>
      </p>

      <div className="flex items-center gap-3 mb-6">
        {!hasActive ? (
          <button
            onClick={startSession}
            className="rounded-xl border px-4 py-2 hover:bg-gray-50"
          >
            ▶ Start
          </button>
        ) : (
          <>
            <button
              onClick={stopSession}
              className="rounded-xl border px-4 py-2 hover:bg-gray-50"
            >
              ■ Stop
            </button>
            <span className="text-lg font-mono">{formatHMS(elapsed)}</span>
          </>
        )}
        <span className="ml-auto text-sm">
          Total today: <span className="font-semibold">{formatHMS(totalToday)}</span>
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Start</th>
              <th className="px-4 py-2 text-left">End</th>
              <th className="px-4 py-2 text-right">Duration</th>
              <th className="px-4 py-2 text-left">Device</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No sessions today.
                </td>
              </tr>
            )}
            {sessions.map((s) => {
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
                : hasActive && s.id === currentSession?.id
                ? "Running..."
                : "-";
              const duration =
                s.durationSeconds != null
                  ? formatHMS(s.durationSeconds)
                  : hasActive && s.id === currentSession?.id
                  ? formatHMS(elapsed)
                  : "-";

              return (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2">{start}</td>
                  <td className="px-4 py-2">{end}</td>
                  <td className="px-4 py-2 text-right font-mono">{duration}</td>
                  <td className="px-4 py-2">{s.device ?? "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
