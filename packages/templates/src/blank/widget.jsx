export default function Widget() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "white",
        backgroundColor: "rgba(30, 30, 30, 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "12px",
      }}
    >
      <span>Hello Widget</span>
    </div>
  );
}
