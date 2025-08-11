"use client";
import { usePlayer } from "../lib/player-context";
import type { ChartItem } from "@/app/types";

export default function TrackTable({ items }: { items: ChartItem[] }) {
  const { currentId, isPlaying, playByItem, togglePlayPause } = usePlayer();

  const onRowClick = async (item: ChartItem) => {
    if (item.id === currentId) {
      console.log("Toggling play/pause for", item.name);
      togglePlayPause();
    } else {
      console.log("Playing new item", item.name);
      await playByItem(item);
    }
  };

  return (
    <div className="table-wrap">
      <table aria-label="Chart list">
        <thead>
          <tr>
            <th className="num">#</th>
            <th>Title</th>
            <th>Artist</th>
            <th className="time">Time</th>
            <th className="price">Price</th>
            <th className="playcell">Play</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr
              key={r.id}
              onClick={() => onRowClick(r)}
              className={r.id === currentId ? "active-row" : ""}
            >
              <td className="num">{r.index}</td>
              <td>
                <div className="title">
                  <img src={r.artwork} alt="Artwork" />
                  <div className="meta">
                    <div className="name">{r.name}</div>
                    <div className="artist">{r.artist}</div>
                  </div>
                </div>
              </td>
              <td>{r.artist}</td>
              <td className="time">{r.time}</td>
              <td className="buycell">
  {r.linkUrl ? (
    <a
      href={r.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="buybtn"
    >
      Buy — {r.price}
    </a>
  ) : (
    <span className="noprice">Not available</span>
  )}
</td>
              <td className="playcell">
                <button
                  className={`playbtn ${
                    r.id === currentId && isPlaying ? "playing" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(r);
                  }}
                  title="Play/Pause sample"
                >
                  {r.id === currentId && isPlaying ? "⏸" : "▶"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
