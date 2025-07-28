import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ 
  className, 
  hover = false,
  children, 
  ...props 
}, ref) => {
  const baseStyles = "bg-white rounded-lg shadow-card transition-all duration-200";
  const hoverStyles = hover ? "hover:shadow-card-hover hover:transform hover:scale-[1.02]" : "";

  return (
    <div
      className={cn(baseStyles, hoverStyles, className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;