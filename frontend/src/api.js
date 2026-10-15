const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") message = body.detail;
      else if (Array.isArray(body.detail)) message = body.detail.map((d) => d.msg).join(", ");
    } catch {
      // response had no JSON body
    }
    throw new Error(message);
  }
  return res.json();
}

export const STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"];

export function getLeads({ status, q } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const qs = params.toString();
  return request(`/leads${qs ? `?${qs}` : ""}`);
}

export function createLead(data) {
  return request("/leads", { method: "POST", body: JSON.stringify(data) });
}

export function getDiscussions(leadId) {
  return request(`/leads/${leadId}/discussions`);
}

export function addDiscussion(leadId, data) {
  return request(`/leads/${leadId}/discussions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateStatus(leadId, status) {
  return request(`/leads/${leadId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
