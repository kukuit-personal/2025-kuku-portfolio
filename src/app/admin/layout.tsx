import type { ReactNode } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
title: "Ainka-e | Admin",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
return (
    <div className="flex min-h-[calc(100vh-56px)]">{/* giữ đồng nhất nếu có topbar ngoài */}
        <AdminSidebar />
        <div className="flex-1 p-6">
            {children}
        </div>
    </div>
);
}