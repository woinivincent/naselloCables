import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Mail, MessageCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SocialMediaProps {
  className?: string;
}

const SocialMediaFloat = ({ className }: SocialMediaProps) => {
  const socialLinks = [

    {
      name: 'Youtube',
      icon: Youtube,
      url: 'https://www.youtube.com/@NaselloCables',
      color: 'hover:text-red-600'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/nasellocables_sa/',
      color: 'hover:text-pink-600'
    },
    {
      name: 'Email',
      icon: Mail,
      url: 'mailto: recepcion@nasellocables.com',
      color: 'hover:text-gray-600'
    },
    {
      name: 'Whatsapp',
      icon: MessageCircle,
      url: 'https://wa.me/2323354771',
      color: 'hover:text-green-600'
    }
  ];

  return (
    <div className={cn(
     " md:block fixed right-0 top-1/2 -translate-y-1/2 flex flex-col gap-4 bg-white p-2 rounded-l-lg shadow-lg border border-r-0 z-50" , className 
    )}>
      {socialLinks.map((social) => {
        const Icon = social.icon;
        return (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "transition-colors duration-200 transform",
              social.color
            )}
            aria-label={`Visitar ${social.name}`}
          >
            <Icon className="w-6 h-6 mb-2" />
          </a>
        );
      })}
    </div>
  );
};

export default SocialMediaFloat;