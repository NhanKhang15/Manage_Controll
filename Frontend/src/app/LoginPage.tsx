import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "../components/ui/AuthLayout";
import { AuthBrand } from "../features/auth/AuthBrand";
import { AuthLanguageRow } from "../features/auth/AuthLanguageRow";
import { LoginForm } from "../features/auth/LoginForm";
import { DemoAccountPicker } from "../features/auth/DemoAccountPicker";
import { useToast } from "../components/ui/Toast";

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
  const { showToast } = useToast();

  function handleSubmit() {
    showToast(`Đăng nhập thành công với ${email || "user@tng.vn"}!`, "success");
    setTimeout(() => {
      navigate("/assistant");
    }, 400);
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
          setPassword("tng@123");
          showToast(`Đã chọn tài khoản: ${account.name}`, "default");
          setTimeout(() => {
            navigate("/assistant");
          }, 600);
        }}
      />
    </AuthLayout>
  );
}
