import * as React from "react";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{ padding: 8, borderRadius: 12, border: "1px solid #ccc" }}
    />
  );
}
