"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";

const AnimatedCard = forwardRef(({ 
  children, 
  className = "",
  delay = 0,
  duration = 0.4,
  hoverScale = 1.02,
  ...props 
}, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        scale: hoverScale,
        transition: { duration: 0.2 }
      }}
      transition={{ 
        duration: duration,
        delay: delay,
        ease: "easeOut"
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
});

AnimatedCard.displayName = "AnimatedCard";

export default AnimatedCard;
