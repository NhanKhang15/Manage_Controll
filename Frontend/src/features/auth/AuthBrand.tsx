import { VelaLogo } from "../../layout/Sidebar/VelaLogo";

/**
 * AuthBrand
 * Logo VelaAI cỡ lớn, căn giữa, dùng chung cho trang Đăng nhập/Đăng ký.
 * Thẻ HTML gốc: <div class="brand center">
 * CSS gốc tham chiếu: .login-card .brand
 */
export function AuthBrand() {
  return (
    <div className="brand center">
      <VelaLogo iconHeight={44} fontSize={38} />
    </div>
  );
}
