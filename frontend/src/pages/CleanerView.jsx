import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import TaskCard from "../components/TaskCard";

function CleanerView() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [proofImage, setProofImage] = useState(null);

  const loadTasks = async () => {
    const response = await api.get("/cleaner/tasks");
    setTasks(response.data);
  };

  useEffect(() => {
    loadTasks();
    const id = setInterval(loadTasks, 15000);
    return () => clearInterval(id);
  }, []);

  const resolveTask = async () => {
    const data = new FormData();
    data.append("proofImage", proofImage);
    await api.post(`/cleaner/tasks/${selectedTask.id}/resolve`, data);
    setSelectedTask(null);
    setProofImage(null);
    await loadTasks();
  };

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => Number(Boolean(a.resolvedAt)) - Number(Boolean(b.resolvedAt))),
    [tasks],
  );

  return (
    <div className="container">
      <div className="header-row">
        <h1>Cleaner Dashboard</h1>
        <button className="btn btn-secondary" onClick={() => (localStorage.clear(), navigate("/login"))}>
          Logout
        </button>
      </div>
      <div className="list">
        {sortedTasks.map((task) => (
          <TaskCard key={task.id} task={task} onResolve={setSelectedTask} />
        ))}
      </div>

      {selectedTask ? (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Upload Proof Image</h3>
            <input type="file" accept="image/*" onChange={(e) => setProofImage(e.target.files?.[0])} />
            <div className="row">
              <button className="btn" disabled={!proofImage} onClick={resolveTask}>
                Submit
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedTask(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default CleanerView;
