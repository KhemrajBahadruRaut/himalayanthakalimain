import Image from "next/image";
import Navbar from "@/components/layout/navbar/Navbar";
import Footer from "@/components/layout/footer/Footer";

export const dynamic = "force-dynamic";

const API_BASE =
  "https://api.himalayanthakali.com/himalayanthakali_backend";

/* ======================================
   Fetch Blog By ID (Server Side Safe)
====================================== */
async function getBlog(id) {
  if (!id) return null;

  try {
    const res = await fetch(
      `${API_BASE}/blogs/get_single_blog.php?id=${id}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      console.error("Fetch failed with status:", res.status);
      return null;
    }

    const data = await res.json();

    if (!data.success) return null;

    return data.data;
  } catch (err) {
    console.error("Server fetch error:", err);
    return null;
  }
}

/* ======================================
   Dynamic Metadata (Facebook + SEO)
====================================== */
export async function generateMetadata({ searchParams }) {
  const id = searchParams?.id;
  if (!id) return {};

  const blog = await getBlog(id);
  if (!blog) return {};

  const imageUrl = `${API_BASE}/${blog.image}`;

  return {
    title: blog.title,
    description: blog.short_description || blog.title,
    openGraph: {
      type: "article",
      title: blog.title,
      description: blog.short_description || blog.title,
      url: `https://himalayanthakali.com/blogs/blogdetails?id=${id}`,
      siteName: "Himalayan Thakali",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.short_description || blog.title,
      images: [imageUrl],
    },
  };
}

/* ======================================
   Server Rendered Page
====================================== */
export default async function BlogDetails({ searchParams }) {
  const id = searchParams?.id;

  const blog = await getBlog(id);

  if (!blog) {
    return (
      <div style={{ padding: "120px", textAlign: "center" }}>
        <h2>Blog not found</h2>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="bg-[#1E1E1E] text-white px-4 pt-30 pb-20">
        <article className="max-w-4xl mx-auto">

          {/* Title */}
          <h1 className="text-4xl font-serif mb-6">
            {blog.title}
          </h1>

          {/* Featured Image */}
          {blog.image && (
            <div className="relative mb-10 h-96 w-full">
              <Image
                src={`${API_BASE}/${blog.image}`}
                alt={blog.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="rounded object-cover"
              />
            </div>
          )}

          {/* Date */}
          <time className="text-gray-400 mb-10 block">
            {new Date(blog.created_at).toDateString()}
          </time>

          {/* Content */}
          <div
            className="blog-content text-gray-300 leading-8"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>
      </div>

      <Footer />
    </>
  );
}
