import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProposals } from '@/hooks/useProposals';
import { useClients } from '@/hooks/useClients';
import { uploadFile } from '@/services/fileUpload';
import {
  Proposal,
  ProposalSections,
  TeamMember,
  EstimationMilestone,
  TechStackCategory,
  SignatureData,
  ProposalSignatures
} from '@/types/proposal';
import { toast } from 'sonner';
import { Save, Eye, Plus, Trash2, ArrowLeft, Linkedin, Upload, User, Pencil, CloudCog } from 'lucide-react';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { SignaturePad } from '@/components/editor/SignaturePad';
import { SectionToggle } from '@/components/editor/SectionToggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { generateUUID } from '@/utils/uuid';

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

const defaultTechStack: TechStackCategory = {
  frontend: '',
  backend: '',
  database: '',
  ui_ux: '',
};

const defaultPostLaunchSupport = `<p>When we hit the launch button, it doesn't mean we're done. Prometteur is always in the wings to guide you through the rough waters of launch planning and post-launch consulting, hosting, and maintenance.</p>
<table>
  <thead>
    <tr>
      <th>Milestone</th>
      <th>Deliverables</th>
      <th>Investment</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Free Bug Support</strong></td>
      <td>We offer a 30-day grace period for maintenance after project completion. During this time, we will fix any errors or issues for free on working days.<br/><br/>Please note that this support does not include new features or changes required for updates to the Back-end, databases, servers, or new OS versions for Android/iOS.</td>
      <td>Included</td>
    </tr>
    <tr>
      <td><strong>Bucket of hours for maintenance</strong></td>
      <td>For all the changes and updates post-free bug support, we will maintain the number of hours in Excel or PMS, and then monthly billing can be taken care of.</td>
      <td>$20 per hour</td>
    </tr>
  </tbody>
</table>`;

const defaultDeploymentStructure = `<p>For the deployment, we will provide the following two structures:</p>

<h3>01 Free Deployment</h3>
<ul>
  <li><strong>Software Deployment:</strong> We'll deploy your project's software onto servers you provide without additional configurations. This covers the basic setup needed to run your application. To streamline the deployment process, we recommend you provide the servers with the predefined environments we suggest.</li>
  <li><strong>Basic Setup:</strong> This includes transferring files, setting up the database (if applicable), and ensuring your application runs smoothly on the provided server. We'll make sure everything is up and running as expected, provided the server is provided as we have requested.</li>
</ul>

<h3>02 Paid Deployment</h3>
<ul>
  <li><strong>Server Management:</strong> Additional charges will apply if you require us to manage servers, including setup, configurations, security measures, and ongoing maintenance. This ensures optimal server performance and reliability.</li>
  <li><strong>Application Installation:</strong> Charges may be incurred if the deployment requires installing additional applications or services beyond the standard project scope, such as third-party APIs or software dependencies. This ensures compatibility and functionality.</li>
  <li><strong>Custom Configurations:</strong> Any custom server configurations or optimizations requested by you or required as per the third-party APIs, that go beyond the standard setup will be subject to additional charges. This includes tailoring the server environment to meet specific project requirements.</li>
</ul>

<h3>03 Deployment Strategy</h3>
<ul>
  <li><strong>Blue/Green Deployment:</strong> Zero downtime deployment strategy ensuring seamless transitions between versions.</li>
  <li><strong>Infrastructure Setup:</strong>
    <ul>
      <li><strong>Development & Staging:</strong> EU-based, non-HDS environments using dummy data only</li>
      <li><strong>Production:</strong> EU-based, HDS-ready environment activated when real patient data is processed</li>
    </ul>
  </li>
  <li><strong>Monitoring + Alerts:</strong> Activated during deployment to ensure system health and performance tracking.</li>
  <li><strong>Security Hardening:</strong> Comprehensive security checks performed pre-launch.</li>
  <li><strong>EU/HDS Compliance:</strong> Deployment compatible with EU-only / HDS-certified environments.</li>
  <li><strong>Access Traceability:</strong> Enabled for sensitive operations to maintain audit trails.</li>
</ul>

<h3>04 Handover Deliverables</h3>
<ul>
  <li><strong>Runbook & Deployment Guide:</strong> Comprehensive operational documentation for deployment procedures.</li>
  <li><strong>Full Admin and User Manuals:</strong> Complete documentation for administrators and end users.</li>
  <li><strong>API Documentation (OpenAPI):</strong> Standardized API specifications and documentation.</li>
  <li><strong>Database Schema Documentation (PostgreSQL):</strong> Detailed database structure and relationships.</li>
  <li><strong>Recorded Training Sessions:</strong> Video tutorials and training materials for team onboarding.</li>
  <li><strong>Post-Launch Monitoring Setup:</strong> Configured monitoring dashboards and alerting systems.</li>
  <li><strong>Warranty Activation:</strong> Support warranty period activation upon project completion.</li>
</ul>`;

