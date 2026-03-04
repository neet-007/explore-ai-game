"use client";

import { motion, Transition } from "framer-motion";

export default function ComparisonComponent() {
    return (
        /* The outer container needs 'px-20' or 'px-32' to give the logos 
           room to breathe on the far left and far right of the screen.
        */
        <div className="flex flex-col sm:flex-row items-center justify-center gap-32 sm:gap-48 p-20 w-full min-h-screen bg-slate-900">

            {/* Real Image */}
            <ComparisonItem
                imgSrc="https://picsum.photos/seed/real/400/400"
                logoSrc="/camera-logo.png"
                color="rgba(34, 197, 94, 0.8)"
                isLeft={true}
            />

            {/* AI Image */}
            <ComparisonItem
                imgSrc="https://picsum.photos/seed/ai/400/400"
                logoSrc="/gpt-logo.png"
                color="rgba(239, 68, 68, 0.8)"
                isLeft={false}
            />

        </div>
    );
}

function ComparisonItem({ imgSrc, logoSrc, color, isLeft }: {
    imgSrc: string, logoSrc: string, color: string, isLeft: boolean
}) {
    // 150% ensures it is completely clear of the image shadow and borders
    const xMove = isLeft ? "-150%" : "150%";

    const sharedTransition: Transition = {
        duration: 3,
        repeat: Infinity,
        times: [0, 0.2, 0.8, 1],
        ease: ["circOut", "linear", "circIn"] as any,
    };

    return (
        /* 'relative' and 'isolate' ensure the z-index works 
           perfectly without leaking into other parts of the UI.
        */
        <div className="relative isolate flex items-center justify-center w-48 h-48 md:w-64 md:h-64">

            {/* 1. THE LOGO (Layered Behind) */}
            <motion.div
                initial={{ x: "0%", scale: 0, opacity: 0 }}
                animate={{
                    x: ["0%", xMove, xMove, "0%"],
                    scale: [0, 1.2, 1.2, 0],
                    opacity: [0, 1, 1, 0],
                }}
                transition={sharedTransition}
                // z-0 puts it behind the image
                className="absolute z-0 w-16 h-16 md:w-24 md:h-24 bg-white rounded-full p-3 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center border-2 border-slate-200"
            >
                <img src={logoSrc} alt="Indicator" className="w-full h-full object-contain" />
            </motion.div>

            {/* 2. THE IMAGE (Layered On Top) */}
            <motion.div
                animate={{
                    boxShadow: [
                        `0px 0px 0px 0px ${color}`,
                        `0px 0px 50px 20px ${color}`,
                        `0px 0px 50px 20px ${color}`,
                        `0px 0px 0px 0px ${color}`,
                    ],
                }}
                transition={sharedTransition}
                className="relative z-10 w-full h-full rounded-3xl border-4 border-slate-700 bg-slate-800 shadow-2xl overflow-hidden"
            >
                <img src={imgSrc} alt="Comparison" className="w-full h-full object-cover" />
            </motion.div>
        </div>
    );
}
