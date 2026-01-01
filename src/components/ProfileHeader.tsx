'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { User, Camera, Image as ImageIcon, X, Check, Crop as CropIcon, Upload, Globe, Flower, Smile } from 'lucide-react';
import { saveUserProfile, getUserProfile } from '@/lib/storage';

const GALLERY_CATEGORIES = [
  {
    id: 'scenery',
    name: 'Scenery',
    icon: <ImageIcon className="w-4 h-4" />,
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop',
    ]
  },
  {
    id: 'places',
    name: 'Famous Places',
    icon: <Globe className="w-4 h-4" />,
    images: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=400&fit=crop', // Taj Mahal
      'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=400&fit=crop', // Machu Picchu
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=400&fit=crop', // Colosseum
      'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=400&h=400&fit=crop', // Big Ben
      'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?w=400&h=400&fit=crop', // Statue of Liberty
      'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=400&h=400&fit=crop', // Pyramids
      'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=400&h=400&fit=crop', // Eiffel Tower
      'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=400&fit=crop', // Great Wall
    ]
  },
  {
    id: 'flowers',
    name: 'Flowers',
    icon: <Flower className="w-4 h-4" />,
    images: [
      'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=400&h=400&fit=crop', // Rose
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&h=400&fit=crop', // Sunflower
      'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400&h=400&fit=crop', // Tulip
      'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=400&h=400&fit=crop', // Daisy
      'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=400&fit=crop', // Cherry Blossom
      'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=400&h=400&fit=crop', // Lavender
    ]
  },
  {
    id: 'avatars',
    name: 'Avatars',
    icon: <Smile className="w-4 h-4" />,
    images: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
      'https://api.dicebear.com/7.x/bottts/svg?seed=Robot',
      'https://api.dicebear.com/7.x/micah/svg?seed=Smile',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Adventure',
      'https://api.dicebear.com/7.x/lorelei/svg?seed=Lorelei',
    ]
  }
];

