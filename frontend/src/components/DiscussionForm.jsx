import { useState } from "react";

export default function DiscussionForm({ onSubmit }) {
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!note.trim()) {
      setError("Note can't be empty");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        note,
        // datetime-local gives local time; send it as a proper UTC timestamp
        follow_up_at: followUp ? new Date(followUp).toISOString() : null,
      });
      setNote("");
      setFollowUp("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form discussion-form" onSubmit={handleSubmit}>
      <textarea
        rows={3}
        placeholder="What did you discuss?"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="discussion-form-row">
        <label className="inline">
          Follow-up (optional)
          <input
            type="datetime-local"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save note"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
