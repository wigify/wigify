import { useEffect, useState } from "react";

function getData(): number | string {
  return 42;
}

export default function StatWidget() {
  const [value, setValue] = useState<number | string>("--");

  useEffect(() => {
    setValue(getData());
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "white",
        backgroundColor: "rgba(30, 30, 30, 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      <div
        style={{
          fontSize: "48px",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "14px",
          fontWeight: 500,
          opacity: 0.7,
          marginTop: "8px",
        }}
      >
        Label
      </div>
    </div>
  );
}