const defaultTermsAndConditions = `<ul>
  <li><strong>Password Management:</strong>
    <ul>
      <li>Upon project completion and access delivery, clients must immediately change all passwords.</li>
      <li>Prometteur Solutions will not be responsible for any issues post-delivery unless an Annual Maintenance Contract (AMC) is in place.</li>
    </ul>
  </li>
  <li><strong>Client-Induced Changes:</strong>
    <ul>
      <li>Any major changes made by the client to the website or app without notifying Prometteur Solutions will be the client's full responsibility for any resulting issues.</li>
    </ul>
  </li>
  <li><strong>Asset Provision:</strong>
    <ul>
      <li>Clients must provide all necessary assets, including logos, color schemes, and translations, as requested by the development team.</li>
    </ul>
  </li>
  <li><strong>Timely Feedback:</strong>
    <ul>
      <li>Timely feedback from the client is crucial to avoid project delays.</li>
    </ul>
  </li>
  <li><strong>Change Requests (CR):</strong>
    <ul>
      <li>Change Requests will be documented and addressed at the end of the current milestone.</li>
      <li>CRs will be billed separately, and full payment is required upon invoice receipt.</li>
    </ul>
  </li>
  <li><strong>Third-Party API Integrations:</strong>
    <ul>
      <li>Clients must provide all necessary documentation and support information for third-party API integrations.</li>
      <li>Assistance from our team in this process will be chargeable, though guidance will be provided as needed.</li>
    </ul>
  </li>
  <li><strong>Support Hours:</strong>
    <ul>
      <li>Weekend and post-working-hour support will be charged at $35 per hour.</li>
    </ul>
  </li>
  <li><strong>Developer Hourly Rates:</strong>
    <ul>
      <li>Developer hourly rates are subject to an annual revision of 10%.</li>
    </ul>
  </li>
</ul>
<p><em>By adhering to these guidelines, we ensure smooth project execution and long-term support for your applications and systems.</em></p>`;

const defaultContactUs = `<h2>Contact Us</h2>
<p><strong>Website:</strong> www.prometteursolutions.com</p>
<p><strong>Phone:</strong> +91 8087555678</p>
<p><strong>E-mail:</strong> sales@prometteursolutions.com</p>
<p><strong>HQ Address:</strong> Office no. 2228, 2nd Floor, J.K Infotech, Hinjewadi - Phase 1, Near Ruby Hall Clinic, Pune - 411057</p>`;

const defaultScopeOfWork = `<h3>01 Activities and Responsibilities</h3>
<ul>
  <li>Website UI Changes</li>
  <li>Admin Panel UI changes</li>
  <li>Testing of app and admin</li>
  <li>Hosting of app</li>
</ul>

<h3>02 Project Phases</h3>
<ul>
  <li>Business Analysis</li>
  <li>UI UX</li>
  <li>Development and testing</li>
  <li>Release</li>
</ul>

<h3>03 Exclusions</h3>
<ul>
  <li>Cost for hosting</li>
  <li>Cost for domain</li>
  <li>Any 3rd party cost</li>
</ul>

<h3>04 Deliverables</h3>
<ul>
  <li>Source code of website</li>
  <li>Release documentation</li>
  <li>Test cases report</li>
  <li>All the copyrights</li>
</ul>

<h3>05 Customer Requirements</h3>
<ul>
  <li>Full tested app and admin</li>
  <li>Single point of contact</li>
  <li>Weekly updates</li>
  <li>Timely delivery</li>
</ul>`;

const defaultDetailedPhaseBreakdown = ` 
<h3>1. Sprint 1 — Initiation, Architecture & UI/UX Foundations</h3>
<p><strong>Duration:</strong> 2 Weeks</p>
<p><strong>Deliverables:</strong></p>
<ul>
  <li>Requirements documentation</li>
  <li>User journey maps</li>
  <li>Information architecture</li>
  <li>Development-oriented UI/UX wireframes and layouts (functional, MVP-focused)</li>
  <li>Platform architecture overview</li>
  <li>Sprint roadmap & backlog</li>
  <li>Technical stack confirmation</li>
</ul>
<p><strong>Milestone:</strong> Requirements, Architecture & UI/UX Foundations Approved</p>

<h3>2. Sprint 2 — Complete Onboarding (7 Categories)</h3>
<p><strong>Duration:</strong> 2.5 Weeks</p>
<p><strong>Deliverables:</strong></p>
<ul>
  <li>Patient onboarding flows</li>
  <li>Clinic onboarding (licenses, certifications, pricing, specialties, languages)</li>
  <li>Doctor onboarding and availability setup</li>
  <li>Document upload & validation flows</li>
  <li>Admin document verification interface</li>
  <li>RBAC implementation</li>
</ul>
<p><strong>Milestone:</strong> Onboarding Flows Completed</p>

<h3>3. Sprint 3 — B2B Subscriptions</h3>
<p><strong>Duration:</strong> 2 Weeks</p>
<p><strong>Deliverables:</strong></p>
<ul>
  <li>Stripe Billing integration for clinic/doctor subscriptions</li>
  <li>Subscription plans and lifecycle management</li>
  <li>Automatic recurring billing</li>
  <li>Invoice generation (PDF)</li>
  <li>Subscription status synchronization</li>
  <li>Admin subscription oversight</li>
</ul>
<p><strong>Milestone:</strong> B2B Subscription Module Ready</p>

<h3>4. Sprint 4 — Booking & Shared Calendar</h3>
<p><strong>Duration:</strong> 2.5 Weeks</p>
<p><strong>Deliverables:</strong></p>
<ul>
  <li>Appointment booking engine</li>
  <li>Shared calendar management</li>
  <li>Availability handling</li>
  <li>Multi-timezone support</li>
  <li>Booking statuses and lifecycle</li>
  <li>Automated notifications (email / SMS)</li>
</ul>
<p><strong>Milestone:</strong> Booking & Calendar Functional</p>

<h3>5. Sprint 5 — Medical Documents & Secure Storage</h3>
<p><strong>Duration:</strong> 2.5 Weeks</p>
<p><strong>Deliverables:</strong></p>
<ul>
  <li>Secure medical document uploads</li>
  <li>EU-hosted encrypted object storage (S3-compatible)</li>
  <li>Presigned URLs for secure access</li>
  <li>Permission engine (patient / clinic / admin)</li>
  <li>Full audit logging for document access</li>
  <li>Watermarked document viewer (as required)</li>
</ul>
<p><strong>Milestone:</strong> Medical Document Management Complete</p>

<h3>6. Sprint 6 — FR/EN Website, Admin Finalization & Go-Live</h3>
<p><strong>Duration:</strong> 2.5 Weeks</p>
<p><strong>Deliverables:</strong></p>
<ul>
  <li>FR / EN showcase website</li>
  <li>Admin workflows finalization</li>
  <li>User, clinic, and doctor management</li>
  <li>Moderation tools</li>
  <li>System configuration & settings</li>
  <li>End-to-end testing (functional & regression)</li>
  <li>UAT with client team</li>
  <li>Deployment to production</li>
  <li>Training & handover</li>
  <li>Start of warranty period</li>
</ul>
<p><strong>Milestone:</strong> Successful MVP Launch</p>`;

