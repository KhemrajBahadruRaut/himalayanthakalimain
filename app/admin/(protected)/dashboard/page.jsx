"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  FolderKanban,
  Image as ImageIcon,
  Mail,
  MessageSquareText,
  Newspaper,
  RefreshCw,
  UtensilsCrossed,
} from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

const API_BASE = "https://api.himalayanthakali.com/himalayanthakali_backend";

const EMPTY_METRICS = {
  blogsTotal: 0,
  contactsTotal: 0,
  menuCategoriesTotal: 0,
  menuItemsTotal: 0,
  galleryCategoriesTotal: 0,
  galleryImagesTotal: 0,
};

const QUICK_ACTIONS = [
  {
    href: "/admin/admin-blogs",
    label: "Manage Blogs",
    description: "Write, update and publish news posts.",
    icon: Newspaper,
  },
  {
    href: "/admin/contacts-table",
    label: "Open Contacts",
    description: "Review and clean incoming contact messages.",
    icon: Mail,
  },
  {
    href: "/admin/menu-table",
    label: "Update Menu",
    description: "Add categories, items, pricing and photos.",
    icon: UtensilsCrossed,
  },
  {
    href: "/admin/admin-gallery",
    label: "Edit Gallery",
    description: "Organize image collections by category.",
    icon: ImageIcon,
  },
];

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
}

