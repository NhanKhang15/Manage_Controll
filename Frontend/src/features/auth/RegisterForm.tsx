import type { FormEvent } from "react";
import { Button } from "../../components/ui/Button";
import { departments } from "../../mocks/auth";

/**
 * RegisterForm
 * Form đăng ký: Họ tên, Email công ty, Phòng ban, Mật khẩu.
 * Thẻ HTML gốc: <form method=post class=login-form>
 * CSS gốc tham chiếu: .login-form
 */
export interface RegisterFormValues {
  name: string;
  email: string;
  departmentId: number | "";
  password: string;
}

export interface RegisterFormProps {
  values: RegisterFormValues;
  onChange: (values: RegisterFormValues) => void;
  onSubmit: () => void;
}

export function RegisterForm({ values, onChange, onSubmit }: RegisterFormProps) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label>
        Họ và tên
        <input
          type="text"
          name="name"
          required
          autoFocus
          placeholder="Nguyễn Văn A"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
        />
      </label>
      <label>
        Email công ty (@tng.vn)
        <input
          type="email"
          name="email"
          required
          placeholder="ten@tng.vn"
          value={values.email}
          onChange={(e) => onChange({ ...values, email: e.target.value })}
        />
      </label>
      <label>
        Phòng ban
        <select
          name="department_id"
          required
          value={values.departmentId}
          onChange={(e) => onChange({ ...values, departmentId: Number(e.target.value) })}
        >
          <option value="">— Chọn phòng ban —</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Mật khẩu (≥ 6 ký tự)
        <input
          type="password"
          name="password"
          required
          minLength={6}
          placeholder="••••••••"
          value={values.password}
          onChange={(e) => onChange({ ...values, password: e.target.value })}
        />
      </label>
      <Button variant="primary" block type="submit">
        Đăng ký
      </Button>
    </form>
  );
}
