"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  UserCog,
  Calendar,
  Star,
  CheckCircle,
  CreditCard,
  Bell,
  FileText,
  DollarSign,
  Settings,
  FileCode,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
  {
    section: "OVERVIEW",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
      { name: "Analytics", icon: TrendingUp, href: "/admin/analytics" },
    ],
  },
  {
    section: "MANAGEMENT",
    items: [
      { name: "Doctors", icon: UserCog, href: "/admin/doctors" },
      { name: "Users", icon: Users, href: "/admin/users" },
      { name: "Appointments", icon: Calendar, href: "/admin/appointments" },
      { name: "Reviews", icon: Star, href: "/admin/reviews" },
    ],
  },
  {
    section: "OPERATIONS",
    items: [
      { name: "Verification", icon: CheckCircle, href: "/admin/verification" },
      { name: "Payments", icon: CreditCard, href: "/admin/payments" },
      { name: "Notifications", icon: Bell, href: "/admin/test-reminders" },
    ],
  },
  {
    section: "INSIGHTS",
    items: [
      { name: "Reports", icon: FileText, href: "/admin/reports" },
      { name: "Revenue", icon: DollarSign, href: "/admin/revenue" },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      { name: "Settings", icon: Settings, href: "/admin/settings" },
      { name: "Logs", icon: FileCode, href: "/admin/logs" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="flex w-64 flex-col bg-gray-900 text-gray-100"
    >
      {/* Logo */}
      <div className="border-b border-gray-800 p-6">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 text-xl font-bold text-white shadow-lg"
          >
            <Activity className="h-6 w-6" />
          </motion.div>
          <div>
            <div className="font-bold text-white">ApnaDoctor</div>
            <div className="text-xs text-gray-400">ADMIN PANEL</div>
          </div>
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="dark-scroll flex-1 overflow-y-auto py-6">
        {menuItems.map((section, sectionIndex) => (
          <motion.div
            key={section.section}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="mb-6"
          >
            <div className="mb-2 px-6">
              <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                {section.section}
              </h3>
            </div>
            <div className="space-y-1 px-3">
              {section.items.map((item, itemIndex) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto h-1.5 w-1.5 rounded-full bg-white"
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        ))}
      </nav>

      {/* User Profile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="border-t border-gray-800 p-4"
      >
        <Link href="/admin/profile">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
          >
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 font-bold text-white">
                AS
              </div>
              <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-gray-900 bg-green-500"></div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">Admin User</div>
              <div className="text-xs text-gray-400">Administrator</div>
            </div>
            <motion.div initial={{ x: 0 }} whileHover={{ x: 3 }}>
              <svg
                className="h-5 w-5 text-gray-400 transition-colors group-hover:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.div>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