export const ProfileHeader = ({ user }: { user: any }) => {
  const [profileImage, setProfileImage] = useState(user?.image);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'camera' | 'upload'>('gallery');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Crop state
  const [isCropping, setIsCropping] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const cropImageRef = useRef<HTMLImageElement>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [displayName, setDisplayName] = useState(user?.name || 'User');
  const [displayEmail, setDisplayEmail] = useState(user?.email || '');
  const [displayRole, setDisplayRole] = useState('Member');

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.email) {
        const savedProfile = await getUserProfile(user.email);
        if (savedProfile?.image) {
          setProfileImage(savedProfile.image);
        }
        if (savedProfile?.name) {
          setDisplayName(savedProfile.name);
        } else if (user.name) {
          setDisplayName(user.name);
        }
        if (savedProfile?.role) {
          setDisplayRole(savedProfile.role);
        }
      }
    };
    loadProfile();
  }, [user?.email, user?.name]);  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, activeTab]);

  const handleStartCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const handleStopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setSelectedImage(dataUrl);
        handleStopCamera();
        setIsCropping(true);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    // Simple crop implementation: Draw the visible area of the image to a new canvas
    if (cropImageRef.current) {
      const img = cropImageRef.current;

      // Check if image is loaded and valid to prevent InvalidStateError
      if (!img.complete || img.naturalWidth === 0) {
        console.warn("Image not loaded yet or broken");
        return;
      }

      const canvas = document.createElement('canvas');
      const size = 400; // Output size
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Calculate source rectangle based on zoom and offset
        // This is a simplified approximation for the demo
        // In a real app, we'd do precise math mapping the DOM coordinates to image coordinates
        
        // For now, we'll just use the image as is if not perfectly implemented, 
        // but let's try to respect the transform
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        
        // Draw image centered and scaled
        const scale = cropZoom;
        const x = cropOffset.x + (size - img.width * scale) / 2;
        const y = cropOffset.y + (size - img.height * scale) / 2;
        
        try {
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        } catch (e) {
            console.error("Error drawing image:", e);
            alert("Failed to process image. Please try another one.");
            return;
        }
        
        // In a real robust implementation, we would crop the actual source pixels
        // Here we are just drawing the transformed image onto a fixed canvas size
        // which effectively "crops" it to the view
        
        const croppedUrl = canvas.toDataURL('image/png');
        setProfileImage(croppedUrl);
        
        if (user?.email) {
            try {
                await saveUserProfile(user.email, { image: croppedUrl });
                console.log('Profile photo saved successfully');
                // Dispatch event to update Navbar
                window.dispatchEvent(new Event('profile-updated'));
            } catch (error) {
                console.error('Failed to save profile photo:', error);
                alert('Failed to save profile photo. Please try again.');
            }
        }
        
        setShowModal(false);
        setIsCropping(false);
        setSelectedImage(null);
        
        // Reset crop state
        setCropZoom(1);
        setCropOffset({ x: 0, y: 0 });
      }
    }
  };

  // Drag logic for crop
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      setCropOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    return () => {
      handleStopCamera();
    };
  }, []);

  return (
    <>
      <Card className="mb-6">
        <CardContent className="flex flex-col sm:flex-row items-center p-6 gap-4 sm:gap-6">
          <div className="h-24 w-24 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden border-4 border-background shadow-lg relative group transition-colors duration-500">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User className="h-12 w-12" />
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setShowModal(true)}>
                <Camera className="text-white h-6 w-6" />
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
            <p className="text-muted-foreground">{displayEmail}</p>
            <div className="mt-2 flex gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Active
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {displayRole}
                </span>
            </div>
          </div>
          <div className="sm:ml-auto w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowModal(true)}>Edit Photo</Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Photo Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card-background rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-border transition-colors duration-500">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Update Profile Photo</h3>
              <button onClick={() => { setShowModal(false); handleStopCamera(); }} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isCropping && selectedImage ? (
                <div className="space-y-4">
                    <div className="text-center mb-4">
                        <h4 className="font-medium text-foreground">Crop & Adjust</h4>
                        <p className="text-sm text-muted-foreground">Drag to move, use slider to zoom</p>
                    </div>
                    
                    <div className="relative h-80 w-full bg-muted rounded-lg overflow-hidden cursor-move flex items-center justify-center border-2 border-dashed border-border"
                         onMouseDown={handleMouseDown}
                         onMouseMove={handleMouseMove}
                         onMouseUp={handleMouseUp}
                         onMouseLeave={handleMouseUp}
                    >
                        {/* Circular Mask Overlay */}
                        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                            <div className="w-64 h-64 rounded-full border-4 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
                        </div>
                        
                        <img 
                            ref={cropImageRef}
                            src={selectedImage} 
                            alt="Crop target" 
                            crossOrigin="anonymous"
                            className="max-w-none transition-transform duration-75"
                            style={{
                                transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`
                            }}
                            draggable={false}
                        />
                    </div>

                    <div className="flex items-center gap-4 px-4">
                        <span className="text-sm font-medium text-foreground">Zoom</span>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="3" 
                            step="0.1" 
                            value={cropZoom}
                            onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                            className="flex-1"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => { 
                            setIsCropping(false);
                            if (activeTab === 'camera') handleStartCamera();
                        }}>Back</Button>
                        <Button onClick={handleCropSave}>Save Photo</Button>
                    </div>
                </div>
              ) : (
                <>
                  {/* Tabs */}
                  <div className="flex gap-2 mb-6 border-b border-border">
                    <button 
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'gallery' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => { handleStopCamera(); setActiveTab('gallery'); }}
                    >
                        Gallery
                    </button>
                    <button 
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'camera' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => { setActiveTab('camera'); handleStartCamera(); }}
                    >
                        Camera
                    </button>
                    <button 
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'upload' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => { handleStopCamera(); setActiveTab('upload'); }}
                    >
                        Upload
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[300px]">
                    {activeTab === 'gallery' && (
                        <div className="space-y-6">
                            {GALLERY_CATEGORIES.map((category) => (
                                <div key={category.id}>
                                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                        {category.icon} {category.name}
                                    </h4>
                                    <div className="grid grid-cols-4 gap-3">
                                        {category.images.map((img, idx) => (
                                            <button 
                                                key={idx}
                                                className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all group"
                                                onClick={() => {
                                                    setSelectedImage(img);
                                                    setIsCropping(true);
                                                }}
                                            >
                                                <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'camera' && (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                            <Button onClick={handleCapture} className="w-full max-w-md">
                                <Camera className="mr-2 h-4 w-4" /> Capture Photo
                            </Button>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer relative">
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileUpload}
                            />
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Upload className="h-8 w-8" />
                                </div>
                                <h4 className="text-lg font-medium text-foreground">Click to upload</h4>
                                <p className="text-sm text-muted-foreground mt-1">SVG, PNG, JPG or GIF (5MB - 10MB)</p>
                            </div>
                        </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
