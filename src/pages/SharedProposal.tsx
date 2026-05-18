import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProposals } from '@/hooks/useProposals';
import { useClients } from '@/hooks/useClients';
import { useProposalAnalytics } from '@/hooks/useProposalAnalytics';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useContentTranslation } from '@/hooks/useContentTranslation';
import { FileX, Linkedin, FileText, ListChecks, Code, Headphones, Users, Server, ScrollText, PenTool, Phone, ChevronRight, Menu, X, CalendarDays, Wrench, Receipt, FileCode, LogOut, Building2, Loader2, CloudCog, Download, ArrowLeft } from 'lucide-react';
import { KodediceLogo } from '@/components/PrometteurLogo';
import { TechStackCategory, ProposalSections } from '@/types/proposal';
import { SignaturePad } from '@/components/editor/SignaturePad';
import { cn } from '@/lib/utils';
import { ProposalHeader } from '@/components/proposals/ProposalHeader';
import { ContactSection } from '@/components/proposals/ContactSection';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getProposalAnalyticsAPI, getShareByTokenAPI, viewPdfAPI } from '@/services/auth_service';
import { useToast } from '@/hooks/use-toast';

export default function SharedProposal() {
  const { projectCategory, token } = useParams();
  const { getProposalByShareId, markShareViewed, updateProposal, updateProposalByClient, getShareLanguage, fetchShareAndProposal, fetchProposalById, fetchProposalFromShareEndpoint, shares, proposals, setProposals } = useProposals();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const queryProposalId = query.get('id');
  const urlLanguage = query.get('lang') as 'en' | 'fr' | null;
  const { getClient } = useClients();
  const { t, i18n } = useTranslation();
  const { translateProposal, translatedContent, isTranslating, clearTranslations } = useContentTranslation();
  const { toast } = useToast();
  const [proposalAnalytics, setProposalAnalytics] = useState<any>(null);
  
  // PDF-related state for external proposals
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const fetchProposalAnalytics = useCallback(async () => {
    if (projectCategory && token) {
      const response = await getShareByTokenAPI(projectCategory, token);
      setProposalAnalytics(response?.data);
    }
  }, [projectCategory, token]);

  const fetchPdfData = useCallback(async (proposalId: string) => {
    try {
      setPdfLoading(true);
      console.log('Fetching PDF for external proposal ID:', proposalId);
      const response = await viewPdfAPI(proposalId);
      console.log('PDF API response:', response);
      
      if (response?.status === 200) {
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        console.log('PDF Blob URL created:', url);
      } else {
        throw new Error('Failed to fetch PDF data');
      }
    } catch (error) {
      console.error('Error fetching PDF:', error);
      toast({
        title: "Error",
        description: "Failed to load the external PDF",
        variant: "destructive",
      });
    } finally {
      setPdfLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProposalAnalytics();
  }, [fetchProposalAnalytics]);

  // Create PDF URL from blob when proposal is external and has pdfBlob
  useEffect(() => {
    if (proposalAnalytics && proposalAnalytics.type === 'external' && proposalAnalytics.pdfBlob && !pdfUrl) {
      const url = URL.createObjectURL(proposalAnalytics.pdfBlob);
      setPdfUrl(url);
    }
  }, [proposalAnalytics, pdfUrl]);

  // Fetch PDF data when proposal is external and we have the proposal data (fallback for old API)
  useEffect(() => {
    if (proposalAnalytics && proposalAnalytics.type === 'external' && proposalAnalytics.id && !pdfUrl && !proposalAnalytics.pdfBlob) {
      fetchPdfData(proposalAnalytics.id);
    }
  }, [proposalAnalytics, fetchPdfData, pdfUrl]);

  const proposal = token ? proposalAnalytics : null;


  // const proposal = token ? getProposalByShareId(token) : null;
  const client = proposal?.clientId ? getClient(proposal.clientId) : null;
  // Get language preference from share link and set it
  const shareLanguage = token ? getShareLanguage(token) : 'en';
  const initialLanguage = urlLanguage || shareLanguage || 'en';
  useEffect(() => {
    if (initialLanguage && i18n.language !== initialLanguage) {
      i18n.changeLanguage(initialLanguage);
    }
  }, [initialLanguage]); // Only run when initialLanguage changes (on mount)

  const isFrench = i18n.language === 'fr';

  // Update URL parameter when language changes
  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const currentLang = currentUrl.searchParams.get('lang');

    if (i18n.language === 'en') {
      // Remove lang parameter for English (default)
      if (currentLang) {
        currentUrl.searchParams.delete('lang');
        window.history.replaceState({}, '', currentUrl.toString());
      }
    } else if (i18n.language === 'fr') {
      // Add/update lang parameter for French
      if (currentLang !== 'fr') {
        currentUrl.searchParams.set('lang', 'fr');
        window.history.replaceState({}, '', currentUrl.toString());
      }
    }
  }, [i18n.language]);


  const techStack = useMemo(() => {
    // console.log("I got called",proposal?.techStackAndEstimation);
    const defaultTechStack = {
      frontend: '',
      backend: '',
      database: '',
      ui_ux: '',
      estimation: []
    };
    // console.log("techStackAndEstimation",proposal?.techStackAndEstimation);
    if (!proposal?.techStackAndEstimation) {
      return defaultTechStack;
    }
    // console.log(proposal)
    return {
      ...defaultTechStack,
      ...proposal.techStackAndEstimation,
      // Ensure estimation is always an array
      estimation: Array.isArray(proposal.techStackAndEstimation.estimation)
        ? proposal.techStackAndEstimation.estimation
        : []
    };
  }, [proposal?.techStackAndEstimation]);

  // Calculate total cost from estimation items (fallback if totalCost is 0 or missing)
  const calculatedTotalCost = useMemo(() => {
    return proposal?.techStackAndEstimation?.estimation?.reduce((sum, item) => {
      return sum + (Number(item.cost) || Number(item.costInr) || 0);
    }, 0) || 0;
  }, [proposal?.techStackAndEstimation?.estimation]);

  const totalCost = proposal?.techStackAndEstimation?.totalCost || calculatedTotalCost;

  // Check if any GST values exist in estimation data
  const hasGSTValues = useMemo(() => {
    if (!proposal?.techStackAndEstimation?.estimation) return false;
    return proposal.techStackAndEstimation.estimation.some(item => 
      item.gst && item.gst !== '' && item.gst !== '0' && item.gst !== 0 && Number(item.gst) > 0
    );
  }, [proposal?.techStackAndEstimation?.estimation]);

  // Calculate Total Cost + GST
  const totalCostWithGST = useMemo(() => {
    if (!hasGSTValues || !totalCost) return 0;
    
    // Calculate total GST amount
    const totalGSTAmount = proposal?.techStackAndEstimation?.estimation?.reduce((sum, item) => {
      const itemCost = Number(item.cost) || Number(item.costInr) || 0;
      const gstRate = Number(item.gst) || 0;
      return sum + (itemCost * (gstRate / 100));
    }, 0) || 0;
    
    return totalCost + totalGSTAmount;
  }, [hasGSTValues, totalCost, proposal?.techStackAndEstimation?.estimation]);



  // Translate proposal content when language is French
  useEffect(() => {
    if (isFrench && proposal) {
      const fieldsToTranslate = [
        'companyOverview',
        'applicationDetails',
        'scopeOfWork',
        'detailedPhaseBreakdown',
        'postLaunchSupport',
        'ongoingMaintenanceAndSupport',
        'deploymentStructure',
        'sourceCodeOwnership',
        'terminationAndExit',
        'invoiceTerms',
        'termsAndConditions',
      ];

      const techStackFields = ['frontend', 'backend', 'database', 'uiux'];

      const allContent: Record<string, any> = { ...proposal };
      techStackFields.forEach(field => {
        allContent[`techStack_${field}`] = proposal?.techStackAndEstimation?.[field as keyof TechStackCategory] || '';
      });

      translateProposal(allContent, [...fieldsToTranslate, ...techStackFields.map(f => `techStack_${f}`)], 'fr');
    } else {
      clearTranslations();
    }
  }, [isFrench, proposal?.id, techStack, translateProposal, clearTranslations]);

  // Get translated or original content
  const getContent = useCallback((field: string, original: string) => {
    if (isFrench && translatedContent[field]) {
      return translatedContent[field];
    }
    return original;
  }, [isFrench, translatedContent]);

  const getTechStackContent = useCallback((field: string, original: string) => {
    if (isFrench && translatedContent[`techStack_${field}`]) {
      return translatedContent[`techStack_${field}`];
    }
    return original;
  }, [isFrench, translatedContent]);

  // Analytics tracking
  const { trackSectionView, trackScrollDepth } = useProposalAnalytics(
    proposal?.id || '',
    token || ''
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarNavRef = useRef<HTMLDivElement>(null);

  // Email notifications
  const { sendViewNotification } = useEmailNotifications();
  const notificationSentRef = useRef(false);

  // UI state (must be declared unconditionally to keep hooks stable)
  const [activeSection, setActiveSection] = useState<string>('companyOverview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFetchingShare, setIsFetchingShare] = useState(false);
  const [isClientSigned, setIsClientSigned] = useState(false);

  useEffect(() => {
    if (token && proposal && !notificationSentRef.current) {
      markShareViewed(token);

      // Send mock email notification
      sendViewNotification(
        proposal.id,
        proposal.title,
        client?.companyName || 'Unknown Client',
        client?.email || 'unknown@email.com'
      );
      notificationSentRef.current = true;
    }
  }, [token, proposal, markShareViewed, sendViewNotification, client]);

  // Check if client has already signed
  useEffect(() => {
    // Only consider client signed if there's actual client signature data
    // Don't confuse with company (Prometteur) signature
    const hasClientSignature = proposal?.signatures?.client?.data || proposal?.clientSignature?.data;
    const isClientSignature = hasClientSignature && (
      // Check if this is actually a client signature (not company signature)
      proposal?.signatures?.client?.data ||
      (proposal?.clientSignature?.data && !proposal?.signature?.company?.data)
    );

    if (isClientSignature) {
      setIsClientSigned(true);
    } else {
      setIsClientSigned(false);
    }
  }, [proposal?.signatures?.client, proposal?.clientSignature, proposal?.signature?.company]);

  // If proposal is not available locally, attempt to fetch share+proposal from server
  useEffect(() => {
    // prefer route param token; otherwise if query param `id` exists, treat it as a proposal id
    if (proposal) return;

    let mounted = true;
    (async () => {
      try {
        setIsFetchingShare(true);
        if (projectCategory && token) {
          await fetchShareAndProposal(projectCategory, token);
        } else if (queryProposalId) {
          // Try fetching the proposal directly first (stateless link), then fall back
          // to the public /share endpoint if necessary.
          const direct = await fetchProposalById(queryProposalId);
          if (!direct) {
            const fetched = await fetchProposalFromShareEndpoint(queryProposalId);
            if (!fetched) {
              // nothing we can do — UI will show 'Proposal Not Found'
            }
          }
        }
        if (!mounted) return;
        // fetched proposal will update state and cause re-render
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setIsFetchingShare(false);
      }
    })();

    return () => { mounted = false; };
  }, [projectCategory, token, proposal, fetchShareAndProposal, queryProposalId, fetchProposalById]);

  // Track scroll depth and active section
  useEffect(() => {
    if (!proposal) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (window.scrollY / scrollHeight) * 100;
      trackScrollDepth(scrollPercent);


      // Determine which section is currently in view
      const sections = document.querySelectorAll('section[id^="section-"]');
      let currentSection = '';

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const sectionHeight = rect.height;
        const viewportHeight = window.innerHeight;
        const scrollPosition = window.scrollY + (viewportHeight * 0.3); // 30% from top for better UX

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSection = section.id.replace('section-', '');
        }
      });
      // TODO: Uncomment this code when you want to track section view
      // if (currentSection && currentSection !== activeSection) {
      //   setActiveSection(currentSection);
      // }

      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);

        // Track section view when scrolling to a new section
        const sectionData = sectionConfig.find(s => s.key === currentSection);
        if (sectionData) {
          trackSectionView(currentSection, sectionData.label);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check on mount
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [proposal, trackScrollDepth, activeSection]);

  // Auto-scroll active section into view in sidebar
  useEffect(() => {
    if (!activeSection || !sidebarNavRef.current) return;

    const activeButton = sidebarNavRef.current.querySelector(`button[data-section="${activeSection}"]`);
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [activeSection]);

  if (!proposal) {
    if (isFetchingShare) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="flex flex-col items-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h1 className="text-lg font-medium">{t('common.loading', 'Loading...')}</h1>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center py-12">
            <FileX className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-xl font-semibold mb-2">{t('errors.proposalNotFound')}</h1>
            <p className="text-muted-foreground text-center mb-4">
              {t('errors.proposalLinkExpired')}
            </p>
            <Button asChild>
              <Link to="/">{t('errors.goToDashboard')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const defaultSections: ProposalSections = {
    companyOverview: true,
    applicationDetails: true,
    scopeOfWork: true,
    techStackEstimation: true,
    detailedPhaseBreakdown: true,
    postLaunchSupport: true,
    ongoingMaintenanceAndSupport: true,
    projectTeam: true,
    deploymentStructure: true,
    sourceCodeOwnership: true,
    terminationAndExit: true,
    invoiceTerms: true,
    termsAndConditions: true,
    signature: true,
    contactUs: true,
  };

  const sections = proposal?.sections || defaultSections;
  // console.log(sections)

  const handleClientSignature = async (sig: any) => {

    // Prevent API call if already signed
    if (isClientSigned) {
      // console.log('=== ALREADY SIGNED - BLOCKING API CALL ===');
      return;
    }

    // Transform signature data to API format - API expects nested signature.client structure
    const signaturePayload = {
      signature: {
        client: {
          mode: sig.type === 'draw' ? 'image' : 'typed',
          value: sig.data,
          signedAt: sig.signedAt || new Date().toISOString(),
        }
      }
    };


    try {
      // Use the updateProposalByClient API with token
      const result = await updateProposalByClient(token || '', signaturePayload);

      // Update local state immediately for instant UI feedback
      const updatedProposal = {
        ...proposal,
        signatures: {
          ...proposal.signatures,
          client: {
            mode: sig.type === 'draw' ? 'image' : 'typed' as const,
            value: sig.data,
            signedAt: sig.signedAt || new Date().toISOString(),
            type: sig.type === 'draw' ? 'draw' as const : 'type' as const,
            data: sig.data,
          }
        }
      };
      // console.log("after update propsal:",updatedProposal);

      setProposals(prev => prev.map(p => p.id === proposal.id ? updatedProposal : p));

      // Disable signature pad after successful signing
      setIsClientSigned(true);

      // console.log('Client signature saved successfully via updateProposalByClient API');
    } catch (error) {
      console.error('Failed to save client signature via updateProposalByClient API:', error);
      // Fallback to original updateProposal API if new one fails
      const fallbackPayload = {
        signature: {
          client: {
            mode: sig.type === 'draw' ? 'image' : 'typed',
            value: sig.data,
            signedAt: sig.signedAt || new Date().toISOString(),
          }
        },
        clientSignature: {
          mode: sig.type === 'draw' ? 'image' : 'typed',
          value: sig.data,
          signedAt: sig.signedAt || new Date().toISOString(),
        }
      };

      try {
        await updateProposal(proposal.id, fallbackPayload);

        const updatedProposal = {
          ...proposal,
          signatures: {
            ...proposal.signatures,
            client: {
              mode: sig.type === 'draw' ? 'image' : 'typed' as const,
              value: sig.data,
              signedAt: sig.signedAt || new Date().toISOString(),
              type: sig.type === 'draw' ? 'draw' as const : 'type' as const,
              data: sig.data,
            }
          }
        };

        setProposals(prev => prev.map(p => p.id === proposal.id ? updatedProposal : p));
        setIsClientSigned(true);
      } catch (fallbackError) {
        console.error('Failed to save client signature via fallback API:', fallbackError);
      }
    };
  };


  const sectionConfig = [
    { key: 'companyOverview', label: t('proposal.companyOverview'), icon: Building2 },
    { key: 'applicationDetails', label: t('proposal.applicationDetails'), icon: FileText },
    { key: 'scopeOfWork', label: t('proposal.scopeOfWork'), icon: ListChecks },
    { key: 'techStackEstimation', label: t('proposal.techStackEstimation'), icon: Code },
    { key: 'detailedPhaseBreakdown', label: t('proposal.phaseBreakdown'), icon: CalendarDays },
    { key: 'postLaunchSupport', label: t('proposal.postLaunchSupport'), icon: Headphones },
    { key: 'ongoingMaintenanceAndSupport', label: t('proposal.ongoingMaintenance'), icon: Wrench },
    { key: 'projectTeam', label: t('proposal.projectTeam'), icon: Users },
    { key: 'deploymentStructure', label: t('proposal.deploymentStructure'), icon: Server },
    { key: 'sourceCodeOwnership', label: t('proposal.sourceCodeOwnership'), icon: FileCode },
    { key: 'terminationAndExit', label: t('proposal.terminationExit'), icon: LogOut },
    { key: 'invoiceTerms', label: t('proposal.invoiceTerms'), icon: Receipt },
    { key: 'termsAndConditions', label: t('proposal.termsConditions'), icon: ScrollText },
    { key: 'signature', label: t('proposal.signatures'), icon: PenTool },
    { key: 'contactUs', label: t('proposal.contactUs'), icon: Phone },
  ];

  const scrollToSection = (sectionKey: string) => {
    const sectionData = sectionConfig.find(s => s.key === sectionKey);
    if (sectionData) {
      trackSectionView(sectionKey, sectionData.label);
    }
    setActiveSection(sectionKey);
    const element = document.getElementById(`section-${sectionKey}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setSidebarOpen(false);
  };

  // Calculate enabled sections in a stable way to prevent hook count variations
  const enabledSections = proposal ? sectionConfig.filter(s => sections[s.key as keyof ProposalSections]) : [];
  // console.log(enabledSections);

  const getStaticInvoiceTerms = () => {
    return t('staticContent.invoiceTerms');
  };

  const getStaticTermsAndConditions = () => {
    return t('staticContent.termsAndConditions');
  };

  const handleDownloadPdf = async () => {
    if (!pdfUrl) return;
    
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${proposal?.title || 'External Proposal'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download complete ✅",
        description: "The PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: "Failed to download the PDF",
        variant: "destructive",
      });
    }
  };



  return (
    <>
      {!proposal ? (
        isFetchingShare ? (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardContent className="flex flex-col items-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h1 className="text-lg font-medium">{t('common.loading', 'Loading...')}</h1>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardContent className="flex flex-col items-center py-12">
                <FileX className="h-16 w-16 text-muted-foreground mb-4" />
                <h1 className="text-xl font-semibold mb-2">{t('errors.proposalNotFound')}</h1>
                <p className="text-muted-foreground text-center mb-4">
                  {t('errors.proposalLinkExpired')}
                </p>
                <Button asChild>
                  <Link to="/">{t('errors.goToDashboard')}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )
      ) : proposal.type === 'external' ? (
        // External proposal - show PDF
        <div className="min-h-screen bg-background overflow-x-hidden">
          {pdfLoading && (
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading PDF...</span>
              </div>
            </div>
          )}
          
          {!pdfLoading && !pdfUrl && (
            <div className="flex items-center justify-center min-h-screen p-4">
              <Card className="w-full max-w-4xl mx-auto">
                <CardContent className="p-8 text-center">
                  <FileX className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
                  <h2 className="text-2xl font-bold mb-4">PDF Not Available</h2>
                  <p className="text-muted-foreground">The external PDF for this proposal could not be loaded.</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {!pdfLoading && pdfUrl && (
            <div className="space-y-6">
              <div className="flex items-center justify-between print:hidden p-4 bg-background border-b flex-wrap gap-2">
                  <div className="flex items-center gap-4 min-w-0">
                    <KodediceLogo size={80} showText={false} />
                    {proposal.type !== 'external' && (
                      <div className="min-w-0">
                        <h1 className="text-xl font-semibold truncate">{proposal.title}</h1>
                        {client && (
                          <p className="text-sm text-muted-foreground truncate">{client.companyName}</p>
                        )}
                      </div>
                    )}
                  </div>
                  {proposal.type !== 'external' && (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleDownloadPdf}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  )}
                </div>

              <div className="p-2 sm:p-4">
                <Card className="w-full max-w-6xl mx-auto">
                  <CardContent className="p-0">
                    <div className="w-full overflow-hidden" style={{ height: proposal.type === 'external' ? 'calc(100vh - 100px)' : 'calc(100vh - 200px)' }}>
                      <iframe
                        src={pdfUrl}
                        title={proposal.title}
                        className="w-full h-full border-0"
                        id="pdf-iframe"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <style>{`
            @media (max-width: 768px) {
              #pdf-iframe {
                transform: scale(0.85);
                transform-origin: top left;
                width: 117.6%; /* 100 / 0.85 */
                height: 117.6%;
              }
            }
            @media (max-width: 425px) {
              #pdf-iframe {
                transform: scale(0.75);
                transform-origin: top left;
                width: 133.33%; /* 100 / 0.75 */
                height: 133.33%;
              }
            }
            @media (max-width: 375px) {
              #pdf-iframe {
                transform: scale(0.68);
                transform-origin: top left;
                width: 147.06%; /* 100 / 0.68 */
                height: 147.06%;
              }
            }
            @media (max-width: 320px) {
              #pdf-iframe {
                transform: scale(0.5);
                transform-origin: top left;
                width: 200%; /* 100 / 0.5 */
                height: 200%;
              }
            }
          `}</style>
        </div>
      ) : (
        <div className="min-h-screen bg-muted/30">
          {/* Translation loading indicator */}
          {isTranslating && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('common.translating', 'Translating...')}
            </div>
          )}

          {/* Mobile sidebar toggle */}
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          {/* Language switcher - top right */}
          <div className="fixed top-4 right-4 z-50">
            <LanguageSwitcher />
          </div>

          {/* Client Sidebar */}
          <aside className={cn(
            "fixed left-0 top-0 h-full w-64 bg-background border-r shadow-lg z-40 transform transition-transform duration-300 overflow-y-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}>
            <div className="p-4 border-b">
              <KodediceLogo size={80} showText={false} />
            </div>
            <nav className="p-4 space-y-1" ref={sidebarNavRef}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('common.sections')}</p>
              {enabledSections.map(({ key, label, icon: Icon }) => {
                if (proposal[key] && proposal[key].length == 0) return null
                return (
                  <button
                    key={key}
                    data-section={key}
                    onClick={() => scrollToSection(key)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                      activeSection === key
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{label}</span>
                    {activeSection === key && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main content */}
          <div className="md:ml-64 py-8 px-4">
            <Card className="max-w-4xl mx-auto overflow-hidden">
              {/* Professional Header */}
              <ProposalHeader
                title={proposal.title}
                clientName={client?.companyName}
                presentedBy="Kodedice"
              />

              <CardContent className="p-8 md:p-12 space-y-10 relative">

                {/* Company Overview */}
                {sections.companyOverview && proposal.companyOverview && (
                  <section id="section-companyOverview">
                    <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">{t('proposal.companyOverview')}</h2>
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: getContent('companyOverview', proposal.companyOverview) }} />
                  </section>
                )}

                {/* Application Details */}
                {sections.applicationDetails && proposal.applicationDetails && (
                  <section id="section-applicationDetails">
                    <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">{t('proposal.applicationDevelopmentDetails')}</h2>
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: getContent('applicationDetails', proposal.applicationDetails) }} />
                  </section>
                )}

                {/* Scope */}
                {sections.scopeOfWork && proposal.scopeOfWork && (
                  <section id="section-scopeOfWork">
                    <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">{t('proposal.scopeOfWork')}</h2>
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: getContent('scopeOfWork', proposal.scopeOfWork) }} />
                  </section>
                )}

                {/* Tech Stack & Estimation */}
                {
                  sections?.techStackEstimation && (
                    <section id="section-techStackEstimation">
                      <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">{t('proposal.techStackEstimation')}</h2>
                      <div className="space-y-6 mb-8">
                        {!techStack?.frontend ? <p>loading...</p> :
                          techStack.frontend && techStack.frontend.trim() !== '' && techStack.frontend !== '<p></p>' ? (
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h3 className="font-bold text-sm uppercase tracking-wide text-foreground mb-2">{t('techStack.frontend')}</h3>
                              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: getTechStackContent('frontend', techStack.frontend) }} />
                            </div>
                          ) : (
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h3 className="font-bold text-sm uppercase tracking-wide text-foreground mb-2">{t('techStack.frontend')}</h3>
                              <p className="text-muted-foreground italic">{t('common.noDataAvailable', 'No data available')}</p>
                            </div>
                          )}
                        {techStack.backend && techStack.backend.trim() !== '' && techStack.backend !== '<p></p>' ? (
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h3 className="font-bold text-sm uppercase tracking-wide text-foreground mb-2">{t('techStack.backend')}</h3>
                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: getTechStackContent('backend', techStack.backend) }} />
                          </div>
                        ) : (
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h3 className="font-bold text-sm uppercase tracking-wide text-foreground mb-2">{t('techStack.backend')}</h3>
                            <p className="text-muted-foreground italic">{t('common.noDataAvailable', 'No data available')}</p>
                          </div>
                        )}
                        {techStack.database && techStack.database.trim() !== '' && techStack.database !== '<p></p>' ? (
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h3 className="font-bold text-sm uppercase tracking-wide text-foreground mb-2">{t('techStack.database')}</h3>
                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: getTechStackContent('database', techStack.database) }} />
                          </div>
                        ) : (
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h3 className="font-bold text-sm uppercase tracking-wide text-foreground mb-2">{t('techStack.database')}</h3>
                            <p className="text-muted-foreground italic">{t('common.noDataAvailable', 'No data available')}</p>
                          </div>
                        )}
                        {techStack.ui_ux && techStack.ui_ux.trim() !== '' && techStack.ui_ux !== '<p></p>' ? (
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h3 className="font-bold text-sm uppercase tracking-wide text-foreground mb-2">{t('techStack.uiux')}</h3>
                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: getTechStackContent('uiux', techStack.ui_ux) }} />
                          </div>
                        ) : (
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h3 className="font-bold text-sm uppercase tracking-wide text-foreground mb-2">{t('techStack.uiux')}</h3>
                            <p className="text-muted-foreground italic">{t('common.noDataAvailable', 'No data available')}</p>
                          </div>
                        )}
                      </div>

                      {/* Estimation Table */}
                      {proposal?.techStackAndEstimation?.estimation?.length > 0 ? (
                        <div>
                          <h3 className="font-bold text-lg mb-4 text-foreground">{t('techStack.estimation')}</h3>
                          <div className="overflow-x-auto rounded-lg border border-border">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-muted/50">
                                  <th className="p-3 text-left font-semibold text-foreground">{t('table.milestone')}</th>
                                  <th className="p-3 text-left font-semibold text-foreground">{t('table.description')}</th>
                                  <th className="p-3 text-left font-semibold text-foreground">{t('table.duration')}</th>
                                  <th className="p-3 text-right font-semibold text-foreground">{t('table.cost')}</th>
                                  {hasGSTValues && (
                                    <th className="p-3 text-right font-semibold text-foreground">{t('table.gst')}</th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {/* {proposal.estimationMilestones.map((milestone, index) => ( */}
                                {proposal?.techStackAndEstimation?.estimation?.map((milestone, index) => (
                                  <tr key={index}>
                                    {/* // <tr key={milestone.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}> */}
                                    <td className="p-3 font-medium border-t border-border">{milestone.milestone}</td>
                                    <td className="p-3 text-muted-foreground border-t border-border">{milestone.description}</td>
                                    <td className="p-3 border-t border-border">{milestone.duration}</td>
                                    <td className="p-3 text-right border-t border-border">
                                      {milestone.currency && milestone.currency !== 'INR' ?
                                        `${milestone.currency} ${milestone.cost || milestone.costInr}` :
                                        `₹${milestone.cost || milestone.costInr}`
                                      }
                                    </td>
                                    {hasGSTValues && (
                                      <td className="p-3 text-right border-t border-border">
                                        {milestone.gst ? `${milestone.gst}%` : "-"}
                                      </td>
                                    )}
                                  </tr>
                                ))}
                                {/* TOTAL COST ROW */}
                                <tr className="bg-gray-100 font-semibold">
                                  <td colSpan={3} className="p-3 text-left border-t-2">
                                    {t("table.totalCosting", "Total Cost")}
                                  </td>

                                  <td className="p-3 text-right border-t-2">
                                    {proposal?.techStackAndEstimation?.estimation?.[0]?.currency === "USD"
                                      ? `$${totalCost}`
                                      : proposal?.techStackAndEstimation?.estimation?.[0]?.currency === "EUR"
                                        ? `€${totalCost}`
                                        : `₹${totalCost}`}
                                  </td>
                                  {hasGSTValues && (
                                    <td className="p-3 text-right border-t border-border">
                                      {proposal?.techStackAndEstimation?.estimation?.[0]?.gst
                                        ? `${proposal?.techStackAndEstimation?.estimation?.[0]?.gst}%`
                                        : "-"}
                                    </td>
                                  )}
                                </tr>

                                {/* TOTAL COST + GST ROW */}
                                {hasGSTValues && (
                                  <tr className="bg-gray-100 font-semibold">
                                    <td colSpan={3} className="p-3 text-left border-t-2">
                                      {t("table.totalCostWithGst", "Total Cost + GST")}
                                    </td>
                                    <td className="p-3 text-right border-t-2">
                                      {proposal?.techStackAndEstimation?.estimation?.[0]?.currency === "USD"
                                        ? `$${totalCostWithGST}`
                                        : proposal?.techStackAndEstimation?.estimation?.[0]?.currency === "EUR"
                                          ? `\u20AC${totalCostWithGST}`
                                          : `₹${totalCostWithGST}`}
                                    </td>
                                    <td className="p-3 text-right border-t border-border">
                                      -
                                    </td>
                                  </tr>
                                )}

                                {/* TIMELINE ROW */}
                                <tr className="bg-gray-100 font-semibold">
                                  <td colSpan={3} className="p-3 text-left border-t-2">
                                    {t("table.timeline", "Timeline")}
                                  </td>

                                  <td colSpan={hasGSTValues ? 2 : 1} className="p-3 text-right border-t-2">
                                    {proposal?.techStackAndEstimation?.timeline || "-"}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-bold text-lg mb-4 text-foreground">{t('techStack.estimation')}</h3>
                          <p className="text-muted-foreground italic">{t('common.noDataAvailable', 'No data available')}</p>
                        </div>
                      )}
                    </section>
                  )}

                {/* Detailed Phase Breakdown */}
                {sections.detailedPhaseBreakdown && proposal.detailedPhaseBreakdown && (
                  <section id="section-detailedPhaseBreakdown">
                    <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">{t('proposal.detailedPhaseBreakdown')}</h2>
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: getContent('detailedPhaseBreakdown', proposal.detailedPhaseBreakdown) }} />
                  </section>
                )}

                {/* Post Launch Support */}
                {sections.postLaunchSupport && proposal.postLaunchSupport && (
                  <section id="section-postLaunchSupport">
                    <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">{t('proposal.postLaunchSupport')}</h2>
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: getContent('postLaunchSupport', proposal.postLaunchSupport) }} />
                  </section>
                )}

                {/* Ongoing Maintenance and Support */}
                {sections?.ongoingMaintenanceAndSupport && proposal?.ongoingMaintenanceAndSupport && (
                  <section id="section-ongoingMaintenanceAndSupport">
                    <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">{t('proposal.ongoingMaintenanceSupport')}</h2>
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: getContent('ongoingMaintenanceAndSupport', proposal?.ongoingMaintenanceAndSupport) }} />
                  </section>
                )}

                {/* Team */}
                {proposal.projectTeam && Array.isArray(proposal.projectTeam) && proposal.projectTeam.length > 0 && (
                  <section id="section-projectTeam">
                    <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">{t('proposal.projectTeam')}</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {proposal.projectTeam.map((member: any) => (
                        <div key={member.id} className="bg-muted/30 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              className="h-20 w-20 rounded-full object-cover mx-auto mb-4 ring-4 ring-primary/20"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 ring-4 ring-primary/20">
                              <span className="text-primary font-bold text-3xl">{member.name.charAt(0)}</span>
                            </div>
                          )}
                          <h3 className="font-bold text-lg">{member.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
                          {member.linkedinUrl && (
                            <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-sm inline-flex items-center gap-1 font-medium hover:underline">
                              <Linkedin className="h-4 w-4" /> {t('common.linkedin')}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Deployment Structure */}
                {sections.deploymentStructure && proposal.deploymentStructure && (
                  <section id="section-deploymentStructure">
                    <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">{t('proposal.deploymentStructure')}</h2>
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: getContent('deploymentStructure', proposal.deploymentStructure) }} />
                  </section>
                )}

                {/* Source Code Ownership */}
                {sections.sourceCodeOwnership && proposal.sourceCodeOwnership && (
                  <section id="section-sourceCodeOwnership">
                    <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">{t('proposal.sourceCodeOwnership')}</h2>
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: getContent('sourceCodeOwnership', proposal.sourceCodeOwnership) }} />
                  </section>
                )}

                {/* Termination & Exit */}
                {sections?.terminationAndExit && proposal?.terminationAndExit && (
                  <section id="section-terminationAndExit">
                    <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">{t('proposal.terminationExit')}</h2>
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: getContent('terminationAndExit', proposal?.terminationAndExit) }} />
                  </section>
                )}

                {/* Invoice Terms */}
                {(sections?.invoiceTerms && proposal?.invoiceTerms) ? (
                  <section id="section-invoiceTerms">
                    <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">{t('proposal.invoiceTerms')}</h2>
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{
                      __html: getContent('invoiceTerms', proposal?.invoiceTerms
                      )
                    }} />
                  </section>
                ) : (
                  <section id="section-invoiceTerms">
                    <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">{t('proposal.invoiceTerms')}</h2>
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: getStaticInvoiceTerms() }} />
                  </section>
                )}

                {/* Terms */}
                {(sections?.termsAndConditions && proposal?.termsAndConditions) ? (
                  <section id="section-termsAndConditions" className="border-t-2 border-primary pt-8">
                    <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">{t('proposal.termsConditions')}</h2>
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: getContent('termsAndConditions', proposal.termsAndConditions) }} />
                  </section>
                ) : (
                  <section id="section-termsAndConditions" className="border-t-2 border-primary pt-8">
                    <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-primary pb-2">{t('proposal.termsConditions')}</h2>
                    <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: getStaticTermsAndConditions() }} />
                  </section>
                )}

                {/* Signatures - Both Parties */}
                {sections?.signature &&
                  <section id="section-signature" className="border-t-2 border-primary pt-8">
                    <h2 className="text-2xl font-bold mb-6 text-foreground">{t('proposal.signatures')}</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Kodedice Signature */}
                      <div className="bg-muted/30 rounded-xl p-6">
                        <p className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">{t('signature.forPrometteur')}</p>
                        {/* {proposal.signatures?.company && proposal.signatures.company.data ? ( */}
                        {proposal.signature?.company ? (

                          <div className="bg-background rounded-lg p-4 border">
                            {proposal.signature.company.mode === 'image' ? (
                              <img
                                src={proposal.signature.company.value}
                                alt="Company Signature"
                                className="max-h-20 mx-auto"
                              />
                            ) : (
                              <p
                                className="text-2xl text-center overflow-hidden"
                                style={{ fontFamily: 'cursive, "Dancing Script", serif' }}
                              >
                                {proposal.signature.company.value}
                              </p>
                            )}
                            {proposal.signature.company.signerName && (
                              <p className="text-sm text-center mt-3 font-semibold">{proposal.signature.company.signerName}</p>
                            )}
                            {proposal.signature.company.signedAt && (
                              <p className="text-xs text-muted-foreground text-center mt-1">
                                {t('common.signedAt')} {new Date(proposal.signature.company.signedAt).toLocaleString(isFrench ? 'fr-FR' : 'en-US')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="bg-background rounded-lg p-6 border border-dashed text-center">
                            <p className="text-sm text-muted-foreground">{t('signature.awaitingCompany')}</p>
                          </div>
                        )}
                      </div>

                      {/* Client Signature */}
                      <div className="bg-muted/30 rounded-xl p-6">
                        <p className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">{t('signature.for')} {client?.companyName || 'Client'}</p>
                        <SignaturePad
                          value={isClientSigned ? (proposal.signatures?.client || proposal.clientSignature) : undefined}
                          onChange={handleClientSignature}
                          disabled={isClientSigned}
                          title=""
                          signerLabel={t('signature.yourSignature')}
                        />
                      </div>
                    </div>
                  </section>

                }
              </CardContent>

              {/* Contact Us Footer */}
              {sections.contactUs && (
                <div id="section-contactUs">
                  <ContactSection />
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
