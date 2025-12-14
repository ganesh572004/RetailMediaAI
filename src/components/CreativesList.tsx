'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, Share2, Edit, Trash2, MessageCircle, Mail, Facebook, Instagram, MessageSquare, Maximize2, ZoomIn, ZoomOut, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCreatives, deleteCreative } from '@/lib/storage';
import { useSession } from 'next-auth/react';

interface Creative {
  id: string;
  productName: string;
  brandName: string;
  imageData: string; // Data URL
  date: string;
  platform: string;
}

export const CreativesList = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [showShareModal, setShowShareModal] = useState<string | null>(null); // ID of creative to share
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const loadCreatives = async () => {
      if (userEmail) {
        try {
          const loaded = await getCreatives(userEmail);
          setCreatives(loaded);
        } catch (e) {
          console.error("Failed to load creatives", e);
        }
      }
    };
    loadCreatives();
  }, [userEmail]);

  const handleDelete = async (id: string) => {
    if (userEmail && confirm('Are you sure you want to delete this creative?')) {
      try {
        await deleteCreative(userEmail, id);
        const updated = await getCreatives(userEmail);
        setCreatives(updated);
      } catch (e) {
        console.error("Failed to delete creative", e);
      }
    }
  };

  const handleDownload = async (creative: Creative) => {
    try {
      const blob = await getPngBlob(creative.imageData);
      if (!blob) throw new Error("Failed to create image blob");
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${creative.productName.replace(/\s+/g, '-').toLowerCase()}-campaign.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Small delay to ensure download starts before revoking
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback to original method
      const link = document.createElement('a');
      link.href = creative.imageData;
      link.download = `${creative.productName}-campaign.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewImage = (creative: Creative) => {
    setSelectedImage(creative.imageData);
    setZoom(1);
  };

  const handleEdit = (creative: Creative) => {
    router.push(`/dashboard?edit=${creative.id}`);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));

  const getPngBlob = (dataURI: string): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      // Enable CORS if needed, though data URIs don't need it
      img.crossOrigin = "anonymous"; 
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            resolve(null);
            return;
        }
        
        // Fill white background to ensure compatibility with apps that don't handle transparency well
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(img, 0, 0);
        // Force conversion to PNG, which is the most compatible format for clipboard
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/png');
      };
      img.onerror = () => resolve(null);
      img.src = dataURI;
    });
  };

  const handleShare = async (platform: string, creative: Creative) => {
    const text = `Check out ${creative.productName} by ${creative.brandName}!`;
    
    // Download the image first as requested
    await handleDownload(creative);
    
    // Open the platform's specific URL immediately
    let url = '';
    switch (platform) {
      case 'whatsapp':
        // Universal link that works for both App (mobile) and Web (desktop)
        url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        // Messenger Web
        url = 'https://www.facebook.com/messages/t/';
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;
      case 'instagram':
        // Instagram Direct
        url = 'https://www.instagram.com/direct/inbox/';
        break;
      case 'mail':
        url = `mailto:?subject=Campaign: ${encodeURIComponent(creative.productName)}&body=${encodeURIComponent(text)}`;
        break;
      case 'message': // SMS
        url = `sms:?body=${encodeURIComponent(text)}`;
        break;
    }
    
    if (url) {
      if (platform === 'mail' || platform === 'message') {
        // Mailto and SMS links should be opened in the same window
        window.location.href = url;
      } else {
        // Open in new tab. 
        // Note: In some strict browsers (like Brave), opening a window after an async operation (clipboard)
        // might trigger a popup blocker. If that happens, the user will see a notification to allow popups.
        window.open(url, '_blank');
      }
    }
    
    setShowShareModal(null);
  };

  if (creatives.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No creatives saved yet.</p>
        <Button className="mt-4" onClick={() => router.push('/dashboard')}>
          Create Your First Campaign
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {creatives.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <div className="aspect-w-16 aspect-h-9 bg-muted h-48 flex items-center justify-center overflow-hidden relative group">
              <img src={item.imageData} alt={item.productName} className="object-cover w-full h-full" />
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} 
                    className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-red-100 text-red-600 shadow-sm"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
              </div>

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 backdrop-blur-[1px]">
                 <Button variant="secondary" size="sm" onClick={() => handleViewImage(item)} className="h-8 px-3">
                    <Maximize2 className="h-3 w-3 mr-1.5" /> View
                 </Button>
                 <Button variant="secondary" size="sm" onClick={() => handleEdit(item)} className="h-8 px-3">
                    <Edit className="h-3 w-3 mr-1.5" /> Edit
                 </Button>
              </div>
            </div>
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-lg font-medium text-foreground line-clamp-1">{item.productName}</h3>
                    <p className="text-sm text-muted-foreground">{item.brandName}</p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                    {item.platform}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Generated on {new Date(item.date).toLocaleDateString()}</p>
              
              <div className="mt-auto grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowShareModal(item.id)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button size="sm" onClick={() => handleDownload(item)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card-background border border-border rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-foreground">Share Creative</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
                <button onClick={() => handleShare('whatsapp', creatives.find(c => c.id === showShareModal)!)} className="flex flex-col items-center gap-2 p-2 hover:bg-muted/50 rounded transition-colors">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white"><MessageCircle size={20} /></div>
                    <span className="text-xs text-foreground">WhatsApp</span>
                </button>
                <button onClick={() => handleShare('instagram', creatives.find(c => c.id === showShareModal)!)} className="flex flex-col items-center gap-2 p-2 hover:bg-muted/50 rounded transition-colors">
                    <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white"><Instagram size={20} /></div>
                    <span className="text-xs text-foreground">Instagram</span>
                </button>
                <button onClick={() => handleShare('facebook', creatives.find(c => c.id === showShareModal)!)} className="flex flex-col items-center gap-2 p-2 hover:bg-muted/50 rounded transition-colors">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white"><Facebook size={20} /></div>
                    <span className="text-xs text-foreground">Facebook</span>
                </button>
                <button onClick={() => handleShare('mail', creatives.find(c => c.id === showShareModal)!)} className="flex flex-col items-center gap-2 p-2 hover:bg-muted/50 rounded transition-colors">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white"><Mail size={20} /></div>
                    <span className="text-xs text-foreground">Mail</span>
                </button>
                <button onClick={() => handleShare('message', creatives.find(c => c.id === showShareModal)!)} className="flex flex-col items-center gap-2 p-2 hover:bg-muted/50 rounded transition-colors">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white"><MessageSquare size={20} /></div>
                    <span className="text-xs text-foreground">Message</span>
                </button>
            </div>
            <Button variant="outline" className="w-full text-foreground" onClick={() => setShowShareModal(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Image View Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute top-4 right-4 flex gap-2 z-50">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} className="rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 border-0 w-10 h-10 p-0 shadow-lg">
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} className="rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 border-0 w-10 h-10 p-0 shadow-lg">
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedImage(null)} className="rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 border-0 w-10 h-10 p-0 shadow-lg">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div 
            className="relative w-full h-full flex items-center justify-center overflow-hidden p-4"
            onWheel={(e) => {
                if (e.deltaY < 0) handleZoomIn();
                else handleZoomOut();
            }}
          >
            <img 
              src={selectedImage} 
              alt="Full size" 
              className="max-w-none transition-transform duration-200 ease-out shadow-2xl rounded-lg"
              style={{ 
                transform: `scale(${zoom})`,
                maxHeight: zoom <= 1 ? '90vh' : 'none',
                maxWidth: zoom <= 1 ? '90vw' : 'none'
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
