import { useRef, useState } from "react";
import type { SubmitEvent } from "react";

function Login() {
  // Store username and password
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Login status
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // SVG container
  const svgRef = useRef<HTMLDivElement>(null);

  // Ask backend to verify login
  async function userSearch(
    username: string,
    password: string,
  ): Promise<boolean> {
    const response = await fetch("http://localhost:5001/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    return response.ok;
  }

  // Handle login button
  async function handleSubmit(
    event: SubmitEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const valid = await userSearch(username, password);

      if (valid) {
        console.log("Login successful!");
        window.location.href = "/dashboard";

        // Navigate to Dashboard after successful login
      } else {
        setError("Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Cannot connect to backend server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div ref={svgRef}></div>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>

        {error && <p>{error}</p>}
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default Login;