const defaultOngoingMaintenanceSupport = `<h3>Monthly Support Plan: $2000/month</h3>
<p><strong>Available Starting:</strong> (after 45-day warranty)</p>
<p>This optional ongoing support plan ensures your system remains secure, up-to-date, and operating at peak performance.</p>

<h3>1. What's Included</h3>

<h4>Technical Support:</h4>
<ul>
  <li>Unlimited email and phone support during business hours</li>
  <li>Remote technical assistance</li>
  <li>Issue troubleshooting and resolution</li>
  <li>Bug fixes and patches</li>
  <li>Security updates</li>
  <li>System health monitoring</li>
</ul>

<h4>Minor Enhancements:</h4>
<p>Up to 10 hours per month of development time for:</p>
<ul>
  <li>Minor feature enhancements</li>
  <li>Report modifications</li>
  <li>Workflow adjustments</li>
  <li>UI/UX improvements</li>
  <li>Configuration changes</li>
</ul>

<h4>Proactive Services:</h4>
<ul>
  <li>Monthly system health check</li>
  <li>Quarterly security audit</li>
  <li>Annual disaster recovery test</li>
  <li>Capacity planning review</li>
  <li>Technology update recommendations</li>
</ul>

<h4>Priority Support:</h4>
<ul>
  <li>Priority response times (faster than warranty period)</li>
  <li>Dedicated account manager</li>
  <li>Direct access to development team</li>
  <li>Scheduled maintenance windows</li>
</ul>

<h4>Service Level Agreements:</h4>
<ul>
  <li><strong>Critical Issues:</strong> 1-hour response, 24/7</li>
  <li><strong>High Priority:</strong> 2-hour response, business hours</li>
  <li><strong>Medium Priority:</strong> 4-hour response</li>
  <li><strong>Low Priority:</strong> 1 business day</li>
</ul>

<h3>2. Support Hours Included</h3>

<h4>Monthly Allocation:</h4>
<ul>
  <li>Technical support: Unlimited</li>
  <li>Development/enhancement: 10 hours</li>
  <li>Proactive maintenance: 4 hours</li>
</ul>

<h4>Unused Hours:</h4>
<ul>
  <li>Roll over up to 10 hours (max 20 hours banked)</li>
  <li>Can be used for larger enhancements</li>
</ul>

<h4>Additional Hours:</h4>
<ul>
  <li>Available at $30/hour if the monthly allocation is exceeded</li>
  <li>Or purchase additional hour blocks at a discounted rate</li>
</ul>

<h3>3. Annual Contract Benefits</h3>

<h4>12-Month Commitment Discount:</h4>
<p><strong>Pay annually: $22000/year</strong></p>

<h4>Included with Annual Contract:</h4>
<ul>
  <li>Annual platform health assessment</li>
  <li>Priority feature roadmap input</li>
  <li>Complimentary emergency hotline access</li>
</ul>`;

const defaultInvoiceTerms = `<ul>
  <li><strong>Net 7 days from invoice date</strong></li>
  <li><strong>Payment methods:</strong> Wire transfer / Bank transfer</li>
  <li><strong>Review Period:</strong> The client has 10 business days to review milestone deliverables and provide acceptance or feedback. Payment follows acceptance per net terms.</li>
  <li><strong>Late payments:</strong> 1.5% per month interest on overdue balances; work may be paused for 30+ day delinquencies.</li>
</ul>`;

const defaultSourceCodeOwnership = `<p>Upon full payment of all project invoices:</p>
<ul>
  <li><strong>100% of the source code, documentation, builds, and deployment scripts</strong> will be handed over to the client.</li>
  <li>The client will have <strong>full rights to use, modify, extend, and host</strong> the platform without limitations.</li>
  <li><strong>Prometteur Solutions will retain no claim or ownership</strong> over the delivered software.</li>
  <li>Any third-party libraries remain governed by their respective licenses.</li>
</ul>
<p><em>This ensures complete transparency and long-term independence for the client.</em></p>`;

const defaultTerminationExit = `<p>In the event of termination of the agreement:</p>

<h3>1. By Client</h3>
<p>The client may terminate the contract by providing written notice in accordance with the agreed-upon terms. All completed and accepted milestones remain payable.</p>

<h3>2. By Vendor</h3>
<p>Prometteur Solutions may terminate only in cases of non-payment or contractual breach, with prior written notice.</p>

<h3>3. Exit Process</h3>
<ul>
  <li><strong>Full handover</strong> of source code, documentation, credentials, and deployment instructions</li>
  <li><strong>Assistance in migrating infrastructure</strong> to a third-party team or in-house IT (paid or included, depending on contract)</li>
  <li><strong>No lock-in or proprietary components</strong> that prevent independent continuation</li>
  <li><strong>Delivery of API docs, DB schemas, and architectural details</strong></li>
</ul>
<p><em>The goal is to ensure a clean, transparent, and smooth exit with minimal operational risk.</em></p>`;

