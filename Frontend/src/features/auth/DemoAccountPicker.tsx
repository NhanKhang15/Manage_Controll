import { demoAccounts } from "../../mocks/auth";
import type { DemoAccount } from "../../types/auth";

/**
 * DemoAccountPicker
 * 6 nút tài khoản dùng thử để đăng nhập nhanh.
 * Thẻ HTML gốc: <div class=login-demo>
 * CSS gốc tham chiếu: .login-demo, .login-demo-h, .demo-pill
 */
export interface DemoAccountPickerProps {
  onPick: (account: DemoAccount) => void;
}

export function DemoAccountPicker({ onPick }: DemoAccountPickerProps) {
  return (
    <div className="login-demo">
      <div className="login-demo-h">
        Tài khoản dùng thử — <code>tng@123</code>
      </div>
      {demoAccounts.map((account) => (
        <button key={account.name} type="button" className="demo-pill" onClick={() => onPick(account)}>
          <b>{account.name}</b>
          <small>{account.role}</small>
        </button>
      ))}
    </div>
  );
}
