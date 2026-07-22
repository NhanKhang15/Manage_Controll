import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/ui/AuthLayout";
import { AuthBrand } from "../features/auth/AuthBrand";
import { RegisterForm, type RegisterFormValues } from "../features/auth/RegisterForm";
import { useToast } from "../components/ui/Toast";

const EMPTY_VALUES: RegisterFormValues = { name: "", email: "", departmentId: "", password: "" };

/**
 * RegisterPage
 * Trang Đăng ký tài khoản mới — không dùng Sidebar/Topbar.
 * Thẻ HTML gốc: <body class=login-body>
 */
export function RegisterPage() {
  const [values, setValues] = useState<RegisterFormValues>(EMPTY_VALUES);
  const { showToast } = useToast();

  function handleSubmit() {
    showToast(`Đã gửi yêu cầu đăng ký cho ${values.email}, chờ quản lý duyệt.`, "success");
    setValues(EMPTY_VALUES);
  }

  return (
    <AuthLayout>
      <AuthBrand />
      <p className="login-tag">Đăng ký tài khoản nhân viên</p>
      <RegisterForm values={values} onChange={setValues} onSubmit={handleSubmit} />
      <div className="login-note-box">
        🔒 Sau khi đăng ký, tài khoản của bạn sẽ ở trạng thái <b>chờ duyệt</b>. Quản lý sẽ nhận thông báo và phê
        duyệt để cấp quyền — sau đó bạn đăng nhập được.
      </div>
      <div className="login-alt">
        Đã có tài khoản?{" "}
        <Link to="/login">Đăng nhập</Link>
      </div>
    </AuthLayout>
  );
}
