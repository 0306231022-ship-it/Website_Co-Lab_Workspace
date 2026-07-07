"use client";
import * as api from '@/API/API';
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function CauHinhLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token_admin="))
          ?.split("=")[1];
        const formData = new FormData();
        formData.append("LoaiND", String(1));
        const res = await api.CallAPI(formData, {
          url: "/NguoiDung/kiemtra_dangnhap",
          PhuongThuc: 1,
          token: `token_admin=${token}`,
        });
        if (!res.success) {
          router.push('/');
        }
      } catch (error) {
        console.error("Lỗi hệ thống tại Layout:", error);
      }
    }
    checkAuth();
  }, [router]);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-slate-50 z-50 flex flex-col overflow-y-auto">
      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto flex-1">
        {children}
      </main>
    </div>
  );
}