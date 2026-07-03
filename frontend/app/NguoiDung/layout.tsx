import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as api from '@/API/API';

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
        redirect("/");
    }
    const formdata = new FormData();
    formdata.append('LoaiND', String(0));
    const result = await api.CallAPI(formdata, {
        url: "/NguoiDung/kiemtra_dangnhap",
        PhuongThuc: 1,
        token: `token=${token}`,
    });
    console.log(result)
    if (!result.success) {
        redirect("/");
    }
    return <>{children}</>;
}