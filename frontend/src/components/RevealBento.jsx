import React from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { FiArrowRight, FiMail, FiMapPin } from "react-icons/fi";

export const RevealBento = () => {
  return (
    <div className="min-h-screen bg-white px-4 py-12 text-zinc-900">
      <motion.div
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.05 }}
        className="mx-auto grid max-w-4xl grid-flow-dense grid-cols-12 gap-4"
      >
        <HeaderBlock />
        <SocialsBlock />
        <AboutBlock />
        <LocationBlock />
        <EmailListBlock />
      </motion.div>
      <Footer />
    </div>
  );
};

const Block = ({ className, ...rest }) => (
  <motion.div
    variants={{
      initial: { scale: 0.5, y: 50, opacity: 0 },
      animate: { scale: 1, y: 0, opacity: 1 },
    }}
    transition={{ type: "spring", mass: 3, stiffness: 400, damping: 50 }}
    className={twMerge(
      "col-span-4 rounded-lg border border-zinc-300 bg-zinc-100 p-6",
      className
    )}
    {...rest}
  />
);

const HeaderBlock = () => (
  <Block className="col-span-12 row-span-2 md:col-span-6">
    <img
      src="https://api.dicebear.com/8.x/lorelei-neutral/svg?seed=John"
      alt="avatar"
      className="mb-4 size-14 rounded-full"
    />
    <h1 className="mb-12 text-4xl font-medium leading-tight">
      Hi, I'm Lumi!. <span className="text-zinc-600">Your AI assistant for Managing claims</span>
    </h1>
    <a href="#" className="flex items-center gap-1 text-red-900 hover:underline">
      Talk to Lumi... <FiArrowRight />
    </a>
  </Block>
);

const SocialsBlock = () => (
  <>
    <Block whileHover={{ rotate: "2.5deg", scale: 1.1 }} className="col-span-6 bg-red-900 md:col-span-3">
      <div className="grid h-full place-content-center text-3xl text-white">YouTube</div>
    </Block>
    <Block whileHover={{ rotate: "-2.5deg", scale: 1.1 }} className="col-span-6 bg-[#151E3D] md:col-span-3">
      <div className="grid h-full place-content-center text-3xl text-white">GitHub</div>
    </Block>
    <Block whileHover={{ rotate: "-2.5deg", scale: 1.1 }} className="col-span-6 bg-[#151E3D] md:col-span-3">
      <div className="grid h-full place-content-center text-3xl text-zinc-900">TikTok</div>
    </Block>
    <Block whileHover={{ rotate: "2.5deg", scale: 1.1 }} className="col-span-6 bg-red-900 md:col-span-3">
      <div className="grid h-full place-content-center text-3xl text-white">Twitter</div>
    </Block>
  </>
);

const AboutBlock = () => (
  <Block className="col-span-12 text-3xl leading-snug">
    <p>
      My passion is helping you.{" "}
      <span className="text-zinc-600">I can understand your questions, process claim information, and keep you updated in real time. Powered by AI, I make filing and tracking claims simple, whether by voice or text.</span>
    </p>
  </Block>
);

const LocationBlock = () => (
  <Block className="col-span-12 flex flex-col items-center gap-4 md:col-span-3">
    <FiMapPin className="text-3xl" />
    <p className="text-center text-lg text-zinc-600">Cyberspace</p>
  </Block>
);

const EmailListBlock = () => (
  <Block className="col-span-12 md:col-span-9">
    <p className="mb-3 text-lg">Join my mailing list</p>
    <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full rounded border border-zinc-300 bg-white px-3 py-1.5 transition-colors focus:border-red-500 focus:outline-0"
      />
      <button className="flex items-center gap-2 whitespace-nowrap rounded bg-[#151E3D] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600">
        <FiMail /> Join the list
      </button>
    </form>
  </Block>
);

const Logo = () => (
  <svg width="40" height="auto" viewBox="0 0 50 39" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-12 fill-red-500">
    <path d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z" stopColor="#000000"></path>
    <path d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z" stopColor="#000000"></path>
  </svg>
);

const Footer = () => (
  <footer className="mt-12 text-center text-zinc-600">
  </footer>
);
