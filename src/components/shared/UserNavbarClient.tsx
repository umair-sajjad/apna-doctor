"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "@/app/actions/auth";
import {
  LayoutDashboard,
  CalendarDays,
  Stethoscope,
  MessageCircle,
  Bell,
  Bot,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  Phone,
  Info,
  Building2,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";

interface UserData {
  id: string;
  full_name: string;
  email: string;
  profile_photo: string | null;
}

interface Props {
  user: UserData | null;
  notificationCount?: number;
  messageCount?: number;
}

export default function UserNavbarClient({
  user,
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

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        isActive(href) ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );

  const iconBtn = (
    href: string,
    icon: React.ReactNode,
    badge?: number,
    label?: string
  ) => (
    <Link
      href={href}
      aria-label={label}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
        isActive(href)
          ? "bg-blue-50 text-blue-600"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {icon}
      {badge != null && badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40">
      {/* ── Top Info Bar (desktop only) ── */}
      <div className="hidden md:block" style={{ background: "var(--hero-bg)" }}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-9 items-center justify-between">
            {/* Left — contact info */}
            <div className="flex items-center gap-6">
              <a
                href="tel:02138140600"
                className="flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: "rgba(255,255,255,0.45)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
                }
              >
                <Phone size={11} />
                021 38140600
              </a>
              <a
                href="mailto:support@apnadoctor.pk"
                className="flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: "rgba(255,255,255,0.45)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
                }
              >
                <Mail size={11} />
                support@apnadoctor.pk
              </a>
            </div>

            {/* Right — social icons */}
            <div className="flex items-center gap-2">
              {[
                { icon: Facebook, label: "Facebook", href: "#" },
                { icon: Instagram, label: "Instagram", href: "#" },
                { icon: Twitter, label: "Twitter", href: "#" },
                { icon: Linkedin, label: "LinkedIn", href: "#" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-6 w-6 items-center justify-center rounded-full transition-all"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.4)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(14,165,233,0.2)";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "rgba(255,255,255,0.4)";
                  }}
                >
                  <Icon size={11} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <div className="border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--accent))",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 44 44" fill="none">
                  <rect
                    x="19"
                    y="6"
                    width="6"
                    height="32"
                    rx="3"
                    fill="white"
                  />
                  <rect
                    x="6"
                    y="19"
                    width="32"
                    height="6"
                    rx="3"
                    fill="white"
                  />
                </svg>
              </div>
              <span
                className="font-display text-xl font-bold tracking-tight"
                style={{ color: "var(--text-dark)" }}
              >
                Apna<span style={{ color: "var(--accent)" }}>Doctor</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-6 md:flex">
              {user ? (
                <>
                  {navLink("/dashboard", "Dashboard")}
                  {navLink("/appointments", "Appointments")}
                  {navLink("/doctors", "Find Doctor")}
                  {navLink("/hospitals", "Hospitals")}
                  {navLink("/about", "About Us")}
                  {navLink("/contact", "Contact Us")}
                </>
              ) : (
                <>
                  {navLink("/doctors", "Find Doctor")}
                  {navLink("/hospitals", "Hospitals")}
                  {navLink("/about", "About Us")}
                  {navLink("/contact", "Contact Us")}
                </>
              )}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/chat"
                className={`hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors md:flex ${
                  isActive("/chat")
                    ? "text-white"
                    : "text-blue-600 hover:opacity-80"
                }`}
                style={
                  isActive("/chat")
                    ? { background: "var(--primary)" }
                    : { background: "var(--primary-light)" }
                }
              >
                <Bot className="h-4 w-4" />
                AI Chat
              </Link>

              {user ? (
                <>
                  {iconBtn(
                    "/messages",
                    <MessageCircle className="h-5 w-5" />,
                    messageCount,
                    "Messages"
                  )}
                  {iconBtn(
                    "/notifications",
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
                      className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 transition-all hover:border-blue-400 focus:outline-none"
                      aria-label="Profile menu"
                      aria-expanded={profileOpen}
                    >
                      {user.profile_photo ? (
                        <Image
                          src={user.profile_photo}
                          alt={user.full_name}
                          width={36}
                          height={36}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-500" />
                      )}
                    </button>

                    {profileOpen && (
                      <div className="absolute top-10 right-0 w-64 rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-black/5">
                        <div className="absolute -top-2 right-0 h-2 w-full" />
                        <div className="flex items-center gap-3 border-b border-gray-100 p-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                            {user.profile_photo ? (
                              <Image
                                src={user.profile_photo}
                                alt={user.full_name}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">
                              {user.full_name}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/profile"
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setProfileOpen(false)}
                          >
                            <User className="h-4 w-4 text-gray-400" />
                            View Profile
                          </Link>
                          <form action={signOut}>
                            <button
                              type="submit"
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <LogOut className="h-4 w-4" />
                              Logout
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
                    className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-green-50"
                    style={{
                      borderColor: "var(--primary)",
                      color: "var(--primary)",
                    }}
                  >
                    <Stethoscope className="h-4 w-4" />
                    Join as Doctor
                  </Link>
                  <Link
                    href="/login/user"
                    className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    style={{ background: "var(--primary)" }}
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((prev) => !prev)}
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
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {user ? (
              <>
                <MobileLink
                  href="/dashboard"
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  label="Dashboard"
                  active={isActive("/dashboard")}
                />
                <MobileLink
                  href="/appointments"
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Appointments"
                  active={isActive("/appointments")}
                />
                <MobileLink
                  href="/doctors"
                  icon={<Stethoscope className="h-4 w-4" />}
                  label="Find Doctor"
                  active={isActive("/doctors")}
                />
                <MobileLink
                  href="/hospitals"
                  icon={<Building2 className="h-4 w-4" />}
                  label="Hospitals"
                  active={isActive("/hospitals")}
                />
                <MobileLink
                  href="/chat"
                  icon={<Bot className="h-4 w-4" />}
                  label="AI Chat"
                  active={isActive("/chat")}
                />
                <MobileLink
                  href="/messages"
                  icon={<MessageCircle className="h-4 w-4" />}
                  label="Messages"
                  active={isActive("/messages")}
                  badge={messageCount}
                />
                <MobileLink
                  href="/notifications"
                  icon={<Bell className="h-4 w-4" />}
                  label="Notifications"
                  active={isActive("/notifications")}
                  badge={notificationCount}
                />
                <div className="my-2 border-t border-gray-100" />
                <MobileLink
                  href="/profile"
                  icon={<User className="h-4 w-4" />}
                  label="Profile"
                  active={isActive("/profile")}
                />
                <MobileLink
                  href="/about"
                  icon={<Info className="h-4 w-4" />}
                  label="About Us"
                  active={isActive("/about")}
                />
                <MobileLink
                  href="/contact"
                  icon={<Phone className="h-4 w-4" />}
                  label="Contact Us"
                  active={isActive("/contact")}
                />
                <form action={signOut}>
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <MobileLink
                  href="/doctors"
                  icon={<Stethoscope className="h-4 w-4" />}
                  label="Find Doctor"
                  active={isActive("/doctors")}
                />
                <MobileLink
                  href="/hospitals"
                  icon={<Building2 className="h-4 w-4" />}
                  label="Hospitals"
                  active={isActive("/hospitals")}
                />
                <MobileLink
                  href="/chat"
                  icon={<Bot className="h-4 w-4" />}
                  label="AI Chat"
                  active={isActive("/chat")}
                />
                <MobileLink
                  href="/about"
                  icon={<Info className="h-4 w-4" />}
                  label="About Us"
                  active={isActive("/about")}
                />
                <MobileLink
                  href="/contact"
                  icon={<Phone className="h-4 w-4" />}
                  label="Contact Us"
                  active={isActive("/contact")}
                />
                <div className="my-2 border-t border-gray-100" />
                <MobileLink
                  href="/login/doctor"
                  icon={<Stethoscope className="h-4 w-4" />}
                  label="Join as Doctor"
                  active={false}
                  highlightGreen
                />
                <MobileLink
                  href="/login/user"
                  icon={<LogIn className="h-4 w-4" />}
                  label="Login"
                  active={false}
                  highlight
                />
              </>
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
  highlightGreen,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
  highlight?: boolean;
  highlightGreen?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        highlight
          ? "text-white"
          : highlightGreen
            ? "border text-green-700 hover:bg-green-50"
            : active
              ? "bg-blue-50 text-blue-600"
              : "text-gray-700 hover:bg-gray-50"
      }`}
      style={
        highlight
          ? { background: "var(--primary)" }
          : highlightGreen
            ? { borderColor: "var(--primary)" }
            : {}
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
