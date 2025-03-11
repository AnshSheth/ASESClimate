import React, { useState } from "react";
import { useRouter } from "next/router";
import { Sidebar as UISidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import { LayoutDashboard, FileText, Settings, LogOut } from "lucide-react";
import { Logo, LogoIcon } from "./ui/logo";
import { cn } from "../lib/utils";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "My Documents",
      href: "/documents",
      icon: (
        <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "/logout",
      icon: (
        <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <UISidebar 
      open={open} 
      setOpen={setOpen} 
      className={cn("h-screen", className)}
    >
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink 
                key={idx} 
                link={{
                  ...link,
                  href: link.href,
                }} 
              />
            ))}
          </div>
        </div>
        <div>
          <SidebarLink
            link={{
              label: "User Profile",
              href: "/profile",
              icon: (
                <div className="h-7 w-7 flex-shrink-0 rounded-full bg-ecodify-primary flex items-center justify-center text-white font-medium">
                  U
                </div>
              ),
            }}
          />
        </div>
      </SidebarBody>
    </UISidebar>
  );
};

export default Sidebar; 