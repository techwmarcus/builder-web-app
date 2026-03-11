import { useState, useEffect } from "react";

const BASE_URL = "http://127.0.0.1:8000"; // 🔧 Replace with your API base URL

// Inject Bootstrap + Google Fonts
const bootstrapLink = document.createElement("link");
bootstrapLink.rel = "stylesheet";
bootstrapLink.href = "https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css";
document.head.appendChild(bootstrapLink);

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap";
document.head.appendChild(fontLink);



const customStyles = `
  body { font-family: 'DM Sans', sans-serif; background: #f1f5f9; }

  .sidebar {
    width: 250px; min-height: 100vh;
    background: #0f1923;
    position: fixed; top: 0; left: 0; bottom: 0;
    display: flex; flex-direction: column;
    z-index: 100;
  }

  .logo-text { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 800; color: #fff; }
  .logo-sub { font-size: 10px; color: #f59e0b; letter-spacing: 2px; text-transform: uppercase; }
  .logo-icon { width: 36px; height: 36px; background: #f59e0b; border-radius: 6px; display:flex; align-items:center; justify-content:center; font-size:18px; }

  .nav-item-custom {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 16px; border-radius: 8px; cursor: pointer;
    color: rgba(255,255,255,0.55); font-size: 14px; font-weight: 500;
    transition: all 0.15s; border: 1px solid transparent; margin-bottom: 2px;
  }
  .nav-item-custom:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
  .nav-item-custom.active { background: rgba(245,158,11,0.15); color: #f59e0b; border-color: rgba(245,158,11,0.25); }

  .main-content { margin-left: 250px; min-height: 100vh; display: flex; flex-direction: column; }

  .topbar {
    background: #fff; height: 64px; padding: 0 28px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 50;
  }

  .topbar-title { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; color: #0f1923; }

  .stat-value { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 800; color: #0f1923; line-height: 1; }
  .stat-icon { width: 44px; height: 44px; border-radius: 10px; display:flex; align-items:center; justify-content:center; font-size:20px; }

  .section-title { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; color: #0f1923; }
  .form-title { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 800; color: #0f1923; }

  .form-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #64748b; }
  .form-control:focus, .form-select:focus {
    border-color: #f59e0b !important;
    box-shadow: 0 0 0 3px rgba(245,158,11,0.15) !important;
  }

  .btn-amber { background: #f59e0b; color: #0f1923; font-weight: 700; font-size: 13px; border: none; }
  .btn-amber:hover { background: #d97706; color: #0f1923; }

  .table thead th { background: #f8fafc; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #64748b; }
  .table tbody td { vertical-align: middle; font-size: 14px; }
  .table tbody tr:hover { background: #fafbfc; }

  .user-avatar { width: 34px; height: 34px; background: #f59e0b; border-radius: 50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; color:#0f1923; }

  .project-name-bold { font-weight: 600; color: #0f1923; }
  .text-muted-sm { font-size: 12px; color: #94a3b8; }
  .amount-red { font-weight: 700; color: #ef4444; }
  .amount-dark { font-weight: 700; color: #0f1923; }

  .empty-state { text-align: center; padding: 56px 24px; }
  .empty-icon { font-size: 44px; margin-bottom: 12px; }
  .empty-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: #0f1923; }
`;

const styleEl = document.createElement("style");
styleEl.textContent = customStyles;
document.head.appendChild(styleEl);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    active: "bg-success-subtle text-success",
    pending: "bg-warning-subtle text-warning",
    completed: "bg-primary-subtle text-primary",
    "on hold": "bg-danger-subtle text-danger",
  };
  const cls = map[(status || "").toLowerCase()] || "bg-secondary-subtle text-secondary";
  return (
    <span className={`badge rounded-pill fw-semibold px-3 py-2 ${cls}`} style={{ fontSize: 11 }}>
      {status || "Pending"}
    </span>
  );
}

