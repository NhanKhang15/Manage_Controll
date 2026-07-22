import type { ReactNode } from "react";

/**
 * Button
 * Nút bấm dùng chung toàn ứng dụng.
 * CSS gốc tham chiếu: .btn, .btn-primary, .btn-sm, .btn-block, .btn-approve, .btn-reject
 */
export interface ButtonProps {
  variant?: "default" | "primary" | "ghost" | "approve" | "reject";
  size?: "sm" | "md" | "lg";
  block?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

const VARIANT_CLASS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "",
  primary: "btn-primary",
  ghost: "btn-ghost",
  approve: "btn-approve",
  reject: "btn-reject",
};

export function Button({
  variant = "default",
  size = "md",
  block = false,
  type = "button",
  disabled = false,
  children,
  onClick,
}: ButtonProps) {
  const className = [
    "btn",
    VARIANT_CLASS[variant],
    size === "sm" ? "btn-sm" : "",
    block ? "btn-block" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
