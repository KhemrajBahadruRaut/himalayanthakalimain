"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Skeleton from "@/components/ui/Skeleton";

const Navbar = dynamic(() => import("../../components/layout/navbar/Navbar"), {
  loading: () => <div className="h-24" />,
});

const Footer = dynamic(() => import("../../components/layout/footer/Footer"), {
  loading: () => <div className="h-40" />,
});

// const API = `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost/himalayanthakali_backend"}/menu`;
const API = `${process.env.NEXT_PUBLIC_API_BASE || "https://api.himalayanthakali.com/himalayanthakali_backend"}/menu`;

function MenuCategorySkeleton() {
  return (
    <ul className="flex min-w-max gap-2 lg:min-w-0 lg:flex-col">
      {Array.from({ length: 6 }).map((_, index) => (
        <li key={`cat-skeleton-${index}`}>
          <Skeleton className="h-10 w-28 rounded bg-white/10 lg:w-full" />
        </li>
      ))}
    </ul>
  );
}

function MenuItemsSkeleton() {
  return (
    <section className="mx-auto mb-10 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`item-skeleton-${index}`}
          className="rounded-lg bg-gray-800/50 p-6"
        >
          <Skeleton className="mx-auto mb-4 aspect-square max-w-55 rounded-full bg-white/10" />
          <Skeleton className="mx-auto mb-2 h-6 w-3/4 bg-white/10" />
          <Skeleton className="mx-auto mb-2 h-4 w-full bg-white/10" />
          <Skeleton className="mx-auto mb-4 h-4 w-5/6 bg-white/10" />
          <Skeleton className="mx-auto h-5 w-28 bg-white/10" />
        </div>
      ))}
    </section>
  );
}

