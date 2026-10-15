import { useCallback, useEffect, useState } from "react";
import { getLeads } from "./api";
import Toolbar from "./components/Toolbar";
import LeadList from "./components/LeadList";
import AddLeadDialog from "./components/AddLeadDialog";
import LeadTimelineDialog from "./components/LeadTimelineDialog";

export default function App() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);

  const loadLeads = useCallback(async () => {
    try {
      setError("");
      setLeads(await getLeads({ status, q: search.trim() }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  // Debounce so typing in the search box doesn't fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(loadLeads, 250);
    return () => clearTimeout(t);
  }, [loadLeads]);

  function handleLeadChanged(updated) {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
    setSelected((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
  }

  // A new status may no longer match the active filter, so refetch the list
  function handleStatusChanged(updated) {
    handleLeadChanged(updated);
    loadLeads();
  }

  function handleLeadCreated() {
    setShowAdd(false);
    loadLeads();
  }

  return (
    <div className="app">
      <header className="header">
        <h1>LeadFlow</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add lead
        </button>
      </header>

      <Toolbar search={search} onSearch={setSearch} status={status} onStatus={setStatus} />

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading leads…</p>
      ) : (
        <LeadList leads={leads} onOpen={setSelected} />
      )}

      {showAdd && (
        <AddLeadDialog onClose={() => setShowAdd(false)} onCreated={handleLeadCreated} />
      )}
      {selected && (
        <LeadTimelineDialog
          lead={selected}
          onClose={() => setSelected(null)}
          onLeadChanged={handleLeadChanged}
          onStatusChanged={handleStatusChanged}
        />
      )}
    </div>
  );
}
