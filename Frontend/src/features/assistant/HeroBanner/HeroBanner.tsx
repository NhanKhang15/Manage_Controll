import { useRef, useState } from "react";
import { HeroBgPickerButton } from "./HeroBgPickerButton";
import { HeroBgPicker, BG_PRESETS } from "./HeroBgPicker";
import { HeroInner } from "./HeroInner";
import { useToast } from "../../../components/ui/Toast";
import { formatVietnameseDate, getGreeting } from "../../../utils/date";
import type { UserProfile } from "../../../types/assistant";

/**
 * HeroBanner
 * Banner chào mừng đầu trang, có nút đổi nền.
 * Thẻ HTML gốc: <div class=hero id=hero>
 * CSS gốc tham chiếu: .hero
 */
export interface HeroBannerProps {
  user: UserProfile;
  greeting?: string;
  pendingTasksCount: number;
  quote: string;
  onChangeAvatar?: (file: File) => void;
}

export function HeroBanner({ user, greeting, pendingTasksCount, quote, onChangeAvatar }: HeroBannerProps) {
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const [background, setBackground] = useState(BG_PRESETS[0].background);
  const bgBtnRef = useRef<HTMLButtonElement>(null);
  const { showToast } = useToast();

  const now = new Date();

  return (
    <div className="hero" id="hero" style={{ background }}>
      <HeroBgPickerButton ref={bgBtnRef} onClick={() => setBgPickerOpen((v) => !v)} />
      <HeroBgPicker
        isOpen={bgPickerOpen}
        onClose={() => setBgPickerOpen(false)}
        anchorRef={bgBtnRef}
        onSelectPreset={(preset) => {
          setBackground(preset.background);
          showToast(`Đã đổi nền: ${preset.label}`, "success");
        }}
        onUploadClick={() => showToast("Tính năng tải ảnh nền đang được phát triển", "default")}
      />
      <HeroInner
        avatar={{
          avatarUrl: user.avatarUrl,
          onChangeAvatar: (file) => {
            onChangeAvatar?.(file);
            showToast("Đã cập nhật ảnh đại diện", "success");
          },
        }}
        body={{
          dateLabel: formatVietnameseDate(now),
          roleLabel: user.role,
          userName: user.name,
          greeting: greeting ?? getGreeting(now),
          pendingTasksCount,
          quote,
          rating: user.rating,
          level: user.level,
          managedStaff: user.managedStaff,
          achievementPoints: user.achievementPoints,
        }}
      />
    </div>
  );
}
