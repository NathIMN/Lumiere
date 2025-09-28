/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";

export const DrawCircleText = () => {
  return (
    <div className="grid place-content-center bg-red-900 px-4 py-24 text-yellow-50">
      <h1 className="max-w-3xl text-center text-5xl leading-snug">
        Level up your{" "}
        <span className="relative inline-block px-2">
          claim management
          <svg
            viewBox="0 0 420 80"
            fill="none"
            className="absolute inset-0 -top-2 -bottom-12 -left-8 -right-8"
          >
            {/* Main stroke */}
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{
                duration: 1.8,
                ease: "easeInOut",
              }}
              d="M15 40 
                 Q50 8, 120 10
                 Q200 12, 280 10
                 Q350 8, 405 40
                 Q410 50, 390 58
                 Q330 70, 260 68
                 Q160 70, 90 68
                 Q10 58, 15 40 Z"
              stroke="#f2a116ff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Second wobbly stroke */}
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                delay: 0.2,
              }}
              d="M20 42
                 Q55 5, 125 7
                 Q205 9, 285 7
                 Q365 5, 400 42
                 Q405 52, 385 60
                 Q325 72, 255 70
                 Q155 72, 85 70
                 Q15 60, 20 42 Z"
              stroke="#ba741fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
          </svg>
        </span>{" "}
        with Lumiere
      </h1>
    </div>
  );
};