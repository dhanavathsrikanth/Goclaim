"use client";

import { useState, useEffect } from "react";

interface ComposioCardProps {
  initialConfigured: boolean;
  initialApiKeyPresent: boolean;
  initialTwitterConnected: boolean;
}

interface SocialPreviews {
  milestone_top1: string;
  milestone_top3: string;
  daily_digest: string;
  weekly_digest: string;
}

interface BroadcastRecord {
  id: string;
  type: string;
  text: string;
  at: string;
  simulated: boolean;
  success: boolean;
  message: string;
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
  const [isActionRunning, setIsActionRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"top1" | "top3" | "daily" | "weekly">("top1");
  const [previews, setPreviews] = useState<SocialPreviews | null>(null);
  const [history, setHistory] = useState<BroadcastRecord[]>([]);
  const [copied, setCopied] = useState(false);

  // Fetch live tweet previews on mount
  useEffect(() => {
    async function loadPreviews() {
      try {
        const res = await fetch("/api/admin/composio?action=preview_social");
        if (res.ok) {
          const data = await res.json();
          if (data.previews) {
            setPreviews(data.previews);
          }
          if (data.history) {
            setHistory(data.history);
          }
        }
      } catch (err) {
        console.warn("Failed to load social previews:", err);
      }
    }
    loadPreviews();
  }, []);

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
        refreshHistory();
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

  const handleTriggerAction = async (action: string, successLabel: string) => {
    setIsActionRunning(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/composio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok && (data.success || data.ok)) {
        setStatusMessage({
          type: "success",
          text: data.message || `${successLabel} triggered successfully!`,
        });
        refreshHistory();
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || data.message || `Failed to execute ${successLabel}.`,
        });
      }
    } catch (err: unknown) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Network error occurred.",
      });
    } finally {
      setIsActionRunning(false);
    }
  };

  const refreshHistory = async () => {
    try {
      const res = await fetch("/api/admin/composio?action=preview_social");
      if (res.ok) {
        const data = await res.json();
        if (data.history) setHistory(data.history);
      }
    } catch {}
  };

  const getActivePreviewText = (): string => {
    if (!previews) return "Loading live preview...";
    switch (activeTab) {
      case "top1":
        return previews.milestone_top1;
      case "top3":
        return previews.milestone_top3;
      case "daily":
        return previews.daily_digest;
      case "weekly":
        return previews.weekly_digest;
    }
  };

  const copyToClipboard = () => {
    const text = getActivePreviewText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeText = getActivePreviewText();
  const charCount = activeText.length;

  return (
    <div className="bg-[#1E1D1B] border border-[#33322E] rounded-2xl p-6 text-[#F3F2EE] shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#33322E] gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold tracking-tight text-white">Social Media Amplification Hub</h2>
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
            Automate viral milestone tweets (#1 &amp; Top 3) and Daily/Weekly Leaderboard Digests across X (Twitter).
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

      {/* Social Bot Live Previews & Instant Triggers */}
      <div className="mt-6 p-5 rounded-xl bg-[#242320] border border-[#33322E]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#33322E]/60">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span>🤖 X / Twitter Bot Engine</span>
            </h3>
            <p className="text-[11px] text-[#9E9C96] mt-0.5">
              Preview and manually fire automated milestone tweets and leaderboard digests.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#181716] p-1 rounded-lg border border-[#33322E]">
            <button
              onClick={() => setActiveTab("top1")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                activeTab === "top1"
                  ? "bg-[#D97757] text-white"
                  : "text-[#9E9C96] hover:text-white"
              }`}
            >
              🔥 #1 Milestone
            </button>
            <button
              onClick={() => setActiveTab("top3")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                activeTab === "top3"
                  ? "bg-[#D97757] text-white"
                  : "text-[#9E9C96] hover:text-white"
              }`}
            >
              ⚡ Top 3 Alert
            </button>
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                activeTab === "daily"
                  ? "bg-[#D97757] text-white"
                  : "text-[#9E9C96] hover:text-white"
              }`}
            >
              📊 Daily Digest
            </button>
            <button
              onClick={() => setActiveTab("weekly")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                activeTab === "weekly"
                  ? "bg-[#D97757] text-white"
                  : "text-[#9E9C96] hover:text-white"
              }`}
            >
              🏆 Weekly Digest
            </button>
          </div>
        </div>

        {/* Live Preview Display */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-[#9E9C96] mb-1.5">
            <span>Live Output Preview</span>
            <div className="flex items-center gap-2">
              <span className={charCount > 280 ? "text-red-400 font-semibold" : "text-[#6B6964]"}>
                {charCount} / 280 chars
              </span>
              <button
                onClick={copyToClipboard}
                className="text-[10px] text-[#D97757] hover:underline cursor-pointer"
              >
                {copied ? "Copied! ✓" : "Copy Tweet"}
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181716] border border-[#33322E] font-mono text-xs text-[#E5E3DD] whitespace-pre-line leading-relaxed">
            {activeText}
          </div>
        </div>

        {/* Action Trigger Buttons */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleTriggerAction("trigger_milestone_test", "Test Milestone Tweet")}
            disabled={isActionRunning}
            className="py-2.5 px-3 text-xs font-semibold bg-[#282724] hover:bg-[#33322E] border border-[#33322E] disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer text-center"
          >
            {isActionRunning ? "Dispatching..." : "🔥 Test #1 Milestone"}
          </button>
          <button
            onClick={() => handleTriggerAction("trigger_daily_digest", "Daily Top 5 Digest")}
            disabled={isActionRunning}
            className="py-2.5 px-3 text-xs font-semibold bg-[#D97757] hover:bg-[#C15F3D] disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer text-center"
          >
            {isActionRunning ? "Dispatching..." : "📊 Post Daily Digest"}
          </button>
          <button
            onClick={() => handleTriggerAction("trigger_weekly_digest", "Weekly Leaderboard Digest")}
            disabled={isActionRunning}
            className="py-2.5 px-3 text-xs font-semibold bg-[#282724] hover:bg-[#33322E] border border-[#33322E] disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer text-center"
          >
            {isActionRunning ? "Dispatching..." : "🏆 Post Weekly Roundup"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Custom Broadcast */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-[#242320] border border-[#33322E]">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9E9C96] mb-2">
              Broadcast Custom Tweet
            </label>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-[#181716] border border-[#33322E] text-[#F3F2EE] placeholder-[#6B6964] focus:outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757] resize-none"
              placeholder="Enter custom announcement text..."
            />
          </div>
          <button
            onClick={handleSendCustom}
            disabled={isSending || !customText.trim()}
            className="mt-3 w-full py-2.5 px-4 text-xs font-semibold bg-[#D97757] hover:bg-[#C15F3D] disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            {isSending ? "Transmitting..." : "Send Custom Broadcast"}
          </button>
        </div>

        {/* Automated System Rules */}
        <div className="flex flex-col justify-between p-4 rounded-xl bg-[#242320] border border-[#33322E]">
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9C96] mb-2">
              Automated Amplification Rules
            </h3>
            <p className="text-xs text-[#9E9C96] mb-3 leading-relaxed">
              Every bid fuels founder distribution automatically:
            </p>
            <ul className="text-xs text-[#9E9C96] space-y-2 list-disc list-inside">
              <li>
                <span className="text-white font-medium">#1 Milestone:</span> Fired instantly on takeover payment.
              </li>
              <li>
                <span className="text-white font-medium">Top 3 Surge:</span> Fired when a tool climbs into ranks #2 or #3.
              </li>
              <li>
                <span className="text-white font-medium">Daily Digest (Top 5):</span> Dispatched automatically at 00:00 UTC.
              </li>
              <li>
                <span className="text-white font-medium">Weekly Digest:</span> Scheduled weekly roundup of top tools.
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleTriggerAction("trigger_daily_champion", "Daily Champion")}
            disabled={isActionRunning}
            className="mt-3 w-full py-2.5 px-4 text-xs font-semibold bg-[#282724] hover:bg-[#33322E] border border-[#33322E] disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer"
          >
            {isActionRunning ? "Announcing..." : "Crown Daily Champion Manually"}
          </button>
        </div>
      </div>

      {/* Recent Broadcast Log */}
      {history.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-[#242320] border border-[#33322E]">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#9E9C96] mb-3">
            Recent Social Broadcasts ({history.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {history.map((record) => (
              <div
                key={record.id}
                className="p-2.5 rounded-lg bg-[#181716] border border-[#33322E] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-semibold rounded uppercase ${
                      record.simulated
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {record.simulated ? "Simulated" : "Posted"}
                  </span>
                  <span className="font-mono text-[#9E9C96] text-[10px]">
                    {new Date(record.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-[#E5E3DD] truncate max-w-md">
                    {record.text}
                  </span>
                </div>
                <span className="text-[10px] text-[#6B6964] shrink-0 font-medium">
                  {record.type.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
