import { NS } from "@ns";
import React from "lib/react";

// timer.tsx
type ProgressInfo = {
  startedAt: number;
  finishedAt: number;
  totalTime?: number;
  isRunning: boolean;
  action?: string; // Added action field to show what is being done
};

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function Timer({ ns }: { ns: NS }) {
  const [progress, setProgress] = React.useState<ProgressInfo | null>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      try {
        const data = ns.read("/progress.txt");
        if (data) {
          const parsed = JSON.parse(data);
          setProgress(parsed);
        }
      } catch (e) {
        setProgress(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [ns]);

  let progressBar = null;
  let countdown = null;
  if (progress && progress.finishedAt > progress.startedAt) {
    const now = Date.now();
    const total = progress.finishedAt - progress.startedAt;
    const elapsed = now - progress.startedAt;
    const percent = Math.max(0, Math.min(1, elapsed / total));
    const remaining = progress.finishedAt - now;
    countdown = (
      <span style={{ fontWeight: "bold", marginLeft: 10, color: "#333" }}>
        {formatTime(remaining)}
      </span>
    );
    progressBar = (
      <div
        style={{
          background: "linear-gradient(90deg, #e0e0e0 0%, #f5f5f5 100%)",
          width: 300,
          height: 28,
          borderRadius: 8,
          marginTop: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          overflow: "hidden",
          position: "relative",
          border: "1px solid #bbb",
        }}
      >
        <div
          style={{
            background:
              "repeating-linear-gradient(135deg, #4caf50 0 16px, #43a047 16px 32px)",
            width: `${percent * 100}%`,
            height: "100%",
            borderRadius: 8,
            transition: "width 0.5s cubic-bezier(.4,2,.6,1)",
            boxShadow: "0 0 8px #4caf50aa",
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 1,
            backgroundSize: "32px 32px",
            animation: "moveStripes 1s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            color: percent > 0.5 ? "#fff" : "#333",
            fontWeight: "bold",
            fontSize: 16,
            textShadow: percent > 0.5 ? "0 1px 4px #0008" : "none",
            pointerEvents: "none",
          }}
        >
          {formatTime(remaining)}
        </div>
        <style>{`
                    @keyframes moveStripes {
                        0% { background-position: 0 0; }
                        100% { background-position: 32px 0; }
                    }
                `}</style>
      </div>
    );
  }

  return (
    <div>
      {progress ? (
        <div style={{ marginTop: 10 }}>
          <div>{progress.action}</div>
          {progressBar}
        </div>
      ) : (
        <div style={{ marginTop: 10 }}>No progress info available.</div>
      )}
      {progress && !progress.isRunning && (
        <div style={{ color: "red", marginTop: 12, fontWeight: "bold" }}>
          Waiting for next action...
        </div>
      )}
    </div>
  );
}
//
export async function main(ns: NS) {
  ns.ui.openTail();
  ns.printRaw(
    <>
      <Timer ns={ns} />
    </>
  );
  ns.disableLog("disableLog");
  ns.disableLog("asleep");
  ns.disableLog("exec");
  ns.exec("distributed-hack.js", "home", 1);
  await ns.asleep(10000000000);
}
