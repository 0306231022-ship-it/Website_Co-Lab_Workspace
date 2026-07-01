import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({
        success: true,
        message: "Đăng xuất an toàn thành công!"
    });

    // Xóa cookie an toàn từ phía Server Next.js, hacker ở client không làm gì được
    response.cookies.set("token_admin", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0), // Ép cookie hết hạn ngay lập tức
    });

    response.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
    });

    return response;
}