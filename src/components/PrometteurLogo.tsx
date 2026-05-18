import kodediceLogo from '@/assets/kodedice-logo.png';

interface KodediceLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function KodediceLogo({ className = '', size = 40, showText = false }: KodediceLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={kodediceLogo}
        alt="Kodedice"
        width={size}
        height={size}
        className="object-contain"
      />
      {showText && (
        <span className="text-xl font-bold tracking-wide text-sidebar-primary">KODEDICE</span>
      )}
    </div>
  );
}

// Backward compatible export
export { KodediceLogo as PrometteurLogo };
