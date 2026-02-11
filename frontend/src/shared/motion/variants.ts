/**
 * Framer Motion Variants — Shared animation presets.
 *
 * All pages and components must use these to maintain consistency.
 * Never define ad-hoc motion variants inline.
 */
import type { Variants } from 'framer-motion'

// Page enter/exit transitions
export const pageVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
}

// Card entrance animations
export const cardVariants: Variants = {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
}

// Modal fade + scale
export const modalVariants: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

// Staggered list items
export const listVariants: Variants = {
    animate: {
        transition: { staggerChildren: 0.06 },
    },
}

export const listItemVariants: Variants = {
    initial: { opacity: 0, x: -12 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
}

// Sidebar slide-in
export const sidebarVariants: Variants = {
    initial: { x: -260, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
}

// Fade in (generic)
export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
}
