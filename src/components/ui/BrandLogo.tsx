import Image from "next/image";

interface BrandLogoProps {
  /** Wordmark width in px — height scales automatically */
  width?: number;
  className?: string;
  priority?: boolean;
}

/**
 * fluxton brand from Fluxton Image 2.webp.
 * Uses mix-blend-mode so the asset's black matte background disappears on the dark canvas.
 */
export function BrandLogo({
  width = 112,
  className = "",
  priority = false,
}: BrandLogoProps) {
  const height = Math.round(width * 0.28);

  return (
    <span className={`brand-logo-wrap inline-flex shrink-0 items-center ${className}`}>
      <Image
        src="/fluxton-logo.webp"
        alt="fluxton"
        width={1200}
        height={1200}
        priority={priority}
        className="brand-logo-img h-auto max-h-[32px] w-auto object-contain object-left"
        style={{ width, height: "auto", maxHeight: height }}
      />
    </span>
  );
}
