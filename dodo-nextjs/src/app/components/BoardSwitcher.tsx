"use client";

type Board = "all-time" | "today" | "daily";

const BOARD_LABELS: Record<Board, string> = {
  "all-time": "All-time",
  today: "Today",
  daily: "Daily",
};

type Props = {
  active: Board;
  onChange: (board: Board) => void;
};

export default function BoardSwitcher({ active, onChange }: Props) {
  const boards: Board[] = ["all-time", "today", "daily"];

  return (
    <div className="flex justify-center">
      <div
        role="tablist"
        aria-label="Ranking board"
        className="inline-flex items-center rounded-full border border-border p-0.5 bg-card"
      >
        {boards.map((board) => {
          const selected = active === board;
          return (
            <button
              key={board}
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(board)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold tracking-tight transition-colors cursor-pointer ${
                selected
                  ? "bg-primary text-primary-foreground"
                  : "text-primary hover:bg-background/70"
              }`}
            >
              {board === "today" && !selected && (
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
              )}
              {BOARD_LABELS[board]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
