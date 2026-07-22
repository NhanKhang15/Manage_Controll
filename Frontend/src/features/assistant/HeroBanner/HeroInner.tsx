import { HeroAvatar, type HeroAvatarProps } from "./HeroAvatar";
import { HeroBody, type HeroBodyProps } from "./HeroBody";

/**
 * HeroInner
 * Thẻ HTML gốc: <div class=hero-inner>
 * CSS gốc tham chiếu: .hero-inner
 */
export interface HeroInnerProps {
  avatar: HeroAvatarProps;
  body: HeroBodyProps;
}

export function HeroInner({ avatar, body }: HeroInnerProps) {
  return (
    <div className="hero-inner">
      <HeroAvatar {...avatar} />
      <HeroBody {...body} />
    </div>
  );
}
