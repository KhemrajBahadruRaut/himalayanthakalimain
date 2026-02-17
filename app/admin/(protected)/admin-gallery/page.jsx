"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Edit3,
  FolderPlus,
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import Skeleton from "@/components/ui/Skeleton";

const API = "https://api.himalayanthakali.com/himalayanthakali_backend/gallery";

function getImageUrl(path = "") {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API}/${path.replace(/^\/+/, "")}`;
}

export default function GalleryAdmin() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingImagePath, setEditingImagePath] = useState("");
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState("");

  const [form, setForm] = useState({
    id: null,
    alt_text: "",
    span: "normal",
    image: null,
  });
  const { showToast, showConfirm } = useToast();

  const fetchGallery = useCallback(
    async (categoryId) => {
      if (!categoryId) {
        setGallery([]);
        return;
      }

      setIsGalleryLoading(true);
      try {
        const res = await fetch(`${API}/get_gallery.php?category_id=${categoryId}`);
        const data = await res.json();
        setGallery(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Failed to fetch gallery:", error);
        setGallery([]);
        showToast("Failed to load gallery.", "error");
      } finally {
        setIsGalleryLoading(false);
      }
    },
    [showToast]
  );

  const fetchCategories = useCallback(
    async (preferredCategory = null, manual = false) => {
      if (manual) {
        setIsRefreshing(true);
      } else {
        setIsCategoriesLoading(true);
      }

      try {
        const res = await fetch(`${API}/get_categories.php`);
        const data = await res.json();
        const safeCategories = Array.isArray(data) ? data : [];
        setCategories(safeCategories);

        if (safeCategories.length === 0) {
          setActiveCategory(null);
          setGallery([]);
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
        await fetchGallery(nextCategory);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
        showToast("Failed to load categories.", "error");
      } finally {
        setIsCategoriesLoading(false);
        setIsRefreshing(false);
      }
    },
    [fetchGallery, showToast]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!form.image) {
      setSelectedImagePreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(form.image);
    setSelectedImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.image]);

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
      console.error("Error adding category:", error);
      showToast("Failed to add category.", "error");
    }
  };

  const deleteCategory = async (id) => {
    const confirmed = await showConfirm("Delete this category and all its images?", {
      type: "error",
      confirmLabel: "Delete",
    });
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
      console.error("Error deleting category:", error);
      showToast("Failed to delete category.", "error");
    }
  };

  const handleCategoryClick = async (id) => {
    setActiveCategory(id);
    await fetchGallery(id);
  };

  const handleEditImage = (image) => {
    setForm({
      id: image.id,
      alt_text: image.alt_text || "",
      span: image.span || "normal",
      image: null,
    });
    setEditingImagePath(image.image_path || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingImagePath("");
    setForm({ id: null, alt_text: "", span: "normal", image: null });
  };

  const deleteImage = async (id) => {
    const confirmed = await showConfirm("Delete this image?", {
      type: "error",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`${API}/delete_gallery.php?id=${id}`);
      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        showToast(data?.message || "Failed to delete image.", "error");
        return;
      }

      await fetchGallery(activeCategory);
      showToast(data?.message || "Image deleted.", "success");
    } catch (error) {
      console.error("Error deleting image:", error);
      showToast("Failed to delete image.", "error");
    }
  };

  const saveImage = async () => {
    if (!activeCategory) {
      showToast("Select a category first.", "warning");
      return;
    }

    if (!form.id && !form.image) {
      showToast("Please choose an image file.", "warning");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("category_id", activeCategory);
    formData.append("alt_text", form.alt_text);
    formData.append("span", form.span);
    if (form.image) formData.append("image", form.image);

    const endpoint = form.id ? "update_gallery.php" : "add_gallery.php";
    if (form.id) formData.append("id", form.id);

    try {
      const res = await fetch(`${API}/${endpoint}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || data?.success === false) {
        showToast(data?.message || "Failed to save image.", "error");
        return;
      }

      setEditingImagePath("");
      setForm({ id: null, alt_text: "", span: "normal", image: null });
      await fetchGallery(activeCategory);
      showToast(data?.message || (form.id ? "Image updated." : "Image uploaded."), "success");
    } catch (error) {
      console.error("Failed to save image:", error);
      showToast("Failed to save image.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGallery = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return gallery;
    return gallery.filter((image) =>
      (image.alt_text || "").toLowerCase().includes(query)
    );
  }, [gallery, searchTerm]);
  const galleryPreviewUrl = useMemo(() => {
    if (selectedImagePreviewUrl) return selectedImagePreviewUrl;
    if (form.id && editingImagePath) return getImageUrl(editingImagePath);
    return "";
  }, [selectedImagePreviewUrl, form.id, editingImagePath]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <ImageIcon className="h-6 w-6 text-[#E9842C]" />
              Gallery Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage gallery categories and curate image collections.
            </p>
          </div>

          <button
            onClick={() => fetchCategories(activeCategory, true)}
            disabled={isCategoriesLoading || isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Categories</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{categories.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Images In Category</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{gallery.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Filtered Results</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{filteredGallery.length}</p>
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
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
                placeholder="Add category"
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
                Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={`gallery-category-skeleton-${index}`} className="h-10 w-full" />
                ))}

              {!isCategoriesLoading && categories.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
                  No categories found.
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
          {!activeCategory ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
                <ImageIcon className="h-6 w-6 text-[#E9842C]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Category Selected</h3>
              <p className="mt-2 text-sm text-slate-500">
                Select a category from the left to manage gallery images.
              </p>
            </div>
          ) : (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">
                    {form.id ? "Edit Image" : "Upload New Image"}
                  </h2>
                  {form.id && (
                    <button
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input
                    value={form.alt_text}
                    onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
                    placeholder="Image label / alt text"
                  />

                  <select
                    value={form.span}
                    onChange={(e) => setForm({ ...form, span: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="large">Large</option>
                  </select>

                  <div className="md:col-span-2 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                    <ImageIcon className="h-4 w-4 text-slate-400" />
                    <input
                      type="file"
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          image: e.target.files?.[0] || null,
                        }))
                      }
                      className="w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                    />
                  </div>

                  <div className="md:col-span-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {galleryPreviewUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={galleryPreviewUrl}
                        alt="Gallery preview"
                        className="h-76 w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center text-sm text-slate-400">
                        No image selected
                      </div>
                    )}
                    <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      {form.image?.name ||
                        (form.id && editingImagePath
                          ? "Current image retained"
                          : "No file selected")}
                    </div>
                  </div>

                  <button
                    disabled={isSubmitting}
                    onClick={saveImage}
                    className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E9842C] py-2.5 text-sm font-semibold text-white transition hover:bg-[#cf7320] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {form.id ? "Update Image" : "Upload Image"}
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Images</h2>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by alt text"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
                    />
                  </div>
                </div>

                {isGalleryLoading ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={`gallery-item-skeleton-${index}`} className="rounded-2xl border border-slate-200 p-2">
                        <Skeleton className="h-56 w-full" />
                      </div>
                    ))}
                  </div>
                ) : filteredGallery.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500">
                    {gallery.length === 0
                      ? "No images found in this category."
                      : "No images match your search."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredGallery.map((image) => (
                      <div
                        key={image.id}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(image.image_path)}
                          className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                          alt={image.alt_text || "Gallery image"}
                          loading="lazy"
                          decoding="async"
                        />

                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-linear-to-t from-black/90 via-black/30 to-transparent p-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {image.alt_text || "Untitled image"}
                            </p>
                            <p className="text-xs text-white/75">{image.span || "normal"}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              onClick={() => handleEditImage(image)}
                              className="rounded-lg bg-white/20 p-2 text-white transition hover:bg-white hover:text-slate-900"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteImage(image.id)}
                              className="rounded-lg bg-red-500/90 p-2 text-white transition hover:bg-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
