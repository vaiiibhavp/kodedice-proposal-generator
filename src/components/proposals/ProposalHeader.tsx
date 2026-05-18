import { useTranslation } from 'react-i18next';
import { KodediceLogo } from '@/components/PrometteurLogo';
import kodediceBuilding from '@/assets/kodedice-building.webp';

interface ProposalHeaderProps {
  title: string;
  clientName?: string;
  presentedBy?: string;
  isLocked?: boolean;

}

export function ProposalHeader({ title, clientName, presentedBy }: ProposalHeaderProps) {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-0">
      {/* Hero Banner with Building Background */}
      <div className="relative h-64 md:h-80 overflow-hidden rounded-t-lg">
        <img
          src={kodediceBuilding}
          alt="Kodedice Office"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6">
          <KodediceLogo size={160} showText={false} className="mb-4" />
          <p className="text-xs text-primary uppercase tracking-[0.3em] font-medium mb-2">
            {t('header.buildAppHireTeam')}
          </p>
          <p className="text-white/80 text-sm">
            {t('header.tagline')}
          </p>
        </div>
      </div>

      {/* Project Proposal Title Section */}
      <div className="bg-background p-8 md:p-12 border-b relative">
        {/* Decorative accent */}
        <div className="absolute right-0 bottom-0 w-32 h-32 md:w-48 md:h-48 rounded-full bg-primary/5 -mr-16 -mb-16" />
        
        <div className="relative z-10">
          <div className="flex items-start gap-2 mb-6">
            <div className="w-1.5 h-16 bg-primary rounded-full" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight whitespace-pre-line">
                {t('header.projectProposal').replace(' ', '\n')}
              </h1>
            </div>
          </div>
          
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-6">{title}</h2>
          
          <div className="flex flex-wrap gap-8 md:gap-16">
            {clientName && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('header.presentedTo')}</p>
                <p className="text-lg font-semibold text-foreground">{clientName}</p>
              </div>
            )}
            {presentedBy && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('header.presentedBy')}</p>
                <p className="text-lg font-semibold text-foreground">{presentedBy}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
