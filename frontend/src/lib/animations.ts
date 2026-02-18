/**
 * Animation Variants and Utilities
 * Framer Motion configurations for consistent animations
 */

import { Variants } from 'framer-motion';

// Timing constants
export const timing = {
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  slower: 0.4,
} as const;

// Easing functions
export const easing = {
  easeOut: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: [0.16, 1, 0.3, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
} as const;

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: timing.slow,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: timing.normal,
      ease: easing.easeIn,
    },
  },
};

// Card entrance variants
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: timing.normal,
      ease: easing.spring,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: timing.fast,
    },
  },
};

// List item variants with stagger
export const listVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: timing.normal,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -5,
    transition: {
      duration: timing.fast,
    },
  },
};

// Sidebar variants
export const sidebarVariants: Variants = {
  closed: {
    x: -100,
    opacity: 0,
    transition: {
      duration: timing.normal,
      ease: easing.easeIn,
    },
  },
  open: {
    x: 0,
    opacity: 1,
    transition: {
      duration: timing.slow,
      ease: easing.spring,
    },
  },
};

// Modal variants
export const modalOverlayVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: timing.fast,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: timing.fast,
    },
  },
};

export const modalContentVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: timing.normal,
      ease: easing.spring,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: timing.fast,
    },
  },
};

// Toast notification variants
export const toastVariants: Variants = {
  initial: {
    opacity: 0,
    x: 100,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: timing.normal,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: timing.fast,
    },
  },
};

// Fade variants
export const fadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: timing.normal,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: timing.fast,
    },
  },
};

// Scale variants
export const scaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: timing.normal,
      ease: easing.spring,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: timing.fast,
    },
  },
};

// Slide variants
export const slideUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: timing.normal,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: timing.fast,
    },
  },
};

export const slideDownVariants: Variants = {
  initial: {
    opacity: 0,
    y: -20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: timing.normal,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: {
      duration: timing.fast,
    },
  },
};

// Button interaction variants
export const buttonTapVariants = {
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

// Hover lift effect
export const hoverLiftVariants = {
  rest: {
    y: 0,
    transition: {
      duration: timing.fast,
      ease: easing.easeOut,
    },
  },
  hover: {
    y: -2,
    transition: {
      duration: timing.fast,
      ease: easing.easeOut,
    },
  },
};

// Skeleton loading animation
export const skeletonVariants: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

// Stagger container for children animations
export function createStaggerContainer(staggerDelay = 0.05): Variants {
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
    exit: {
      transition: {
        staggerChildren: staggerDelay * 0.5,
        staggerDirection: -1,
      },
    },
  };
}

// Reduced motion support
export const reducedMotionVariants: Variants = {
  initial: {},
  animate: {},
  exit: {},
};
