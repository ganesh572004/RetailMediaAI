import React from 'react';
import { Facebook, Instagram, Twitter, Phone, Mail, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-card-background text-foreground py-12 border-t border-border transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Contact Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Contact Us</h3>
            <div className="space-y-3">
              <a 
                href="tel:7569102138" 
                className="flex items-center space-x-2 hover:text-primary transition-colors"
              >
                <Phone size={18} />
                <span>+91 7569102138</span>
              </a>
              <a 
                href="mailto:ganeshkorada572004@gmail.com" 
                className="flex items-center space-x-2 hover:text-primary transition-colors"
              >
                <Mail size={18} />
                <span>ganeshkorada572004@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4 text-primary">Follow Us</h3>
            <div className="flex space-x-6">
              <a 
                href="https://www.facebook.com/profile.php?id=100091624745355" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-[#1877F2] hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30"
              >
                <Facebook size={24} className="transition-transform duration-300 group-hover:scale-110" />
              </a>
              <a 
                href="https://www.instagram.com/ganesh_korada572004/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-linear-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/30"
              >
                <Instagram size={24} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              </a>
              <a 
                href="https://x.com/GaneshKora64373" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-[#1DA1F2] hover:text-white hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/30"
              >
                <Twitter size={24} className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
              </a>
            </div>
          </div>

          {/* Copyright & Love */}
          <div className="flex flex-col items-center md:items-end justify-center text-center md:text-right">
            <p className="text-sm text-muted-foreground mb-2">
              &copy; {new Date().getFullYear()} All rights reserved for Ganesh Korada
            </p>
            <p className="flex items-center text-sm text-muted-foreground">
              Made with <Heart size={14} className="mx-1 text-red-500 fill-current" /> by Ganesh Korada
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
