
import { useEffect, useRef, useState } from "react";
import { SVG } from "@svgdotjs/svg.js";

export default function Header() {
  const svgRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const container = svgRef.current;

    if (!container) return;

    function drawHeader(): void {
      if (!container) return;

      const width = container.clientWidth;
      const height = 90;

      container.innerHTML = "";

      const header = SVG()
        .addTo(container)
        .size(width, height);

      header
        .rect(width, height)
        .fill("#1e1e24");

      header
        .image("/CircuitEDU.png")
        .size(350, 325)
        .move(width / 2 - 175, -115);

      header
        .image("/avatar.png")
        .size(120, 120)
        .move(width - 150, -15)
        .css("cursor", "pointer")
        .click(() => {
          setIsProfileOpen((prev) => !prev);
        });

      header
        .line(0, height - 1, width, height - 1)
        .stroke({
          color: "#d1d5db",
          width: 1,
        });
    }

    drawHeader();

    window.addEventListener("resize", drawHeader);

    return () => {
      window.removeEventListener("resize", drawHeader);
      container.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleSignOut() {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");

    window.location.href = "/";
  }

  return (
    <div className="dashboard-header" ref={headerRef}>
      <div ref={svgRef}></div>

      {isProfileOpen && (
        <div className="profile-dropdown">
          <div className="profile-info">
            <img
              src="/avatar.png"
              alt="Profile"
              className="profile-menu-avatar"
            />

            <div>
              <strong>My Account</strong>
            </div>
          </div>

          <div className="profile-divider"></div>

          <button
            type="button"
            className="profile-item"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
