"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#F2F5F6",
          color: "#1A2B30",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: "#5A6B70", marginBottom: 16 }}>
            A server error occurred. If this is a fresh deploy, confirm{" "}
            <code>DATABASE_URL</code>, <code>NEXTAUTH_SECRET</code>, and{" "}
            <code>NEXTAUTH_URL</code> are set in Vercel.
          </p>
          {error.digest && (
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: "#5A6B70",
              }}
            >
              Digest: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              background: "#0E5F6B",
              color: "#fff",
              border: 0,
              borderRadius: 6,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
