import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "../components/ui/AuthLayout";
import { AuthBrand } from "../features/auth/AuthBrand";
import { RegisterForm, type RegisterFormValues } from "../features/auth/RegisterForm";
import { useToast } from "../components/ui/Toast";
import { register } from "../api/auth";
import { setTokens } from "../auth/tokenStorage";
import { useAuth } from "../auth/AuthContext";

const EMPTY_VALUES: RegisterFormValues = { name: "", email: "", password: "" };

/**
 * RegisterPage
 * Trang Đăng ký tài khoản mới — không dùng Sidebar/Topbar.
 * Thẻ HTML gốc: <body class=login-body>
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const { refetch } = useAuth();
  const [values, setValues] = useState<RegisterFormValues>(EMPTY_VALUES);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { access, refresh } = await register(values.name, values.email, values.password);
      setTokens(access, refresh);
      await refetch();
      showToast("Đăng ký thành công! Tài khoản của bạn đã sẵn sàng sử dụng.", "success");
      setValues(EMPTY_VALUES);
      navigate("/assistant");
    } catch (err: any) {
      showToast(err.message || "Đăng ký thất bại", "danger");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <AuthBrand />
      <p className="login-tag">Đăng ký tài khoản nhân viên</p>
      <RegisterForm values={values} onChange={setValues} onSubmit={handleSubmit} />
      <div className="login-alt">
        Đã có tài khoản?{" "}
        <Link to="/login">Đăng nhập</Link>
      </div>
    </AuthLayout>
  );
}
