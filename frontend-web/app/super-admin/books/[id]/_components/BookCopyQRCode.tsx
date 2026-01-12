'use client';

import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface BookCopyQRCodeProps {
  barcode: string;
  callNumber?: string;
  bookTitle?: string;
}

export function BookCopyQRCode({ barcode, callNumber, bookTitle }: BookCopyQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    try {
      const canvas = qrRef.current?.querySelector('canvas');
      if (!canvas) {
        toast.error('QR Code tidak ditemukan');
        return;
      }

      // Create a new canvas with padding and text
      const newCanvas = document.createElement('canvas');
      const ctx = newCanvas.getContext('2d');
      if (!ctx) return;

      const padding = 40;
      const textHeight = 80;
      const qrSize = canvas.width;
      
      newCanvas.width = qrSize + (padding * 2);
      newCanvas.height = qrSize + (padding * 2) + textHeight;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

      // Draw QR code
      ctx.drawImage(canvas, padding, padding);

      // Add text below QR code
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      
      // Book title (if available)
      if (bookTitle) {
        ctx.font = 'bold 16px Arial';
        const maxWidth = newCanvas.width - (padding * 2);
        const titleText = bookTitle.length > 40 ? bookTitle.substring(0, 40) + '...' : bookTitle;
        ctx.fillText(titleText, newCanvas.width / 2, qrSize + padding + 25, maxWidth);
      }

      // Barcode
      ctx.font = 'bold 18px monospace';
      ctx.fillText(barcode, newCanvas.width / 2, qrSize + padding + (bookTitle ? 50 : 30));

      // Call number (if available)
      if (callNumber) {
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText(callNumber, newCanvas.width / 2, qrSize + padding + (bookTitle ? 70 : 50));
      }

      // Convert to blob and download
      newCanvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Gagal membuat QR Code');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `QR-${barcode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('QR Code berhasil didownload');
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Gagal mendownload QR Code');
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        ref={qrRef}
        className="p-4 bg-white rounded-lg border-2 border-emerald-200 shadow-sm"
      >
        <QRCodeCanvas
          value={barcode}
          size={160}
          level="H"
          includeMargin={false}
        />
      </div>
      
      <div className="text-center">
        <p className="text-xs font-medium text-gray-500 mb-1">BARCODE</p>
        <p className="font-mono font-bold text-sm">{barcode}</p>
        {callNumber && (
          <p className="text-xs text-gray-500 mt-1">{callNumber}</p>
        )}
      </div>

      <Button
        onClick={downloadQRCode}
        variant="outline"
        size="sm"
        className="w-full hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
      >
        <Download className="h-4 w-4 mr-2" />
        Download QR Code
      </Button>
    </div>
  );
}
