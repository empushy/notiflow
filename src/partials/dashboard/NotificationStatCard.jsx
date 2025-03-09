import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const NotificationStatCard = ({ stat, initialQuantity, autoIncrease }) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const count = useMotionValue(0); // Start at 0
  const springCount = useSpring(count, { stiffness: 100, damping: 20 });
  const displayNumber = useTransform(springCount, (value) => Math.floor(value).toLocaleString());

  useEffect(() => {
    count.set(quantity); // Animate to the latest quantity
  }, [quantity, count]);

  // Optional: Randomly increase quantity every 10 seconds if autoIncrease is true
  useEffect(() => {
    if (!autoIncrease) return; // ✅ Exit if autoIncrease is false

    const interval = setInterval(() => {
      setQuantity((prev) => prev + Math.floor(Math.random() * 6)); // Increase by 0-20
    }, 5000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [autoIncrease]); // ✅ Only runs when autoIncrease is true

  return (
    <div className="flex flex-col col-span-4 bg-white shadow-sm rounded-xl">
      <div className="px-5 pt-5 pb-4">
        <h2 className="text-lg font-semibold text-gray-400">{stat}</h2>
        <motion.p className="text-2xl font-bold text-gray-500">{displayNumber}</motion.p>
      </div>
    </div>
  );
};

export default NotificationStatCard;