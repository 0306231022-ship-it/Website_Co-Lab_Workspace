 //Kiểm tra giá trị rổng của obj
export function KiemTraRong(obj) {
  if (typeof obj !== "object" || obj === null) return false;

  const keys = Object.keys(obj);
  if (keys.length === 0) return false;

  const errorKeys = [];

  for (const key of keys) {
    const value = obj[key];
    // Nếu là File thì chỉ cần check null
    if (value instanceof File) {
      if (!value) errorKeys.push(key);
    } else if (typeof value === "object" && value !== null) {
      const result = KiemTraRong(value);
      if (!result.Status) {
        result.ErrorKeys.forEach(subKey => errorKeys.push(`${key}.${subKey}`));
      }
    } else if (value === "" || value === null || value === undefined) {
      errorKeys.push(key);
    }
  }

  if (errorKeys.length > 0) {
    return { Status: false, ErrorKeys: errorKeys };
  }
  return { Status: true };
}
//reset giá trị obj
export function resetGiaTri(obj) {
    if (typeof obj !== "object" || obj === null) return;

    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        const value = obj[key];

        if (Array.isArray(value)) {
            obj[key] = []; // reset mảng
        } else if (typeof value === "object" && value !== null) {
            resetGiaTri(value); // reset object con
        } else {
            obj[key] = ""; // reset primitive
        }
    }
}
export function objectToFormData(obj, formData = new FormData(), parentKey = '') {
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) { 
      const propName = parentKey ? `${parentKey}[${key}]` : key;
      const value = obj[key];
      if (value instanceof File || value instanceof Blob) {
        formData.append(propName, value, value.name);
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        objectToFormData(value, formData, propName);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${propName}[]`, item);
        });
      } else if (value !== null && value !== undefined) {
        formData.append(propName, value);
      }
     
    }
  }
  return formData;
}
//hàm kiểm tra fromdata rỗng 
export function isFormDataEmpty(formData) {
  for (const pair of formData.entries()) {
    return false; 
  }
  return true; 
}
// Hàm kiểm tra định dạng số điện thoại Việt Nam
export const validatePhone = (value) => {
    const regex = /^(0|\+84)(\d{9,10})$/;
    if (!regex.test(value)) {
      return false;
    } else {
      return true;
    }
  };
// Hàm kiểm tra định dạng email
export const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    if (!regex.test(value)) {
      return false;
    } else {
      return true;
    } 
  };
//hàm kiểm tra image
export const validateImage = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']; 
    if (!allowedTypes.includes(file.type)) {
      return false;
    } else {
      return true;
    }
  };
  export const Map=(obj)=> {
          switch (obj) {
              case 'HEDIEUHANH':
                  return "Hệ điều hành";
              case 'MANHINH':
                  return "Màn Hình";
              case 'RAM':
                  return "RAM";
              case 'BONHOTRONG':
                  return "Bộ nhớ trong";
              case 'PIN':
                  return "Dung lượng Pin";
              case 'MAUSAC':
                  return "Màu sắc";
              default:
                  return "Không xác định";
          }
      }
export  const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
export  const tinhThoiGian = (deleteAt) => {
        if (!deleteAt) return { soNgay: 0, phanTram: 0 };
        
        const ngayXoa = new Date(deleteAt);
        const ngayHetHan = new Date(ngayXoa.getTime() + 30 * 24 * 60 * 60 * 1000);
        const bayGio = new Date();
        
        const diffTime = ngayHetHan - bayGio;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const phanTram = Math.max(0, Math.min(100, (diffDays / 30) * 100));
        
        return {
            soNgay: diffDays > 0 ? diffDays : 0,
            phanTram: phanTram
        };
    };
// tính định dang giờ vd 10:00
export const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
// tính định dạng ngày vd 25/10/2026
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
//hàm tạo mã ngẫu nhiên
export const RandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
export function tinhTongGiamGia(dulieu, tongTien) {
  if(!dulieu || dulieu.length===0){
    return 0;
  }
  let tongGiam = 0;
  for (const item of dulieu) {
    if (item.LOAIGIAM === 1) {
      tongGiam += tongTien * (item.GIATRIGIAM / 100);
    } else if (item.LOAIGIAM === 0) {
      tongGiam += item.GIATRIGIAM;
    }
  }
  return tongGiam;
}