function Alert({ type, message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type === "success" ? "success" : "danger"} alert-dismissible d-flex align-items-center gap-2`} role="alert">
      <span>{type === "success" ? "✅" : "❌"}</span>
      <span className="flex-grow-1">{message}</span>
      <button type="button" className="btn-close" onClick={onClose} />
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ projects, expenses }) {
  const totalBudget = projects.reduce((s, p) => s + (parseFloat(p.budget) || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const activeCount = projects.filter((p) => (p.status || "").toLowerCase() === "active").length;
  const fmt = (n) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(0)}K` : `$${n.toFixed(0)}`;

  const stats = [
    { icon: "🏗️", label: "Total Projects", value: projects.length, topColor: "#f59e0b", iconBg: "rgba(245,158,11,0.12)" },
    { icon: "⚡", label: "Active Projects", value: activeCount, topColor: "#3b82f6", iconBg: "rgba(59,130,246,0.12)" },
    { icon: "💰", label: "Total Budget", value: fmt(totalBudget), topColor: "#10b981", iconBg: "rgba(16,185,129,0.12)" },
    { icon: "📋", label: "Total Expenses", value: fmt(totalExpenses), topColor: "#ef4444", iconBg: "rgba(239,68,68,0.12)" },
  ];

  return (
    <>
      <div className="row g-4 mb-4">
        {stats.map((s) => (
          <div className="col-md-3" key={s.label}>
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12, overflow: "hidden" }}>
              <div style={{ height: 4, background: s.topColor }} />
              <div className="card-body p-4">
                <div className="stat-icon mb-3" style={{ background: s.iconBg }}>{s.icon}</div>
                <div className="stat-value mb-1">{s.value}</div>
                <div className="text-muted" style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4">
              <span className="section-title">Recent Projects</span>
              <span className="badge bg-secondary-subtle text-secondary rounded-pill">{projects.length}</span>
            </div>
            {projects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏗️</div>
                <div className="empty-title">No projects yet</div>
                <p className="text-muted small mt-1">Create your first project to get started</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <tbody>
                    {projects.slice(0, 5).map((p, i) => (
                      <tr key={i}>
                        <td>
                          <div className="project-name-bold">{p.name || p.project_name || "Unnamed"}</div>
                          <div className="text-muted-sm">{p.client || p.location || "—"}</div>
                        </td>
                        <td><StatusBadge status={p.status || "Pending"} /></td>
                        <td className="text-end amount-dark">{p.budget ? `$${Number(p.budget).toLocaleString()}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4">
              <span className="section-title">Recent Expenses</span>
              <span className="badge bg-secondary-subtle text-secondary rounded-pill">{expenses.length}</span>
            </div>
            {expenses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💳</div>
                <div className="empty-title">No expenses logged</div>
                <p className="text-muted small mt-1">Track your project costs here</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <tbody>
                    {expenses.slice(0, 5).map((e, i) => (
                      <tr key={i}>
                        <td>
                          <div className="project-name-bold">{e.description || e.category || "Expense"}</div>
                          <div className="text-muted-sm">{e.project_name || e.project_name || "—"}</div>
                        </td>
                        <td className="text-end amount-red">−${Number(e.amount || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Projects Page ─────────────────────────────────────────────────────────────

function ProjectsPage({ projects, loading, onRefresh }) {
  const [tab, setTab] = useState("list");
  const [form, setForm] = useState({ name: "", client: "", location: "", budget: "", start_date: "", end_date: "", status: "Pending", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name) return setAlert({ type: "error", message: "Project name is required." });
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setAlert({ type: "success", message: "Project created successfully!" });
      setForm({ name: "", client: "", location: "", budget: "", start_date: "", end_date: "", status: "Pending", description: "" });
      onRefresh();
      setTimeout(() => setTab("list"), 1400);
    } catch {
      setAlert({ type: "error", message: "Failed to create project. Check your API connection." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${tab === "list" ? "active fw-semibold" : "text-muted"}`} onClick={() => setTab("list")}>
            📋 All Projects
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === "create" ? "active fw-semibold" : "text-muted"}`} onClick={() => setTab("create")}>
            ➕ New Project
          </button>
        </li>
      </ul>

      {tab === "list" && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4">
            <span className="section-title">All Projects ({projects.length})</span>
            <button className="btn btn-outline-secondary btn-sm" onClick={onRefresh}>↻ Refresh</button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Project</th><th>Client</th><th>Location</th><th>Budget</th><th>Status</th><th>Start Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm me-2" role="status" />Loading projects…
                  </td></tr>
                ) : projects.length === 0 ? (
                  <tr><td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-icon">🏗️</div>
                      <div className="empty-title">No Projects Found</div>
                      <p className="text-muted small mt-1">Use the "New Project" tab to get started</p>
                    </div>
                  </td></tr>
                ) : projects.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div className="project-name-bold">{p.name || p.project_name || "—"}</div>
                      <div className="text-muted-sm">{p.description?.slice(0, 55) || ""}</div>
                    </td>
                    <td className="text-muted">{p.client || "—"}</td>
                    <td className="text-muted">{p.location || "—"}</td>
                    <td className="amount-dark">{p.budget ? `$${Number(p.budget).toLocaleString()}` : "—"}</td>
                    <td><StatusBadge status={p.status || "Pending"} /></td>
                    <td className="text-muted">{p.start_date || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "create" && (
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 12 }}>
          <div className="mb-4">
            <div className="form-title">Create New Project</div>
            <p className="text-muted small mt-1">Fill in the details to register a new construction project</p>
          </div>

          <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Project Name *</label>
              <input className="form-control" name="name" value={form.name} onChange={set} placeholder="e.g. Riverside Office Complex" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Client Name</label>
              <input className="form-control" name="client" value={form.client} onChange={set} placeholder="e.g. Acme Corp" />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label">Location</label>
              <input className="form-control" name="location" value={form.location} onChange={set} placeholder="City, State" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Budget ($)</label>
              <input className="form-control" type="number" name="budget" value={form.budget} onChange={set} placeholder="0.00" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select className="form-select" name="status" value={form.status} onChange={set}>
                <option>Pending</option><option>Active</option><option>On Hold</option><option>Completed</option>
              </select>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Start Date</label>
              <input className="form-control" type="date" name="start_date" value={form.start_date} onChange={set} />
            </div>
            <div className="col-md-6">
              <label className="form-label">End Date</label>
              <input className="form-control" type="date" name="end_date" value={form.end_date} onChange={set} />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Description</label>
            <textarea className="form-control" name="description" value={form.description} onChange={set} rows={3} placeholder="Brief project description and scope…" />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-outline-secondary" onClick={() => setForm({ name: "", client: "", location: "", budget: "", start_date: "", end_date: "", status: "Pending", description: "" })}>
              Clear
            </button>
            <button className="btn btn-amber px-4" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Creating…</> : "🏗️ Create Project"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Expenses Page ─────────────────────────────────────────────────────────────

function ExpensesPage({ expenses, projects, loading, onRefresh }) {
  const [tab, setTab] = useState("list");
  const [form, setForm] = useState({ project_name: "", category: "", description: "", amount: "", date: "", vendor: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null); 

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.amount || !form.description) return setAlert({ type: "error", message: "Amount and description are required." });
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setAlert({ type: "success", message: "Expense logged successfully!" });
      setForm({ project_name: "", category: "", description: "", amount: "", date: "", vendor: "", notes: "" });
      onRefresh();
      setTimeout(() => setTab("list"), 1400);
    } catch {
      setAlert({ type: "error", message: "Failed to log expense. Check your API connection." });
    } finally {
      setSubmitting(false);
    }
  };
   
    const clearForm = () => {
    setForm({
      project_name: "",
      category: "",
      description: "",
      amount: "",
      date: "",
      vendor: "",
      notes: ""
    });
  };

  const Alert = ({ type, message, onClose }) => {

    if (!message) return null;

    return (
      <div className={`alert alert-${type === "error" ? "danger" : "success"} d-flex justify-content-between`}>
        {message}
        <button className="btn-close" onClick={onClose}></button>
      </div>
    );
  };


  const total = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  return (
    <>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${tab === "list" ? "active fw-semibold" : "text-muted"}`} onClick={() => setTab("list")}>
            📋 Expense Log
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === "create" ? "active fw-semibold" : "text-muted"}`} onClick={() => setTab("create")}>
            ➕ Log Expense
          </button>
        </li>
      </ul>

      {tab === "list" && (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3 px-4">
            <span className="section-title">Expense Log ({expenses.length})</span>
            <div className="d-flex align-items-center gap-3">
              <span className="fw-bold amount-red small">Total: ${total.toLocaleString()}</span>
              <button className="btn btn-outline-secondary btn-sm" onClick={onRefresh}>↻ Refresh</button>
              <button className="btn btn-outline-secondary btn-sm" onClick={form} >Edit</button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Description</th><th>Category</th><th>Project</th><th>Vendor</th><th>Date</th><th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center text-muted py-5">
                    <div className="spinner-border spinner-border-sm me-2" role="status" />Loading expenses…
                  </td></tr>
                ) : expenses.length === 0 ? (
                  <tr><td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-icon">💳</div>
                      <div className="empty-title">No Expenses Logged</div>
                      <p className="text-muted small mt-1">Use the "Log Expense" tab to start tracking costs</p>
                    </div>
                  </td></tr>
                ) : expenses.map((e, i) => (
                  <tr key={i}>
                    <td><div className="project-name-bold">{e.description || "—"}</div></td>
                    <td><span className="badge bg-warning-subtle text-warning rounded-pill px-3" style={{ fontSize: 11 }}>{e.category || "General"}</span></td>
                    <td className="text-muted">{e.project_name || e.project_name || "—"}</td>
                    <td className="text-muted">{e.vendor || "—"}</td>
                    <td className="text-muted">{e.date || "—"}</td>
                    <td className="text-end amount-red">${Number(e.amount || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "create" && (
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 12 }}>
          <div className="mb-4">
            <div className="form-title">Log New Expense</div>
            <p className="text-muted small mt-1">Record a cost associated with a project</p>
          </div>

          <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Description *</label>
              <input className="form-control" name="description" value={form.description} onChange={set} placeholder="e.g. Concrete delivery" />
            </div>
            <div className="col-md-6">
              <label className="form-label">Amount ($) *</label>
              <input className="form-control" type="number" name="amount" value={form.amount} onChange={set} placeholder="0.00" />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label">Project</label>
              <select className="form-select" name="project_name" value={form.project_name} onChange={set}>
                <option value="">— Select Project —</option>
                {projects.map((p, i) => (
                  <option key={i} value={p.name || p.project_name || `Project ${i + 1}`}>{p.name || p.project_name || `Project ${i + 1}`}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select className="form-select" name="category" value={form.category} onChange={set}>
                <option value="">— Select Category —</option>
                <option>Materials</option><option>Labor</option><option>Equipment</option>
                <option>Subcontractor</option><option>Permits & Fees</option><option>Transportation</option><option>Other</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Date</label>
              <input className="form-control" type="date" name="date" value={form.date} onChange={set} />
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label">Vendor / Supplier</label>
              <input className="form-control" name="vendor" value={form.vendor} onChange={set} placeholder="e.g. BuildRight Supply Co." />
            </div>
            <div className="col-md-6">
              <label className="form-label">Notes</label>
              <input className="form-control" name="notes" value={form.notes} onChange={set} placeholder="Optional notes…" />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-outline-secondary" onClick={() => setForm({ project_name: "", category: "", description: "", amount: "", date: "", vendor: "", notes: "" })}>
              Clear
            </button>
            <button className="btn btn-amber px-4" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Logging…</> : "💳 Log Expense"}
            </button>
          </div>
        </div>
      )}
            {tab === "edit" && (

        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 12 }}>

          <div className="mb-4">
            <div className="form-title">Edit Expense</div>
            <p className="text-muted small mt-1">Update an existing project expense</p>
          </div>

          <Alert
            type={alert?.type}
            message={alert?.message}
            onClose={() => setAlert(null)}
          />

          <div className="row g-3 mb-3">

            <div className="col-md-6">
              <label className="form-label">Description *</label>

              <input
                className="form-control"
                name="description"
                value={form.description}
                onChange={set}
                placeholder="e.g. Concrete delivery"
              />

            </div>

            <div className="col-md-6">

              <label className="form-label">Amount ($) *</label>

              <input
                className="form-control"
                type="number"
                name="amount"
                value={form.amount}
                onChange={set}
                placeholder="0.00"
              />

            </div>

          </div>


          <div className="row g-3 mb-3">

            <div className="col-md-4">

              <label className="form-label">Project</label>

              <select
                className="form-select"
                name="project_name"
                value={form.project_name}
                onChange={set}
              >

                <option value="">— Select Project —</option>

                {projects.map((p, i) => (
                  <option key={i} value={p.name}>
                    {p.name}
                  </option>
                ))}

              </select>

            </div>


            <div className="col-md-4">

              <label className="form-label">Category</label>

              <select
                className="form-select"
                name="category"
                value={form.category}
                onChange={set}
              >

                <option value="">— Select Category —</option>

                <option>Materials</option>
                <option>Labor</option>
                <option>Equipment</option>
                <option>Subcontractor</option>
                <option>Permits & Fees</option>
                <option>Transportation</option>
                <option>Other</option>

              </select>

            </div>


            <div className="col-md-4">

              <label className="form-label">Date</label>

              <input
                className="form-control"
                type="date"
                name="date"
                value={form.date}
                onChange={set}
              />

            </div>

          </div>


          <div className="row g-3 mb-4">

            <div className="col-md-6">

              <label className="form-label">Vendor / Supplier</label>

              <input
                className="form-control"
                name="vendor"
                value={form.vendor}
                onChange={set}
                placeholder="e.g. BuildRight Supply Co."
              />

            </div>

            <div className="col-md-6">

              <label className="form-label">Notes</label>

              <input
                className="form-control"
                name="notes"
                value={form.notes}
                onChange={set}
                placeholder="Optional notes…"
              />

            </div>

          </div>


          <div className="d-flex justify-content-end gap-2">

            <button
              className="btn btn-outline-secondary"
              onClick={clearForm}
            >
              Clear
            </button>




          </div>

        </div>

      )}
    </>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);


  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch(`${BASE_URL}/projects`);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : data.projects || []);
    } catch { setProjects([]); }
    finally { setLoadingProjects(false); }
  };

  const fetchExpenses = async () => {
    setLoadingExpenses(true);
    try {
      const res = await fetch(`${BASE_URL}/expenses`);
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : data.expenses || []);
    } catch { setExpenses([]); }
    finally { setLoadingExpenses(false); }
  };

  useEffect(() => { fetchProjects(); fetchExpenses(); }, []);

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "projects", icon: "🏗️", label: "Projects" },
    { id: "expenses", icon: "💳", label: "Expenses" },
  ];

  const pageTitles = { dashboard: "Dashboard", projects: "Projects", expenses: "Expenses" };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="p-4 border-bottom border-white border-opacity-10">
          <div className="d-flex align-items-center gap-2">
            <div className="logo-icon">🔩</div>
            <div>
              <div className="logo-text">ConstructIQ</div>
              <div className="logo-sub">Management Platform</div>
            </div>
          </div>
        </div>

        <nav className="p-3 flex-grow-1">
          <div className="text-uppercase text-white-50 px-2 py-2" style={{ fontSize: 10, letterSpacing: 2, fontWeight: 700 }}>Main Menu</div>
          {navItems.map((item) => (
            <div key={item.id} className={`nav-item-custom ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="p-3 border-top border-white border-opacity-10">
          <div className="d-flex align-items-center gap-2">
            <div className="user-avatar">AM</div>
            <div>
              <div className="text-white fw-semibold" style={{ fontSize: 13 }}>Project Admin</div>
              <div className="text-white-50" style={{ fontSize: 11 }}>Site Manager</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content flex-grow-1">
        <div className="topbar">
          <div className="topbar-title">{pageTitles[page]}</div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => { fetchProjects(); fetchExpenses(); }}>↻ Sync</button>
          </div>
        </div>

        <div className="p-4">
          {page === "dashboard" && <Dashboard projects={projects} expenses={expenses} />}
          {page === "projects" && <ProjectsPage projects={projects} loading={loadingProjects} onRefresh={fetchProjects} />}
          {page === "expenses" && <ExpensesPage expenses={expenses} projects={projects} loading={loadingExpenses} onRefresh={fetchExpenses} />}
        </div>
      </div>
    </div>
  );
}