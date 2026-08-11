import { useEffect, useState } from "react";
import { AppShellPage } from "../layout/AppShellPage";
import { Panel } from "../components/ui/Panel";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../auth/AuthContext";
import { getEmployees, type EmployeeListItem } from "../api/employees";
import { OnboardingChecklist, type OnboardingSteps } from "../features/onboarding/OnboardingChecklist";
import { CompanyCulturePanel } from "../features/onboarding/CompanyCulturePanel";
import { TeamIntroPanel } from "../features/onboarding/TeamIntroPanel";
import { IdentityDocsForm } from "../features/onboarding/IdentityDocsForm";
import { OnboardingTrackingTable } from "../features/onboarding/OnboardingTrackingTable";

export function OnboardingPage() {
  const { employee } = useAuth();
  const companyId = employee?.companies?.[0]?.id ?? null;
  const { showToast } = useToast();

  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<OnboardingSteps>({ hdld: false, nda: false, culture: false, team: false });

  useEffect(() => {
    if (!companyId) return;
    getEmployees(companyId)
      .then(setEmployees)
      .catch(() => showToast("Không tải được danh sách nhân sự", "danger"))
      .finally(() => setLoading(false));
  }, [companyId, showToast]);

  const manager = employees.find((e) => /giám đốc|trưởng|chủ tịch/i.test(e.position_title ?? "")) ?? employees[0] ?? null;
  const colleagues = employees.filter((e) => e.id !== manager?.id && e.id !== employee?.id).slice(0, 4);

  function handleSign(step: "hdld" | "nda") {
    setSteps((prev) => ({ ...prev, [step]: true }));
    showToast(step === "hdld" ? "Đã ký Hợp đồng lao động" : "Đã ký Thỏa thuận bảo mật (NDA)", "success");
  }

  return (
    <AppShellPage initialNavId="dashboard">
      <div className="page-head">
        <h1>🚀 Nhập việc (Onboarding)</h1>
        <p className="page-sub">
          Hoàn tất các bước để bắt đầu: ký HĐLĐ + NDA, tìm hiểu văn hóa công ty, làm quen team và khai hồ sơ BHXH/thuế/định danh.
        </p>
      </div>

      {!companyId ? (
        <Panel>Bạn chưa thuộc công ty nào.</Panel>
      ) : (
        <>
          <OnboardingChecklist steps={steps} onSign={handleSign} />
          <CompanyCulturePanel read={steps.culture} onRead={() => setSteps((p) => ({ ...p, culture: true }))} />
          <TeamIntroPanel
            manager={manager}
            colleagues={colleagues}
            greeted={steps.team}
            onGreet={() => {
              setSteps((p) => ({ ...p, team: true }));
              showToast("Đã chào hỏi team", "success");
            }}
          />
          <IdentityDocsForm />
          {loading ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
              Đang tải dữ liệu từ máy chủ...
            </div>
          ) : (
            <OnboardingTrackingTable employees={employees} />
          )}
        </>
      )}
    </AppShellPage>
  );
}
