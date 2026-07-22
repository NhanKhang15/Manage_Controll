import type { ReactNode } from "react";

/**
 * AuthLayout
 * Khung layout dành riêng cho các trang đăng nhập / đăng ký (không dùng Sidebar).
 * HTML gốc dùng <body class=login-body><div class=login-card>...</div></body>
 * — không phải `.shell`/`.auth-shell` như bản đặc tả ban đầu suy đoán.
 * Thẻ HTML gốc: <body class=login-body> > <div class=login-card>
 * CSS gốc tham chiếu: .login-body, .login-card
 */
export interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="login-body">
      <div className="login-card">{children}</div>
    </div>
  );
}
