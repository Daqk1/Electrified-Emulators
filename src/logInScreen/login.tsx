
import { useRef, useState } from "react";
import type { SubmitEvent } from "react";

interface LoginResult {
  valid: boolean;
  userId: number | undefined;
  role: "teacher" | "student" | undefined;
}

function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const svgRef = useRef<HTMLDivElement>(null);

  async function userSearch(
    username: string,
    password: string
  ): Promise<LoginResult> {
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

    const data = await response.json();

    if (!response.ok) {
      return {
        valid: false,
        userId: undefined,
        role: undefined,
      };
    }

    const validRole =
      data.role === "teacher" || data.role === "student";

    return {
      valid: typeof data.userId === "number" && validRole,
      userId:
        typeof data.userId === "number"
          ? data.userId
          : undefined,
      role: validRole ? data.role : undefined,
    };
  }

  async function handleSubmit(
    event: SubmitEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await userSearch(username, password);

      if (data.valid && data.userId !== undefined && data.role) {
        const userId = data.userId;
        const role = data.role;

        console.log("Login successful!");
        console.log("User ID:", userId);
        console.log("Role:", role);

        sessionStorage.setItem("userId", String(userId));
        sessionStorage.setItem("role", role);

        localStorage.setItem("username", username);
        localStorage.setItem("userId", String(userId));

        if (role === "teacher") {
          window.location.href = "/teacher-dashboard";
        } else {
          window.location.href = "/dashboard";
        }
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
      <img
        src="/CircuitEDU.png"
        alt="CircuitEDU Logo"
        style={{
          width: "400px",
          height: "auto",
          display: "block",
          margin: "0 auto",
        }}
      />

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
      </form>
    </div>
  );
}

export default Login;
