import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function decodeRole(token) {
  try {
    return JSON.parse(atob(token.split(".")[1])).role;
  } catch (_error) {
    return null;
  }
}

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await api.post("/auth/login", form);
      const token = response.data.token;
      localStorage.setItem("token", token);
      const role = decodeRole(token);
      if (!role) throw new Error("Invalid token");
      navigate(`/${role.toLowerCase()}`);
    } catch (_err) {
      setError("Login failed. Check credentials.");
    }
  };

  return (
    <div className="container narrow">
      <h1>Waste Reporting Login</h1>
      <form className="panel" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />
        <button className="btn" type="submit">
          Login
        </button>
        {error ? <p className="error">{error}</p> : null}
      </form>
      <p className="hint">Use seeded accounts: admin@test.com, student@test.com, cleaner1@test.com</p>
    </div>
  );
}

export default Login;
