import LeadRow from "./LeadRow";
import { isOverdue, isToday } from "../time";

const byFollowUp = (a, b) => new Date(a.follow_up_at) - new Date(b.follow_up_at);

export default function LeadList({ leads, onOpen }) {
  // Pin follow-ups due today, plus any that are already overdue
  const pinned = leads
    .filter((l) => isToday(l.follow_up_at) || isOverdue(l.follow_up_at))
    .sort(byFollowUp);
  const pinnedIds = new Set(pinned.map((l) => l.id));
  const rest = leads.filter((l) => !pinnedIds.has(l.id));

  if (leads.length === 0) {
    return <p className="empty">No leads found.</p>;
  }

  return (
    <>
      {pinned.length > 0 && (
        <section>
          <h3 className="section-title">📌 Due today & overdue</h3>
          <ul className="lead-list pinned">
            {pinned.map((lead) => (
              <LeadRow key={lead.id} lead={lead} onOpen={onOpen} />
            ))}
          </ul>
        </section>
      )}
      {rest.length > 0 && (
        <section>
          <h3 className="section-title">All leads</h3>
          <ul className="lead-list">
            {rest.map((lead) => (
              <LeadRow key={lead.id} lead={lead} onOpen={onOpen} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
