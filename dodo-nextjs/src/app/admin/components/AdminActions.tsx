"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const btn =
  "px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer disabled:opacity-50";

async function patchListing(id: string, action: string) {
  const res = await fetch(`/api/admin/listings/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function ListingRowActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(action: "remove" | "restore") {
    if (
      action === "remove" &&
      !window.confirm("Remove this listing from all boards?")
    )
      return;
    setBusy(true);
    try {
      await patchListing(id, action);
      router.refresh();
    } catch {
      window.alert("Action failed — try again.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "removed") {
    return (
      <button
        onClick={() => run("restore")}
        disabled={busy}
        className={`${btn} bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20`}
      >
        Restore
      </button>
    );
  }
  return (
    <button
      onClick={() => run("remove")}
      disabled={busy}
      className={`${btn} bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20`}
    >
      Remove
    </button>
  );
}

export function CreativeActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(action: "approve_creative" | "reject_creative") {
    setBusy(true);
    try {
      await patchListing(id, action);
      router.refresh();
    } catch {
      window.alert("Action failed — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => run("approve_creative")}
        disabled={busy}
        className={`${btn} bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20`}
      >
        Approve
      </button>
      <button
        onClick={() => run("reject_creative")}
        disabled={busy}
        className={`${btn} bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20`}
      >
        Reject
      </button>
    </div>
  );
}

export function SnapshotTrigger() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "snapshot" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setMsg(`Snapshot ok — ${data.snapshot_date}, ${data.rows} rows.`);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={run}
        disabled={busy}
        className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#D97757] hover:bg-[#c8684a] disabled:opacity-50 transition-colors cursor-pointer"
      >
        {busy ? "Running…" : "Run snapshot now"}
      </button>
      {msg && <span className="text-xs text-[#9E9C96]">{msg}</span>}
    </div>
  );
}