import { useState } from "react";
import Modal from "./Modal";
import { createLead } from "../api";

export default function AddLeadDialog({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", company: "", phone: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const lead = await createLead({
        name: form.name,
        company: form.company || null,
        phone: form.phone || null,
      });
      onCreated(lead);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title="Add new lead" onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Name <span className="required">*</span>
          <input value={form.name} onChange={update("name")} autoFocus maxLength={100} />
        </label>
        <label>
          Company
          <input value={form.company} onChange={update("company")} maxLength={100} />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={update("phone")} maxLength={20} />
        </label>
        <p className="muted small">Status will be set to New.</p>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Add lead"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
