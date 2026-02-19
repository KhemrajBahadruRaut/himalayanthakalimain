"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

const Navbar = dynamic(() => import("../../components/layout/navbar/Navbar"), {
  loading: () => <div className="h-24" />,
});

const Footer = dynamic(() => import("../../components/layout/footer/Footer"), {
  loading: () => <div className="h-40" />,
});

// const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost/himalayanthakali_backend";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.himalayanthakali.com/himalayanthakali_backend";

function BlogCardSkeleton() {
  return (
    <article>
      <div className="relative h-full overflow-hidden">
        <div className="absolute h-50 w-50 border-l-2 border-t-2 border-[#D97634]" />
        <div className="absolute bottom-0 right-0 h-50 w-50 border-b-2 border-r-2 border-[#D97634]" />

        <div className="m-7 flex h-full flex-col">
          <Skeleton className="h-60 w-full bg-white/10" />
          <div className="grow p-4">
            <Skeleton className="mb-3 h-6 w-5/6 bg-white/10" />
            <Skeleton className="mb-2 h-4 w-full bg-white/10" />
            <Skeleton className="mb-2 h-4 w-11/12 bg-white/10" />
            <Skeleton className="mb-4 h-4 w-2/3 bg-white/10" />
            <div className="flex justify-end">
              <Skeleton className="h-4 w-28 bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

const BlogListingPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/blogs/get_blogs.php`);
        const data = await res.json();
        if (data.success) setBlogPosts(data.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-[#1E1E1E] px-4 pt-30 text-white">
        <div className="mx-auto max-w-7xl">
          <header className="mb-16 text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <div className="h-px md:w-56 bg-linear-to-r from-transparent to-[#D97634]" />
              <div className="flex items-center gap-2 text-sm text-[#D97634]">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span className="tracking-wider uppercase">OUR BLOGS</span>
              </div>
              <div className="h-px md:w-56 bg-linear-to-l from-transparent to-[#D97634]" />
            </div>

            <h1 className="mb-4 text-4xl font-serif md:text-5xl">News & Updates</h1>
            <p className="mx-auto max-w-2xl text-gray-400">
              Discover our latest stories, updates, and events from Himalayan Thakali.
            </p>
          </header>

          <div className="mb-8 flex justify-end">
            <select
              aria-label="Sort blog posts"
              className="cursor-pointer rounded border border-[#D97634] bg-transparent px-4 py-2 text-sm text-[#D97634] transition-colors"
              defaultValue="relevance"
            >
              <option value="relevance" className="bg-[#1E1E1E]">
                Sort By: Relevance
              </option>
              <option value="date" className="bg-[#1E1E1E]">
                Sort By: Date
              </option>
              <option value="popular" className="bg-[#1E1E1E]">
                Sort By: Popular
              </option>
            </select>
          </div>

          <section className="grid grid-cols-1 gap-18 md:grid-cols-2 lg:grid-cols-3" aria-label="Blog posts">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <BlogCardSkeleton key={`blog-skeleton-${index}`} />
                ))
              : blogPosts.map((post) => (
                  <article key={post.id}>
                    <Link
                      href={`/blogs/blogdetails?id=${post.id}`}
                      className="group block h-full focus-visible:rounded-md"
                      aria-label={`Read blog post: ${post.title}`}
                    >
                      <div className="relative h-full overflow-hidden transition-all duration-300">
                        <div className="absolute h-50 w-50 border-l-2 border-t-2 border-[#D97634]" />
                        <div className="absolute bottom-0 right-0 h-50 w-50 border-b-2 border-r-2 border-[#D97634]" />

                        <div className="m-7 flex h-full flex-col">
                          <div className="relative h-60 shrink-0 overflow-hidden">
                            <Image
                              src={`${API_BASE}/${post.image}`}
                              alt={post.title || "Blog image"}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>

                          <div className="grow p-4">
                            <h2 className="mb-3 line-clamp-2 text-lg font-semibold text-white transition-colors group-hover:text-amber-600">
                              {post.title}
                            </h2>

                            <p className="mb-4 min-h-18 line-clamp-3 text-sm text-gray-400">
                              {post.short_description || post.description}
                            </p>

                            <div className="flex justify-end">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" aria-hidden="true" />
                                <time dateTime={post.created_at}>
                                  {new Date(post.created_at).toDateString()}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
          </section>

          {!isLoading && blogPosts.length === 0 && (
            <p className="py-10 text-center text-gray-400">No blogs available.</p>
          )}
        </div>

        <div className="pt-10">
          <Footer />
        </div>
      </div>
    </>
  );
};

export default BlogListingPage;
