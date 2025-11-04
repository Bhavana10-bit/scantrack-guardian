import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OCRUploadProps {
  teacherId: string;
  onScanComplete?: () => void;
}

export const OCRUpload = ({ teacherId, onScanComplete }: OCRUploadProps) => {
  const [className, setClassName] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { toast } = useToast();

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      setPreviewImage(base64);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Error",
        description: "Failed to read the image file",
        variant: "destructive",
      });
    }
  };

  const handleProcessOCR = async () => {
    if (!className || !previewImage || !attendanceDate) {
      toast({
        title: "Missing information",
        description: "Please provide class name, date, and upload an image",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-ocr', {
        body: {
          imageBase64: previewImage,
          teacherId,
          className,
          attendanceDate,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success!",
          description: `Processed ${data.recordsCount} attendance records`,
        });
        setPreviewImage(null);
        setClassName("");
        setAttendanceDate(new Date().toISOString().split('T')[0]);
        onScanComplete?.();
      } else {
        throw new Error(data.error || 'Failed to process OCR');
      }
    } catch (error) {
      console.error('Error processing OCR:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process attendance sheet",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="shadow-elegant border-border/50">
      <CardHeader>
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
          <Camera className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Scan Attendance Sheet</CardTitle>
        <CardDescription>
          Upload a photo of handwritten attendance to automatically extract and store records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="className">Class Name</Label>
            <Input
              id="className"
              placeholder="e.g., Mathematics 101"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attendanceDate">Date</Label>
            <Input
              id="attendanceDate"
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUpload">Upload Attendance Sheet</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-smooth">
            <Input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="hidden"
            />
            <label
              htmlFor="imageUpload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </span>
            </label>
          </div>
        </div>

        {previewImage && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <img
              src={previewImage}
              alt="Preview"
              className="w-full rounded-lg border border-border"
            />
          </div>
        )}

        <Button
          onClick={handleProcessOCR}
          disabled={!className || !previewImage || !attendanceDate || isProcessing}
          className="w-full"
          variant="hero"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Process Attendance"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};