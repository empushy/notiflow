"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const NotificationStatCard = ({ stat, initialQuantity, autoIncrease }) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const count = useMotionValue(0);
  const springCount = useSpring(count, { stiffness: 100, damping: 20 });
  const displayNumber = useTransform(springCount, (value) => Math.floor(value).toLocaleString());

  useEffect(() => {
    count.set(quantity);
  }, [quantity, count]);

  useEffect(() => {
    if (!autoIncrease) return;

    const interval = setInterval(() => {
      setQuantity((prev) => prev + Math.floor(Math.random() * 6));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoIncrease]);

  return (
    <motion.div className="flex flex-col h-full bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="px-6 pt-6 pb-5 flex flex-col items-center text-center">
        <h2 className="text-xs sm:text-sm font-medium uppercase tracking-wide mb-2">{stat}</h2>
        <motion.p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{displayNumber}</motion.p>
        <div className="w-12 h-1 bg-primary rounded-full mt-3"></div>
      </div>
    </motion.div>
  );
};

export default NotificationStatCard;
