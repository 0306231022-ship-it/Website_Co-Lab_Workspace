import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { LoaiND } = await request.json();

    const response = NextResponse.json({
        success: true,
        message: "Đăng xuất thành công!",
    });

    if (LoaiND === 1) {
        response.cookies.set("token_admin", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: new Date(0),
        });
    } else if (LoaiND === 0) {
        response.cookies.set("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: new Date(0),
        });
    } else {
        return NextResponse.json(
            {
                success: false,
                message: "Loại người dùng không hợp lệ",
            },
            { status: 400 }
        );
    }

    return response;
}