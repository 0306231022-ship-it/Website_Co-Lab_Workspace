import { randomUUID, randomBytes } from 'crypto';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import NodeGeocoder from 'node-geocoder';
const options = {
  provider: 'openstreetmap',
};

const geocoder = NodeGeocoder(options);

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const PASSWORD_HASH_ROUNDS = parseInt(process.env.PASSWORD_HASH_ROUNDS) || 10;

export const generateToken = (user) => {
    return jwt.sign(
        { id: user.IDND },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
    }
export const TaoID = (bien) => {
  const prefix = bien.toString().slice(0, 2).toUpperCase();
  const timePart = Date.now().toString(36).toUpperCase().slice(-4); // lấy 4 ký tự cuối
  const randomPart = randomBytes(4).toString('hex').toUpperCase().slice(0,2); // lấy 4 ký tự đầu
  return `${prefix}-${timePart}-${randomPart}`; // tổng cộng ~ 10 ký tự
};


export function mapFilesByProduct(files) {
    if (!Array.isArray(files)) return [];

    const result = [];
   
    const INDEX_REGEX = /HinhAnh\[(\d+)\]/;

    for (const file of files) {
        // Kiểm tra file và fieldname tồn tại để tránh crash
        if (!file?.fieldname) continue;

        const match = file.fieldname.match(INDEX_REGEX);
        if (!match) continue;

        const index = parseInt(match[1], 10);

        if (!result[index]) {
            result[index] = [];
        }
        result[index].push(file);
    }

    // Tùy chọn: Loại bỏ các khoảng trống (empty items) nếu bạn muốn kết quả liên tục
    return result.filter(item => item !== undefined);
}
export function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Bán kính Trái đất (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; 
    return distance * 1.2;
}
export function tinhPhiShip(soKm) {
    const GIA_MO_CUA = 15000; 
    const GIA_MOI_KM_TIEP_THEO = 5000;
    const KHOANG_CACH_TOI_THIEU = 2;
    let tongPhi = 0;
    if (soKm <= KHOANG_CACH_TOI_THIEU) {
        tongPhi = GIA_MO_CUA;
    } else {
        const kmDuRa = soKm - KHOANG_CACH_TOI_THIEU;
        tongPhi = GIA_MO_CUA + (kmDuRa * GIA_MOI_KM_TIEP_THEO);
    }
    return Math.round(tongPhi / 1000) * 1000; 
}

export async function getCoordinates(address) {
  if (!address) return null;

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "WebsiteBanDienThoai/1.0 (your-email@gmail.com)"
    }
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return null;
  }
  if (!data || data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon)
  };
}
