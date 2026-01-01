'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Upload, Wand2, CheckCircle, Image as ImageIcon, Loader2, Download, Save, RotateCcw } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveCreative, getCreativeById, saveAutosave, getAutosave } from '@/lib/storage';
import { useSession } from 'next-auth/react';

export const DashboardForm = () => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const [productName, setProductName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('Brand Awareness');
  const [targetPlatform, setTargetPlatform] = useState('Instagram');
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop');
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  
  // Image Editing State
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [adTemplate, setAdTemplate] = useState('none');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get('edit');

  useEffect(() => {
    const loadCreative = async () => {
      if (editId && userEmail) {
        try {
          const creative = await getCreativeById(userEmail, editId);
          if (creative) {
            setProductName(creative.productName);
            setBrandName(creative.brandName);
            setTargetPlatform(creative.platform);
            setGeneratedResult(creative.imageData);
            setUploadedImage(creative.imageData); 
            if (creative.brightness) setBrightness(creative.brightness);
            if (creative.contrast) setContrast(creative.contrast);
            if (creative.saturation) setSaturation(creative.saturation);
            if (creative.adTemplate) setAdTemplate(creative.adTemplate);
          }
        } catch (e) {
          console.error("Error loading creative", e);
        }
      }
    };
    loadCreative();
  }, [editId, userEmail]);

  // Load autosave if not editing
  useEffect(() => {
    const loadAutosave = async () => {
      if (!editId && userEmail) {
        try {
          const data: any = await getAutosave(userEmail);
          if (data) {
            if (data.productName) setProductName(data.productName);
            if (data.brandName) setBrandName(data.brandName);
            if (data.campaignGoal) setCampaignGoal(data.campaignGoal);
            if (data.targetPlatform) setTargetPlatform(data.targetPlatform);
            if (data.uploadedImage) setUploadedImage(data.uploadedImage);
            if (data.generatedResult) setGeneratedResult(data.generatedResult);
            if (data.brightness) setBrightness(data.brightness);
            if (data.contrast) setContrast(data.contrast);
            if (data.saturation) setSaturation(data.saturation);
            if (data.adTemplate) setAdTemplate(data.adTemplate);
          }
        } catch (e) {
          console.error("Error loading autosave", e);
        }
      }
    };
    loadAutosave();
  }, [editId, userEmail]);
  // Autosave changes
  useEffect(() => {
    if (!userEmail) return;
    const autosaveData = {
      productName,
      brandName,
      campaignGoal,
      targetPlatform,
      uploadedImage,
      generatedResult,
      brightness,
      contrast,
      saturation,
      adTemplate
    };
    saveAutosave(userEmail, autosaveData).catch(console.error);
  }, [productName, brandName, campaignGoal, targetPlatform, uploadedImage, generatedResult, brightness, contrast, saturation, adTemplate, userEmail]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setGeneratedResult(reader.result as string); // Show preview immediately
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate = () => {
    if (!uploadedImage) {
      alert("Please upload a product image first.");
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      setIsGenerating(false);
      // For now, we just use the uploaded image as the "result" but maybe we could add an overlay or filter in a real app
      // In a real app, this would be the URL returned from the AI API
      setGeneratedResult(uploadedImage); 
    }, 2000);
  };

    const handleSaveDraft = async () => {
    if (!generatedResult || !userEmail) return;
    
    try {
      let finalImageData = generatedResult;

      // Capture the current state of the preview (filters + overlays)
      if (previewRef.current) {
        // Use toJpeg to snapshot the DOM element
        finalImageData = await toJpeg(previewRef.current, { quality: 0.85 });
      }

      const creative = {
        id: editId || Date.now().toString(),
        productName,
        brandName,
        imageData: finalImageData, // Save the processed image
        date: new Date().toISOString(),
        platform: targetPlatform,
        brightness,
        contrast,
        saturation,
        adTemplate
      };
    
      await saveCreative(userEmail, creative);
      alert('Draft saved successfully!');
      router.push('/results');
    } catch (e) {
      console.error("Failed to save draft", e);
      alert('Failed to save draft');
    }
  };

  const handleExport = async () => {
    if (previewRef.current) {
      try {
        const dataUrl = await toJpeg(previewRef.current, { quality: 0.95 });
        const link = document.createElement('a');
        link.download = `${productName || 'creative'}-campaign.jpg`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Export failed:", error);
        alert("Failed to export image.");
      }
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Create New Campaign</h1>
        <Button onClick={handleGenerate} disabled={isGenerating || !uploadedImage}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate with AI
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                onClick={triggerFileInput}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${uploadedImage ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg" 
                  onChange={handleImageUpload}
                />
                {uploadedImage ? (
                  <div className="relative h-32 w-full">
                    <img src={uploadedImage} alt="Preview" className="h-full w-full object-contain" />
                    <p className="mt-2 text-xs text-primary">Click to change</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-1 text-sm text-muted-foreground">Upload Product Image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  </>
                )}
              </div>

              <Input 
                label="Product Name" 
                placeholder="e.g. Wireless Headphones" 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <Input 
                label="Brand Name" 
                placeholder="e.g. AudioTech" 
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Campaign Goal</label>
                <select 
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  value={campaignGoal}
                  onChange={(e) => setCampaignGoal(e.target.value)}
                >
                  <option>Brand Awareness</option>
                  <option>Conversion</option>
                  <option>Seasonal Sale</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Ad Style Template</label>
                <select 
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  value={adTemplate}
                  onChange={(e) => setAdTemplate(e.target.value)}
                >
                  <option value="none">Standard Product</option>
                  <option value="minimal">Minimalist Ad</option>
                  <option value="bold">Bold Sale</option>
                  <option value="lifestyle">Lifestyle Story</option>
                  <option value="retail">RetailMedia Special</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Target Platform</label>
                <div className="flex space-x-2">
                  {['Instagram', 'Facebook', 'Amazon'].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setTargetPlatform(platform)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        targetPlatform === platform 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {uploadedImage && (
            <Card>
              <CardHeader>
                <CardTitle>Image Enhancements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs items-center">
                    <label className="font-medium text-foreground">Brightness</label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{brightness}%</span>
                      <button 
                        onClick={() => setBrightness(100)} 
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Reset Brightness"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="150" 
                    value={brightness} 
                    onChange={(e) => setBrightness(Number(e.target.value))} 
                    className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer" 
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs items-center">
                    <label className="font-medium text-foreground">Contrast</label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{contrast}%</span>
                      <button 
                        onClick={() => setContrast(100)} 
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Reset Contrast"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="150" 
                    value={contrast} 
                    onChange={(e) => setContrast(Number(e.target.value))} 
                    className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer" 
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs items-center">
                    <label className="font-medium text-foreground">Saturation</label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{saturation}%</span>
                      <button 
                        onClick={() => setSaturation(100)} 
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Reset Saturation"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    value={saturation} 
                    onChange={(e) => setSaturation(Number(e.target.value))} 
                    className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer" 
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Compliance Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className={`flex items-center text-sm ${brandName ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Brand Colors Matched
                </div>
                <div className={`flex items-center text-sm ${uploadedImage ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Logo Placement Correct
                </div>
                <div className={`flex items-center text-sm ${generatedResult ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Text-to-Image Ratio
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full min-h-[600px] flex flex-col">
            <CardHeader className="border-b border-border flex justify-between items-center">
              <CardTitle>Live Preview</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant={previewMode === 'mobile' ? 'primary' : 'outline'} 
                  size="sm"
                  className={previewMode === 'mobile' ? '' : 'text-foreground'}
                  onClick={() => setPreviewMode('mobile')}
                >
                  Mobile
                </Button>
                <Button 
                  variant={previewMode === 'desktop' ? 'primary' : 'outline'} 
                  size="sm"
                  className={previewMode === 'desktop' ? '' : 'text-foreground'}
                  onClick={() => setPreviewMode('desktop')}
                >
                  Desktop
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center bg-muted/30 m-4 rounded-lg border border-border overflow-hidden relative">
              {generatedResult ? (
                <div 
                  ref={previewRef}
                  className={`relative transition-all duration-300 overflow-hidden group max-w-full ${previewMode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full h-full'}`}
                >
                  <img 
                    src={generatedResult} 
                    alt="Generated Creative" 
                    className="w-full h-full object-cover shadow-lg transition-all duration-300"
                    style={{ 
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` 
                    }}
                  />
                  
                  {/* Ad Template Overlays */}
                  {adTemplate === 'minimal' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-8 backdrop-blur-sm border-t border-gray-100">
                       <h3 className="text-2xl font-light text-black tracking-wide">{productName || 'Product Name'}</h3>
                       <p className="text-sm text-gray-600 mt-1 uppercase tracking-widest">{brandName || 'Brand Name'}</p>
                       <div className="mt-4 w-12 h-1 bg-black"></div>
                    </div>
                  )}

                  {adTemplate === 'bold' && (
                    <>
                      <div className="absolute top-8 right-8 bg-red-600 text-white px-6 py-3 font-black text-2xl -rotate-6 shadow-xl z-10">
                         SALE
                      </div>
                      <div className="absolute bottom-12 left-8 bg-black text-white px-8 py-4 font-bold text-3xl uppercase tracking-tighter shadow-lg max-w-[80%]">
                         {productName || 'Product Name'}
                      </div>
                    </>
                  )}

                  {adTemplate === 'lifestyle' && (
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-end p-8">
                       <p className="text-white/80 text-sm font-medium mb-2 uppercase tracking-wider">{brandName || 'Brand Name'}</p>
                       <h3 className="text-4xl font-bold text-white mb-4 leading-tight">{productName || 'Product Name'}</h3>
                       <button className="bg-white text-black px-6 py-3 rounded-full font-medium w-fit hover:bg-gray-100 transition-colors">
                         Shop Now
                       </button>
                    </div>
                  )}

                  {adTemplate === 'retail' && (
                    <>
                      <div className="absolute top-0 left-0 right-0 bg-primary p-4 flex justify-between items-center shadow-md z-10">
                        <span className="text-primary-foreground font-bold text-lg">RetailMediaAI</span>
                        <span className="bg-white text-primary px-2 py-1 rounded text-xs font-bold">AD</span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 bg-card-background/95 p-4 rounded-xl shadow-lg border border-border backdrop-blur-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-foreground text-lg">{productName || 'Product Name'}</h3>
                            <p className="text-sm text-muted-foreground">{brandName || 'Brand Name'}</p>
                          </div>
                          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Default Overlay if no template selected (or kept as fallback) */}
                  {adTemplate === 'none' && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}
                    >
                      <h3 className="text-2xl font-bold" style={{ color: '#ffffff' }}>{productName || 'Product Name'}</h3>
                      <p className="text-sm opacity-90" style={{ color: '#ffffff' }}>{brandName || 'Brand Name'}</p>
                      <button 
                        className="mt-4 px-4 py-2 rounded-full text-sm font-bold"
                        style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      >
                        Shop Now
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="mx-auto h-16 w-16 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">
                    {uploadedImage ? 'Ready to generate!' : 'Generated creative will appear here'}
                  </p>
                </div>
              )}
            </CardContent>
            <div className="p-4 border-t border-border flex justify-end space-x-3">
              <Button variant="outline" disabled={!generatedResult} onClick={handleSaveDraft}>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button disabled={!generatedResult} onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export Creative
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
