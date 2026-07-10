export const formatCurrency = (amount: string | number | undefined) => {
    if (!amount) return '0đ';
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN').format(numericAmount) + 'đ';
  };
export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
export function formatDate(date: string) {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}
export function formatShortNumber(number : number) {
    if (typeof number !== 'number') {
        number = Number(number);
    }
    if (isNaN(number)) return "0";
    if (number >= 1000000) {
        return (number / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (number >= 1000) {
        return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return number.toString();
}
export const formatToBackendDateTime = (dateTimeLocalValue: string): string => {
  if (!dateTimeLocalValue) return "";
  
  // dateTimeLocalValue sẽ có dạng: "2026-07-02T09:00"
  // Bước 1: Thay thế ký tự 'T' bằng một dấu cách ' '
  let formatted = dateTimeLocalValue.replace('T', ' ');
  
  // Bước 2: Nếu chuỗi thiếu phần giây (độ dài lúc này là 16 ký tự "YYYY-MM-DD HH:mm")
  if (formatted.length === 16) {
    formatted += ':00'; // Cộng thêm giây vào cuối
  }
  
  return formatted; // Kết quả trả về: "2026-07-02 09:00:00"
};
