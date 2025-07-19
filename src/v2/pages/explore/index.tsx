import { Fragment } from "react";
import { motion } from "motion/react";
import { FiChevronRight } from "react-icons/fi";
import ChatBot from "../home/components/ChatBot";

export default function Explore() {
  return (
    <Fragment>
      <motion.div
        initial={{ x: -4, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="w-full h-full overflow-y-auto mb-18 p-4"
      >
        <div className="flex flex-row items-center justify-between">
          <p className="text-sm font-semibold">Prediction Markets</p>
          <span className="text-accent-primary text-sm font-medium">
            See More
          </span>
        </div>
      </motion.div>

      <ChatBot />
    </Fragment>
  );
}
