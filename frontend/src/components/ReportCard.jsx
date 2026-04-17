import StatusBadge from "./StatusBadge";

function ReportCard({ report, showConfidence = false }) {
  return (
    <div className="card">
      <img src={report.imageUrl} alt="Waste report" className="thumb" />
      <div className="card-content">
        <p>
          <strong>Date:</strong> {new Date(report.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>GPS:</strong> {report.gpsLat}, {report.gpsLng}
        </p>
        {showConfidence && report.confidenceScore !== null && report.confidenceScore !== undefined ? (
          <p>
            <strong>Confidence:</strong> {report.confidenceScore}%
          </p>
        ) : null}
        <StatusBadge status={report.status} />
      </div>
    </div>
  );
}

export default ReportCard;
