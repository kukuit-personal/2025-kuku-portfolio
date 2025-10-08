export default function AdminHome() {
return (
<div className="space-y-3">
<h1 className="text-2xl md:text-3xl font-bold">Admin Overview</h1>
<p className="text-gray-600">Chọn mục bên trái: Users, Templates, API.</p>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<Card title="Users" desc="Quản lý tài khoản, vai trò, quyền." href="/admin/users" />
<Card title="Templates" desc="Kho template toàn hệ thống." href="/admin/templates" />
<Card title="API" desc="Quản lý API keys, rate limit." href="/admin/api" />
</div>
</div>
);
}


function Card({ title, desc, href }: { title: string; desc: string; href: string }) {
return (
<a href={href} className="rounded-2xl border bg-white shadow-sm p-5 hover:shadow-md transition">
<div className="text-lg font-semibold">{title}</div>
<div className="text-sm text-gray-500 mt-1">{desc}</div>
</a>
);
}