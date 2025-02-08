import { motion } from "framer-motion";

export default function LoadingScreen({ text = "Loading" }) {
  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <motion.div
        className="relative flex flex-col items-center"
      >
        <motion.span
          className="text-green-700 mt-4 text-lg font-semibold flex"
        >
          {text}
          <motion.span
            animate={{ opacity: [0, 1, 0], x: [0, 0, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
          >.</motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0], x: [0, 0, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
          >.</motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0], x: [0, 0, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.6 }}
          >.</motion.span>
        </motion.span>
      </motion.div>
    </div>
  );
}