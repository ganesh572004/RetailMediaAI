import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Loader2, Wand2, Save, Sparkles, RefreshCw, Zap, Image as ImageIcon, Bot, Maximize2, ZoomIn, ZoomOut, X } from 'lucide-react';
import { saveCreative } from '@/lib/storage';

const STYLES = [
  { id: 'standard', name: 'Standard', icon: '✨' },
  { id: 'realistic', name: 'Hyper-Real', icon: '📸' },
  { id: 'cinematic', name: 'Cinematic', icon: '🎬' },
  { id: '3d-render', name: '3D Render', icon: '🧊' },
  { id: 'anime', name: 'Anime', icon: '🎨' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '🌃' },
];

const STYLE_PROMPTS: Record<string, string> = {
  'standard': ', high quality, 8k, detailed, sharp focus, vivid colors, highly detailed, perfect composition, uhd, hdr, accurate to prompt',
  'realistic': ', photorealistic, 8k, raw photo, hyperrealistic, highly detailed, dslr, sharp focus, real life, detailed skin texture, masterpiece, best quality, live action adaptation, detailed facial features, photograph, 35mm, f/1.8, 8k uhd, hdr, accurate details',
  'cinematic': ', cinematic lighting, movie scene, 8k, detailed, dramatic lighting, imax, color graded, detailed background, atmospheric, film grain, wide angle, anamorphic lens, depth of field, 8k uhd, masterpiece',
  '3d-render': ', 3d render, unreal engine 5, octane render, ray tracing, 8k, highly detailed, c4d, blender, 3d model, volumetric lighting, digital art, 8k uhd',
  'anime': ', anime style, studio ghibli, vibrant colors, high quality, detailed character design, 2d, cel shaded, manga style, illustration, 8k, masterpiece',
  'cyberpunk': ', cyberpunk, neon lights, futuristic, high tech, detailed, night city, sci-fi, synthwave, blade runner style, glowing, 8k, highly detailed',
};

