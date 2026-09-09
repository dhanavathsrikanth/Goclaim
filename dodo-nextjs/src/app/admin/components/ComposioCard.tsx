"use client";

import { useState } from "react";

interface ComposioCardProps {
  initialConfigured: boolean;
  initialApiKeyPresent: boolean;
  initialTwitterConnected: boolean;
}

export default function ComposioCard({
  initialConfigured,
  initialApiKeyPresent,
  initialTwitterConnected,
}: ComposioCardProps) {
  const [customText, setCustomText] = useState(
    "👑 Goclaim Leaderboard Update: Competition is heating up! Who will take #1 by midnight? https://goclaim.space"
  );
  const [isSending, setIsSending] = useState(false);
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSendCustom = async () => {
    if (!customText.trim()) return;
    setIsSending(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/composio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_broadcast", text: customText }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: data.message || "Broadcast successfully transmitted via Composio!",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || data.message || "Failed to transmit broadcast.",
        });
      }
    } catch (err: unknown) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Network error occurred.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleAnnounceChampion = async () => {
    setIsAnnouncing(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/composio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger_daily_champion" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: "success",
          text: data.message || "Daily champion announced to social channels!",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || data.message || "Failed to announce champion.",
        });
      }
    } catch (err: unknown) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Network error occurred.",
      });
    } finally {
      setIsAnnouncing(false);
    }
  };

  return (
    <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-6 text-[#F3F2EE] shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#33322E] gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold tracking-tight text-white">Composio Social Hub</h2>
            <span
              className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
                initialConfigured
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-[#D97757]/15 text-[#D97757] border-[#D97757]/30"
              }`}
            >
              {initialConfigured ? "Active & Linked" : "Simulation Mode"}
            </span>
          </div>
          <p className="text-xs text-[#9E9C96] mt-1">
            Automate social proof distributions across X (Twitter) and external channels via Composio.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                initialApiKeyPresent ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
            <span className="text-[#9E9C96]">
              {initialApiKeyPresent ? "API Key Configured" : "Missing Key"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                initialTwitterConnected ? "bg-emerald-400" : "bg-[#6B6964]"
              }`}
            />
            <span className="text-[#9E9C96]">
              {initialTwitterConnected ? "X Connected" : "X Standby"}
            </span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`mt-4 p-3 rounded-xl text-xs border ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
              : "bg-red-500/10 text-red-300 border-red-500/20"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Custom Broadcast */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-[#242320] border border-[#33322E]">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9E9C96] mb-2">
              Broadcast Custom Update
            </label>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-[#181716] border border-[#33322E] text-[#F3F2EE] placeholder-[#6B6964] focus:outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757] resize-none"
              placeholder="Enter announcement text..."
            />
          </div>
          <button
            onClick={handleSendCustom}
            disabled={isSending || !customText.trim()}
            className="mt-3 w-full py-2.5 px-4 text-xs font-semibold bg-[#D97757] hover:bg-[#C15F3D] disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            {isSending ? "Transmitting..." : "Send Broadcast via Composio"}
          </button>
        </div>

        {/* Automated Triggers */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-[#242320] border border-[#33322E]">
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9C96] mb-2">
              Automated Milestones
            </h3>
            <p className="text-xs text-[#9E9C96] mb-3 leading-relaxed">
              Social proof automatically broadcasts on live platform milestones:
            </p>
            <ul className="text-xs text-[#9E9C96] space-y-2 list-disc list-inside">
              <li>
                <span className="text-white font-medium">Daily 00:00 UTC Winner:</span> Crowned via Upstash QStash cron.
              </li>
              <li>
                <span className="text-white font-medium">#1 Takeover Alert:</span> Dispatched in real-time on top rank displacement.
              </li>
            </ul>
          </div>
          <button
            onClick={handleAnnounceChampion}
            disabled={isAnnouncing}
            className="mt-3 w-full py-2.5 px-4 text-xs font-semibold bg-[#282724] hover:bg-[#33322E] border border-[#33322E] disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer"
          >
            {isAnnouncing ? "Announcing..." : "Trigger Daily Champion Broadcast Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
