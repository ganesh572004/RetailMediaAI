import React from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoSrc }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        >
          <X size={24} />
        </button>
        <div className="relative pt-[56.25%]">
          {videoSrc?.toLowerCase().endsWith('.mp4') ? (
            <video 
              className="absolute top-0 left-0 w-full h-full"
              src={videoSrc}
              controls
              autoPlay
            />
          ) : (
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={videoSrc || "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"} // Default placeholder
              title="Demo Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>
      </div>
    </div>
  );
};
