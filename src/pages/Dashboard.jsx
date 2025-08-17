import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import Footer from '../partials/Footer';
import FilterButton from '../components/DropdownFilter';
import Datepicker from '../components/Datepicker';
import NotificationStatCard from '../partials/dashboard/NotificationStatCard';
import DashboardCard01 from '../partials/dashboard/DashboardCard01';
import DashboardCard02 from '../partials/dashboard/DashboardCard02';
import DashboardCard03 from '../partials/dashboard/DashboardCard03';
import DashboardCard04 from '../partials/dashboard/DashboardCard04';
import DashboardCard05 from '../partials/dashboard/DashboardCard05';
import DashboardCard06 from '../partials/dashboard/DashboardCard06';
import DashboardCard07 from '../partials/dashboard/DashboardCard07';
import DashboardCard08 from '../partials/dashboard/DashboardCard08';
import DashboardCard09 from '../partials/dashboard/DashboardCard09';
import DashboardCard10 from '../partials/dashboard/DashboardCard10';
import DashboardCard11 from '../partials/dashboard/DashboardCard11';
import NotificationHeatmap from '../partials/dashboard/NotificationHeatmap';
import NotificationAppType from '../partials/dashboard/NotificationAppType';
import NotificationVolume from '../partials/dashboard/NotificationVolume';
import EmotionalToneTrends from '../partials/dashboard/NotificationToneCard';

const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;
const API_KEY = import.meta.env.VITE_NOTIFLOW_API_KEY;

const NotificationCard = ({ message, iconUrl, posted, appName }) => {
  const timeAgo = moment(posted, "ddd, DD MMM YYYY HH:mm:ss [GMT]").fromNow();

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }} // Start off-screen (right)
      animate={{ x: 0, opacity: 1 }} // Move to center
      exit={{ x: "-100%", opacity: 0 }} // Exit to left
      transition={{ duration: 1.5 }}
      className="relative flex items-center bg-white shadow-lg rounded-lg px-6 text-black w-80 h-16"
    >
      <div className="absolute -left-6 w-20 h-20 rounded-full flex items-center justify-center text-white text-lg font-bold overflow-hidden">
        {iconUrl ? <img src={iconUrl} alt="Notification Icon" className="w-full h-full object-scale-down rounded-full p-1 bg-white" /> : null}
      </div>
      
      <div className="absolute right-2 text-[10px] text-pink-500 mt-10">{timeAgo}</div>
      <div className="absolute ml-10 text-[10px] text-gray-500 mt-10">{appName}</div>
      <div className="ml-10 flex-1 text-sm text-ellipsis whitespace-normal line-clamp-2 mb-4 text-left">
        {message}
      </div>
    </motion.div>
  );
};

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}/web/recent-notifications`, {
          method: "GET",
          headers: {
            "X-API-Key": API_KEY,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log(data)
        setNotifications(data.slice(-3)); // Keep only the latest 3 notifications
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Fetch notifications initially
    fetchNotifications();

    // Set interval to fetch notifications every 1 minute
    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <div className="relative w-full flex justify-center overflow-x-hidden py-4">
      <div className="grid grid-cols-3 gap-8 w-3/4">
        <AnimatePresence mode="popLayout">
          {notifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ x: "100%", opacity: 0 }} // Enter from the right
              animate={{ x: 0, opacity: 1, transition: { duration: index === 1 ? 1.5 : 1.5 } }}
              exit={{ x: "-100%", opacity: 0 }} // Exit to the left
              transition={{ duration: 1.5 }}
            >
              <NotificationCard message={notif.text} iconUrl={notif.icon} posted={notif.posted} appName={notif.appName} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

function Dashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalStats, setTotalStats] = useState()
  const [selectedFilter, setSelectedFilter] = useState("Emotional Tone")

  const handleFilterClick = async (filter) => {
    setSelectedFilter(filter);
    // try {
    //   const response = await fetch(`${API_URL}/api/data?filter=${filter}`);
    //   const data = await response.json();
    //   setChartData(data);
    // } catch (error) {
    //   console.error("Error fetching chart data:", error);
    // }
  };

  useEffect(() => {
    const fetchTotalStats = async () => {
      try {
        const response = await fetch(`${API_URL}/web/total-stats`, {
          method: "GET",
          headers: {
            "X-API-Key": API_KEY,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setTotalStats(data); // Keep only the latest 3 notifications
      } catch (error) {
        console.error("Error fetching total stats:", error);
      }
    };

    // Fetch notifications initially
    fetchTotalStats();

    // Set interval to fetch notifications every 1 minute
    // const interval = setInterval(fetchNotifications, 10000);

    //return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const filters = ["Emotional Tone", "Context Awareness", "Behavioral Triggers", "Call-to-Emotion", "Promotions"];

  return (
    <div className="flex h-[100dvh] overflow-hidden">

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Left: Title */}
            <div className="mb-24 sm:mb-12">
              <div className="grid grid-cols-2 gap-24">
                <div className="my-auto">
                  <h1 className="text-4xl md:text-4xl text-gray-800 font-bold text-right mb-4">Discover EmPushy</h1>
                  <h4 className="text-xl md:text-xl text-gray-400 text-right">We track mobile and web notifications<br/> pushed by brands, identify trends and <br/>recommend engaging campaigns</h4>
                </div>
                <div className="text-left my-auto">
                  <stripe-buy-button 
                    buy-button-id="buy_btn_1R0XGNEcRqjLfVA2KAfBHLWs"
                    publishable-key="pk_live_51LO28HEcRqjLfVA2ChuRABaHeAGLF3foAIuYXROAa4cj0u1tEPUuzP5fRQKa75Qpeh0OXyOlxMEv5h9EklXcgVo300L2yD7mDG">
                  </stripe-buy-button>
                </div>
              </div>
              
            </div>

            <div className="w-2/3 text-center mx-auto mb-12">
              <div className="grid grid-cols-12 gap-6 mb-12">
              {totalStats && (
                <>
                  <NotificationStatCard stat={"Notifications"} initialQuantity={totalStats["total_notifications"]} autoIncrease={true} />
                  <NotificationStatCard stat={"Brands"} initialQuantity={totalStats["total_brands"]} autoIncrease={false} />
                  <NotificationStatCard stat={"Markets"} initialQuantity={totalStats["total_markets"]} autoIncrease={false} />
                </>
              )}
              </div>
            </div>
            <div className="w-100 text-center mx-auto mb-12">
              <div>
                <NotificationSystem/>
              </div>
            </div>

            <div className="w-2/3 text-center mx-auto mb-12">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={`px-4 py-2 rounded-lg font-bold mx-2 transition-all duration-300 ${
                    selectedFilter === filter ? "bg-yellow-500 text-white" : "bg-pink-400 text-white"
                  }`}
                  onClick={() => handleFilterClick(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="w-4/5 mx-auto  mb-24">
              <EmotionalToneTrends trendType={selectedFilter}/>

            </div>
          </div>
          <Footer/>
        </main>

      </div>
    </div>
  );
}

export default Dashboard;