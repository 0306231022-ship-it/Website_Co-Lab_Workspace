// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { CallAPI } from '@/API/API'; 

export async function middleware(request: NextRequest) {
  
    const { pathname } = request.nextUrl;
    if (
        pathname.startsWith('/_next') || 
        pathname.startsWith('/api') || 
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }
    //Chặn người dùng truy cập các trang được định nghĩa
    const TrangQuyDinh = [
        '/NguoiDung'
    ]
    const dangVaoTrangBiChan = TrangQuyDinh.some(route => pathname.startsWith(route));

    if (dangVaoTrangBiChan) {
        const chuoiCookie = request.headers.get('cookie') || '';
        if (!chuoiCookie.includes('token=')) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        try {
            const res = await CallAPI(null, {
                url: '/NguoiDung/kiemtra_dangnhap',
                PhuongThuc: 2,
                token: chuoiCookie
            });
            if (!res || !res.success || !res.dulieu?.IDND) {
                return NextResponse.redirect(new URL("/", request.url));
            }

            if (pathname.startsWith('/admin') && Number(res.dulieu?.LOAIND) !== 1) {
                return NextResponse.redirect(new URL("/", request.url));
            }

        } catch (error) {
             console.error("Lỗi kết nối Middleware -> Express:", error);
            return NextResponse.redirect(new URL("/", request.url));
        }
    }
 


    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'], 
};