export default function MainWindow() {
  return (
    <div className="flex h-screen w-screen flex-col">
      <div className="titlebar" />
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-glassy-text text-3xl font-semibold drop-shadow-sm">
            Wigify
          </h1>
          <p className="text-glassy-text-muted text-sm">
            Your desktop widget companion
          </p>
        </div>
      </div>
    </div>
  );
}
