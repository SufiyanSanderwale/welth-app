"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";

const AnimatedWrapper = forwardRef(({ 
  children, 
  className = "", 
  delay = 0,
  duration = 0.6,
  y = 20,
  ...props 
}, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: y }}
      animate={{ opacity: 1, y: 0 }}
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

AnimatedWrapper.displayName = "AnimatedWrapper";

export default AnimatedWrapper;
