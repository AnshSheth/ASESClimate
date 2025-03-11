"use client";

import React, { useEffect, useState, useRef } from "react";
import { SplashCursor } from "@/components/ui/splash-cursor";

interface ScrollBoundedCursorProps {
  scrollThreshold?: number; // Height in pixels at which to hide the cursor
}

export default function ScrollBoundedCursor({ scrollThreshold = 600 }: ScrollBoundedCursorProps) {
  const [isVisible, setIsVisible] = useState(true);
  const mouseYRef = useRef(0);
  
  useEffect(() => {
    // Function to check scroll position and hide cursor when past threshold
    const checkVisibility = () => {
      // Calculate effective position: mouse position + scroll position
      const effectivePosition = mouseYRef.current + window.scrollY;
      
      if (effectivePosition > scrollThreshold) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };
    
    // Track the mouse Y position
    const handleMouseMove = (e: MouseEvent) => {
      mouseYRef.current = e.clientY;
      checkVisibility();
    };
    
    // Handle scroll events
    const handleScroll = () => {
      checkVisibility();
    };
    
    // Initial check
    checkVisibility();
    
    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [scrollThreshold]); // Only depend on scrollThreshold, not mouseY
  
  // Only render the SplashCursor component when visible
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
      <SplashCursor 
        BACK_COLOR={{ r: 0.2, g: 0.3, b: 0.1 }} // Eco-friendly green color
        TRANSPARENT={true}
        SPLAT_RADIUS={0.25}
        SPLAT_FORCE={7000}
      />
    </div>
  );
} 