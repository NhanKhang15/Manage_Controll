import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "../components/ui/AuthLayout";
import { AuthBrand } from "../features/auth/AuthBrand";
import { AuthLanguageRow } from "../features/auth/AuthLanguageRow";
import { LoginForm } from "../features/auth/LoginForm";
import { DemoAccountPicker } from "../features/auth/DemoAccountPicker";
import { useToast } from "../components/ui/Toast";
import { login } from "../api/auth";
import { setTokens } from "../auth/tokenStorage";

/**
 * LoginPage
 * Trang Đăng nhập tài khoản — không dùng Sidebar/Topbar.
 * Thẻ HTML gốc: <body class=login-body>
 */
export function LoginPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("vi");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { access, refresh } = await login(email, password);
      setTokens(access, refresh);
      showToast("Đăng nhập thành công!", "success");
      navigate("/assistant");
    } catch (err: any) {
      showToast(err.message || "Đăng nhập thất bại", "danger");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <AuthLanguageRow currentLang={lang} onChange={setLang} />
      <AuthBrand />
      <p className="login-tag">Trợ lý thông minh cho công việc của bạn</p>
      <LoginForm
        email={email}
        password={password}
        onChangeEmail={setEmail}
        onChangePassword={setPassword}
        onSubmit={handleSubmit}
      />
      <div className="login-alt">
        Chưa có tài khoản?{" "}
        <Link to="/register">Đăng ký bằng email công ty</Link>
      </div>
      <DemoAccountPicker
        onPick={(account) => {
          const userEmail = `${account.name.split(" ").pop()?.toLowerCase()}@tng.vn`;
          setEmail(userEmail);
          setPassword("");
          showToast(`Đã điền email của "${account.name}" — nhập mật khẩu thật để đăng nhập`, "default");
        }}
      />
    </AuthLayout>
  );
}
