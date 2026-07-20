"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  activeClassName: string;
  className?: string;
}

export default function NavLink({ href, children, activeClassName, className = "" }: NavLinkProps) {
  const pathname = usePathname();
  
  // Xử lý thông minh: 
  // Trang chủ "/" thì check bằng nhau tuyệt đối
  // Các trang khác (như /NguoiDung) thì check xem pathname hiện tại có bắt đầu bằng href đó không (để ăn cả /NguoiDung/5)
  const isActive = pathname === href;
  return (
    <Link 
      href={href} 
      // Dùng logic sạch: Nếu active thì cộng class active, không thì giữ nguyên class thường
      className={`${className} ${isActive ? activeClassName : ""}`.trim()}
    >
      {children}
    </Link>
  );
}