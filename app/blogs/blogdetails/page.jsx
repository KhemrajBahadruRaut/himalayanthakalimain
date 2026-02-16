import Image from "next/image";
import Navbar from "@/components/layout/navbar/Navbar";
import Footer from "@/components/layout/footer/Footer";

export const dynamic = "force-dynamic";

const API_BASE =
  "https://api.himalayanthakali.com/himalayanthakali_backend";

/* ===============================
   Fetch Blog By ID
================================ */
async function getBlog(id) {
  if (!id) return null;

  try {
    const res = await fetch(
      `${API_BASE}/blogs/get_single_blog.php?id=${id}`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data.success ? data.data : null;
  } catch (err) {
    return null;
  }
}

/* ===============================
   Dynamic Metadata
================================ */
export async function generateMetadata(props) {
  const id = props.searchParams?.id;
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

/* ===============================
   Page Component
================================ */
export default async function BlogDetails(props) {
  const id = props.searchParams?.id;

  if (!id) {
    return (
      <div style={{ padding: "120px", textAlign: "center" }}>
        No blog ID provided.
      </div>
    );
  }

  const blog = await getBlog(id);

  if (!blog) {
    return (
      <div style={{ padding: "120px", textAlign: "center" }}>
        Blog not found.
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="bg-[#1E1E1E] text-white px-4 pt-30 pb-20">
        <article className="max-w-4xl mx-auto">

          <h1 className="text-4xl font-serif mb-6">
            {blog.title}
          </h1>

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

          <time className="text-gray-400 mb-10 block">
            {new Date(blog.created_at).toDateString()}
          </time>

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
