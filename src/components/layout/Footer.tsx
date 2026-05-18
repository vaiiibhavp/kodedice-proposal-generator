import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { KodediceLogo } from '@/components/PrometteurLogo';

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground border-t border-sidebar-border">
      <div className="container py-8 px-4 md:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Company Info */}
          <div>
            <KodediceLogo size={80} className="mb-4" />
            <p className="text-xs text-sidebar-foreground/70 uppercase tracking-wider mb-2">
              BUILD APP | HIRE TEAM
            </p>
            <p className="text-sm text-sidebar-foreground/70">
              12+ years, 99% client satisfaction, 1000+ projects delivered.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm text-sidebar-foreground/70">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-sidebar-primary" />
                <a href="https://www.kodedice.com" target="_blank" rel="noopener noreferrer" className="hover:text-sidebar-primary transition-colors">
                  www.kodedice.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-sidebar-primary" />
                <span>+91 8087555678</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sidebar-primary" />
                <a href="mailto:sales@kodedice.com" className="hover:text-sidebar-primary transition-colors">
                  sales@kodedice.com
                </a>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="font-semibold mb-4">HQ Address</h3>
            <div className="flex items-start gap-2 text-sm text-sidebar-foreground/70">
              <MapPin className="h-4 w-4 text-sidebar-primary mt-0.5 flex-shrink-0" />
              <span>
                Office no. 2228, 2nd Floor, J.K Infotech,<br />
                Hinjewadi - Phase 1, Near Ruby Hall Clinic,<br />
                Pune - 411057
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-sidebar-border text-center text-sm text-sidebar-foreground/60">
          © {new Date().getFullYear()} Kodedice. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
