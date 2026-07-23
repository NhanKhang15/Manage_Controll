import { Button } from "../../../components/ui/Button";

/**
 * DriveConnectBanner
 * Banner nhắc kết nối Google Drive để đồng bộ folder/file dự án.
 * CSS gốc tham chiếu: .drive-bar, .drive-ico
 */
export interface DriveConnectBannerProps {
  onConnect?: () => void;
}

export function DriveConnectBanner({ onConnect }: DriveConnectBannerProps) {
  return (
    <div className="drive-bar">
      <span className="drive-ico">☁️</span>
      <span>
        Chưa kết nối <b>Google Drive</b>. Kết nối để đồng bộ folder/file dự án với Drive công ty.
      </span>
      <Button variant="primary" size="sm" onClick={onConnect}>
        Kết nối Google Drive
      </Button>
    </div>
  );
}