const defaultCompanyOverview = `<p><strong>Prometteur Solutions Pvt. Ltd.</strong> is a global IT consulting and software development partner delivering secure, scalable digital products for startups, enterprises, and government organizations.</p>

<h3>Who We Are</h3>
<ul>
  <li>150+ in-house engineers, architects, designers, and QA specialists</li>
  <li>Headquarters in Pune, India, serving clients across <strong>North America, Europe, and the Middle East</strong></li>
  <li><strong>300+ successful projects</strong> delivered in:
    <ul>
      <li>HealthTech</li>
      <li>EdTech</li>
      <li>iGaming</li>
      <li>FinTech</li>
      <li>eCommerce</li>
      <li>Enterprise SaaS</li>
    </ul>
  </li>
</ul>

<h3>Mission</h3>
<p>To build secure, user-centered, future-ready digital platforms that drive operational excellence and measurable business impact.</p>

<h3>Vision</h3>
<p>To be the trusted technology partner for enterprises and startups seeking scalable, compliant, and innovative digital solutions.</p>

<h3>Core Values</h3>
<table>
  <thead>
    <tr>
      <th>Value</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Quality First</strong></td>
      <td>Clean engineering, best practices, and rigorous testing</td>
    </tr>
    <tr>
      <td><strong>Customer Success</strong></td>
      <td>Tailored, business-aligned solutions</td>
    </tr>
    <tr>
      <td><strong>Innovation</strong></td>
      <td>Latest technologies, scalable architectures</td>
    </tr>
    <tr>
      <td><strong>Efficiency</strong></td>
      <td>Optimized delivery processes</td>
    </tr>
    <tr>
      <td><strong>Integrity</strong></td>
      <td>Transparent, ethical, reliable collaboration</td>
    </tr>
  </tbody>
</table>`;

const authUser = localStorage.getItem('auth-user')
  ? JSON.parse(localStorage.getItem('auth-user')!) : null;

const emptyProposal: Omit<Proposal, 'createdAt' | 'updatedAt'> = {
  id: authUser?.id || '',
  title: '',
  clientId: undefined,
  userId: authUser?.id || '',
  externalPdf: null,
  externalPdfUrl: '',
  sections: defaultSections,
  companyOverview: defaultCompanyOverview,
  applicationDetails: '',
  scopeOfWork: defaultScopeOfWork,
  techStackAndEstimation: defaultTechStack,
  estimation: [],
  detailedPhaseBreakdown: defaultDetailedPhaseBreakdown,
  postLaunchSupport: defaultPostLaunchSupport,
  ongoingMaintenanceAndSupport: defaultOngoingMaintenanceSupport,
  team: [],
  deploymentStructure: defaultDeploymentStructure,
  sourceCodeOwnership: defaultSourceCodeOwnership,
  terminationAndExit: defaultTerminationExit,
  invoiceTerms: defaultInvoiceTerms,
  termsAndConditions: defaultTermsAndConditions,
  signatures: undefined,
  clientSignature: undefined,
  contactUs: defaultContactUs,
  projectOverview: '',
  shareToken: null,
  scope: '',
  phases: [],
  timeline: '',
  investment: '',
  status: 'draft',
  totalCost: 0,
};

