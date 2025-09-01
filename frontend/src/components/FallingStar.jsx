import { motion, useScroll, useTransform } from "framer-motion";
import { Star } from "lucide-react";

export function FallingStar() {
  const { scrollY } = useScroll();

  // Map scroll range -> star position
  const y = useTransform(scrollY, [100, 300], [0, 200]); // falls 200px in first 300px scroll
  const opacity = useTransform(scrollY, [0, 100, 300], [1, 1, 0.8]); // fades slightly

  return (
    <motion.div style={{ y, opacity }} className="fixed left-1/2 -translate-x-1/2 top-0">
      <Star className="w-12 h-12 text-yellow-400" strokeWidth={2} />
    </motion.div>
  );
}

