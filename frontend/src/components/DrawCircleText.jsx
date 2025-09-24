import React from "react";
import { motion } from "framer-motion";

export const DrawCircleText = () => {
  return (
    <div className="grid place-content-center bg-emerald-950 px-4 py-24 text-yellow-50">
      <h1 className="max-w-3xl text-center text-5xl leading-snug">
        Level up your{" "}
        <span className="relative inline-block px-3">
          claim management
          <svg
            viewBox="0 0 360 100"
            fill="none"
            className="absolute inset-0 -left-4 -right-4 -top-4 -bottom-0"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{
                duration: 1.6,
                ease: "easeInOut",
              }}
              d="M30 50
                 C70 15, 290 15, 330 50
                 C335 75, 270 85, 180 80
                 C90 78, 50 70, 30 50 Z"
              stroke="#FACC15"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>{" "}
        with Lumiere
      </h1>
    </div>
  );
};
