"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const CollapsibleSection = ({
  title,
  icon,
  children,
  defaultOpen = true,
  badge,
  headerClassName,
  wrapperClassName,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  headerClassName?: string;
  wrapperClassName?: string;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={`border rounded-xl overflow-hidden bg-card ${wrapperClassName || ""}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 border-b bg-muted/50 flex items-center justify-between hover:bg-muted/70 transition-colors cursor-pointer ${headerClassName || ""}`}
      >
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          {icon}
          {title}
          {badge}
        </h3>
        <div className="flex items-center gap-2">
          {isOpen ? (
            <Minus className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Plus className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>
      {isOpen && children}
    </div>
  );
};

export default CollapsibleSection;
