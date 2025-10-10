// app/page.tsx
export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-gray-600">
      <h1 className="text-3xl font-bold mb-2">Welcome to KukuIt</h1>
      <p className="text-sm text-gray-500">
        Your personal productivity & worklog system.
      </p>
      <a
        href="/worklog"
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Go to Worklog →
      </a>
    </main>
  );
}
