import React from 'react';

const InstagramLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Instagram Logo"
    {...props}
  >
    <defs>
      <radialGradient id="instaLogoGradient" cx="0.3" cy="1.1" r="1.2">
        <stop offset="0" stopColor="#F58529" />
        <stop offset="0.5" stopColor="#DD2A7B" />
        <stop offset="1" stopColor="#8134AF" />
      </radialGradient>
    </defs>
    
    {/* Background Gradient Circle */}
    <circle cx="32" cy="32" r="32" fill="url(#instaLogoGradient)" />
    
    {/* Camera Icon */}
    <g stroke="white" strokeWidth="4" fill="none">
      {/* Camera Body */}
      <rect x="15" y="15" width="34" height="34" rx="10" ry="10" />
      
      {/* Lens */}
      <circle cx="32" cy="32" r="9" />
      
      {/* Flash Dot */}
      <circle cx="42.5" cy="21.5" r="2" fill="white" stroke="none" />
    </g>
  </svg>
);

export default InstagramLogo;
