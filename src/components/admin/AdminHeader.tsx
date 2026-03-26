"use client";

import { useState } from "react";
import { signOut } from "@/app/actions/auth";
import {
  Search,
  Moon,
  Sun,
  Settings,
  Bell,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminHeaderProps {
  user: any;
  admin?: any;
}

export default function AdminHeader({ user, admin }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white bg-white/95 backdrop-blur-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl flex-1"
        >
          <div className="group relative">
            <Search className="absolute top-2.5 left-3 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-green-500" />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pr-12 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-green-500"
            />
            <kbd className="absolute top-2.5 right-3 rounded border border-gray-300 bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500">
              ⌘K
            </kbd>
          </div>
        </motion.div>

        {/* Right Side Actions */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="ml-6 flex items-center gap-2"
        >
          {/* Chat Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
            <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
              Chat
            </span>
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDark(!isDark)}
            className="group relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
              Theme
            </span>
          </motion.button>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="group relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            <Settings className="h-5 w-5" />
            <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
              Settings
            </span>
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="group relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
            >
              <Bell className="h-5 w-5" />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"
              ></motion.span>
              <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                Notifications
              </span>
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
                >
                  <div className="border-b border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="cursor-pointer border-b border-gray-100 p-4 hover:bg-gray-50"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          New appointment booked
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          2 minutes ago
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="bg-gray-50 p-3 text-center">
                    <button className="text-sm font-medium text-green-600 hover:text-green-700">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300"></div>

          {/* Logout */}
          <form action={signOut}>
            {/* <div className="flex-1">
              <div className="text-sm font-medium text-white">
                {admin?.full_name || user.email}
              </div>
              <div className="text-xs text-gray-400">
                {admin?.role === "super_admin"
                  ? "Super Admin"
                  : "Administrator"}
              </div>
            </div> */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-red-500/30 transition-all hover:from-red-600 hover:to-red-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </motion.button>
          </form>
        </motion.div>
      </div>
    </header>
  );
}
