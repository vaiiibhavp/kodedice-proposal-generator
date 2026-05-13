import { useTranslation } from 'react-i18next';
import { Globe, Phone, Mail, MapPin } from 'lucide-react';
import prometteurBuilding from '@/assets/prometteur-building.webp';

export function ContactSection() {
  const { t } = useTranslation();
  
  return (
    <div className="bg-background overflow-hidden relative">
      {/* Contact Us Title */}
      <div className="px-6 pt-8 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t('contact.contactUs')}</h2>
      </div>

      {/* Building Image & Contact Info - Aligned Container */}
      <div className="px-6 pb-10">
        <div className="max-w-lg mx-auto">
          {/* Building Image with Rounded Border */}
          <div className="rounded-xl overflow-hidden border-4 border-muted shadow-md mb-8">
            <img 
              src={prometteurBuilding} 
              alt="Prometteur Solutions Office Building" 
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Contact Details - Aligned with Image */}
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Globe className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">{t('contact.website')}</p>
                <a 
                  href="https://www.prometteursolutions.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  www.prometteursolutions.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">{t('contact.phone')}</p>
                <p className="text-sm text-muted-foreground">+91 8087555678</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">{t('contact.email')}</p>
                <a 
                  href="mailto:sales@prometteursolutions.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
                >
                  sales@prometteursolutions.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">{t('contact.hqAddress')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('contact.addressLine1')}<br />
                  {t('contact.addressLine2')}<br />
                  {t('contact.addressLine3')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute right-0 bottom-0 w-32 h-32 rounded-full bg-primary/10 translate-x-1/3 translate-y-1/3" />
    </div>
  );
}
