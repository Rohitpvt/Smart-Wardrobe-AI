export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <main className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          Smart Wardrobe AI
        </h1>
        <p className="text-lg text-muted-foreground">
          Your personal AI-powered styling assistant.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/login"
            className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Login
          </a>
          <a
            href="/register"
            className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors"
          >
            Register
          </a>
        </div>
      </main>
    </div>
  );
}
