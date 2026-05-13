import { useEffect, useMemo, useCallback, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useProposals } from '@/hooks/useProposals';
import { useClients } from '@/hooks/useClients';
import { useContentTranslation } from '@/hooks/useContentTranslation';
import { ArrowLeft, Edit, Download, Share2, Linkedin, Loader2, CloudCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TechStackCategory } from '@/types/proposal';
import { ProposalHeader } from '@/components/proposals/ProposalHeader';
import { ContactSection } from '@/components/proposals/ContactSection';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useRef } from 'react';
import { exportProposalPDFAPI } from '@/services/auth_service';


export interface ProposalSections {
  companyOverview: boolean;
  applicationDetails: boolean;
  scopeOfWork: boolean;
  techStackEstimation: boolean;
  detailedPhaseBreakdown: boolean;
  postLaunchSupport: boolean;
  ongoingMaintenanceAndSupport: boolean;
  projectTeam: boolean;
  deploymentStructure: boolean;
  sourceCodeOwnership: boolean;
  terminationAndExit: boolean;
  invoiceTerms: boolean;
  termsAndConditions: boolean;
  signature: boolean;
  contactUs: boolean;
}

export default function ProposalPreview() {
  const { id, category } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchProposalById, createShare } = useProposals();
  const { getClient } = useClients();
  const { t, i18n } = useTranslation();
  const { translateProposal, translatedContent, isTranslating, clearTranslations } = useContentTranslation();

  // ✅ ALL useState hooks
  const [proposal, setProposal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const proposalRef = useRef<HTMLDivElement>(null);
  console.log(proposal?.techStackAndEstimation);

  const [sections, setSections] = useState<ProposalSections>({
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
  });

  const isFrench = i18n.language === 'fr';
  const client = proposal?.clientId ? getClient(proposal.clientId) : null;
  // console.log(client)

  const techStack = useMemo(() => {
    const defaultTechStack = {
      frontend: '',
      backend: '',
      database: '',
      ui_ux: '',
      estimation: []
    };

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

  // ✅ ALL useEffect hooks
  useEffect(() => {
    if (!id) return;
    apiCallToGetPraposal();
  }, [id]);

  const apiCallToGetPraposal = async () => {
    try {
      setLoading(true);
      const data = await fetchProposalById(id);
      console.log(data);
      setProposal(data);
      
      // If it's an external proposal, redirect to PDF preview
      if (data?.type === 'external') {
        navigate(`/proposals/${id}/preview-pdf`, { replace: true });
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  // Translate proposal content when language changes to French
  useEffect(() => {
    if (!proposal) return;

    if (isFrench) {
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

      // Also translate tech stack fields
      const techStackFields = ['frontend', 'backend', 'database', 'uiux'];

      const allContent: Record<string, any> = { ...proposal };
      techStackFields.forEach(field => {
        allContent[`techStack_${field}`] = techStack?.[field as keyof TechStackCategory] || '';
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


  const calculatedTotalCost =
    proposal?.techStackAndEstimation?.estimation?.reduce((sum, item) => {
      return sum + (Number(item.cost) || Number(item.costInr) || 0);
    }, 0) || 0;

  const totalCost =
    proposal?.techStackAndEstimation?.totalCost || calculatedTotalCost;

  const handleExportPDF = async () => {
    try {
     toast({ title: "Downloading PDF...", description: "Please wait while we generate your proposal PDF", });
      setLoading(true);
      const response = await exportProposalPDFAPI(proposal?.id);
      const pdfUrl = response?.data;

      const fileResponse = await fetch(pdfUrl);
      const blob = await fileResponse.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "proposal.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
      setLoading(false)
    toast({
      title: "Download complete ✅",
      description: "Your proposal PDF has been downloaded successfully.",
    });
    } catch (error) 
    { 
      console.error(error); 
      toast({ title: "Error", description: "Failed to download PDF", variant: "destructive", });
    }
  };

  const getTechStackContent = useCallback((field: string, original: string) => {
    if (isFrench && translatedContent[`techStack_${field}`]) {
      return translatedContent[`techStack_${field}`];
    }
    return original;
  }, [isFrench, translatedContent]);

  const getStaticInvoiceTerms = () => {
    return t('staticContent.invoiceTerms');
  };

  const getStaticTermsAndConditions = () => {
    return t('staticContent.termsAndConditions');
  };

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

  console.log(proposal?.companyOverview || "");

  if (!sections) return null;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex gap-2 flex-wrap items-center">
            {isTranslating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common.translating', 'Translating...')}
              </div>
            )}
            <LanguageSwitcher />
          </div>
          {/* <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            {t('common.share')}
          </Button> */}
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            {t('common.exportPdf')}
          </Button>

          {/* <Button asChild>
            <Link to={`/proposals/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              {t('common.edit')}
            </Link>
          </Button> */}
        </div>
      </div>

      {/* Proposal Document */}
      <Card ref={proposalRef} className="max-w-4xl mx-auto print:shadow-none print:border-none overflow-hidden">
        <ProposalHeader
          title={proposal?.title || ""}
          clientName={client?.companyName}
          presentedBy="Prometteur Solutions"
        />

        <CardContent className="p-8 md:p-12 space-y-10 relative">
          {/* Company Overview */}
          {sections?.companyOverview && proposal?.companyOverview && (
            <section className="page-break-inside-avoid">
              <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-amber-500 pb-2">{t('proposal.companyOverview')}</h2>
              <div
                className="prose page-break-wrapper page-break-inside-avoid prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: getContent('companyOverview', proposal.companyOverview) }}
              />
            </section>
          )}

          {/* Application Development Details */}
          {sections?.applicationDetails && proposal?.applicationDetails && (
            <section className="page-break-inside-avoid">
              <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-amber-500 pb-2">{t('proposal.applicationDevelopmentDetails')}</h2>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: getContent('applicationDetails', proposal.applicationDetails) }}
              />
            </section>
          )}

          {/* Scope of Work */}
          {sections?.scopeOfWork && proposal?.scopeOfWork && (
            <section className="page-break-inside-avoid">
              <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-amber-500 pb-2">{t('proposal.scopeOfWork')}</h2>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: getContent('scopeOfWork', proposal.scopeOfWork) }}
              />
            </section>
          )}

          {/* Tech Stack & Estimation */}
          {sections?.techStackEstimation && (
            <section className="page-break-inside-avoid">
              <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-amber-500 pb-2">{t('proposal.techStackEstimation')}</h2>

              {/* Tech Stack */}
              <div className="space-y-6 mb-8">
                {techStack?.frontend && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-foreground mb-2">{t('techStack.frontend')}</h3>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: getTechStackContent('frontend', techStack?.frontend) }}
                    />
                  </div>
                )}
                {techStack?.backend && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-foreground mb-2">{t('techStack.backend')}</h3>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: getTechStackContent('backend', techStack?.backend) }}
                    />
                  </div>
                )}
                {techStack?.database && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-foreground mb-2">{t('techStack.database')}</h3>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: getTechStackContent('database', techStack?.database) }}
                    />
                  </div>
                )}
                {techStack?.ui_ux && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-foreground mb-2">{t('techStack.uiux')}</h3>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: getTechStackContent('uiux', techStack?.ui_ux) }}
                    />
                  </div>
                )}
              </div>

              {/* Estimation Table */}
              {proposal?.techStackAndEstimation?.estimation && proposal?.techStackAndEstimation?.estimation?.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-4 text-foreground">{t('techStack.estimation')}</h3>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="p-3 text-left font-semibold text-foreground">{t('table.milestone')}</th>
                          <th className="p-3 text-left font-semibold text-foreground">{t('table.description')}</th>
                          <th className="p-3 text-left font-semibold text-foreground">{t('table.duration')}</th>
                          <th className="p-3 text-center font-semibold text-foreground">{t('table.cost')}</th>
                          {hasGSTValues && (
                            <th className="p-3 text-right font-semibold text-foreground">{t('table.gst')}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {proposal?.techStackAndEstimation?.estimation?.map((milestone, index) => (
                          <tr key={milestone.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                            <td className="p-3 font-medium border-t border-border">
                              {milestone.milestone}
                            </td>

                            <td className="p-3 text-muted-foreground border-t border-border">
                              {milestone.description}
                            </td>

                            <td className="p-3 border-t border-border">
                              {milestone.duration}
                            </td>

                            <td className="p-3 text-center border-t border-border">
                              {milestone.currency === "USD"
                                ? `$${milestone.cost || milestone.costInr}`
                                : milestone.currency === "EUR"
                                  ? `€${milestone.cost || milestone.costInr}`
                                  : `₹${milestone.cost || milestone.costInr}`}
                            </td>

                            {/* {milestone.currency === "INR" && (
                              <td className="p-3 text-right border-t border-border">
                                {milestone.gst}
                              </td>
                            )} */}
                            {hasGSTValues && (
                              <td className="p-3 text-right border-t border-border">
                                {milestone.gst ? `${milestone.gst}%` : "-"}
                              </td>
                            )}
                          </tr>
                        ))}

                        {/* TOTAL COST ROW */}
                        <tr className="#F8F9FA  font-semibold">
                          <td
                            colSpan={3}
                            className="p-3 text-align-center border-t-2 "
                          >
                            {t("table.totalCosting", "Total Cost")}
                          </td>
                         

                          <td className="p-3 text-center border-t-2 #F8F9FA">
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
                          <tr className="#F8F9FA font-semibold">
                            <td
                              colSpan={3}
                              className="p-3 text-align-center border-t-2"
                            >
                              {t("table.totalCostWithGst", "Total Cost + GST")}
                            </td>

                            <td className="p-3 text-center border-t-2 #F8F9FA">
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
                        <tr className="#F8F9FA font-semibold">
                          <td
                            colSpan={3}
                            className="p-3 text-align-center border-t-2"
                          >
                            {t("table.timeline", "Timeline")}
                          </td>

                          <td
                            colSpan={hasGSTValues ? 2 : 1}
                            className="p-3 text-center border-t-2 #F8F9FA"
                          >
                            {proposal?.techStackAndEstimation?.timeline
                              ? proposal.techStackAndEstimation.timeline
                              : "-"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}


          {/* Detailed Phase Breakdown */}
          {sections?.detailedPhaseBreakdown && proposal?.detailedPhaseBreakdown && (
            <section className="page-break-inside-avoid">
              <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-amber-500 pb-2">{t('proposal.detailedPhaseBreakdown')}</h2>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: getContent('detailedPhaseBreakdown', proposal.detailedPhaseBreakdown) }}
              />
            </section>
          )}

          {/* Post Launch Support */}
          {sections?.postLaunchSupport && proposal?.postLaunchSupport && (
            <section className="page-break-inside-avoid">
              <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-amber-500 pb-2">{t('proposal.postLaunchSupport')}</h2>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: getContent('postLaunchSupport', proposal.postLaunchSupport) }}
              />
            </section>
          )}

          {/* Ongoing Maintenance and Support */}
          {sections?.ongoingMaintenanceAndSupport && proposal?.ongoingMaintenanceAndSupport && (
            <section className="page-break-inside-avoid">
              <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-amber-500 pb-2">{t('proposal.ongoingMaintenanceSupport')}</h2>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: getContent('ongoingMaintenanceAndSupport', proposal.ongoingMaintenanceAndSupport) }}
              />
            </section>
          )}


          {/* Project Team */}
          {sections?.projectTeam && proposal?.team && proposal.team.length > 0 && (
            <section className="page-break-inside-avoid">
              <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-amber-500 pb-2">{t('proposal.projectTeam')}</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {proposal.team.map((member) => (
                  <div key={member.id} className="bg-muted/30 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-20 w-20 rounded-full object-cover mx-auto mb-4 ring-4 ring-amber-500/20"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4 ring-4 ring-amber-500/20">
                        <span className="text-amber-600 font-bold text-3xl">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <h3 className="font-bold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-amber-600 hover:underline font-medium"
                      >
                        <Linkedin className="h-4 w-4" />
                        {t('common.linkedin')}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Deployment Structure */}
          {sections?.deploymentStructure && proposal?.deploymentStructure && (
            <section className="page-break-inside-avoid">
              <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-amber-500 pb-2">{t('proposal.deploymentStructure')}</h2>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: getContent('deploymentStructure', proposal.deploymentStructure) }}
              />
            </section>
          )}

          {/* Source Code Ownership */}
          {sections?.sourceCodeOwnership && proposal?.sourceCodeOwnership && (
            <section className="page-break-inside-avoid">
              <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-amber-500 pb-2">{t('proposal.sourceCodeOwnership')}</h2>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: getContent('sourceCodeOwnership', proposal.sourceCodeOwnership) }}
              />
            </section>
          )}

          {/* Termination & Exit */}
          {sections?.terminationAndExit && proposal?.terminationAndExit && (
            <section className="page-break-inside-avoid">
              <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-amber-500 pb-2">{t('proposal.terminationExit')}</h2>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: getContent('terminationAndExit', proposal.terminationAndExit) }}
              />
            </section>
          )}

          {/* Invoice Terms */}
          {sections?.invoiceTerms && (
            <section className="page-break-inside-avoid">
              <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-amber-500 pb-2">{t('proposal.invoiceTerms')}</h2>
              {proposal?.invoiceTerms ? (
                <div
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: getContent('invoiceTerms', proposal.invoiceTerms) }}
                />
              ) : (
                <div
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: getStaticInvoiceTerms() }}
                />
              )}
            </section>
          )}

          {/* Terms & Conditions */}
          {sections?.termsAndConditions && (
            <section className="page-break-inside-avoid border-t-2 border-amber-500 pt-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground border-b-2 border-amber-500 pb-2">{t('proposal.termsConditions')}</h2>
              {proposal?.termsAndConditions ? (
                <div
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: getContent('termsAndConditions', proposal.termsAndConditions) }}
                />
              ) : (
                <div
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: getStaticTermsAndConditions() }}
                />
              )}
            </section>
          )}

          {/* Signature */}
          {sections.signature && (
            <section className="page-break-inside-avoid border-t-2 border-amber-500 pt-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">{t('proposal.signatures')}</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Prometteur Solutions Signature */}
                <div className="bg-muted/30 rounded-xl p-6">
                  <p className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">{t('signature.forPrometteur')}</p>
                  {proposal?.signatures?.company ? (
                    <div className="bg-background rounded-lg p-4 border">
                      {proposal?.signatures?.company?.type === 'draw' ? (
                        <img
                          src={proposal?.signatures?.company?.data}
                          alt="Company Signature"
                          className="max-h-20 mx-auto"
                        />
                      ) : (
                        <p
                          className="text-2xl text-center"
                          style={{ fontFamily: 'cursive, "Dancing Script", serif' }}
                        >
                          {proposal?.signatures?.company?.data}
                        </p>
                      )}
                      {proposal?.signatures?.company?.signerName && (
                        <p className="text-sm text-center mt-3 font-semibold">{proposal?.signatures?.company?.signerName}</p>
                      )}
                      {proposal?.signatures?.company?.signedAt && (
                        <p className="text-xs text-muted-foreground text-center mt-1">
                          {t('common.signedAt')} {new Date(proposal.signatures.company.signedAt).toLocaleString(isFrench ? 'fr-FR' : 'en-US')}
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
                  {(proposal?.signatures?.client || proposal?.clientSignature) ? (
                    <div className="bg-background rounded-lg p-4 border">
                      {(proposal?.signatures?.client?.type || proposal?.clientSignature?.type) === 'draw' ? (
                        <img
                          src={proposal?.signatures?.client?.data || proposal?.clientSignature?.data}
                          alt="Client Signature"
                          className="max-h-20 mx-auto"
                        />
                      ) : (
                        <p
                          className="text-2xl text-center"
                          style={{ fontFamily: 'cursive, "Dancing Script", serif' }}
                        >
                          {proposal?.signatures?.client?.data || proposal?.clientSignature?.data}
                        </p>
                      )}
                      {(proposal?.signatures?.client?.signerName || proposal?.clientSignature?.signerName) && (
                        <p className="text-sm text-center mt-3 font-semibold">
                          {proposal?.signatures?.client?.signerName || proposal?.clientSignature?.signerName}
                        </p>
                      )}
                      {(proposal?.signatures?.client?.signedAt || proposal?.clientSignature?.signedAt) && (
                        <p className="text-xs text-muted-foreground text-center mt-1">
                          {t('common.signedAt')} {new Date(proposal?.signatures?.client?.signedAt || proposal?.clientSignature?.signedAt || '').toLocaleString(isFrench ? 'fr-FR' : 'en-US')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-background rounded-lg p-6 border border-dashed text-center">
                      <p className="text-sm text-muted-foreground">{t('signature.awaitingClient')}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

        </CardContent>

        {/* Contact Us Footer */}
        {sections.contactUs && (
          <ContactSection />
        )}
      </Card>
    </div>
  );
}
