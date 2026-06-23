"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FolderPlus,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Utensils,
  Tag,
  X,
  Check,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import Skeleton from "@/components/ui/Skeleton";

// const API = "https://api.himalayanthakali.com/himalayanthakali_backend/menu";
const API = "http://localhost/himalayanthakali_backend/menu";

function toCurrency(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return `Rs. ${value || "-"}`;
  return `Rs. ${amount.toLocaleString()}`;
}

// ─── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ item, existingSubcategories, onClose, onSaved, showToast }) {
  const [form, setForm] = useState({
    name: item.name || "",
    description: item.description || "",
    price: item.price || "",
    subcategory: item.subcategory || "",
    image: null,
    removeImage: false,
  });
  const [previewUrl, setPreviewUrl] = useState(() => {
    if (item.image) return `${API}/uploads/${item.image}`;
    if (item.image_url) return item.image_url.startsWith("http") ? item.image_url : `https://api.himalayanthakali.com/${item.image_url.replace(/^\/+/, "")}`;
    return "";
  });
  const [isSaving, setIsSaving] = useState(false);
  const firstInputRef = useRef(null);

  useEffect(() => {
    firstInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (!form.image) return;
    const url = URL.createObjectURL(form.image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.image]);

  const handleRemoveImage = () => {
    setForm((p) => ({ ...p, image: null, removeImage: true }));
    setPreviewUrl("");
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      showToast("Name and price are required.", "warning");
      return;
    }
    setIsSaving(true);
    const fd = new FormData();
    fd.append("id", item.id);
    fd.append("name", form.name.trim());
    fd.append("description", form.description.trim());
    fd.append("price", form.price);
    fd.append("subcategory", form.subcategory.trim());
    fd.append("remove_image", form.removeImage ? "1" : "0");
    if (form.image) fd.append("image", form.image);
    try {
      const res = await fetch(`${API}/update_item.php`, { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) {
        showToast(data?.message || "Failed to update item.", "error");
        return;
      }
      showToast(data?.message || "Item updated.", "success");
      onSaved();
    } catch {
      showToast("Failed to update item.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Edit Menu Item</h2>
            <p className="text-xs text-slate-500">ID #{item.id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              ref={firstInputRef}
              placeholder="Item name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
            />
            <input
              placeholder="Price *"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
            />

            <div className="md:col-span-2">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-[#E9842C] focus-within:bg-white transition">
                <Tag className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  list="edit-subcategory-suggestions"
                  placeholder="Subcategory (optional)"
                  value={form.subcategory}
                  onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              <datalist id="edit-subcategory-suggestions">
                {existingSubcategories.map((s) => <option key={s} value={s} />)}
              </datalist>
              {existingSubcategories.length > 0 && (
                <p className="mt-1.5 text-xs text-slate-400">
                  Quick pick:{" "}
                  {existingSubcategories.map((s, i) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, subcategory: s })}
                      className="font-medium text-[#E9842C] hover:underline"
                    >
                      {s}{i < existingSubcategories.length - 1 ? ", " : ""}
                    </button>
                  ))}
                </p>
              )}
            </div>

            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="md:col-span-2 h-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
            />

            <div className="md:col-span-2">
              <p className="mb-1.5 text-xs font-medium text-slate-500">
                Image <span className="font-normal text-slate-400">(optional)</span>
              </p>
              {previewUrl ? (
                <div className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <img src={previewUrl} alt="Preview" className="h-40 w-full object-contain" />
                  <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="text-xs text-slate-500">{form.image ? form.image.name : "Current image"}</span>
                    <button type="button" onClick={handleRemoveImage} className="text-xs font-medium text-red-500 hover:underline">
                      Remove image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-3 flex h-14 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                  No image
                </div>
              )}
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                <ImageIcon className="h-4 w-4 text-slate-400" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.files?.[0] || null, removeImage: false }))}
                  className="w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#E9842C] py-2.5 text-sm font-semibold text-white transition hover:bg-[#cf7320] disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function MenuAdmin() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [menuImagePreviewUrl, setMenuImagePreviewUrl] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const existingSubcategories = useMemo(() => {
    return [...new Set(items.map((i) => i.subcategory).filter(Boolean))];
  }, [items]);

  const [form, setForm] = useState({ name: "", description: "", price: "", subcategory: "", image: null });
  const { showToast, showConfirm } = useToast();

  const fetchItems = useCallback(async (categoryId) => {
    if (!categoryId) { setItems([]); return; }
    setIsItemsLoading(true);
    try {
      const res = await fetch(`${API}/get_items.php?category_id=${categoryId}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
      showToast("Failed to fetch items.", "error");
    } finally {
      setIsItemsLoading(false);
    }
  }, [showToast]);

  const fetchCategories = useCallback(async (preferredCategory = null) => {
    setIsCategoriesLoading(true);
    try {
      const res = await fetch(`${API}/get_categories.php`);
      const data = await res.json();
      const cats = Array.isArray(data) ? data : [];
      setCategories(cats);
      if (cats.length === 0) { setActiveCategory(null); setItems([]); return; }
      const exists = preferredCategory !== null && cats.some((c) => String(c.id) === String(preferredCategory));
      const next = exists ? preferredCategory : cats[0].id;
      setActiveCategory(next);
      await fetchItems(next);
    } catch {
      setCategories([]);
      showToast("Failed to fetch categories.", "error");
    } finally {
      setIsCategoriesLoading(false);
    }
  }, [fetchItems, showToast]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    if (!form.image) { setMenuImagePreviewUrl(""); return; }
    const url = URL.createObjectURL(form.image);
    setMenuImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.image]);

  const handleCategoryClick = async (id) => {
    setActiveCategory(id);
    setForm({ name: "", description: "", price: "", subcategory: "", image: null });
    await fetchItems(id);
  };

  const addCategory = async () => {
    if (!newCategory.trim()) { showToast("Enter a category name first.", "warning"); return; }
    try {
      const res = await fetch(`${API}/add_category.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) { showToast(data?.message || "Failed to add category.", "error"); return; }
      setNewCategory("");
      await fetchCategories(activeCategory);
      showToast(data?.message || "Category added.", "success");
    } catch { showToast("Failed to add category.", "error"); }
  };

  const deleteCategory = async (id) => {
    const confirmed = await showConfirm("Delete this category and all its menu items?", { type: "error", confirmLabel: "Delete" });
    if (!confirmed) return;
    try {
      const res = await fetch(`${API}/delete_category.php?id=${id}`);
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) { showToast(data?.message || "Failed to delete category.", "error"); return; }
      await fetchCategories(String(activeCategory) === String(id) ? null : activeCategory);
      showToast(data?.message || "Category deleted.", "success");
    } catch { showToast("Failed to delete category.", "error"); }
  };

  const addItem = async () => {
    if (!activeCategory || !form.name.trim() || !form.price) {
      showToast("Category, name and price are required.", "warning"); return;
    }
    const fd = new FormData();
    fd.append("category_id", activeCategory);
    fd.append("name", form.name.trim());
    fd.append("description", form.description.trim());
    fd.append("price", form.price);
    fd.append("subcategory", form.subcategory.trim());
    if (form.image) fd.append("image", form.image);
    try {
      const res = await fetch(`${API}/add_item.php`, { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) { showToast(data?.message || "Failed to add menu item.", "error"); return; }
      setForm({ name: "", description: "", price: "", subcategory: "", image: null });
      await fetchItems(activeCategory);
      showToast(data?.message || "Menu item added.", "success");
    } catch { showToast("Failed to add menu item.", "error"); }
  };

  const deleteItem = async (id) => {
    const confirmed = await showConfirm("Delete this item?", { type: "error", confirmLabel: "Delete" });
    if (!confirmed) return;
    try {
      const res = await fetch(`${API}/delete_item.php?id=${id}`);
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.success === false) { showToast(data?.message || "Failed to delete item.", "error"); return; }
      await fetchItems(activeCategory);
      showToast(data?.message || "Menu item deleted.", "success");
    } catch { showToast("Failed to delete item.", "error"); }
  };

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.name, item.description, item.price, item.subcategory].join(" ").toLowerCase().includes(q)
    );
  }, [items, searchTerm]);

  const groupedFilteredItems = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const key = item.subcategory?.trim() || "";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [filteredItems]);

  const activeCategoryName = categories.find((c) => String(c.id) === String(activeCategory))?.name ?? "";

  const getImgSrc = (item) => {
    if (item.image) return `${API}/uploads/${item.image}`;
    if (item.image_url) return item.image_url.startsWith("http") ? item.image_url : `https://api.himalayanthakali.com/${item.image_url.replace(/^\/+/, "")}`;
    return null;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {editingItem && (
        <EditModal
          item={editingItem}
          existingSubcategories={existingSubcategories}
          showToast={showToast}
          onClose={() => setEditingItem(null)}
          onSaved={async () => { setEditingItem(null); await fetchItems(activeCategory); }}
        />
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <Utensils className="h-6 w-6 text-[#E9842C]" />
              Menu Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">Organize categories, add, edit, and manage pricing.</p>
          </div>
          {isItemsLoading && (
            <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading items...
            </span>
          )}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Categories", value: categories.length },
            { label: "Items In Category", value: items.length },
            { label: "Subcategories", value: existingSubcategories.length },
            { label: "Filtered Results", value: filteredItems.length },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <aside className="xl:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <FolderPlus className="h-5 w-5 text-[#E9842C]" /> Categories
            </h2>
            <div className="mb-4 flex gap-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
                placeholder="Add category"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
              />
              <button onClick={addCategory} className="rounded-xl bg-[#E9842C] px-3 text-white transition hover:bg-[#cf7320]">
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {isCategoriesLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              {!isCategoriesLoading && categories.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">No categories created yet.</div>
              )}
              {!isCategoriesLoading && categories.map((cat) => {
                const isActive = String(activeCategory) === String(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${isActive ? "bg-[#E9842C] text-white" : "bg-slate-50 text-slate-700 hover:bg-orange-50"}`}
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    <span
                      onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
                      className={`inline-flex rounded-lg p-1 ${isActive ? "hover:bg-white/20" : "hover:bg-red-100"}`}
                    >
                      <Trash2 className={`h-4 w-4 ${isActive ? "text-white" : "text-red-500"}`} />
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
                <h2 className="mb-1 text-lg font-bold text-slate-900">Add New Menu Item</h2>
                <p className="mb-4 text-xs text-slate-500">
                  Adding to: <span className="font-semibold text-[#E9842C]">{activeCategoryName}</span>
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input
                    placeholder="Item name *"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
                  />
                  <input
                    placeholder="Price *"
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
                  />
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-[#E9842C] focus-within:bg-white transition">
                      <Tag className="h-4 w-4 shrink-0 text-slate-400" />
                      <input
                        list="subcategory-suggestions"
                        placeholder="Subcategory (optional) — e.g. Indian Cuisine, Starters"
                        value={form.subcategory}
                        onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                        className="flex-1 bg-transparent text-sm outline-none"
                      />
                    </div>
                    <datalist id="subcategory-suggestions">
                      {existingSubcategories.map((s) => <option key={s} value={s} />)}
                    </datalist>
                    {existingSubcategories.length > 0 && (
                      <p className="mt-1.5 text-xs text-slate-400">
                        Existing:{" "}
                        {existingSubcategories.map((s, i) => (
                          <button key={s} type="button" onClick={() => setForm({ ...form, subcategory: s })} className="font-medium text-[#E9842C] hover:underline">
                            {s}{i < existingSubcategories.length - 1 ? ", " : ""}
                          </button>
                        ))}
                      </p>
                    )}
                  </div>
                  <textarea
                    placeholder="Description (optional)"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="md:col-span-2 h-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
                  />
                  <div className="md:col-span-2">
                    <p className="mb-1.5 text-xs font-medium text-slate-500">Image <span className="font-normal text-slate-400">(optional)</span></p>
                    <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                      <ImageIcon className="h-4 w-4 text-slate-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.files?.[0] || null }))}
                        className="w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                      />
                      {form.image && (
                        <button type="button" onClick={() => setForm((prev) => ({ ...prev, image: null }))} className="shrink-0 text-xs text-red-500 hover:underline">Remove</button>
                      )}
                    </div>
                    {menuImagePreviewUrl && (
                      <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <img src={menuImagePreviewUrl} alt="Preview" className="h-40 w-full object-contain" />
                        <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">{form.image?.name}</div>
                      </div>
                    )}
                  </div>
                  <button onClick={addItem} className="md:col-span-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-black">
                    Add Item
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-bold text-slate-900">
                    Menu Items
                    {activeCategoryName && <span className="ml-2 text-sm font-normal text-slate-400">— {activeCategoryName}</span>}
                  </h2>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search name, description, subcategory"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {isItemsLoading && Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-14 w-16 rounded-lg" />
                        <div><Skeleton className="mb-2 h-4 w-40" /><Skeleton className="h-3 w-24" /></div>
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}

                  {!isItemsLoading && filteredItems.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
                      {items.length === 0 ? "This category has no menu items yet." : "No menu items match your search."}
                    </div>
                  )}

                  {!isItemsLoading && Object.entries(groupedFilteredItems).map(([subcat, subItems]) => (
                    <div key={subcat || "__none__"}>
                      {subcat ? (
                        <div className="mb-3 flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-[#E9842C]" />
                          <span className="text-xs font-bold uppercase tracking-wider text-[#E9842C]">{subcat}</span>
                          <div className="flex-1 border-t border-slate-200" />
                        </div>
                      ) : (
                        Object.keys(groupedFilteredItems).length > 1 && (
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">General</span>
                            <div className="flex-1 border-t border-slate-200" />
                          </div>
                        )
                      )}
                      <div className="space-y-3">
                        {subItems.map((item) => {
                          const imgSrc = getImgSrc(item);
                          return (
                            <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50/70">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                                  {imgSrc ? (
                                    <img src={imgSrc} alt={item.name || "Menu item"} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                                  ) : (
                                    <Utensils className="h-4 w-4 text-slate-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                                  {item.subcategory && <p className="text-xs text-[#E9842C]">{item.subcategory}</p>}
                                  <p className="truncate text-xs text-slate-500">{item.description || "No description"}</p>
                                  <p className="mt-1 text-sm font-bold text-[#E9842C]">{toCurrency(item.price)}</p>
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#E9842C] hover:text-[#E9842C]"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteItem(item.id)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
              <p className="mt-2 text-sm text-slate-500">Create or choose a category from the left to manage menu items.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}