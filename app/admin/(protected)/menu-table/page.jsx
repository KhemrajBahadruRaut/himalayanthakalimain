"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FolderPlus,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
  Utensils,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import Skeleton from "@/components/ui/Skeleton";

const API = "https://api.himalayanthakali.com/himalayanthakali_backend/menu";

function toCurrency(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return `Rs. ${value || "-"}`;
  return `Rs. ${amount.toLocaleString()}`;
}

export default function MenuAdmin() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
  });
  const { showToast, showConfirm } = useToast();

  const fetchItems = useCallback(
    async (categoryId) => {
      if (!categoryId) {
        setItems([]);
        return;
      }

      setIsItemsLoading(true);
      try {
        const res = await fetch(`${API}/get_items.php?category_id=${categoryId}`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch items", error);
        setItems([]);
        showToast("Failed to fetch items.", "error");
      } finally {
        setIsItemsLoading(false);
      }
    },
    [showToast]
  );

  const fetchCategories = useCallback(
    async (preferredCategory = null) => {
      setIsCategoriesLoading(true);
      try {
        const res = await fetch(`${API}/get_categories.php`);
        const data = await res.json();
        const safeCategories = Array.isArray(data) ? data : [];
        setCategories(safeCategories);

        if (safeCategories.length === 0) {
          setActiveCategory(null);
          setItems([]);
          return;
        }

        const preferredExists =
          preferredCategory !== null &&
          safeCategories.some(
            (category) => String(category.id) === String(preferredCategory)
          );
        const nextCategory = preferredExists
          ? preferredCategory
          : safeCategories[0].id;

        setActiveCategory(nextCategory);
        await fetchItems(nextCategory);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        setCategories([]);
        showToast("Failed to fetch categories.", "error");
      } finally {
        setIsCategoriesLoading(false);
      }
    },
    [fetchItems, showToast]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryClick = async (id) => {
    setActiveCategory(id);
    await fetchItems(id);
  };

  const addCategory = async () => {
    if (!newCategory.trim()) {
      showToast("Enter a category name first.", "warning");
      return;
    }

    try {
      const res = await fetch(`${API}/add_category.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        showToast(data?.message || "Failed to add category.", "error");
        return;
      }

      const currentCategory = activeCategory;
      setNewCategory("");
      await fetchCategories(currentCategory);
      showToast(data?.message || "Category added.", "success");
    } catch (error) {
      console.error("Failed to add category", error);
      showToast("Failed to add category.", "error");
    }
  };

  const deleteCategory = async (id) => {
    const confirmed = await showConfirm(
      "Delete this category and all its menu items?",
      { type: "error", confirmLabel: "Delete" }
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${API}/delete_category.php?id=${id}`);
      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        showToast(data?.message || "Failed to delete category.", "error");
        return;
      }

      const nextPreferredCategory =
        String(activeCategory) === String(id) ? null : activeCategory;

      await fetchCategories(nextPreferredCategory);
      showToast(data?.message || "Category deleted.", "success");
    } catch (error) {
      console.error("Failed to delete category", error);
      showToast("Failed to delete category.", "error");
    }
  };

  const addItem = async () => {
    if (!activeCategory || !form.name.trim() || !form.price) {
      showToast("Category, name and price are required.", "warning");
      return;
    }

    const fd = new FormData();
    fd.append("category_id", activeCategory);
    fd.append("name", form.name.trim());
    fd.append("description", form.description.trim());
    fd.append("price", form.price);
    if (form.image) fd.append("image", form.image);

    try {
      const res = await fetch(`${API}/add_item.php`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        showToast(data?.message || "Failed to add menu item.", "error");
        return;
      }

      setForm({ name: "", description: "", price: "", image: null });
      await fetchItems(activeCategory);
      showToast(data?.message || "Menu item added.", "success");
    } catch (error) {
      console.error("Failed to add menu item", error);
      showToast("Failed to add menu item.", "error");
    }
  };

  const deleteItem = async (id) => {
    const confirmed = await showConfirm("Delete this item?", {
      type: "error",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`${API}/delete_item.php?id=${id}`);
      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        showToast(data?.message || "Failed to delete item.", "error");
        return;
      }

      await fetchItems(activeCategory);
      showToast(data?.message || "Menu item deleted.", "success");
    } catch (error) {
      console.error("Failed to delete item", error);
      showToast("Failed to delete item.", "error");
    }
  };

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) => {
      const haystack = [item.name, item.description, item.price]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [items, searchTerm]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <Utensils className="h-6 w-6 text-[#E9842C]" />
              Menu Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Organize categories, upload menu items, and manage pricing.
            </p>
          </div>
          {isItemsLoading && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading items...
            </span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Categories</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{categories.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Items In Category</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{items.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Filtered Results</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{filteredItems.length}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <aside className="xl:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <FolderPlus className="h-5 w-5 text-[#E9842C]" />
              Categories
            </h2>

            <div className="mb-4 flex gap-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add category"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
              />
              <button
                onClick={addCategory}
                className="rounded-xl bg-[#E9842C] px-3 text-white transition hover:bg-[#cf7320]"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {isCategoriesLoading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={`category-skeleton-${index}`} className="h-10 w-full" />
                ))}

              {!isCategoriesLoading && categories.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
                  No categories created yet.
                </div>
              )}

              {!isCategoriesLoading &&
                categories.map((category) => {
                  const isActive =
                    activeCategory !== null &&
                    String(activeCategory) === String(category.id);

                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                        isActive
                          ? "bg-[#E9842C] text-white"
                          : "bg-slate-50 text-slate-700 hover:bg-orange-50"
                      }`}
                    >
                      <span className="truncate pr-2">{category.name}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(category.id);
                        }}
                        className={`inline-flex rounded-lg p-1 ${
                          isActive ? "hover:bg-white/20" : "hover:bg-red-100"
                        }`}
                      >
                        <Trash2
                          className={`h-4 w-4 ${
                            isActive ? "text-white" : "text-red-500"
                          }`}
                        />
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </aside>

        <main className="xl:col-span-8 space-y-6">
          {activeCategory ? (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-slate-900">Add New Menu Item</h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input
                    placeholder="Item name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
                  />
                  <input
                    placeholder="Price"
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
                  />
                  <textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="md:col-span-2 h-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
                  />
                  <div className="md:col-span-2 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                    <ImageIcon className="h-4 w-4 text-slate-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setForm({ ...form, image: e.target.files?.[0] || null })
                      }
                      className="w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                    />
                  </div>
                  <button
                    onClick={addItem}
                    className="md:col-span-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                  >
                    Add Item
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Menu Items</h2>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search item name or description"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {isItemsLoading &&
                    Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`item-skeleton-${index}`}
                        className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-14 w-16 rounded-lg" />
                          <div>
                            <Skeleton className="mb-2 h-4 w-40" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ))}

                  {!isItemsLoading && filteredItems.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                      {items.length === 0
                        ? "This category has no menu items yet."
                        : "No menu items match your search."}
                    </div>
                  )}

                  {!isItemsLoading &&
                    filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50/70"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                            {item.image_url ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={
                                  item.image_url.startsWith("http")
                                    ? item.image_url
                                    : `https://api.himalayanthakali.com/${item.image_url.replace(
                                        /^\/+/,
                                        ""
                                      )}`
                                }
                                alt={item.name || "Menu item"}
                                className="h-full w-full object-cover"
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <Utensils className="h-4 w-4 text-slate-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {item.name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {item.description || "No description"}
                            </p>
                            <p className="mt-1 text-sm font-bold text-[#E9842C]">
                              {toCurrency(item.price)}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteItem(item.id)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    ))}
                </div>
              </section>
            </>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
                <Utensils className="h-6 w-6 text-[#E9842C]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Category Selected</h3>
              <p className="mt-2 text-sm text-slate-500">
                Create or choose a category from the left to manage menu items.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