const MenuPage = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isItemsLoading, setIsItemsLoading] = useState(false);

  const fetchItems = async (id) => {
    setIsItemsLoading(true);
    try {
      setActiveCategory(id);
      const res = await fetch(`${API}/get_items.php?category_id=${id}`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Error fetching items:", err);
      setItems([]);
    } finally {
      setIsItemsLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const loadInitialMenu = async () => {
      setIsInitialLoading(true);
      try {
        const categoriesRes = await fetch(`${API}/get_categories.php`);
        const categoriesData = await categoriesRes.json();

        if (isCancelled) return;
        setCategories(categoriesData);

        if (categoriesData.length > 0) {
          const firstCategoryId = categoriesData[0].id;
          setActiveCategory(firstCategoryId);

          const itemsRes = await fetch(
            `${API}/get_items.php?category_id=${firstCategoryId}`,
          );
          const itemsData = await itemsRes.json();

          if (isCancelled) return;
          setItems(itemsData);
        }
      } catch (err) {
        console.error("Error loading initial menu:", err);
      } finally {
        if (!isCancelled) {
          setIsInitialLoading(false);
        }
      }
    };

    loadInitialMenu();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedItem) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedItem(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem]);

  return (
    <>
      <Navbar />

      <div className="bg-[#1E1E1E] pt-30 text-white">
        <div className="flex flex-col lg:flex-row">
          <aside className="w-full border-b border-gray-800 p-4 pt-20 lg:w-64 lg:border-r lg:border-b-0">
            <h2 className="mb-4 text-center lg:mb-6 text-[#D97634] text-sm tracking-[0.3em] font-light">
              MENU
            </h2>

            <nav
              aria-label="Menu categories"
              className="overflow-x-auto lg:overflow-visible"
            >
              {isInitialLoading ? (
                <MenuCategorySkeleton />
              ) : (
                <ul className="flex min-w-max gap-2 lg:min-w-0 lg:flex-col">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <button
                        type="button"
                        onClick={() => fetchItems(category.id)}
                        aria-pressed={activeCategory === category.id}
                        className={`w-full whitespace-nowrap rounded px-4 py-2 text-sm transition-colors lg:text-base ${
                          activeCategory === category.id
                            ? "bg-orange-500 font-medium text-white"
                            : "text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </nav>
          </aside>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mb-10 text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-px  md:w-56 bg-linear-to-r from-transparent to-[#D97634]" />
            <span
              className="text-[#D97634] text-sm tracking-[0.2em] font-light"
            >
             OUR MENU 
            </span>
            <div className="h-px  md:w-56 bg-linear-to-l from-transparent to-[#D97634]" />
              </div>

              <h1 className="text-2xl font-serif sm:text-3xl lg:text-4xl">
                From Our Kitchen
              </h1>
            </div>

            {isInitialLoading || isItemsLoading ? (
              <MenuItemsSkeleton />
            ) : items.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <h3 className="mb-2 text-xl font-semibold text-gray-300">
                    No Items Available
                  </h3>
                  <p className="text-sm text-gray-500">
                    There are no items in this category at the moment.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <section
                  className="mx-auto mb-10 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3"
                  aria-label="Menu items"
                >
                  {items.slice(0, 3).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      aria-label={`View details for ${item.name}`}
                      className="cursor-pointer rounded-lg bg-gray-800/50 p-6 text-left transition-colors hover:bg-gray-800"
                    >
                      <div className="relative mx-auto mb-4 aspect-square max-w-55 overflow-hidden rounded-full bg-gray-700">
                        <Image
                          src={
                            item.image
                              ? `${API}/uploads/${item.image}`
                              : "/placeholder.png"
                          }
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <h2 className="mb-2 text-center text-lg font-semibold">
                        {item.name}
                      </h2>
                      <p className="mb-4 text-center text-xs leading-relaxed text-gray-400">
                        {item.description}
                      </p>
                      <p className="text-center font-medium text-orange-500">
                        Rs. {item.price}/-
                      </p>
                    </button>
                  ))}
                </section>

                {items.length > 3 && (
                  <section
                    className="mx-auto max-w-sm px-2 sm:px-0"
                    aria-label="Featured menu item"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedItem(items[3])}
                      aria-label={`View details for ${items[3].name}`}
                      className="w-full cursor-pointer rounded-lg bg-gray-800/50 p-6 text-left transition-colors hover:bg-gray-800"
                    >
                      <div className="relative mx-auto mb-4 aspect-square max-w-55 overflow-hidden rounded-full bg-gray-700">
                        <Image
                          src={
                            items[3].image
                              ? `${API}/uploads/${items[3].image}`
                              : "/placeholder.png"
                          }
                          alt={items[3].name}
                          fill
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <h2 className="mb-2 text-center text-lg font-semibold">
                        {items[3].name}
                      </h2>
                      <p className="mb-4 text-center text-xs leading-relaxed text-gray-400">
                        {items[3].description}
                      </p>
                      <p className="text-center font-medium text-orange-500">
                        Rs. {items[3].price}/-
                      </p>
                    </button>
                  </section>
                )}
              </>
            )}
          </main>

          {selectedItem && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
              onClick={() => setSelectedItem(null)}
              role="dialog"
              aria-modal="true"
              aria-label={`Menu item details: ${selectedItem.name}`}
            >
              <div
                className="relative w-full max-w-md rounded-lg bg-[#1E1E1E] p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  aria-label="Close menu item details"
                  className="absolute top-3 right-3 text-gray-400 hover:text-white"
                >
                  &times;
                </button>

                <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-gray-700">
                  <Image
                    src={
                      selectedItem.image
                        ? `${API}/uploads/${selectedItem.image}`
                        : "/placeholder.png"
                    }
                    alt={selectedItem.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 512px"
                    className="h-full w-full object-cover"
                  />
                </div>

                <h2 className="mb-2 text-center text-xl font-semibold">
                  {selectedItem.name}
                </h2>
                <p className="mb-4 text-center text-sm text-gray-400">
                  {selectedItem.description}
                </p>
                <p className="text-center text-lg font-medium text-orange-500">
                  Rs. {selectedItem.price}/-
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-10">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default MenuPage;
