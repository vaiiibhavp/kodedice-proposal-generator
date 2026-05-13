import prometteurLogo from '@/assets/prometteur-logo.png';

interface PrometteurLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function PrometteurLogo({ className = '', size = 40, showText = true }: PrometteurLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={prometteurLogo} 
        alt="Prometteur Solutions" 
        width={size} 
        height={size}
        className="object-contain"
      />
      {showText && (
        <span className="text-xl font-bold tracking-wide text-sidebar-primary">PROMETTEUR</span>
      )}
    </div>
  );
}