export const ImageGenerator = ({ onImageSaved }: { onImageSaved?: () => void }) => {
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loadingText, setLoadingText] = useState('Initializing AI...');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [generatingEmoji, setGeneratingEmoji] = useState('✨');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Reset loading state when image changes
  useEffect(() => {
    if (generatedImages.length > 0) {
        setImageLoading(true);
        setImageError(false);
    }
  }, [selectedImageIndex, generatedImages]);

  const getEmojiForPrompt = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('cat') || lower.includes('kitten')) return '🐱';
    if (lower.includes('dog') || lower.includes('puppy')) return '🐶';
    if (lower.includes('anime') || lower.includes('manga') || lower.includes('naruto') || lower.includes('luffy')) return '👺';
    if (lower.includes('city') || lower.includes('building')) return '🏙️';
    if (lower.includes('nature') || lower.includes('forest') || lower.includes('tree')) return '🌳';
    if (lower.includes('space') || lower.includes('galaxy') || lower.includes('star')) return '🚀';
    if (lower.includes('food') || lower.includes('burger') || lower.includes('pizza')) return '🍔';
    if (lower.includes('car') || lower.includes('vehicle')) return '🏎️';
    if (lower.includes('robot') || lower.includes('cyborg')) return '🤖';
    if (lower.includes('love') || lower.includes('heart')) return '❤️';
    return '🎨';
  };

  const handleImageError = () => {
    const currentUrlStr = generatedImages[selectedImageIndex];
    if (!currentUrlStr) return;

    try {
        const url = new URL(currentUrlStr);
        const model = url.searchParams.get('model');

        // Strategy 1: If using Flux, fallback to Turbo (faster/more reliable)
        if (model === 'flux') {
            console.log("Flux generation failed, retrying with Turbo model...");
            url.searchParams.set('model', 'turbo'); // Explicitly switch to turbo
            url.searchParams.set('retry', Date.now().toString());
            
            const newImages = [...generatedImages];
            newImages[selectedImageIndex] = url.toString();
            setGeneratedImages(newImages);
            return;
        }
        
        // Strategy 2: If Turbo failed, try removing model param entirely (default)
        if (model === 'turbo') {
             console.log("Turbo generation failed, retrying with default...");
             url.searchParams.delete('model');
             url.searchParams.set('retry', Date.now().toString());
             
             const newImages = [...generatedImages];
             newImages[selectedImageIndex] = url.toString();
             setGeneratedImages(newImages);
             return;
        }

        // Final failure
        console.error("All generation attempts failed.");
        setImageError(true);
        setImageLoading(false);

    } catch (e) {
        console.error("Error handling image fallback", e);
        setImageError(true);
        setImageLoading(false);
    }
  };

  const addEnhancement = (enhancement: string) => {
    setPrompt(prev => {
      if (prev.includes(enhancement)) return prev;
      return prev ? `${prev}, ${enhancement}` : enhancement;
    });
  };

  // Smart Prompt Refinement to fix common ambiguities
  const refinePrompt = (inputPrompt: string) => {
    let refined = inputPrompt;
    const lower = refined.toLowerCase();
    
    // Fix: "Sakura" often generates trees instead of the character in Naruto context
    if (lower.includes('naruto') && lower.includes('sakura') && !lower.includes('haruno')) {
      refined = refined.replace(/sakura/gi, 'Sakura Haruno');
    }
    
    return refined;
  };

  // Cycle through loading texts
  useEffect(() => {
    if (!isGenerating) return;
    const texts = [
      "Analyzing prompt...",
      "Refining character details...",
      "Enhancing realism...",
      "Applying texture details...",
      "Finalizing lighting...",
      "Almost there..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingText(texts[i % texts.length]);
      i++;
    }, 800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setGeneratedImages([]);
    setSelectedImageIndex(0);
    setImageError(false);
    setGeneratingEmoji(getEmojiForPrompt(prompt));

    try {
      // Auto-detect style based on keywords ONLY if standard is selected.
      // If user explicitly picks a style (e.g. Realistic), we respect it even for anime characters.
      let effectiveStyle = selectedStyle;
      const lowerPrompt = prompt.toLowerCase();
      
      if (selectedStyle === 'standard') {
          if (lowerPrompt.includes('anime') || lowerPrompt.includes('manga') || lowerPrompt.includes('naruto') || lowerPrompt.includes('luffy') || lowerPrompt.includes('goku') || lowerPrompt.includes('one piece')) {
              effectiveStyle = 'anime';
          } else if (lowerPrompt.includes('cyberpunk') || lowerPrompt.includes('neon') || lowerPrompt.includes('future')) {
              effectiveStyle = 'cyberpunk';
          }
      }

      const refinedPrompt = refinePrompt(prompt);
      const stylePrompt = STYLE_PROMPTS[effectiveStyle] || '';
      const fullPrompt = `${refinedPrompt}${stylePrompt}`;
      
      // Generate 4 variations using Pollinations.ai (Free, No Key, High Quality)
      // We use different seeds to get variations
      const seeds = Array.from({ length: 4 }, () => Math.floor(Math.random() * 1000000));
      
      const imageUrls = seeds.map(seed => {
        // Construct URL
        // nologo=true removes the watermark
        // width/height=1280 for higher quality (increased from 1024)
        // seed ensures consistency/variation
        // model=flux is generally best, but if it fails we might want to fallback (handled in UI)
        // enhance=true attempts to improve prompt adherence and quality
        return `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1280&height=1280&seed=${seed}&nologo=true&model=flux&enhance=true`; 
      });

      // Simulate a short delay to make it feel like "processing" (since the URL loads instantly but image takes time to render)
      // We can just set them directly, the browser will load them.
      // But to prevent broken images showing up before they are ready, we can pre-load them or just show them.
      // Pollinations usually streams or loads reasonably fast.
      
      setGeneratedImages(imageUrls);

    } catch (error) {
      console.error("Generation failed:", error);
      setGeneratedImages([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    const currentImage = generatedImages[selectedImageIndex];
    if (!currentImage) return;
    
    try {
      const newCreative = {
        id: Date.now().toString(),
        productName: 'AI Generated',
        brandName: 'AI Studio',
        imageData: currentImage,
        date: new Date().toISOString(),
        platform: 'AI Generation'
      };
      
      if (session?.user?.email) {
        await saveCreative(session.user.email, newCreative);
        alert("Image saved to My Creatives!");
        if (onImageSaved) onImageSaved();
      } else {
        alert("Please sign in to save images.");
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save image.");
    }
  };

  const openModal = (index = 0) => {
    setSelectedImageIndex(index);
    setShowModal(true);
    setZoom(1);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));

  return (
    <>
      {/* Image Modal */}
      {showModal && generatedImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
          {/* Controls */}
          <div className="absolute top-4 right-4 flex gap-2 z-50">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 flex gap-1 border border-white/20">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/20 h-8 w-8 p-0" 
                onClick={handleZoomOut}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="flex items-center text-xs text-white/70 px-2 font-mono">
                {Math.round(zoom * 100)}%
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/20 h-8 w-8 p-0" 
                onClick={handleZoomIn}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-red-500/20 hover:text-red-400 h-10 w-10 rounded-full" 
              onClick={() => setShowModal(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Image Container */}
          <div className="w-full h-full overflow-auto flex items-center justify-center p-4 cursor-move"
               onMouseDown={(e) => {
                 // Simple drag to scroll implementation could go here
                 // For now, native scrollbars work if zoomed in
               }}
          >
            <img 
              src={generatedImages[selectedImageIndex]} 
              alt="Full size generated" 
              className="max-w-none transition-transform duration-200 ease-out shadow-2xl"
              style={{ 
                transform: `scale(${zoom})`,
                maxHeight: zoom <= 1 ? '90vh' : 'none',
                maxWidth: zoom <= 1 ? '90vw' : 'none'
              }}
            />
          </div>
        </div>
      )}

      <Card className="h-full border-0 shadow-xl overflow-hidden bg-card-background/80 backdrop-blur-sm ring-1 ring-border">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Bot className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Creative Studio
              </CardTitle>
              <CardDescription className="text-muted-foreground">Transform your ideas into reality</CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-muted-foreground font-medium">Online</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {generatedImages.length === 0 && !isGenerating ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Style Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Style</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      selectedStyle === style.id
                        ? 'bg-purple-600 text-white shadow-md scale-105'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <span>{style.icon}</span>
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Prompt</label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your vision... (e.g., A futuristic sneaker store with neon blue lighting, 8k resolution)"
                  className="w-full min-h-[120px] p-4 rounded-xl border border-border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-foreground placeholder:text-muted-foreground/50"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={!prompt}
                    className={`rounded-full px-4 py-2 transition-all duration-300 ${
                      prompt 
                        ? 'bg-linear-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:scale-105 text-white'  
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    <span className="mr-2">Generate</span>
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Inspiration/Tips */}
            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400">Pro Tip</h4>
                  <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
                    Be specific about lighting, mood, and camera angles for the best results. Try adding{' '}
                    <button 
                      onClick={() => addEnhancement("cinematic lighting")}
                      className="font-bold hover:underline cursor-pointer hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1"
                    >
                      "cinematic lighting"
                    </button>
                    {' '}or{' '}
                    <button 
                      onClick={() => addEnhancement("wide angle")}
                      className="font-bold hover:underline cursor-pointer hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1"
                    >
                      "wide angle"
                    </button>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (isGenerating || (generatedImages.length > 0 && imageLoading && selectedImageIndex === 0)) ? (
          <div className="h-[400px] flex flex-col items-center justify-center bg-muted/50 rounded-xl border-2 border-dashed border-purple-500/20 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-purple-500/10 to-transparent w-[200%] animate-[shimmer_2s_infinite] -translate-x-full"></div>
            
            {/* Floating Particles Effect */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-50 delay-100"></div>
                <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-pink-400 rounded-full animate-pulse opacity-75 delay-300"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center p-6">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 animate-pulse rounded-full scale-150"></div>
                <div className="bg-card-background p-6 rounded-full shadow-2xl animate-[bounce_2s_infinite] border border-purple-100 dark:border-purple-900 relative">
                  <span className="text-6xl filter drop-shadow-lg transform hover:scale-110 transition-transform cursor-default select-none relative z-10">
                    {generatingEmoji}
                  </span>
                  {/* Robo Emoji Badge */}
                  <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-purple-200 z-20 animate-bounce delay-75">
                    <span className="text-xl">🤖</span>
                  </div>
                </div>
                {/* Orbiting Elements */}
                <div className="absolute inset-0 animate-[spin_3s_linear_infinite]">
                    <div className="absolute -top-2 left-1/2 w-3 h-3 bg-blue-500 rounded-full blur-[1px]"></div>
                </div>
                <div className="absolute inset-0 animate-[spin_4s_linear_infinite_reverse]">
                    <div className="absolute -bottom-2 left-1/2 w-2 h-2 bg-purple-500 rounded-full blur-[1px]"></div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {imageLoading && !isGenerating ? "Rendering Final Pixels..." : "Dreaming up your image..."}
              </h3>
              <p className="text-sm text-muted-foreground font-medium animate-pulse max-w-[250px]">
                {loadingText}
              </p>
            </div>
            
            {/* Hidden Image Loader to trigger onLoad */}
            {generatedImages.length > 0 && imageLoading && (
                <img 
                    src={generatedImages[selectedImageIndex]} 
                    className="hidden"
                    onLoad={() => setImageLoading(false)}
                    onError={handleImageError}
                />
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-in zoom-in-95 duration-300">
            {/* Main Image Display */}
            <div 
              className="relative group rounded-xl overflow-hidden shadow-2xl ring-1 ring-border cursor-pointer aspect-video bg-muted flex items-center justify-center"
              onClick={() => !imageError && openModal(selectedImageIndex)}
            >
              {imageLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted z-10">
                      <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-2" />
                      <p className="text-sm text-muted-foreground">Rendering high-quality image...</p>
                  </div>
              )}
              
              {imageError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted z-10 p-4 text-center">
                      <X className="h-10 w-10 text-red-500 mb-2" />
                      <p className="text-sm text-foreground font-medium">Failed to load image.</p>
                      <p className="text-xs text-muted-foreground mb-4">The AI server might be busy.</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                            e.stopPropagation();
                            // Force reload by updating the URL with a new seed or just re-triggering state
                            const currentUrl = new URL(generatedImages[selectedImageIndex]);
                            currentUrl.searchParams.set('retry', Date.now().toString());
                            const newImages = [...generatedImages];
                            newImages[selectedImageIndex] = currentUrl.toString();
                            setGeneratedImages(newImages);
                        }}
                      >
                        <RefreshCw className="mr-2 h-3 w-3" /> Retry
                      </Button>
                  </div>
              ) : (
                  <img 
                    src={generatedImages[selectedImageIndex]} 
                    alt="Generated" 
                    className={`w-full h-full object-contain transition-opacity duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setImageLoading(false)}
                    onError={handleImageError}
                  />
              )}

              {!imageLoading && !imageError && (
                <>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="bg-black/50 text-white px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2 backdrop-blur-sm">
                      <Maximize2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Click to Zoom</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
                    <p className="text-white text-sm line-clamp-2">{prompt}</p>
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {generatedImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {generatedImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all snap-start ${
                      selectedImageIndex === idx 
                        ? 'border-purple-600 ring-2 ring-purple-500/30 scale-105' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => setGeneratedImages([])} 
                variant="outline"
                className="w-full border-border hover:bg-muted text-foreground"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button 
                onClick={handleSave} 
                className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Creative
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};

