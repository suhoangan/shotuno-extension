export default function App() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-6">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome to Shotuno</h1>
        <p className="text-muted-foreground leading-relaxed">
          Capture and annotate screenshots right in your browser. Open the extension
          popup on any page to start a visible, area, or full-page capture.
        </p>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>Click the Shotuno icon in the toolbar</li>
          <li>Choose a capture mode</li>
          <li>Annotate, then copy or download</li>
        </ol>
      </div>
    </main>
  );
}
