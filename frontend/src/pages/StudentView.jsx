import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import ReportCard from "../components/ReportCard";

function StudentView() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ gpsLat: "", gpsLng: "", image: null });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadReports = async () => {
    const response = await api.get("/reports/mine");
    setReports(response.data);
  };

  useEffect(() => {
    loadReports();
    const id = setInterval(loadReports, 15000);
    return () => clearInterval(id);
  }, []);

  const submitReport = async (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("image", form.image);
    data.append("gpsLat", form.gpsLat);
    data.append("gpsLng", form.gpsLng);
    setLoading(true);
    try {
      await api.post("/reports", data);
      setForm({ gpsLat: "", gpsLng: "", image: null });
      await loadReports();
    } finally {
      setLoading(false);
    }
  };

  const useGeolocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setForm((prev) => ({
        ...prev,
        gpsLat: String(position.coords.latitude),
        gpsLng: String(position.coords.longitude),
      }));
    });
  };

  return (
    <div className="container">
      <div className="header-row">
        <h1>Student Dashboard</h1>
        <button className="btn btn-secondary" onClick={() => (localStorage.clear(), navigate("/login"))}>
          Logout
        </button>
      </div>
      <form className="panel" onSubmit={submitReport}>
        <h2>Submit Report</h2>
        <input type="file" accept="image/*" required onChange={(e) => setForm((p) => ({ ...p, image: e.target.files?.[0] }))} />
        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={form.gpsLat}
          onChange={(e) => setForm((p) => ({ ...p, gpsLat: e.target.value }))}
          required
        />
        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={form.gpsLng}
          onChange={(e) => setForm((p) => ({ ...p, gpsLng: e.target.value }))}
          required
        />
        <div className="row">
          <button className="btn btn-secondary" type="button" onClick={useGeolocation}>
            Use Browser GPS
          </button>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
      <section>
        <h2>My Reports</h2>
        <div className="list">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default StudentView;
