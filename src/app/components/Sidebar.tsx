"use client";
import { GENRES } from "../lib/genres";

export default function Sidebar({
  activeGenre,
  onSelectGenre,
  total,
}: {
  activeGenre: string;
  onSelectGenre: (id: string) => void;
  total: number;
}) {
  return (
    <aside className="sidebar" aria-label="Smart Playlists & Genres">
      <div className="side-title">Smart Playlists</div>
      <nav className="side-list">
        <button
          className={`side-item ${activeGenre === "all" ? "active" : ""}`}
          onClick={() => {
            console.log("Genre changed to all");
            onSelectGenre("all");
          }}
        >
          All Top Songs <span className="badge">{total}</span>
        </button>
        <button
          className="side-item"
          onClick={() => {
            console.log("Genre changed to previews");
            onSelectGenre("previews");
          }}
        >
          Has Preview
        </button>
      </nav>
      <div className="side-title" style={{ marginTop: 14 }}>
        Genres
      </div>
      <nav className="side-list">
        {GENRES.map((g) => (
          <button
            key={g.id}
            className={`side-item ${activeGenre === String(g.id) ? "active" : ""}`}
            onClick={() => {
              console.log("Genre changed to", g.name);
              onSelectGenre(String(g.id));
            }}
          >
            {g.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}
