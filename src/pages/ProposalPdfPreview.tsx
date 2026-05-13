import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { viewPdfAPI } from '@/services/auth_service';

export default function ProposalPdfPreview() {
  const { id, category } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposalTitle, setProposalTitle] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    fetchPdfData();
  }, [id]);

  const fetchPdfData = async () => {
    try {
      setLoading(true);
      console.log('Fetching PDF for proposal ID:', id);
      const response = await viewPdfAPI(id);
      console.log('PDF API response:', response);
      
      // Handle raw PDF response
      if (response?.status === 200) {
        // The API returns raw PDF data as ArrayBuffer
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        setProposalTitle('External Proposal');
        console.log('PDF Blob URL created:', url);
        console.log('Response status:', response.status);
        console.log('Response data type:', typeof response.data);
        console.log('Is ArrayBuffer:', response.data instanceof ArrayBuffer);
        console.log('Data length:', response.data?.byteLength || 'unknown');
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
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!pdfUrl) return;
    
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${proposalTitle}.pdf`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading PDF...</span>
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">PDF Not Available</h2>
            <p className="text-muted-foreground">The external PDF for this proposal could not be loaded.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="max-w-6xl mx-auto">
        <CardContent className="p-0">
          <div className="w-full h-screen">
            <iframe
              src={pdfUrl}
              title={proposalTitle}
              className="w-full h-full border-0"
              style={{ minHeight: '800px' }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
