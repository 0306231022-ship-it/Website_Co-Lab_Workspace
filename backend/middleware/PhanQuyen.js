export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.LOAIND)) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }
    next();
  };
}
