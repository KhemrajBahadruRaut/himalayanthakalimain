import Image from "next/image";
import dynamicImport from "next/dynamic";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // ensures stable server fetch

const Navbar = dynamicImport(
  () => import("../../../components/layout/navbar/Navbar"),
  { loading: () => <div className="h-24" /> }
);

const Footer = dynamicImport(
  () => import("../../../components/layout/footer/Footer"),
  { loading: () => <div className="h-40" /> }
);

const API_BASE =
  "https://api.himalayanthakali.com/himalayanthakali_backend";

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
  } catch (error) {
    console.error("Blog fetch error:", error);
    return null;
  }
}

/* ============================= */
/* ✅ FACEBOOK / WHATSAPP PREVIEW */
/* ============================= */

export async function generateMetadata({ searchParams }) {
  try {
    const id = searchParams?.id;
    if (!id) return {};

    const blog = await getBlog(id);
    if (!blog) return {};

    const imageUrl = `${API_BASE}/${blog.image}`;
    const pageUrl = `https://himalayanthakali.com/blogs/blogdetails?id=${id}`;

    return {
      title: blog.title,
      description: blog.short_description,
      openGraph: {
        title: blog.title,
        description: blog.short_description,
        type: "article",
        url: pageUrl,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: blog.short_description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Metadata error:", error);
    return {};
  }
}

/* ============================= */
/* ✅ BLOG PAGE */
/* ============================= */

export default async function BlogDetails({ searchParams, params }) {

  // keep this because your setup depends on it
  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;

  const searchId = Array.isArray(resolvedSearchParams?.id)
    ? resolvedSearchParams?.id[0]
    : resolvedSearchParams?.id;

  const paramId = Array.isArray(resolvedParams?.id)
    ? resolvedParams?.id[0]
    : resolvedParams?.id;

  const id = searchId || paramId;

  if (!id) {
    return (
      <div className="p-6 sm:p-12 md:p-20 text-center bg-[#1E1E1E] text-white min-h-screen">
        No blog ID provided
      </div>
    );
  }

  const blog = await getBlog(id);

  if (!blog) {
    return (
      <div className="p-6 sm:p-12 md:p-20 text-center bg-[#1E1E1E] text-white min-h-screen">
        Blog not found
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="bg-[#1E1E1E] text-white  px-4 sm:px-6 md:px-8 pt-26 sm:pt-8 md:pt-30 min-h-screen">
        <article className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-4 sm:mb-6">
            {blog.title}
          </h1>

          <div className="relative mb-6 sm:mb-8 md:mb-10 h-48 sm:h-72 md:h-96 w-full">
            <Image
              src={`${API_BASE}/${blog.image}`}
              alt={blog.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="rounded object-contain sm:object-cover"
              unoptimized
            />
          </div>

          <time
            dateTime={blog.created_at}
            className="text-gray-400 mb-6 sm:mb-8 md:mb-10 block text-xs sm:text-sm"
          >
            {new Date(blog.created_at).toDateString()}
          </time>

          <div
            className="blog-content text-gray-300 leading-7 sm:leading-8 text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>

        <div className="pt-12 sm:pt-16 md:pt-20">
          <Footer />
        </div>
      </div>
    </>
  );
}
