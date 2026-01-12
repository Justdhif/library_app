'use client';

import { useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { Button } from '@/components/ui/button';
import { Download, Barcode } from 'lucide-react';
import { toast } from 'sonner';

interface BookCopyBarcodeProps {
  barcode: string;
  callNumber?: string;
  bookTitle?: string;
}

export function BookCopyBarcode({ barcode, callNumber, bookTitle }: BookCopyBarcodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      try {
        JsBarcode(canvasRef.current, barcode, {
          format: "CODE128",
          width: 1.5,
          height: 40,
          displayValue: false,
          margin: 5,
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [barcode]);

  const downloadBarcode = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        toast.error('Barcode tidak ditemukan');
        return;
      }

      // Create a new canvas with padding and text
      const newCanvas = document.createElement('canvas');
      const ctx = newCanvas.getContext('2d');
      if (!ctx) return;

      const padding = 40;
      const textHeight = 100;
      const barcodeWidth = canvas.width;
      const barcodeHeight = canvas.height;
      
      newCanvas.width = barcodeWidth + (padding * 2);
      newCanvas.height = barcodeHeight + (padding * 2) + textHeight;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

      // Draw barcode
      ctx.drawImage(canvas, padding, padding);

      // Add text below barcode
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      
      // Book title (if available)
      if (bookTitle) {
        ctx.font = 'bold 16px Arial';
        const maxWidth = newCanvas.width - (padding * 2);
        const titleText = bookTitle.length > 40 ? bookTitle.substring(0, 40) + '...' : bookTitle;
        ctx.fillText(titleText, newCanvas.width / 2, barcodeHeight + padding + 25, maxWidth);
      }

      // Barcode text
      ctx.font = 'bold 18px monospace';
      ctx.fillText(barcode, newCanvas.width / 2, barcodeHeight + padding + (bookTitle ? 50 : 30));

      // Call number (if available)
      if (callNumber) {
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText(callNumber, newCanvas.width / 2, barcodeHeight + padding + (bookTitle ? 70 : 50));
      }

      // Convert to blob and download
      newCanvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Gagal membuat barcode');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `BOOK${barcode}-${callNumber || 'copy'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Barcode berhasil didownload');
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading barcode:', error);
      toast.error('Gagal mendownload barcode');
    }
  };

  return (
    <div className="relative bg-linear-to-br from-gray-50 to-emerald-50/30 rounded-lg border border-emerald-100 p-3 hover:shadow-md transition-all duration-200">
      {/* Barcode Canvas */}
      <div className="bg-white rounded-md p-2 mb-2 border border-gray-200 overflow-hidden">
        <canvas ref={canvasRef} className="mx-auto max-w-full h-auto" />
      </div>
      
      {/* Barcode Info */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Barcode</span>
          <Button
            onClick={downloadBarcode}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs hover:bg-emerald-100 hover:text-emerald-700"
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
        <p className="font-mono font-bold text-xs text-gray-900">{barcode}</p>
        {callNumber && (
          <p className="text-[10px] text-gray-500 font-medium">{callNumber}</p>
        )}
      </div>
    </div>
  );
}
