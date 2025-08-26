import React, { useState } from "react";

import SearchModal from "../components/ModalSearch";
import Notifications from "../components/DropdownNotifications";
import Help from "../components/DropdownHelp";
import UserMenu from "../components/DropdownProfile";
import ThemeToggle from "../components/ThemeToggle";
import { NavLink, useLocation } from "react-router-dom";

function Header({ sidebarOpen, setSidebarOpen, variant = "default" }) {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 before:absolute before:inset-0 before:backdrop-blur-md max-lg:before:bg-white/90 dark:max-lg:before:bg-gray-800/90 before:-z-10 z-30 ${
        variant === "v2" || variant === "v3"
          ? "before:bg-white after:absolute after:h-px after:inset-x-0 after:top-full after:bg-gray-200 dark:after:bg-gray-700/60 after:-z-10"
          : "max-lg:shadow-sm lg:before:bg-gray-100/90 dark:lg:before:bg-gray-900/90"
      } ${variant === "v2" ? "dark:before:bg-gray-800" : ""} ${
        variant === "v3" ? "dark:before:bg-gray-900" : ""
      }`}
    >
      <div className="px-60">
        <div
          className={`flex items-center justify-between h-16 ${
            variant === "v2" || variant === "v3"
              ? ""
              : "lg:border-b border-gray-200 dark:border-gray-700/60"
          }`}
        >
          {/* Header: Left side */}
          <div className="flex">
            <NavLink
              end
              to="/"
              className="text-black hover:text-yellow-500 px-3 transition font-bold"
            >
              EmPushy
            </NavLink>
          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            <NavLink
              end
              to="/about"
              className={"text-black hover:text-yellow-500 px-3 transition"}
            >
              About Us
            </NavLink>

            <NavLink
              end
              to="/newsletter"
              className={"text-black hover:text-yellow-500 px-3 transition"}
            >
              Newsletter
            </NavLink>
            <a
              target="_blank"
              href="https://blog.empushy.com"
              className={"text-black hover:text-yellow-500 px-3 transition"}
            >
              Blog
            </a>
            <NavLink
              end
              className="text-white hover:bg-pink-400 bg-yellow-400 px-4 py-2 rounded-lg font-bold"
              to="/about"
            >
              PRO
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
