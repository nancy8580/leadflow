import { useEffect, useState } from "react";
import Modal from "./Modal";
import DiscussionForm from "./DiscussionForm";
import { STATUSES, addDiscussion, getDiscussions, updateStatus } from "../api";
import { formatDateTime, isOverdue } from "../time";

export default function LeadTimelineDialog({ lead, onClose, onLeadChanged }) {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDiscussions(lead.id)
      .then((data) => !cancelled && setDiscussions(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [lead.id]);

  async function handleStatusChange(e) {
    setError("");
    try {
      const updated = await updateStatus(lead.id, e.target.value);
      onLeadChanged(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddDiscussion(data) {
    const created = await addDiscussion(lead.id, data);
    setDiscussions((prev) => [created, ...prev]);
    onLeadChanged({
      ...lead,
      last_note: created.note,
      last_discussion_at: created.created_at,
      follow_up_at: data.follow_up_at ?? lead.follow_up_at,
    });
  }

  return (
    <Modal title={lead.name} onClose={onClose}>
      <div className="timeline-header">
        <div className="muted">
          {[lead.company, lead.phone].filter(Boolean).join(" · ") || "No contact details"}
        </div>
        <label className="inline">
          Status
          <select value={lead.status} onChange={handleStatusChange}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {lead.follow_up_at && (
        <p className={`follow-up ${isOverdue(lead.follow_up_at) ? "overdue" : ""}`}>
          Next follow-up: {formatDateTime(lead.follow_up_at)}
        </p>
      )}
      {error && <p className="error">{error}</p>}

      <div className="timeline">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : discussions.length === 0 ? (
          <p className="muted">No discussions yet. Add the first one below.</p>
        ) : (
          <ul>
            {discussions.map((d) => (
              <li key={d.id} className="timeline-item">
                <span className="timeline-date">{formatDateTime(d.created_at)}</span>
                <p>{d.note}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DiscussionForm onSubmit={handleAddDiscussion} />
    </Modal>
  );
}
