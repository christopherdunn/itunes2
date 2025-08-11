"use client";
import { usePlayer } from "../lib/player-context";

export default function PlayerBadge() {
  const { current, isPlaying, timeLabel, durLabel, togglePlayPause, next, prev } =
    usePlayer();
  console.log("Rendering PlayerBadge", current?.name || "none");
  return (
    <div className="playerBadge" aria-live="polite">
      {current ? (
        <>
          <img className="art" src={current.artwork} alt="Artwork" />
          <div className="trackline">
            <div className="tname">{current.name}</div>
            <div className="tartist">{current.artist}</div>
            <div className="progress">
              <span>{timeLabel}</span>
              <div className="bar">
                <div className="fill" style={{ width: current.progressPct + "%" }} />
              </div>
              <span>{durLabel}</span>
            </div>
          </div>
          <div className="ctrls">
            <button className="btn" onClick={prev} title="Previous">
              ⏮
            </button>
            <button className="btn" onClick={togglePlayPause} title="Play/Pause">
              {isPlaying ? "⏸" : "▶️"}
            </button>
            <button className="btn" onClick={next} title="Next">
              ⏭
            </button>
          </div>
        </>
      ) : (
        <div className="noTrack">
    <svg
      className="noTrackIcon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
    </svg>
    Select a song to play a 30-sec preview
  </div>
      )}
    </div>
  );
}
