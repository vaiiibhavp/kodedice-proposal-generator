import { Checkbox } from '@/components/ui/checkbox';
import { ProposalSections } from '@/types/proposal';
import { 
  FileText, 
  ListChecks, 
  Code, 
  Headphones, 
  Users, 
  Server, 
  ScrollText, 
  PenTool, 
  Phone,
  ChevronRight,
  CalendarDays,
  Wrench,
  Receipt,
  FileCode,
  LogOut,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionToggleProps {
  sections: ProposalSections;
  onToggle: (section: keyof ProposalSections) => void;
  activeSection: string | null;
  onSelectSection: (section: string) => void;
}

const sectionConfig: { key: keyof ProposalSections; label: string; icon: React.ElementType }[] = [
  { key: 'companyOverview', label: 'Company Overview', icon: Building2 },
  { key: 'applicationDetails', label: 'Application Details', icon: FileText },
  { key: 'scopeOfWork', label: 'Scope of Work', icon: ListChecks },
  { key: 'techStackEstimation', label: 'Tech Stack & Estimation', icon: Code },
  { key: 'detailedPhaseBreakdown', label: 'Detailed Phase Breakdown', icon: CalendarDays },
  { key: 'postLaunchSupport', label: 'Post Launch Support', icon: Headphones },
  { key: 'ongoingMaintenanceAndSupport', label: 'Ongoing Maintenance & Support', icon: Wrench },
  { key: 'projectTeam', label: 'Project Team', icon: Users },
  { key: 'deploymentStructure', label: 'Deployment Structure', icon: Server },
  { key: 'sourceCodeOwnership', label: 'Source Code Ownership', icon: FileCode },
  { key: 'terminationAndExit', label: 'Termination & Exit', icon: LogOut },
  { key: 'invoiceTerms', label: 'Invoice Terms', icon: Receipt },
  { key: 'termsAndConditions', label: 'Terms & Conditions', icon: ScrollText },
  { key: 'signature', label: 'Signatures', icon: PenTool },
  { key: 'contactUs', label: 'Contact Us', icon: Phone },
];

export function SectionToggle({ sections, onToggle, activeSection, onSelectSection }: SectionToggleProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Proposal Sections
        </h3>
        <span className="text-xs text-muted-foreground">
          {Object.values(sections).filter(Boolean).length} selected
        </span>
      </div>
      <div className="space-y-1">
        {sectionConfig.map(({ key, label, icon: Icon }) => {
          const isActive = activeSection === key;
          const isEnabled = sections[key];
          
          return (
            <div
              key={key}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 border",
                isActive 
                  ? "bg-primary/10 border-primary/30 shadow-sm" 
                  : isEnabled
                    ? "hover:bg-accent border-transparent hover:border-border"
                    : "hover:bg-muted/50 border-transparent opacity-60"
              )}
              onClick={() => isEnabled && onSelectSection(key)}
            >
              {/* Checkbox for selection */}
              <Checkbox
                checked={isEnabled}
                onCheckedChange={() => onToggle(key)}
                onClick={(e) => e.stopPropagation()}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              
              {/* Icon */}
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-md transition-colors",
                isActive 
                  ? "bg-primary/20" 
                  : isEnabled 
                    ? "bg-muted" 
                    : "bg-muted/50"
              )}>
                <Icon className={cn(
                  "h-4 w-4",
                  isActive 
                    ? "text-primary" 
                    : isEnabled 
                      ? "text-foreground" 
                      : "text-muted-foreground"
                )} />
              </div>
              
              {/* Label */}
              <span className={cn(
                "flex-1 text-sm font-medium transition-colors",
                isActive ? "text-primary" : "",
                !isEnabled && "line-through text-muted-foreground"
              )}>
                {label}
              </span>
              
              {/* Arrow indicator */}
              {isEnabled && (
                <ChevronRight className={cn(
                  "h-4 w-4 transition-all duration-200",
                  isActive 
                    ? "text-primary opacity-100" 
                    : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { sectionConfig };
