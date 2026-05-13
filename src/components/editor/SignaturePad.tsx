import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignatureData } from '@/types/proposal';
import { Eraser, Check, Pen, Type, Upload, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '@/services/fileUpload';
import { toast } from 'sonner';

interface SignaturePadProps {
  value?: SignatureData;
  onChange: (signature: SignatureData) => void;
  disabled?: boolean;
  title?: string;
  signerLabel?: string;
}

export function SignaturePad({ value, onChange, disabled = false, title = "Signature", signerLabel = "Full Name" }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedName, setTypedName] = useState(value?.type === 'type' ? value.data : '');
  const [activeTab, setActiveTab] = useState<'image' | 'typed' | 'upload'>(value?.mode || 'image');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if this is Prometteur company signature (show upload tab only for Prometteur)
  const isPrometteurSignature = title.toLowerCase().includes('prometteur') || signerLabel.toLowerCase().includes('authorized');
  const showUploadTab = isPrometteurSignature;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1a365d';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (value?.type === 'draw' && value.data) {
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.crossOrigin = 'anonymous'; // Handle cross-origin images
      img.src = value.data;
    }
  }, [value?.data]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      toast.loading('Uploading signature...', { id: 'signature-upload' });
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Failed to create signature file', { id: 'signature-upload' });
          return;
        }

        // Create file from blob
        const file = new File([blob], `signature-${Date.now()}.png`, { type: 'image/png' });
        
        // Upload to API
        const result = await uploadFile(file);
        
        if (result.success && result.fileUrl) {
          onChange({
            type: 'draw',
            mode: 'image',
            data: result.fileUrl, // Store file URL instead of base64
            signedAt: new Date().toISOString(),
          });
          toast.success('Signature uploaded successfully!', { id: 'signature-upload' });
        } else {
          toast.error(result.error || 'Failed to upload signature', { id: 'signature-upload' });
        }
      }, 'image/png');
    } catch (error) {
      console.error('Signature upload error:', error);
      toast.error('Failed to upload signature', { id: 'signature-upload' });
    }
  };

  const saveTypedSignature = () => {
    if (!typedName.trim()) return;

    onChange({
      type: 'type',
      mode: 'typed',
      data: typedName.trim(),
      signerName: typedName.trim(),
      signedAt: new Date().toISOString(),
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      toast.loading('Uploading signature...', { id: 'signature-file-upload' });
      
      const result = await uploadFile(file);
      
      if (result.success && result.fileUrl) {
        onChange({
          type: 'draw',
          mode: 'image',
          data: result.fileUrl,
          signedAt: new Date().toISOString(),
        });
        toast.success('Signature uploaded successfully!', { id: 'signature-file-upload' });
      } else {
        toast.error(result.error || 'Failed to upload signature', { id: 'signature-file-upload' });
      }
    } catch (error) {
      console.error('Signature file upload error:', error);
      toast.error('Failed to upload signature', { id: 'signature-file-upload' });
    }

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">{title}</h4>
        {value?.signedAt && value?.data && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Signed on {new Date(value.signedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'image' | 'typed' | 'upload')}>
        <TabsList className={`grid w-full ${showUploadTab ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="image" disabled={disabled} className="flex items-center gap-2">
            <Pen className="h-4 w-4" />
            Draw
          </TabsTrigger>
          {showUploadTab && (
            <TabsTrigger value="upload" disabled={disabled} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          )}
          <TabsTrigger value="typed" disabled={disabled} className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Type
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image" className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-2 bg-white">
            <canvas
              ref={canvasRef}
              width={500}
              height={150}
              className="w-full h-32 cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              disabled={disabled}
            >
              <Eraser className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={saveDrawSignature}
              disabled={disabled}
            >
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </TabsContent>

        {showUploadTab && (
        <TabsContent value="upload" className="space-y-4">
          <div className="space-y-2">
            <Label>Upload Signature Image</Label>
            <p className="text-sm text-muted-foreground">
              Upload a scanned signature or signature image file (JPG, PNG, GIF, or WebP, max 5MB)
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileUpload}
            disabled={disabled}
            className="hidden"
          />
          
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            {value?.type === 'draw' && value?.data && value?.data.startsWith('http') ? (
              <div className="space-y-4">
                <div className="max-w-xs mx-auto">
                  <img 
                    src={value.data} 
                    alt="Uploaded signature" 
                    className="w-full h-auto max-h-24 object-contain border rounded bg-white"
                  />
                </div>
                <p className="text-sm text-green-600 font-medium">Signature uploaded successfully</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  disabled={disabled}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Replace Image
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Click to upload signature image</p>
                  <p className="text-xs text-muted-foreground">or drag and drop</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  disabled={disabled}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        )}

        <TabsContent value="typed" className="space-y-4">
          <div className="space-y-2">
            <Label>{signerLabel}</Label>
            <Input
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Enter full name"
              disabled={disabled}
              className="text-lg bg-white"
            />
          </div>
          {typedName && (
            <div className="border-2 border-dashed border-border rounded-lg p-4 bg-white">
              <p 
                className="text-2xl text-center"
                style={{ fontFamily: 'cursive, "Dancing Script", serif', color: '#1a365d' }}
              >
                {typedName}
              </p>
            </div>
          )}
          <Button
            type="button"
            size="sm"
            onClick={saveTypedSignature}
            disabled={disabled || !typedName.trim()}
          >
            <Check className="h-4 w-4 mr-2" />
            Save
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
