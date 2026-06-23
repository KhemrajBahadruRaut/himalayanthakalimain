"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

const Navbar = dynamic(() => import("../../components/layout/navbar/Navbar"), {
  loading: () => <div className="h-24" />,
});

const Footer = dynamic(() => import("../../components/layout/footer/Footer"), {
  loading: () => <div className="h-40" />,
});

const API = `${process.env.NEXT_PUBLIC_API_BASE || "https://api.himalayanthakali.com/himalayanthakali_backend"}/menu`;
// const API = `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost/himalayanthakali_backend"}/menu`;


type Category = { id: number; name: string };
type MenuItem = {
  id: number;
  name: string;
  description?: string;
  price: string;
  image?: string;
  image_url?: string;
  subcategory?: string;
};

function CategoryTabsSkeleton() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-9 w-28 shrink-0 animate-pulse rounded border border-[#D97634]/20 bg-white/5"
        />
      ))}
    </div>
  );
}

function MenuListSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between border-b border-white/5 py-4"
        >
          <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

type SelectedItem = MenuItem & { categoryName?: string };

function ItemModal({
  item,
  onClose,
}: {
  item: SelectedItem;
  onClose: () => void;
}) {
  // Resolve image src
  const imageSrc = item.image_url
    ? item.image_url.startsWith("http")
      ? item.image_url
      : `https://api.himalayanthakali.com/himalayanthakali_backend/menu/${item.image_url.replace(/^\/+/, "")}`
      // : `http://localhost/himalayanthakali_backend/menu/${item.image_url.replace(/^\/+/, "")}`
    : item.image
    ? `${API}/uploads/${item.image}`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${item.name}`}
    >
      <div
        className="relative w-full max-w-sm rounded-lg border border-[#D97634]/20 bg-[#1E1E1E] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-500 transition-colors hover:text-white"
        >
          ✕
        </button>

        {imageSrc ? (
          <div className="relative mx-auto mb-5 h-48 w-48 overflow-hidden rounded-full border border-[#D97634]/30 bg-gray-800">
            <Image
              src={imageSrc}
              alt={item.name}
              fill
              sizes="192px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="mx-auto mb-5 flex h-48 w-48 items-center justify-center rounded-full border border-[#D97634]/20 bg-white/5">
            <span className="text-4xl opacity-40">🍽️</span>
          </div>
        )}

        <h2 className="mb-1 text-center font-serif text-xl font-semibold text-white">
          {item.name}
        </h2>

        {item.subcategory && (
          <p className="mb-2 text-center text-xs font-light tracking-widest text-[#D97634]/70 uppercase">
            {item.subcategory}
          </p>
        )}

        {item.description && (
          <p className="mb-4 text-center text-sm leading-relaxed text-gray-400">
            {item.description}
          </p>
        )}

        <p className="text-center text-lg font-medium tracking-wide text-[#D97634]">
          RS. {item.price}/-
        </p>
      </div>
    </div>
  );
}

export default function MainMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isItemsLoading, setIsItemsLoading] = useState(false);

  const activeCategoryName =
    categories.find((c) => c.id === activeCategory)?.name ?? "";

  const fetchItems = async (id: number) => {
    setIsItemsLoading(true);
    setActiveCategory(id);
    try {
      const res = await fetch(`${API}/get_items.php?category_id=${id}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setIsItemsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      setIsInitialLoading(true);
      try {
        const catRes = await fetch(`${API}/get_categories.php`);
        const cats: Category[] = await catRes.json();
        if (cancelled) return;
        setCategories(cats);
        if (cats.length > 0) {
          const first = cats[0].id;
          setActiveCategory(first);
          const itemsRes = await fetch(`${API}/get_items.php?category_id=${first}`);
          const itemsData = await itemsRes.json();
          if (cancelled) return;
          setItems(Array.isArray(itemsData) ? itemsData : []);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setIsInitialLoading(false);
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedItem(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedItem]);

  // Group items by subcategory
  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const key = item.subcategory?.trim() ?? "";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const hasSubcategories = Object.keys(grouped).some((k) => k !== "");

  // Resolve image URL for a given item
  const resolveImageUrl = (item: MenuItem): string | null => {
    if (item.image_url) {
      return item.image_url.startsWith("http")
        ? item.image_url
        : `https://api.himalayanthakali.com/himalayanthakali_backend/menu/${item.image_url.replace(/^\/+/, "")}`;
        // : `http://localhost/himalayanthakali_backend/menu/${item.image_url.replace(/^\/+/, "")}`;
    }
    if (item.image) return `${API}/uploads/${item.image}`;
    return null;
  };

  // Pick a featured item that has an image (for the sidebar)
  const featuredItem = items.find((i) => resolveImageUrl(i));
  const featuredImageSrc = featuredItem ? resolveImageUrl(featuredItem) : null;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#1E1E1E] text-white">
        {/* Hero heading */}
        <div className="px-6 pb-8 pt-32 text-center sm:pt-36">
          <div className="mb-3 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-linear-to-r from-transparent to-[#D97634] sm:w-32" />
            <span className="text-xs font-light tracking-[0.35em] text-[#D97634]">
              HIMALAYAN THAKALI
            </span>
            <div className="h-px w-16 bg-linear-to-l from-transparent to-[#D97634] sm:w-32" />
          </div>
          <h1 className="font-serif text-3xl font-light tracking-wide sm:text-4xl lg:text-5xl">
            Our Menu
          </h1>
        </div>

        {/* Category tabs */}
        <div className="border-b border-white/10 px-4 sm:px-8">
          <div className="mx-auto max-w-7xl">
            {isInitialLoading ? (
              <CategoryTabsSkeleton />
            ) : (
              <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-none">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => fetchItems(cat.id)}
                      aria-pressed={isActive}
                      className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-xs font-light tracking-[0.15em] transition-all ${
                        isActive
                          ? "border-[#D97634] text-[#D97634]"
                          : "border-transparent text-gray-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {cat.name.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Menu content */}
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 lg:flex lg:gap-16">
          {/* Left: menu list */}
          <div className="flex-1">
            {isInitialLoading || isItemsLoading ? (
              <>
                <div className="mb-6 h-7 w-48 animate-pulse rounded bg-white/10" />
                <MenuListSkeleton />
              </>
            ) : items.length === 0 ? (
              <div className="flex items-center justify-center py-24">
                <p className="text-sm text-gray-500">
                  No items in this category yet.
                </p>
              </div>
            ) : (
              <>
                {/* Category title */}
                <h2 className="mb-1 font-serif text-xl font-light italic text-[#D97634] sm:text-2xl">
                  {activeCategoryName}
                </h2>
                <div className="mb-8 h-px w-full bg-linear-to-r from-[#D97634]/40 to-transparent" />

                {hasSubcategories ? (
                  Object.entries(grouped).map(([subcat, subItems]) => (
                    <div key={subcat || "__none__"} className="mb-10">
                      {subcat && (
                        <div className="mb-4 flex items-center gap-3">
                          <h3 className="font-serif text-base italic text-[#D97634]/80">
                            {subcat}
                          </h3>
                          <div className="flex-1 border-b border-dashed border-white/10" />
                        </div>
                      )}
                      <MenuList
                        items={subItems}
                        onSelect={(item) =>
                          setSelectedItem({
                            ...item,
                            categoryName: activeCategoryName,
                          })
                        }
                      />
                    </div>
                  ))
                ) : (
                  <MenuList
                    items={items}
                    onSelect={(item) =>
                      setSelectedItem({
                        ...item,
                        categoryName: activeCategoryName,
                      })
                    }
                  />
                )}

                {/* All prices notice */}
                <p className="mt-10 text-center text-xs text-gray-600">
                  All Prices are inclusive of Government Taxes
                </p>
              </>
            )}
          </div>

          {/* Right: feature image — only shown when an item has an image */}
          {featuredItem && featuredImageSrc && (
            <div className="mt-10 hidden lg:block lg:w-72 xl:w-80">
              <div className="sticky top-32">
                <div className="h-px w-full bg-linear-to-r from-[#D97634]/30 to-transparent mb-6" />
                <div className="overflow-hidden rounded-lg border border-[#D97634]/20">
                  <div className="relative aspect-square w-full bg-gray-900">
                    <Image
                      src={featuredImageSrc}
                      alt={activeCategoryName}
                      fill
                      sizes="320px"
                      className="object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#1E1E1E]/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                      <p className="text-xs font-light tracking-[0.2em] text-[#D97634]">
                        FEATURED
                      </p>
                      <p className="font-serif text-sm text-white">{featuredItem.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>

      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  );
}

function MenuList({
  items,
  onSelect,
}: {
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
}) {
  return (
    <div>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item)}
          className="group flex w-full items-baseline gap-3 border-b border-white/8 py-3.5 text-left transition-colors hover:border-[#D97634]/30"
        >
          <span className="flex-1 text-sm font-medium uppercase tracking-wide text-white transition-colors group-hover:text-[#D97634]">
            {item.name}
          </span>
          {/* dotted line */}
          <span className="min-w-0 flex-1 border-b border-dashed border-white/15 self-center" />
          <span className="shrink-0 text-sm font-medium tracking-wide text-white">
            RS.&nbsp;{item.price}/-
          </span>
        </button>
      ))}
    </div>
  );
}