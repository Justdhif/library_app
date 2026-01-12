'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Quagga from '@ericblade/quagga2';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      setIsScanning(true);
      
      if (!videoRef.current) return;

      await Quagga.init({
        inputStream: {
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment"
          },
        },
        decoder: {
          readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader"]
        },
      }, (err) => {
        if (err) {
          console.error(err);
          toast.error('Gagal mengakses kamera');
          setIsScanning(false);
          return;
        }
        Quagga.start();
      });

      Quagga.onDetected((result) => {
        if (result.codeResult.code) {
          toast.success('Barcode berhasil di-scan!');
          onScan(result.codeResult.code);
          stopCamera();
        }
      });

    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Gagal mengakses kamera');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    Quagga.stop();
    setIsScanning(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    try {
      setIsProcessing(true);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageSrc = event.target?.result as string;
        
        await Quagga.decodeSingle({
          src: imageSrc,
          numOfWorkers: 0,
          decoder: {
            readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader"]
          },
        }, (result) => {
          if (result && result.codeResult && result.codeResult.code) {
            toast.success('Barcode berhasil di-scan!');
            onScan(result.codeResult.code);
          } else {
            toast.error('Barcode tidak terdeteksi. Pastikan gambar jelas dan merupakan barcode 1D (bukan QR code).');
          }
          setIsProcessing(false);
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File scan error:', error);
      toast.error('Gagal memproses gambar');
      setIsProcessing(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Scan Barcode</Label>
          {isScanning && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={stopCamera}
            >
              <X className="h-4 w-4 mr-1" />
              Stop
            </Button>
          )}
        </div>

        {isScanning ? (
          <div className="space-y-3">
            <div 
              ref={videoRef} 
              className="relative w-full h-64 bg-black rounded-lg overflow-hidden"
            />
            <p className="text-sm text-muted-foreground text-center">
              Arahkan kamera ke barcode
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={startCamera}
              disabled={isProcessing}
              className="h-24 flex flex-col gap-2"
            >
              <Camera className="h-6 w-6" />
              <span className="text-sm">Scan dengan Kamera</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="h-24 flex flex-col gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm">Memproses...</span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">Upload Gambar</span>
                </>
              )}
            </Button>

            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Mendukung Barcode 1D (Code 128, EAN, Code 39). Scan barcode pada buku atau upload foto barcode.
        </p>
      </CardContent>
    </Card>
  );
}
