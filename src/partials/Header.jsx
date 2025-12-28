import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { NavLink } from "react-router-dom";

function Header({ variant = "default", extraContent = null }) {
  const { isAuthenticated, logout, user } = useAuth0();

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation Links (for reuse)
  const navigationLinks = (
      <>
        {!isAuthenticated && (
          <>
            <NavLink
              end
            to="/about"
            className={
              "text-black hover:bg-yellow-500 font-medium rounded-lg px-3 py-2 transition-all"
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </NavLink>
          <NavLink
            end
            to="/newsletter"
            className={
              "text-black hover:bg-yellow-500 font-medium rounded-lg px-3 py-2 transition-all"
            }
            onClick={() => setMobileMenuOpen(false)}
          >
              Newsletter
            </NavLink>
            <NavLink
              end
              to="/pricing"
              className={
                "text-black hover:bg-yellow-500 font-medium rounded-lg px-3 py-2 transition-all"
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </NavLink>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://blog.empushy.com"
            className={
              "text-black hover:bg-yellow-500 font-medium rounded-lg px-3 py-2 transition-all"
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Blog
          </a>
        </>
      )}
        {!isAuthenticated && (
          <NavLink
            end
            className="bg-blue-200 hover:bg-blue-300 text-blue-700 px-4 py-2 rounded-lg font-bold transition-all"
            to="/auth"
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </NavLink>
        )}
      </>
    );

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
      <div className="px-4 sm:px-6 lg:px-10">
        <div
          className={`flex items-center justify-between h-16 ${
            variant === "v2" || variant === "v3"
              ? ""
              : "lg:border-b border-gray-200 dark:border-gray-700/60"
          }`}
        >
          {/* Hamburger menu (mobile) */}
          <button
            className="lg:hidden flex items-center mr-2 focus:outline-none"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(true)}
            type="button"
          >
            <svg
              className="w-7 h-7 text-black dark:text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {/* Header: Left side */}
            <div className="flex">
              <NavLink end to="/" className="text-black text-xl font-bold">
                NotiFlow
              </NavLink>
            </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="hidden lg:flex flex-col items-end text-right pr-3">
                <span className="text-[11px] uppercase tracking-[0.16em] text-emerald-600 font-semibold">
                  Welcome back
                </span>
                <span className="text-sm text-gray-700 font-semibold">{user.name || "User"}</span>
              </div>
            ) : null}
            {extraContent ? (
              <div className="hidden lg:flex items-center pr-3">{extraContent}</div>
            ) : null}
            {isAuthenticated ? (
              <button
                className={
                  "text-black hover:bg-yellow-500 font-medium rounded-lg px-3 py-2 transition-all"
                }
                onClick={() =>
                  logout({
                    logoutParams: {
                      returnTo: window.location.origin,
                    },
                  })
                }
              >
                Log Out
              </button>
            ) : null}
            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center space-x-3">
              {navigationLinks}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{}}
      >
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <NavLink
              end
              to="/"
              className="text-black text-xl font-bold"
              onClick={() => setMobileMenuOpen(false)}
            >
              NotiFlow
            </NavLink>
          <button
            className="flex items-center text-gray-700 dark:text-gray-200 focus:outline-none"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
            type="button"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col items-start px-4 py-6 space-y-2">
          {navigationLinks}
        </nav>
      </div>
      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
}

export default Header;
