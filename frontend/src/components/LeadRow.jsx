import StatusBadge from "./StatusBadge";
import { formatDateTime, formatTime, isOverdue, isToday, timeAgo } from "../time";

export default function LeadRow({ lead, onOpen }) {
  const overdue = isOverdue(lead.follow_up_at);
  const today = isToday(lead.follow_up_at);

  return (
    <li className={`lead-row ${overdue ? "lead-overdue" : ""}`} onClick={() => onOpen(lead)}>
      <div className="lead-main">
        <div className="lead-title">
          <span className="lead-name">{lead.name}</span>
          {lead.company && <span className="lead-company">{lead.company}</span>}
          <StatusBadge status={lead.status} />
        </div>
        <p className="lead-note">{lead.last_note || <em>No discussions yet</em>}</p>
      </div>
      <div className="lead-meta">
        {lead.last_discussion_at && (
          <span className="muted">{timeAgo(lead.last_discussion_at)}</span>
        )}
        {lead.follow_up_at && (
          <span className={`follow-up ${overdue ? "overdue" : today ? "today" : ""}`}>
            {overdue ? "Overdue · " : "Follow-up · "}
            {today ? formatTime(lead.follow_up_at) : formatDateTime(lead.follow_up_at)}
          </span>
        )}
      </div>
    </li>
  );
}