function toTimestamp(value) {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeTime(value) {
  const stamp = toTimestamp(value);
  if (!stamp) return "just now";

  const diffMs = Date.now() - stamp;
  const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [menuBreakdown, setMenuBreakdown] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loadErrors, setLoadErrors] = useState([]);

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const nextErrors = [];

    try {
      const [
        blogsResult,
        contactsResult,
        menuCategoriesResult,
        galleryCategoriesResult,
        galleryResult,
      ] = await Promise.allSettled([
        fetchJson(`${API_BASE}/blogs/get_blogs.php`),
        fetchJson(`${API_BASE}/contacts/get-contacts.php`),
        fetchJson(`${API_BASE}/menu/get_categories.php`),
        fetchJson(`${API_BASE}/gallery/get_categories.php`),
        fetchJson(`${API_BASE}/gallery/get_gallery.php`),
      ]);

      const blogsPayload =
        blogsResult.status === "fulfilled" ? blogsResult.value : null;
      if (blogsResult.status === "rejected" || blogsPayload?.success === false) {
        nextErrors.push("blogs");
      }
      const blogs = normalizeArray(blogsPayload?.data);

      const contactsPayload =
        contactsResult.status === "fulfilled" ? contactsResult.value : null;
      if (contactsResult.status === "rejected") {
        nextErrors.push("contacts");
      }
      const contacts = normalizeArray(contactsPayload);

      const menuCategoriesPayload =
        menuCategoriesResult.status === "fulfilled"
          ? menuCategoriesResult.value
          : null;
      if (menuCategoriesResult.status === "rejected") {
        nextErrors.push("menu categories");
      }
      const menuCategories = normalizeArray(menuCategoriesPayload);

      const menuItemCounts = [];
      if (menuCategories.length > 0) {
        const menuItemsResult = await Promise.allSettled(
          menuCategories.map((category) =>
            fetchJson(`${API_BASE}/menu/get_items.php?category_id=${category.id}`)
          )
        );

        menuItemsResult.forEach((result, index) => {
          const category = menuCategories[index];
          if (result.status === "fulfilled") {
            menuItemCounts.push({
              id: category.id,
              name: category.name || `Category ${category.id}`,
              count: normalizeArray(result.value).length,
            });
            return;
          }

          nextErrors.push(`menu items (${category.name || category.id})`);
          menuItemCounts.push({
            id: category.id,
            name: category.name || `Category ${category.id}`,
            count: 0,
          });
        });
      }

      const galleryCategoriesPayload =
        galleryCategoriesResult.status === "fulfilled"
          ? galleryCategoriesResult.value
          : null;
      if (galleryCategoriesResult.status === "rejected") {
        nextErrors.push("gallery categories");
      }
      const galleryCategories = normalizeArray(galleryCategoriesPayload);

      const galleryPayload =
        galleryResult.status === "fulfilled" ? galleryResult.value : null;
      if (galleryResult.status === "rejected" || galleryPayload?.success === false) {
        nextErrors.push("gallery images");
      }
      const galleryImages = normalizeArray(galleryPayload?.data);

      const menuItemsTotal = menuItemCounts.reduce(
        (sum, category) => sum + category.count,
        0
      );

      const nextActivity = [
        ...blogs.slice(0, 6).map((blog) => ({
          id: `blog-${blog.id}`,
          type: "Blog",
          title: blog.title || "Untitled blog",
          detail: blog.short_description || "Published post",
          createdAt: blog.created_at,
          href: "/admin/admin-blogs",
        })),
        ...contacts.slice(0, 6).map((contact) => ({
          id: `contact-${contact.id}`,
          type: "Contact",
          title: contact.full_name || "Unknown sender",
          detail: contact.message || contact.email || "New message",
          createdAt: contact.created_at,
          href: "/admin/contacts-table",
        })),
      ]
        .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt))
        .slice(0, 8);

      setMetrics({
        blogsTotal: blogs.length,
        contactsTotal: contacts.length,
        menuCategoriesTotal: menuCategories.length,
        menuItemsTotal,
        galleryCategoriesTotal: galleryCategories.length,
        galleryImagesTotal: galleryImages.length,
      });
      setMenuBreakdown(
        [...menuItemCounts].sort((a, b) => b.count - a.count).slice(0, 6)
      );
      setRecentActivity(nextActivity);
      setLoadErrors([...new Set(nextErrors)]);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error("Dashboard loading failed:", error);
      setLoadErrors(["dashboard"]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = useMemo(
    () => [
      {
        label: "Published Blogs",
        value: metrics.blogsTotal,
        icon: Newspaper,
        href: "/admin/admin-blogs",
        accent: "text-blue-600 bg-blue-50",
      },
      {
        label: "Contact Messages",
        value: metrics.contactsTotal,
        icon: MessageSquareText,
        href: "/admin/contacts-table",
        accent: "text-emerald-600 bg-emerald-50",
      },
      {
        label: "Menu Categories",
        value: metrics.menuCategoriesTotal,
        icon: FolderKanban,
        href: "/admin/menu-table",
        accent: "text-indigo-600 bg-indigo-50",
      },
      {
        label: "Menu Items",
        value: metrics.menuItemsTotal,
        icon: UtensilsCrossed,
        href: "/admin/menu-table",
        accent: "text-amber-700 bg-amber-50",
      },
      {
        label: "Gallery Categories",
        value: metrics.galleryCategoriesTotal,
        icon: FolderKanban,
        href: "/admin/admin-gallery",
        accent: "text-violet-600 bg-violet-50",
      },
      {
        label: "Gallery Images",
        value: metrics.galleryImagesTotal,
        icon: ImageIcon,
        href: "/admin/admin-gallery",
        accent: "text-rose-600 bg-rose-50",
      },
    ],
    [metrics]
  );

  const maxMenuCount =
    menuBreakdown.length > 0 ? Math.max(...menuBreakdown.map((c) => c.count)) : 1;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Overview of content, customer messages, menu, and gallery assets.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Last updated: {lastUpdated ? formatDateTime(lastUpdated) : "Loading..."}
            </p>
          </div>

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      {loadErrors.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-sm">
            Some data sources could not be loaded: {loadErrors.slice(0, 4).join(", ")}
            {loadErrors.length > 4 ? "..." : ""}.
          </p>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`dashboard-stat-skeleton-${index}`}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <Skeleton className="h-5 w-2/5" />
                <Skeleton className="mt-3 h-9 w-1/3" />
                <Skeleton className="mt-4 h-4 w-3/5" />
              </div>
            ))
          : stats.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <span className={`rounded-lg p-2 ${card.accent}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition group-hover:text-slate-800">
                    Open module <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition hover:border-[#E9842C]/40 hover:bg-orange-50/40"
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 text-[#E9842C]" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                    <p className="text-xs text-slate-500">{action.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest updates from blogs and contact messages.
          </p>

          <div className="mt-4 space-y-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`activity-skeleton-${index}`}
                  className="rounded-xl border border-slate-100 p-3"
                >
                  <Skeleton className="h-4 w-2/5" />
                  <Skeleton className="mt-2 h-4 w-4/5" />
                </div>
              ))
            ) : recentActivity.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                No recent activity found.
              </div>
            ) : (
              recentActivity.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50/60"
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {item.type}
                    </span>
                    <span className="text-xs text-slate-400">
                      {relativeTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 truncate text-sm text-slate-500">{item.detail}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Menu Breakdown</h2>
          <p className="mt-1 text-sm text-slate-500">
            Category distribution by item volume.
          </p>

          <div className="mt-4 space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={`menu-breakdown-skeleton-${index}`}>
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="mt-2 h-2 w-full rounded-full" />
                </div>
              ))
            ) : menuBreakdown.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                No menu category data yet.
              </div>
            ) : (
              menuBreakdown.map((category) => {
                const percent =
                  maxMenuCount > 0 ? Math.round((category.count / maxMenuCount) * 100) : 0;

                return (
                  <div key={category.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{category.name}</span>
                      <span className="text-slate-500">{category.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-[#E9842C]"
                        style={{ width: `${category.count > 0 ? Math.max(8, percent) : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
