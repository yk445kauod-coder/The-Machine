import React from 'react';

interface ImageViewerProps {
  src: string;
  alt: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt }) => {
  return (
    <div className="my-4 group relative rounded-xl overflow-hidden border border-machine-highlight shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
        <a 
          href={src} 
          download="generated-image.png"
          className="bg-machine-cyan/20 backdrop-blur-md border border-machine-cyan text-machine-cyan px-4 py-2 rounded-full text-xs font-bold hover:bg-machine-cyan hover:text-black transition-all"
        >
          Download Art
        </a>
      </div>
      <img src={src} alt={alt} className="w-full h-auto object-cover" loading="lazy" />
    </div>
  );
};

export default ImageViewer;