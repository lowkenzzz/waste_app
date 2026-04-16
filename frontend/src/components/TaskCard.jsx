import StatusBadge from "./StatusBadge";

function TaskCard({ task, onResolve }) {
  const resolved = Boolean(task.resolvedAt) || task.report.status === "RESOLVED";
  return (
    <div className={`card ${resolved ? "card-resolved" : ""}`}>
      <img src={task.report.imageUrl} alt="Assigned waste" className="thumb" />
      <div className="card-content">
        <p>
          <strong>Assigned:</strong> {new Date(task.assignedAt).toLocaleString()}
        </p>
        <p>
          <strong>GPS:</strong> {task.report.gpsLat}, {task.report.gpsLng}
        </p>
        <StatusBadge status={task.report.status} />
        {!resolved ? (
          <button className="btn" onClick={() => onResolve(task)}>
            Mark as Resolved
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default TaskCard;
