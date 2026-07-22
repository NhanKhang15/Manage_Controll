import type { RefObject } from "react";
import { Dropdown } from "../../../components/ui/Dropdown";
import { Icon, type IconName } from "../../../components/ui/Icon";

export interface FeatureOption {
  id: string;
  label: string;
  icon: IconName;
}

export const FEATURE_OPTIONS: FeatureOption[] = [
  { id: "task", label: "Giao việc", icon: "tasks" },
  { id: "calendar", label: "Tạo lịch hẹn", icon: "calendar" },
  { id: "event", label: "Tạo sự kiện", icon: "events" },
  { id: "template", label: "Dùng mẫu việc", icon: "templates" },
];

/**
 * FeatureMenu
 * Menu các tính năng nhanh (giao việc, tạo lịch, tạo mẫu...). Rỗng trong HTML
 * gốc (JS runtime cũ tự inject).
 * Thẻ HTML gốc: <div id=featMenu class="feat-menu sf-hidden">
 * CSS gốc tham chiếu: .feat-menu, .feat-opt:hover
 */
export interface FeatureMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  onSelect: (option: FeatureOption) => void;
}

export function FeatureMenu({ isOpen, onClose, anchorRef, onSelect }: FeatureMenuProps) {
  return (
    <Dropdown isOpen={isOpen} onClose={onClose} anchorRef={anchorRef} className="feat-menu">
      {FEATURE_OPTIONS.map((opt) => (
        <div
          key={opt.id}
          className="feat-opt"
          onClick={() => {
            onSelect(opt);
            onClose();
          }}
        >
          <Icon name={opt.icon} size={18} />
          <span>{opt.label}</span>
        </div>
      ))}
    </Dropdown>
  );
}
