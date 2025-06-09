"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScanLine, Upload, AlertCircle, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { extractDateFromImage, DateInfo, ExtractionResult } from '@/lib/ocr/dateExtractor';
import { cn } from '@/lib/utils';

interface IdScannerProps {
  onDateExtracted: (dateInfo: DateInfo) => void;
}

export const IdScanner = ({ onDateExtracted }: IdScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    
    // Reset state
    setScanning(true);
    setProgress(0);
    setError(null);
    setExtractionResult(null);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
        }
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 100);
    
    try {
      // Extract date from the image
      const result = await extractDateFromImage(file);
      setExtractionResult(result);
      
      if (result.success && result.dateInfo) {
        onDateExtracted(result.dateInfo);
      } else {
        setError(result.error || "Failed to extract date from the ID");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setScanning(false);
    }
  }, [onDateExtracted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    disabled: scanning
  });

  return (
    <div className="space-y-6">
      <Card className={cn(
        "border-2 border-dashed transition-colors duration-200",
        isDragActive ? "border-primary" : "border-border",
        scanning && "opacity-50"
      )}>
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className="flex flex-col items-center justify-center p-8 text-center cursor-pointer relative overflow-hidden"
          >
            <input {...getInputProps()} />
            
            {previewUrl ? (
              <div className="w-full aspect-[3/2] relative">
                <img 
                  src={previewUrl} 
                  alt="ID preview" 
                  className="w-full h-full object-contain"
                />
                {scanning && (
                  <div 
                    className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse"
                    style={{
                      transform: `translateY(${(progress / 100) * 100}%)`,
                      transition: 'transform 0.2s ease-out'
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="py-12">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-1">Upload your ID document</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Drag and drop or click to upload an ID card or passport. We'll scan for your birth date.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {scanning && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm">Scanning document...</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Error scanning document</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      )}

      {extractionResult?.success && extractionResult.dateInfo && (
        <div className="bg-primary/10 p-3 rounded-md flex items-start gap-2">
          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Birth date successfully extracted</p>
            <p className="text-xs text-muted-foreground mt-1">
              Date: {extractionResult.dateInfo.month}/{extractionResult.dateInfo.day}/{extractionResult.dateInfo.year}
            </p>
          </div>
        </div>
      )}

      {previewUrl && !scanning && (
        <Button 
          onClick={() => {
            setPreviewUrl(null);
            setExtractionResult(null);
            setError(null);
          }}
          variant="outline"
        >
          Scan a different document
        </Button>
      )}
    </div>
  );
};