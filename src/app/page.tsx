// src/app/dashboard/page.tsx
export default function Dashboard() {
  return (
    <main className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Email Platform Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Templates" description="Tạo và quản lý email template.">
          <a href="/templates" className="text-sm underline">Xem templates</a>
        </Card>
        <Card title="Chiến dịch" description="Tạo và gửi email chiến dịch.">
          <a href="/campaigns" className="text-sm underline">Tạo chiến dịch</a>
        </Card>
        <Card title="Danh sách người nhận" description="Quản lý email người nhận.">
          <a href="/audience" className="text-sm underline">Xem danh sách</a>
        </Card>
      </div>
    </main>
  );
}

type CardProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

function Card({ title, description, children }: CardProps) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-4 space-y-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-gray-500 text-sm">{description}</p>
      {children}
    </div>
  );
}
