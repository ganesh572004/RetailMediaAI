'use client';

import { motion, useAnimate, stagger } from 'framer-motion';
import { useEffect, useState } from 'react';

// Define the animation configurations
const variants = [
  // 1. Fade Up & Blur
  {
    name: 'Fade Up',
    container: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    child: { 
      initial: { opacity: 0, y: 20, filter: 'blur(10px)' }, 
      animate: { opacity: 1, y: 0, filter: 'blur(0px)' } 
    }
  },
  // 2. Fade Down & Blur
  {
    name: 'Fade Down',
    container: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    child: { 
      initial: { opacity: 0, y: -20, filter: 'blur(10px)' }, 
      animate: { opacity: 1, y: 0, filter: 'blur(0px)' } 
    }
  },
  // 3. Scale Up & Fade
  {
    name: 'Scale Up',
    container: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    child: { 
      initial: { opacity: 0, scale: 0.9, filter: 'blur(5px)' }, 
      animate: { opacity: 1, scale: 1, filter: 'blur(0px)' } 
    }
  },
  // 4. Slide Right & Blur
  {
    name: 'Slide Right',
    container: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    child: { 
      initial: { opacity: 0, x: -30, filter: 'blur(5px)' }, 
      animate: { opacity: 1, x: 0, filter: 'blur(0px)' } 
    }
  },
  // 5. Slide Left & Blur
  {
    name: 'Slide Left',
    container: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    child: { 
      initial: { opacity: 0, x: 30, filter: 'blur(5px)' }, 
      animate: { opacity: 1, x: 0, filter: 'blur(0px)' } 
    }
  },
  // 6. Rotate & Scale
  {
    name: 'Rotate In',
    container: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    child: { 
      initial: { opacity: 0, rotate: -3, scale: 0.95, filter: 'blur(5px)' }, 
      animate: { opacity: 1, rotate: 0, scale: 1, filter: 'blur(0px)' } 
    }
  },
  // 7. Elastic Pop
  {
    name: 'Elastic Pop',
    container: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    child: { 
      initial: { opacity: 0, scale: 0.8 }, 
      animate: { opacity: 1, scale: 1 } 
    }
  }
];

export default function Template({ children }: { children: React.ReactNode }) {
  const [scope, animate] = useAnimate();
  const [index, setIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Get the last index from session storage
    const storedIndex = sessionStorage.getItem('pageTransitionIndex');
    let nextIndex = 0;

    if (storedIndex !== null) {
      nextIndex = (parseInt(storedIndex) + 1) % variants.length;
    }

    // Save the new index
    sessionStorage.setItem('pageTransitionIndex', nextIndex.toString());
    setIndex(nextIndex);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !scope.current) return;

    const variant = variants[index];
    
    // Target common block-level elements for the staggered effect
    // We exclude 'script', 'style', and hidden elements implicitly
    const selector = "h1, h2, h3, p, img, button, input, label, .card, .btn, a, span.icon";

    const runAnimation = async () => {
      // 1. Set initial state for container and children immediately
      // We use a try-catch because sometimes selectors might not find elements
      try {
        await Promise.all([
          animate(scope.current, variant.container.initial, { duration: 0 }),
          animate(selector, variant.child.initial, { duration: 0 })
        ]);

        // 2. Animate Container
        animate(scope.current, variant.container.animate, { duration: 0.5, ease: "easeOut" });

        // 3. Animate Children with stagger
        await animate(
          selector, 
          variant.child.animate, 
          { 
            delay: stagger(0.05, { startDelay: 0.1 }), 
            duration: 0.5,
            ease: "easeOut"
          }
        );
      } catch (e) {
        // Fallback if animation fails (e.g. no children found)
        console.log("Animation skipped for some elements", e);
        animate(scope.current, { opacity: 1 }, { duration: 0.5 });
      }
    };

    runAnimation();

  }, [index, isMounted, animate, scope]);

  // While mounting, render a hidden div to prevent FOUC
  if (!isMounted) {
    return <div className="min-h-screen opacity-0">{children}</div>;
  }

  return (
    <div ref={scope} className="min-h-screen">
      {children}
    </div>
  );
}
