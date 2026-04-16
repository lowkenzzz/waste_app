import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import ReportCard from "../components/ReportCard";

function AdminView() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("queue");
  const [queue, setQueue] = useState([]);
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = async () => {
    const [queueRes, reportRes] = await Promise.all([
      api.get("/admin/queue"),
      api.get("/admin/reports", { params: statusFilter ? { status: statusFilter } : {} }),
    ]);
    setQueue(queueRes.data);
    setReports(reportRes.data);
  };

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 15000);
    return () => clearInterval(id);
  }, [statusFilter]);

  const approve = async (id) => {
    await api.patch(`/admin/reports/${id}/approve`);
    await loadData();
  };

  const reject = async (id) => {
    await api.patch(`/admin/reports/${id}/reject`);
    await loadData();
  };

  return (
    <div className="container">
      <div className="header-row">
        <h1>Admin Dashboard</h1>
        <button className="btn btn-secondary" onClick={() => (localStorage.clear(), navigate("/login"))}>
          Logout
        </button>
      </div>
      <div className="row">
        <button className={`btn ${activeTab === "queue" ? "" : "btn-secondary"}`} onClick={() => setActiveTab("queue")}>
          Review Queue
        </button>
        <button className={`btn ${activeTab === "all" ? "" : "btn-secondary"}`} onClick={() => setActiveTab("all")}>
          All Reports
        </button>
      </div>

      {activeTab === "queue" ? (
        <div className="list">
          {queue.map((report) => (
            <div key={report.id} className="panel">
              <ReportCard report={report} />
              <div className="row">
                <button className="btn" onClick={() => approve(report.id)}>
                  Approve
                </button>
                <button className="btn btn-danger" onClick={() => reject(report.id)}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="DISCARDED">DISCARDED</option>
          </select>
          <div className="list">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminView;
