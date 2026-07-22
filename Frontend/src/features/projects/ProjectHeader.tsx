import { Button } from "../../components/ui/Button";

export interface ProjectHeaderProps {
  onCreateProject?: () => void;
}

export function ProjectHeader({ onCreateProject }: ProjectHeaderProps) {
  return (
    <div className="page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <h1>Quản lý Dự án</h1>
        <p className="page-sub">Theo dõi tiến độ, nhân sự và danh sách dự án của tổ chức</p>
      </div>
      <Button variant="primary" onClick={onCreateProject}>
        + Tạo dự án mới
      </Button>
    </div>
  );
}
