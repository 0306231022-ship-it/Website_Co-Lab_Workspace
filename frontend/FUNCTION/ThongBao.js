import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
export function ThongBao_ThanhCong(TinNhan){
      Swal.fire({
        icon: "success",
        title : "Thành công ",
        text: TinNhan,
        confirmButtonColor: "#3085d6",
        timer: 2500,
        timerProgressBar: true,
  });
}
export function ThongBao_CanhBao(message, title = "Cảnh báo!") {
  Swal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#f8bb86",
  });
};
export function ThongBao_Loi(message, title = "Lỗi!") {
  Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonText: "Đóng",
    confirmButtonColor: "#d33",
  });
}
export function ThongBao_ThongTin(message, title = "Thông tin") {
  Swal.fire({
    icon: "info",
    title,
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor: "#3085d6",
  });
}
export async function ThongBao_XacNhanTT(message, title = "Xác nhận") {
  const result = await Swal.fire({
    title,
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Có",
    cancelButtonText: "Không",
  });
  return result.isConfirmed;
}
