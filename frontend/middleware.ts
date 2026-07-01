import { NextRequest, NextResponse } from "next/server";
import { CallAPI } from "@/API/API";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }
    const canKiemTra =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/NguoiDung");

    if (!canKiemTra) {
        return NextResponse.next();
    }
    const chuoiCookie = request.headers.get("cookie") || "";
    if (!chuoiCookie.includes("token=")) {
        return NextResponse.redirect(new URL("/", request.url));
    }
    try {
        const res = await CallAPI(undefined, {
            url: "/NguoiDung/kiemtra_dangnhap",
            PhuongThuc: 1,
            token: chuoiCookie,
        });
        if (!res.success) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        const loaiND = Number(res.dulieu?.LOAIND);
        if (pathname.startsWith("/admin") && loaiND !== 1) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        /*if (pathname.startsWith("/NguoiDung") && loaiND !== 0) {
            return NextResponse.redirect(new URL("/", request.url));
        }*/
        return NextResponse.next();

    } catch (error) {
        console.error("Lỗi Proxy:", error);
        return NextResponse.redirect(new URL("/", request.url));
    }
}
export const config = {
    matcher: [
        "/admin/:path*",
        /*"/NguoiDung/:path*",*/
    ],
};