export default function ProposalEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProposal, addProposal, updateProposal, fetchProposalById, proposals } = useProposals();
  const { clients } = useClients();

  const [formData, setFormData] = useState(emptyProposal);
  const [activeSection, setActiveSection] = useState<string | null>('companyOverview');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const isEditing = id && id !== 'new';

  useEffect(() => {
    if (!isEditing) return;

    // If proposals are not loaded yet, try to fetch the specific proposal
    const loadProposal = async () => {
      let proposal = getProposal(id!);

      if (!proposal && id) {
        // Try to fetch the proposal directly
        proposal = await fetchProposalById(id);
      }

        if (proposal) {
        const formData = {
          ...emptyProposal,
          ...proposal,
          // Ensure userId is always a string ID, not the full user object
          userId: typeof proposal.userId === 'string' ? proposal.userId :
            (proposal.userId && typeof proposal.userId === 'object' && 'id' in proposal.userId ?
              (proposal.userId as any).id : authUser?.id || ''),
          sections: { ...defaultSections, ...proposal.sections },
          techStackAndEstimation: {
            ...defaultTechStack,
            ...(proposal?.techStackAndEstimation as TechStackCategory || {})
          },
          // Ensure these fields are properly loaded from proposal
          estimationMilestones: proposal.estimation || [],
          team: proposal.team || [],
          signatures: proposal.signatures || undefined,
          clientSignature: proposal.clientSignature || undefined,
          // Handle PDF fields
          externalPdf: proposal.externalPdf || null,
          externalPdfUrl: proposal.externalPdfUrl || '',
          // Preserve all other rich content fields
          companyOverview: proposal.companyOverview || defaultCompanyOverview,
          applicationDetails: proposal.applicationDetails || '',
          scopeOfWork: proposal.scopeOfWork || defaultScopeOfWork,
          detailedPhaseBreakdown: proposal.detailedPhaseBreakdown || defaultDetailedPhaseBreakdown,
          postLaunchSupport: proposal.postLaunchSupport || defaultPostLaunchSupport,
          ongoingMaintenanceAndSupport: proposal.ongoingMaintenanceAndSupport || defaultOngoingMaintenanceSupport,
          deploymentStructure: proposal.deploymentStructure || defaultDeploymentStructure,
          sourceCodeOwnership: proposal.sourceCodeOwnership || defaultSourceCodeOwnership,
          terminationAndExit: proposal.terminationAndExit || defaultTerminationExit,
          invoiceTerms: proposal.invoiceTerms || defaultInvoiceTerms,
          termsAndConditions: proposal.termsAndConditions || defaultTermsAndConditions,
          contactUs: proposal.contactUs || defaultContactUs,
        };
        setFormData(formData);
      } else {
        navigate('/proposals');
      }
    };

    loadProposal();
  }, [id, isEditing, navigate]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        externalPdf: file,
        externalPdfUrl: url
      }));
    } else if (file) {
      toast.error('Please upload a PDF file only');
    }
  };

  const handleRemovePdf = () => {
    if (formData.externalPdfUrl) {
      URL.revokeObjectURL(formData.externalPdfUrl);
    }
    setFormData(prev => ({
      ...prev,
      externalPdf: null,
      externalPdfUrl: ''
    }));
  };

  const handleSectionToggle = (section: keyof ProposalSections) => {
    setFormData((prev) => ({
      ...prev,
      sections: { ...prev.sections, [section]: !prev.sections[section] },
    }));
  };

  // Team member functions
  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: generateUUID(),
      name: '',
      role: '',
      linkedinUrl: '',
      avatar: '',
    };
    handleChange('team', [...(formData.team || []), newMember]);
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...(formData.team || [])];
    updated[index] = { ...updated[index], [field]: value };
    handleChange('team', updated);
  };

  const removeTeamMember = (index: number) => {
    handleChange('team', (formData.team || []).filter((_, i) => i !== index));
  };

  const handleAvatarUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        toast.loading('Uploading photo...', { id: 'avatar-upload' });
        const result = await uploadFile(file);

        if (result.success && result.fileUrl) {
          updateTeamMember(index, 'avatar', result.fileUrl);
          toast.success('Photo uploaded successfully!', { id: 'avatar-upload' });
        } else {
          toast.error(result.error || 'Failed to upload photo', { id: 'avatar-upload' });
        }
      } catch (error) {
        console.error('Avatar upload error:', error);
        toast.error('Failed to upload photo', { id: 'avatar-upload' });
      }
    }
  };

  const totalCost =
    (formData?.estimation || []).reduce((sum, item) => {
      return sum + (Number(item.costInr) || 0);
    }, 0);


  // Estimation milestone functions
  const addMilestone = () => {
    const newMilestone: EstimationMilestone = {
      id: generateUUID(),
      milestone: '',
      description: '',
      duration: '',
      costInr: '',
      currency: 'INR',
      gst: '',
    };
    handleChange('estimation', [...(formData.estimation || []), newMilestone]);
  };

  const updateMilestone = (index: number, field: keyof EstimationMilestone, value: string) => {
    const updated = [...(formData.estimation || [])];
    updated[index] = { ...updated[index], [field]: value };
    handleChange('estimation', updated);
  };

  const removeMilestone = (index: number) => {
    handleChange('estimation', (formData.estimation || []).filter((_, i) => i !== index));
  };

  const handleTechStackChange = (field: keyof TechStackCategory, value: string) => {
    setFormData((prev) => ({
      ...prev,
      techStackAndEstimation: { ...prev.techStackAndEstimation, [field]: value },
    }));
  };

  const handleSignatureChange = (party: 'company' | 'client', signature: SignatureData) => {
    setFormData((prev) => ({
      ...prev,
      signatures: {
        ...prev.signatures,
        [party]: signature,
      } as ProposalSignatures,
    }));
  };

  const sectionValue = <T,>(
    enabled: boolean,
    value: T,
    empty: T
  ): T => {
    return enabled ? value : empty;
  };


  // Transform frontend Proposal format to API AddProposalPayload format
  const transformToAPIPayload = (proposalData: typeof formData) => {
    // If external PDF is uploaded, only send essential fields
    if (proposalData.externalPdf && proposalData.externalPdf instanceof File) {
      return {
        title: proposalData.title,
        clientId: proposalData.clientId!,
        userId: proposalData.userId!,
        externalPdf: proposalData.externalPdf,
      };
    }

    const s = proposalData.sections;


    return {
      title: proposalData.title,
      clientId: proposalData.clientId!,
      userId: proposalData.userId!,

      // companyOverview: proposalData.companyOverview,
      // applicationDetails: proposalData.applicationDetails,
      // scopeOfWork: proposalData.scopeOfWork,

      companyOverview: sectionValue(
        s.companyOverview,
        proposalData.companyOverview,
        ''
      ),

      applicationDetails: sectionValue(
        s.applicationDetails,
        proposalData.applicationDetails,
        ''
      ),

      scopeOfWork: sectionValue(
        s.scopeOfWork,
        proposalData.scopeOfWork,
        ''
      ),


      // Transform techStack and estimationMilestones to techStackAndEstimation
      // techStackAndEstimation: {
      //   frontend: proposalData.techStackAndEstimation.frontend,
      //   backend: proposalData.techStackAndEstimation.backend,
      //   database: proposalData.techStackAndEstimation.database,
      //   ui_ux: proposalData.techStackAndEstimation.ui_ux,
      //   estimation: proposalData.estimation.map(milestone => ({
      //     description: milestone.description,
      //     milestone: milestone.milestone,
      //     duration: milestone.duration,
      //     cost: parseFloat(milestone.costInr) || 0,
      //     currency: milestone.currency || 'INR',
      //     gst: parseFloat(milestone.gst) || 0,
      //   })),
      // },
      techStackAndEstimation: s.techStackEstimation
        ? {
          frontend: proposalData.techStackAndEstimation.frontend,
          backend: proposalData.techStackAndEstimation.backend,
          database: proposalData.techStackAndEstimation.database,
          ui_ux: proposalData.techStackAndEstimation.ui_ux,
          totalCost: proposalData.techStackAndEstimation.totalCost || 0,
          timeline: proposalData.techStackAndEstimation.timeline || '',
          estimation: proposalData.estimation.map(m => ({
            description: m.description,
            milestone: m.milestone,
            duration: m.duration,
            cost: parseFloat(m.costInr) || 0,
            currency: m.currency || 'INR',
            gst: parseFloat(m.gst) || 0,
          })),
        }
        : {
          frontend: '',
          backend: '',
          database: '',
          ui_ux: '',
          estimation: [],
          totalCost: 0,
          timeline: ''
        },

      // detailedPhaseBreakdown: proposalData.detailedPhaseBreakdown,
      // postLaunchSupport: proposalData.postLaunchSupport,
      // ongoingMaintenanceAndSupport: proposalData.ongoingMaintenanceAndSupport,

      detailedPhaseBreakdown: sectionValue(
        s.detailedPhaseBreakdown,
        proposalData.detailedPhaseBreakdown,
        ''
      ),

      postLaunchSupport: sectionValue(
        s.postLaunchSupport,
        proposalData.postLaunchSupport,
        ''
      ),

      ongoingMaintenanceAndSupport: sectionValue(
        s.ongoingMaintenanceAndSupport,
        proposalData.ongoingMaintenanceAndSupport,
        ''
      ),

      // Transform team to projectTeam
      // projectTeam: proposalData.team.map(member => ({
      //   name: member.name,
      //   role: member.role,
      //   avatarUrl: member.avatar,
      //   linkedinUrl: member.linkedinUrl,
      // })),

      projectTeam: s.projectTeam
        ? proposalData.team.map(member => ({
          name: member.name,
          role: member.role,
          avatarUrl: member.avatar,
          linkedinUrl: member.linkedinUrl,
        }))
        : [],

      // deploymentStructure: proposalData.deploymentStructure,
      // sourceCodeOwnership: proposalData.sourceCodeOwnership,
      // terminationAndExit: proposalData.terminationAndExit,

      deploymentStructure: sectionValue(
        s.deploymentStructure,
        proposalData.deploymentStructure,
        ''
      ),

      sourceCodeOwnership: sectionValue(
        s.sourceCodeOwnership,
        proposalData.sourceCodeOwnership,
        ''
      ),

      terminationAndExit: sectionValue(
        s.terminationAndExit,
        proposalData.terminationAndExit,
        ''
      ),

      termsAndConditions: sectionValue(
        s.termsAndConditions,
        proposalData.termsAndConditions,
        ''
      ),

      contactUs: sectionValue(
        s.contactUs,
        proposalData.contactUs,
        ''
      ),

      paymentTerms: sectionValue(
        s.invoiceTerms,
        proposalData.invoiceTerms,
        ''
      ),

      // Transform signatures to signature
      // signature: {
      //   company: proposalData.signatures?.company ? {
      //     mode: proposalData.signatures.company.type === 'draw' ? 'image' : 'typed',
      //     value: proposalData.signatures.company.data,
      //     signedAt: proposalData.signatures.company.signedAt || new Date().toISOString(),
      //   } : {
      //     mode: 'typed' as const,
      //     value: '',
      //     signedAt: new Date().toISOString(),
      //   },
      //   client: proposalData.signatures?.client ? {
      //     mode: proposalData.signatures.client.type === 'draw' ? 'image' : 'typed',
      //     value: proposalData.signatures.client.data,
      //     signedAt: proposalData.signatures.client.signedAt || new Date().toISOString(),
      //   } : {
      //     mode: 'typed' as const,
      //     value: '',
      //     signedAt: new Date().toISOString(),
      //   },
      // },

      signature: s.signature
        ? {
          company: proposalData.signatures?.company
            ? {
              mode:
                proposalData.signatures.company.type === 'draw'
                  ? 'image'
                  : 'typed',
              value: proposalData.signatures.company.data,
              signedAt:
                proposalData.signatures.company.signedAt ||
                new Date().toISOString(),
            }
            : {
              mode: 'typed' as const,
              value: '',
              signedAt: new Date().toISOString(),
            },

          client: proposalData.signatures?.client
            ? {
              mode:
                proposalData.signatures.client.type === 'draw'
                  ? 'image'
                  : 'typed',
              value: proposalData.signatures.client.data,
              signedAt:
                proposalData.signatures.client.signedAt ||
                new Date().toISOString(),
            }
            : {
              mode: 'typed' as const,
              value: '',
              signedAt: new Date().toISOString(),
            },
        }
        : null,


      // contactUs: proposalData.contactUs,
      // paymentTerms: proposalData.invoiceTerms,
      // paymentGateway: '',
      // paymentMethod: '',
    };
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    // Ensure a client is selected when saving to API
    if (!formData.clientId) {
      toast.error('Please select a client before saving');
      return;
    }

    try {
      const apiPayload = transformToAPIPayload(formData);

      if (isEditing) {
        await updateProposal(id!, apiPayload);
        toast.success('Proposal updated successfully');
        navigate('/proposals');
      } else {
        await addProposal(apiPayload);
        toast.success('Proposal created successfully');
        navigate('/proposals');
      }
    } catch (err) {
      console.error('Save failed', err);
      toast.error('Failed to save proposal');
    }
  };

  const handleUpdateProposal = (updatedData: any) => {
    setFormData(prev => ({
      ...prev,
      ...updatedData,
      // Preserve ALL existing data that might not be in the update form
      sections: prev.sections,
      techStackAndEstimation: prev?.techStackAndEstimation,
      team: prev.team,
      estimationMilestones: prev.estimation,
      signatures: prev.signatures,
      clientSignature: prev.clientSignature,
      companyOverview: prev.companyOverview,
      applicationDetails: prev.applicationDetails,
      scopeOfWork: prev.scopeOfWork,
      detailedPhaseBreakdown: prev.detailedPhaseBreakdown,
      postLaunchSupport: prev.postLaunchSupport,
      ongoingMaintenanceAndSupport: prev.ongoingMaintenanceAndSupport,
      deploymentStructure: prev.deploymentStructure,
      sourceCodeOwnership: prev.sourceCodeOwnership,
      terminationAndExit: prev.terminationAndExit,
      invoiceTerms: prev.invoiceTerms,
      termsAndConditions: prev.termsAndConditions,
      contactUs: prev.contactUs,
    }));

    if (isEditing) {
      const updatedFormData = {
        ...formData,
        ...updatedData
      };
      const apiPayload = transformToAPIPayload(updatedFormData);
      updateProposal(id, apiPayload);
      toast.success('Proposal details updated');
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'companyOverview':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Company Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.companyOverview}
                onChange={(content) => handleChange('companyOverview', content)}
                placeholder="Enter company overview..."
              />
            </CardContent>
          </Card>
        );

      case 'applicationDetails':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Application Development Details</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.applicationDetails}
                onChange={(content) => handleChange('applicationDetails', content)}
                placeholder="Enter application development details..."
              />
            </CardContent>
          </Card>
        );

      case 'scopeOfWork':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Scope of Work</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.scopeOfWork}
                onChange={(content) => handleChange('scopeOfWork', content)}
                placeholder="Define the scope of work..."
              />
            </CardContent>
          </Card>
        );

      case 'techStackEstimation':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tech Stack</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Frontend</Label>
                  <RichTextEditor
                    content={formData?.techStackAndEstimation?.frontend}
                    onChange={(content) => handleTechStackChange('frontend', content)}
                    placeholder="e.g., React, Next.js, TypeScript..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Backend</Label>
                  <RichTextEditor
                    content={formData?.techStackAndEstimation?.backend}
                    onChange={(content) => handleTechStackChange('backend', content)}
                    placeholder="e.g., Node.js, Express, Python..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Database</Label>
                  <RichTextEditor
                    content={formData?.techStackAndEstimation?.database}
                    onChange={(content) => handleTechStackChange('database', content)}
                    placeholder="e.g., PostgreSQL, MongoDB..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>UI/UX</Label>
                  <RichTextEditor
                    content={formData?.techStackAndEstimation?.ui_ux}
                    onChange={(content) => handleTechStackChange('ui_ux', content)}
                    placeholder="e.g., Figma, Tailwind CSS..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Estimation</CardTitle>
                <Button variant="outline" size="sm" onClick={addMilestone}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {(formData?.estimation || []).map((milestone, index) => (
                  <div key={milestone.id} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Milestone {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMilestone(index)}
                        className="text-destructive h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Milestone Name</Label>
                        <Input
                          value={milestone.milestone}
                          onChange={(e) => updateMilestone(index, 'milestone', e.target.value)}
                          placeholder="e.g., Phase 1 - Design"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input
                          value={milestone.duration}
                          onChange={(e) => updateMilestone(index, 'duration', e.target.value)}
                          placeholder="e.g., 2 weeks"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        placeholder="Brief description of this milestone"
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Cost</Label>
                        <Input
                          value={milestone.costInr}
                          // onChange={(e) => updateMilestone(index, 'costInr', e.target.value)}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (Number(value) >= 0) {
                              updateMilestone(index, "costInr", value);
                            }
                          }}
                          placeholder="e.g., 50000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select
                          value={milestone.currency}
                          onValueChange={(value) => updateMilestone(index, 'currency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>GST</Label>
                        <Input
                          value={milestone.gst}
                          onChange={(e) => updateMilestone(index, 'gst', e.target.value)}
                          placeholder="e.g., 18%"
                          disabled={milestone.currency === 'USD' || milestone.currency === 'EUR'}
                          className={milestone.currency === 'USD' || milestone.currency === 'EUR' ? 'bg-muted' : ''}
                        />
                        {(milestone.currency === 'USD' || milestone.currency === 'EUR') && (
                          <p className="text-xs text-muted-foreground">GST not applicable for USD/EUR</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {(formData.estimation || []).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No milestones added yet. Click "Add Milestone" to begin.
                  </p>
                )}
                {(formData.estimation || []).length > 0 && (
                  <div className="flex justify-center pt-4 border-t">
                    <Button variant="outline" onClick={addMilestone}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Milestone
                    </Button>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4 pt-6 border-t">

                  {/* Timeline Input */}
                  <div className="space-y-2">
                    <Label>Project Timeline</Label>
                    <Input
                      value={formData?.techStackAndEstimation?.timeline || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          techStackAndEstimation: {
                            ...formData.techStackAndEstimation,
                            timeline: e.target.value
                          }
                        })
                      }
                      placeholder="Enter the project timeline"
                    />
                  </div>

                  {/* Total Cost Display */}
                  <div className="space-y-2">
                    <Label>Total Cost</Label>
                    <Input
                      value={totalCost}
                      readOnly
                      className="bg-muted"
                    />
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'detailedPhaseBreakdown':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Phase Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.detailedPhaseBreakdown}
                onChange={(content) => handleChange('detailedPhaseBreakdown', content)}
                placeholder="Define the detailed phase breakdown for the project..."
              />
            </CardContent>
          </Card>
        );

      case 'postLaunchSupport':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Post Launch Support</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.postLaunchSupport}
                onChange={(content) => handleChange('postLaunchSupport', content)}
                placeholder="Define post-launch support terms..."
              />
            </CardContent>
          </Card>
        );

      case 'ongoingMaintenanceAndSupport':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Ongoing Maintenance and Support</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.ongoingMaintenanceAndSupport}
                onChange={(content) => handleChange('ongoingMaintenanceAndSupport', content)}
                placeholder="Define ongoing maintenance and support plans..."
              />
            </CardContent>
          </Card>
        );

      case 'projectTeam':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Project Team</CardTitle>
              <Button variant="outline" size="sm" onClick={addTeamMember}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {(formData.team || []).map((member, index) => (
                <div key={member.id} className="p-4 border rounded-lg space-y-4 bg-muted/30">
                  <div className="flex items-start justify-between gap-4">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="h-20 w-20 border-2 border-border">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-primary/10">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <Label className="cursor-pointer">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleAvatarUpload(index, e)}
                        />
                        <span className="text-xs text-primary hover:underline flex items-center gap-1">
                          <Upload className="h-3 w-3" />
                          Upload Photo
                        </span>
                      </Label>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Team Member {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTeamMember(index)}
                          className="text-destructive h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={member.name}
                            onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                            placeholder="e.g., John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Input
                            value={member.role}
                            onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                            placeholder="e.g., Project Manager"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                          LinkedIn Profile URL
                        </Label>
                        <Input
                          value={member.linkedinUrl || ''}
                          onChange={(e) => updateTeamMember(index, 'linkedinUrl', e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(formData.team || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No team members added yet. Click "Add Member" to begin.
                </p>
              )}
            </CardContent>
          </Card>
        );

      case 'deploymentStructure':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Deployment Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.deploymentStructure}
                onChange={(content) => handleChange('deploymentStructure', content)}
                placeholder="Define deployment structure and process..."
              />
            </CardContent>
          </Card>
        );

      case 'sourceCodeOwnership':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Source Code Ownership</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.sourceCodeOwnership}
                onChange={(content) => handleChange('sourceCodeOwnership', content)}
                placeholder="Define source code ownership terms..."
              />
            </CardContent>
          </Card>
        );

      case 'terminationAndExit':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Termination & Exit</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.terminationAndExit}
                onChange={(content) => handleChange('terminationAndExit', content)}
                placeholder="Define termination and exit terms..."
              />
            </CardContent>
          </Card>
        );

      case 'invoiceTerms':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Invoice Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.invoiceTerms}
                onChange={(content) => handleChange('invoiceTerms', content)}
                placeholder="Define invoice terms and payment conditions..."
              />
            </CardContent>
          </Card>
        );

      case 'termsAndConditions':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.termsAndConditions}
                onChange={(content) => handleChange('termsAndConditions', content)}
                placeholder="Enter terms and conditions..."
              />
            </CardContent>
          </Card>
        );

      case 'signature':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Signatures</CardTitle>
              <p className="text-sm text-muted-foreground">
                By signing below, both parties agree to the terms and conditions outlined in this proposal.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Signature */}
              <div className="p-4 border rounded-lg bg-muted/30">
                <SignaturePad
                  value={formData.signatures?.company}
                  onChange={(sig) => handleSignatureChange('company', sig)}
                  title="Prometteur Solutions Pvt. Ltd."
                  signerLabel="Authorized Signatory Name"
                />
              </div>

              <Separator />

              {/* Client Signature */}
              <div className="p-4 border rounded-lg bg-muted/30">
                <SignaturePad
                  value={formData.signatures?.client}
                  onChange={(sig) => handleSignatureChange('client', sig)}
                  title="Client Signature"
                  signerLabel="Client Name"
                  disabled={true} // 🔒 disabled when company signed

                />
              </div>
            </CardContent>
          </Card>
        );

      case 'contactUs':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.contactUs}
                onChange={(content) => handleChange('contactUs', content)}
                placeholder="Enter contact information..."
              />
            </CardContent>
          </Card>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Select a section from the sidebar to edit
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/proposals">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? 'Edit Proposal' : 'New Proposal'}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          {isEditing && (
            <>
              {/* <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsUpdateModalOpen(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Update Details
              </Button> */}
              <Button variant="outline" size="sm" asChild>
                <Link to={`/proposals/${id}/preview`} target="_blank">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Light Formal Theme */}
        <div className="w-80 border-r bg-muted/30 overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold text-foreground">Proposal Builder</h2>
            <p className="text-xs text-muted-foreground">Configure your proposal sections</p>
          </div>

          {/* Basic Info */}
          <div className="p-4 space-y-4 border-b">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Basic Information
            </h3>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm">Proposal Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Web Application Development"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client" className="text-sm">Client</Label>
              <Select
                value={formData.clientId || ''}
                onValueChange={(v) => handleChange('clientId', v || undefined)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.leadName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdf-upload" className="text-sm">Upload External PDF</Label>
              <div className="space-y-2">
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {formData.externalPdf ? 'Change PDF' : 'Upload PDF'}
                </Button>
                {formData.externalPdf && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground truncate">
                      {formData.externalPdf.name}
                    </p>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemovePdf}
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove PDF
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section Toggles - Hide when PDF is uploaded */}
          {!formData.externalPdf && (
            <div className="p-4">
              <SectionToggle
                sections={formData.sections}
                onToggle={handleSectionToggle}
                activeSection={activeSection}
                onSelectSection={setActiveSection}
              />
            </div>
          )}
        </div>

        {/* Main Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-4xl">
            {formData.externalPdf && formData.externalPdfUrl ? (
              <Card>
                <CardHeader>
                  <CardTitle>External PDF Preview</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    This proposal uses an external PDF file instead of the built-in sections.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-screen max-h-[800px] border rounded-lg overflow-hidden">
                    <iframe
                      src={formData.externalPdfUrl}
                      className="w-full h-full"
                      title="PDF Preview"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              renderSectionContent()
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
