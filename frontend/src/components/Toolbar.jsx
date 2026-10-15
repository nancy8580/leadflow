import { STATUSES } from "../api";

export default function Toolbar({ search, onSearch, status, onStatus }) {
  return (
    <div className="toolbar">
      <input
        className="search"
        type="search"
        placeholder="Search leads by name…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <div className="filters">
        {["", ...STATUSES].map((s) => (
          <button
            key={s || "all"}
            className={`chip ${status === s ? "chip-active" : ""}`}
            onClick={() => onStatus(s)}
          >
            {s || "All"}
          </button>
        ))}
      </div>
    </div>
  );
}
