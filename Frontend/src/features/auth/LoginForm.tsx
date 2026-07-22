import type { FormEvent } from "react";
import { Button } from "../../components/ui/Button";

/**
 * LoginForm
 * Form đăng nhập: Email công ty + Mật khẩu.
 * Thẻ HTML gốc: <form method=post class=login-form>
 * CSS gốc tham chiếu: .login-form
 */
export interface LoginFormProps {
  email: string;
  password: string;
  onChangeEmail: (v: string) => void;
  onChangePassword: (v: string) => void;
  onSubmit: () => void;
}

export function LoginForm({ email, password, onChangeEmail, onChangePassword, onSubmit }: LoginFormProps) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label>
        Email công ty
        <input
          type="email"
          name="email"
          required
          autoFocus
          placeholder="name@tng.vn"
          value={email}
          onChange={(e) => onChangeEmail(e.target.value)}
        />
      </label>
      <label>
        Mật khẩu
        <input
          type="password"
          name="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => onChangePassword(e.target.value)}
        />
      </label>
      <Button variant="primary" block type="submit">
        Đăng nhập
      </Button>
    </form>
  );
}
