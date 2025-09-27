"use client";

import { useState } from "react";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

export default function Avatar({
  src,
  alt,
  name = "",
  size = "md",
  className = "",
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(name);
  const shouldShowImage = src && !imageError;

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        flex 
        items-center 
        justify-center 
        font-medium 
        ${
          shouldShowImage
            ? "bg-transparent"
            : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
        }
        ${className}
      `}
    >
      {shouldShowImage ? (
        <Image
          src={src}
          alt={alt || name}
          width={
            size === "sm" ? 32 : size === "md" ? 40 : size === "lg" ? 48 : 64
          }
          height={
            size === "sm" ? 32 : size === "md" ? 40 : size === "lg" ? 48 : 64
          }
          className="rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{initials || "?"}</span>
      )}
    </div>
  );
}
