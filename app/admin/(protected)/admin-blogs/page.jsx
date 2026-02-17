"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "quill/dist/quill.snow.css";
import {
  CalendarDays,
  Edit3,
  FileText,
  ImagePlus,
  PlusCircle,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import Skeleton from "@/components/ui/Skeleton";

const API_BASE = "https://api.himalayanthakali.com/himalayanthakali_backend";

function stripHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminBlogs() {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [blogs, setBlogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [editorLoading, setEditorLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast, showConfirm } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    content: "",
  });

  const contentText = stripHtml(formData.content);
  const canSubmit =
    formData.title.trim().length > 0 &&
    formData.short_description.trim().length > 0 &&
    contentText.length > 0;

  const filteredBlogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return blogs;

    return blogs.filter((blog) => {
      const title = (blog.title || "").toLowerCase();
      const description = (blog.short_description || "").toLowerCase();
      return title.includes(query) || description.includes(query);
    });
  }, [blogs, searchTerm]);

  const recentBlogsCount = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return blogs.filter((blog) => {
      const createdAt = new Date(blog.created_at).getTime();
      return !Number.isNaN(createdAt) && createdAt >= sevenDaysAgo;
    }).length;
  }, [blogs]);

  useEffect(() => {
    let mounted = true;

    const initializeEditor = async () => {
      if (!editorRef.current || quillRef.current) {
        if (mounted) setEditorLoading(false);
        return;
      }

      try {
        const { default: Quill } = await import("quill");
        if (!mounted || !editorRef.current || quillRef.current) return;

        quillRef.current = new Quill(editorRef.current, {
          theme: "snow",
          modules: {
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link", "image"],
              ["clean"],
            ],
          },
        });

        quillRef.current.on("text-change", () => {
          setFormData((prev) => ({
            ...prev,
            content: quillRef.current.root.innerHTML,
          }));
        });
      } finally {
        if (mounted) setEditorLoading(false);
      }
    };

    initializeEditor();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (quillRef.current && editingId !== null) {
      quillRef.current.root.innerHTML = formData.content;
    }
  }, [editingId, formData.content]);

  const fetchBlogs = useCallback(async () => {
    setBlogsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/blogs/get_blogs.php`);
      const data = await res.json();
      if (data.success) {
        setBlogs(Array.isArray(data.data) ? data.data : []);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      setBlogs([]);
      showToast("Failed to load blogs.", "error");
    } finally {
      setBlogsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setImageFile(null);
    setFormData({
      title: "",
      short_description: "",
      content: "",
    });

    if (quillRef.current) {
      quillRef.current.root.innerHTML = "";
    }
  };

  const handleCreate = async () => {
    if (!canSubmit) {
      showToast("Title, short description and content are required.", "warning");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("title", formData.title);
    formDataObj.append("short_description", formData.short_description);
    formDataObj.append("content", formData.content);

    if (imageFile) {
      formDataObj.append("image", imageFile);
    }

    try {
      const res = await fetch(`${API_BASE}/blogs/create_blog.php`, {
        method: "POST",
        body: formDataObj,
      });

      const data = await res.json();

      if (data.success) {
        showToast("Blog created.", "success");
        resetForm();
        fetchBlogs();
      } else {
        showToast(data.message || "Failed to create blog.", "error");
      }
    } catch (error) {
      console.error("Failed to create blog:", error);
      showToast("Failed to create blog.", "error");
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    if (!canSubmit) {
      showToast("Title, short description and content are required.", "warning");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("id", editingId);
    formDataObj.append("title", formData.title);
    formDataObj.append("short_description", formData.short_description);
    formDataObj.append("content", formData.content);

    if (imageFile) {
      formDataObj.append("image", imageFile);
    }

    try {
      const res = await fetch(`${API_BASE}/blogs/update_blog.php`, {
        method: "POST",
        body: formDataObj,
      });

      const data = await res.json();

      if (data.success) {
        showToast("Blog updated.", "success");
        resetForm();
        fetchBlogs();
      } else {
        showToast(data.message || "Failed to update blog.", "error");
      }
    } catch (error) {
      console.error("Failed to update blog:", error);
      showToast("Failed to update blog.", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("Delete this blog?", {
      type: "error",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/blogs/delete_blog.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (data.success) {
        showToast("Blog deleted.", "success");
        fetchBlogs();
      } else {
        showToast(data.message || "Failed to delete blog.", "error");
      }
    } catch (error) {
      console.error("Failed to delete blog:", error);
      showToast("Failed to delete blog.", "error");
    }
  };

  const handleEdit = (blog) => {
    setEditingId(blog.id);
    setFormData({
      title: blog.title || "",
      short_description: blog.short_description || "",
      content: blog.content || "",
    });

    if (quillRef.current) {
      quillRef.current.root.innerHTML = blog.content || "";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Blog Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create, update, and remove published blog posts.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            {editingId ? "Editing Post" : "Create Mode"}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Total Blogs</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{blogs.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Published This Week</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{recentBlogsCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Attached Image</p>
            <p className="mt-2 truncate text-sm font-semibold text-slate-700">
              {imageFile?.name || "No image selected"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#E9842C]" />
            <h2 className="text-lg font-bold text-slate-900">
              {editingId ? "Update Blog Post" : "Create New Blog Post"}
            </h2>
          </div>
          {editingId && (
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <XCircle className="h-4 w-4" />
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-500">Title</label>
            <input
              type="text"
              name="title"
              placeholder="Enter blog title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#E9842C] focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Short Description
            </label>
            <textarea
              name="short_description"
              placeholder="Write a short summary"
              value={formData.short_description}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#E9842C] focus:bg-white"
              rows={3}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase text-slate-500">Content</label>
              <span className="text-xs text-slate-400">{contentText.length} chars</span>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
              {editorLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50 text-sm text-slate-500">
                  Loading editor...
                </div>
              )}
              <div ref={editorRef} style={{ minHeight: "260px" }} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-500">Cover Image</label>
            <div className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
              />
              <p className="text-xs text-slate-500">
                {imageFile?.name || "No file selected"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            {editingId ? (
              <>
                <button
                  onClick={handleUpdate}
                  disabled={!canSubmit}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Edit3 className="h-4 w-4" />
                  Update Blog
                </button>
                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <XCircle className="h-4 w-4" />
                  Reset
                </button>
              </>
            ) : (
              <button
                onClick={handleCreate}
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PlusCircle className="h-4 w-4" />
                Create Blog
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Uploaded Blogs</h2>
            <p className="text-sm text-slate-500">Search and manage all published entries.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or summary"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#E9842C] focus:bg-white"
            />
          </div>
        </div>

        {blogsLoading ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left text-xs font-semibold uppercase text-slate-500">
                  <th className="px-4 py-3">Post</th>
                  <th className="px-4 py-3">Summary</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`blog-row-skeleton-${index}`} className="border-t border-slate-200">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-16 w-20 bg-slate-200" />
                        <div className="w-full">
                          <Skeleton className="mb-2 h-4 w-4/5 bg-slate-200" />
                          <Skeleton className="h-3 w-20 bg-slate-200" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-full bg-slate-200" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24 bg-slate-200" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <Skeleton className="h-8 w-16 bg-slate-200" />
                        <Skeleton className="h-8 w-16 bg-slate-200" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">
            <p className="text-sm font-medium text-slate-600">
              {blogs.length === 0 ? "No blogs uploaded yet." : "No matching blogs found."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left text-xs font-semibold uppercase text-slate-500">
                  <th className="px-4 py-3">Post</th>
                  <th className="px-4 py-3">Summary</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="border-t border-slate-200 hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="flex min-w-60 items-center gap-3">
                        {blog.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={`${API_BASE}/${blog.image}`}
                            alt={blog.title}
                            className="h-16 w-20 rounded-lg object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="flex h-16 w-20 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                            <ImagePlus className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {blog.title}
                          </p>
                          <p className="text-xs text-slate-500">ID #{blog.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-md truncate text-sm text-slate-600">
                        {blog.short_description || "No short description."}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(blog.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(blog)}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
