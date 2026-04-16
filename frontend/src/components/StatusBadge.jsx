const STATUS_COLORS = {
  PENDING: "#f59e0b",
  NEEDS_REVIEW: "#f97316",
  ASSIGNED: "#3b82f6",
  RESOLVED: "#16a34a",
  DISCARDED: "#dc2626",
};

function StatusBadge({ status }) {
  return (
    <span className="status-badge" style={{ backgroundColor: STATUS_COLORS[status] || "#6b7280" }}>
      {status}
    </span>
  );
}

export default StatusBadge;
