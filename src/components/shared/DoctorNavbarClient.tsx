"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "@/app/actions/auth";
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  User,
  BarChart2,
  LogOut,
  Menu,
  X,
  Stethoscope,
  MessageCircle,
  Bell,
} from "lucide-react";

interface DoctorData {
  id: string;
  full_name: string;
  email: string;
  profile_photo: string | null;
}

interface Props {
  doctor: DoctorData | null;
  notificationCount?: number;
  messageCount?: number;
}

export default function DoctorNavbarClient({
  doctor,
  notificationCount = 0,
  messageCount = 0,
}: Props) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setProfileOpen(true);
  };
  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setProfileOpen(false), 150);
  };
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const iconBtn = (
    href: string,
    icon: React.ReactNode,
    badge?: number,
    label?: string
  ) => (
    <Link
      href={href}
      aria-label={label}
      className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors"
      style={
        isActive(href)
          ? { background: "var(--primary-light)", color: "var(--primary)" }
          : { color: "#6b7280" }
      }
    >
      {icon}
      {badge != null && badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className="text-sm font-medium transition-colors"
      style={
        isActive(href) ? { color: "var(--primary)" } : { color: "#4b5563" }
      }
    >
      {label}
    </Link>
  );

  return (
    <header
      className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-sm"
      style={{ borderColor: "var(--primary-light)" }}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/doctor/dashboard"
            className="flex shrink-0 items-center gap-2"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--accent))",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 44 44" fill="none">
                <rect x="19" y="6" width="6" height="32" rx="3" fill="white" />
                <rect x="6" y="19" width="32" height="6" rx="3" fill="white" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="font-display text-xl font-bold tracking-tight"
                style={{ color: "var(--text-dark)" }}
              >
                Apna<span style={{ color: "var(--accent)" }}>Doctor</span>
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  background: "rgba(14,165,233,0.1)",
                  color: "var(--accent)",
                }}
              >
                Doctor
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          {doctor && (
            <nav className="hidden items-center gap-6 md:flex">
              {navLink("/doctor/dashboard", "Dashboard")}
              {navLink("/doctor/appointments", "Appointments")}
              {navLink("/doctor/availability", "Availability")}
              {navLink("/doctor/analytics", "Analytics")}
            </nav>
          )}

          {/* Right */}
          <div className="flex items-center gap-2">
            {doctor ? (
              <>
                {iconBtn(
                  "/doctor/messages",
                  <MessageCircle className="h-5 w-5" />,
                  messageCount,
                  "Messages"
                )}
                {iconBtn(
                  "/doctor/notifications",
                  <Bell className="h-5 w-5" />,
                  notificationCount,
                  "Notifications"
                )}

                {/* Profile dropdown */}
                <div
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full transition-all focus:outline-none"
                    style={{ border: "2px solid var(--primary-light)" }}
                    aria-label="Profile menu"
                    aria-expanded={profileOpen}
                  >
                    {doctor.profile_photo ? (
                      <Image
                        src={doctor.profile_photo}
                        alt={doctor.full_name}
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {profileOpen && (
                    <div
                      className="absolute top-10 right-0 w-64 rounded-2xl bg-white shadow-xl"
                      style={{ border: "1px solid var(--primary-light)" }}
                    >
                      <div className="absolute -top-2 right-0 h-2 w-full" />
                      <div
                        className="flex items-center gap-3 border-b p-4"
                        style={{ borderColor: "var(--primary-light)" }}
                      >
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full"
                          style={{ background: "var(--primary-light)" }}
                        >
                          {doctor.profile_photo ? (
                            <Image
                              src={doctor.profile_photo}
                              alt={doctor.full_name}
                              width={44}
                              height={44}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User
                              className="h-5 w-5"
                              style={{ color: "var(--primary)" }}
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className="truncate text-sm font-semibold"
                            style={{ color: "var(--text-dark)" }}
                          >
                            Dr. {doctor.full_name}
                          </p>
                          <p className="truncate text-xs text-gray-400">
                            {doctor.email}
                          </p>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/doctor/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
                          style={{ color: "var(--text-dark)" }}
                        >
                          <User size={14} style={{ color: "var(--primary)" }} />{" "}
                          View Profile
                        </Link>
                        <form action={signOut}>
                          <button
                            type="submit"
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                          >
                            <LogOut size={14} /> Logout
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href="/login/doctor"
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary), var(--accent))",
                  }}
                >
                  <Stethoscope className="h-4 w-4" /> Doctor Login
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="border-t bg-white px-4 py-4 md:hidden"
          style={{ borderColor: "var(--primary-light)" }}
        >
          <nav className="flex flex-col gap-1">
            {doctor ? (
              <>
                <div
                  className="mb-2 flex items-center gap-3 rounded-xl p-3"
                  style={{
                    background: "var(--bg-soft)",
                    border: "1px solid var(--primary-light)",
                  }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full"
                    style={{ background: "var(--primary-light)" }}
                  >
                    {doctor.profile_photo ? (
                      <Image
                        src={doctor.profile_photo}
                        alt={doctor.full_name}
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User
                        className="h-4 w-4"
                        style={{ color: "var(--primary)" }}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-semibold"
                      style={{ color: "var(--text-dark)" }}
                    >
                      Dr. {doctor.full_name}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {doctor.email}
                    </p>
                  </div>
                </div>

                <div
                  className="my-1 border-t"
                  style={{ borderColor: "var(--primary-light)" }}
                />

                <MobileLink
                  href="/doctor/dashboard"
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  label="Dashboard"
                  active={isActive("/doctor/dashboard")}
                />
                <MobileLink
                  href="/doctor/appointments"
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Appointments"
                  active={isActive("/doctor/appointments")}
                />
                <MobileLink
                  href="/doctor/availability"
                  icon={<Clock className="h-4 w-4" />}
                  label="Availability"
                  active={isActive("/doctor/availability")}
                />
                <MobileLink
                  href="/doctor/analytics"
                  icon={<BarChart2 className="h-4 w-4" />}
                  label="Analytics"
                  active={isActive("/doctor/analytics")}
                />
                <MobileLink
                  href="/doctor/messages"
                  icon={<MessageCircle className="h-4 w-4" />}
                  label="Messages"
                  active={isActive("/doctor/messages")}
                  badge={messageCount}
                />
                <MobileLink
                  href="/doctor/notifications"
                  icon={<Bell className="h-4 w-4" />}
                  label="Notifications"
                  active={isActive("/doctor/notifications")}
                  badge={notificationCount}
                />

                <div
                  className="my-1 border-t"
                  style={{ borderColor: "var(--primary-light)" }}
                />

                <MobileLink
                  href="/doctor/profile"
                  icon={<User className="h-4 w-4" />}
                  label="Profile"
                  active={isActive("/doctor/profile")}
                />
                <form action={signOut}>
                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </form>
              </>
            ) : (
              <MobileLink
                href="/login/doctor"
                icon={<Stethoscope className="h-4 w-4" />}
                label="Doctor Login"
                active={false}
                highlight
              />
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function MobileLink({
  href,
  icon,
  label,
  active,
  badge,
  highlight,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
      style={
        highlight
          ? {
              background:
                "linear-gradient(135deg, var(--primary), var(--accent))",
              color: "white",
            }
          : active
            ? { background: "var(--primary-light)", color: "var(--primary)" }
            : { color: "var(--text-dark)" }
      }
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>
      {badge != null && badge > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}
