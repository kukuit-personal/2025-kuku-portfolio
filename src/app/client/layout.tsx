import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
title: "Ainka-e | Client",
};

export default function ClientLayout({ children }: { children: ReactNode }) {
return (
    <div className="flex min-h-[calc(100vh-56px)]">{/* giữ đồng nhất nếu có topbar ngoài */}
        <Sidebar />
        <div className="flex-1 p-6">
            {children}
        </div>
    </div>
);
}