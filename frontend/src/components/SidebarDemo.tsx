"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, UserCog, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import FileUploadSupabase from "./FileUploadSupabase";

// Override the default sidebar width by targeting the element with CSS
// This will be added to the global CSS
const sidebarStyles = `
  @media (min-width: 768px) {
    .custom-sidebar > div > div {
      width: 200px !important;
    }
  }
`;

export function SidebarDemo() {
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <LayoutDashboard className="text-ecodify-primary h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Profile",
      href: "/coming-soon",
      icon: (
        <UserCog className="text-ecodify-primary h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/coming-soon",
      icon: (
        <Settings className="text-ecodify-primary h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "/coming-soon",
      icon: (
        <LogOut className="text-ecodify-primary h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  const [open, setOpen] = useState(true);
  
  useEffect(() => {
    // Add the custom styles to the document head
    const styleElement = document.createElement('style');
    styleElement.innerHTML = sidebarStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      // Clean up on unmount
      document.head.removeChild(styleElement);
    };
  }, []);
  
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-50 w-full flex-1 overflow-hidden",
        "h-screen"
      )}
    >
      <div className="custom-sidebar">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            </div>
            <div>
              <SidebarLink
                link={{
                  label: "User",
                  href: "/coming-soon",
                  icon: (
                    <div className="h-7 w-7 flex-shrink-0 rounded-full bg-ecodify-primary flex items-center justify-center text-white font-medium">
                      U
                    </div>
                  ),
                }}
              />
            </div>
          </SidebarBody>
        </Sidebar>
      </div>
      <div className="flex-1 overflow-auto">
        <Dashboard />
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-gray-800 py-1 relative z-20"
    >
      <div className="h-6 w-6 bg-ecodify-primary rounded-md flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-semibold text-ecodify-primary whitespace-pre"
      >
        Ecodify
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-gray-800 py-1 relative z-20"
    >
      <div className="h-6 w-6 bg-ecodify-primary rounded-md flex-shrink-0" />
    </Link>
  );
};

// Dashboard component with FileUploadSupabase
const Dashboard = () => {
  return (
    <div className="flex flex-col min-h-full">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-gray-200 bg-white flex flex-col gap-6 w-full">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        
        {/* Informative section about Ecodify */}
        <div className="bg-gradient-to-r from-ecodify-primary/10 to-ecodify-secondary/10 rounded-xl p-6 border border-ecodify-primary/20">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0 bg-ecodify-primary/20 p-4 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-ecodify-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-ecodify-primary mb-2">Transform Your Educational Materials</h2>
              <p className="text-gray-700 mb-4">
                Ecodify seamlessly integrates climate education into your existing worksheets and learning materials. 
                Simply upload your PDF document, and our AI will enhance it with relevant climate context while preserving your original content.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-ecodify-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Upload any PDF worksheet</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-ecodify-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>AI enhances with climate context</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-ecodify-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Download enhanced materials</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200 mb-10">
          <FileUploadSupabase />
        </div>
      </div>
    </div>
  );
}; 