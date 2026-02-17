import Image from "next/image";
import dynamicImport from "next/dynamic";

const Navbar = dynamicImport(() => import("../../../components/layout/navbar/Navbar"), {
  loading: () => <div className="h-24" />,
});

const Footer = dynamicImport(() => import("../../../components/layout/footer/Footer"), {
  loading: () => <div className="h-40" />,
});

export const dynamic = "force-dynamic";

const API_BASE = "https://api.himalayanthakali.com/himalayanthakali_backend";

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

export default async function BlogDetails({ searchParams, params }) {
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
      <div className="p-20 text-center bg-[#1E1E1E] text-white min-h-screen">
        No blog ID provided
      </div>
    );
  }

  const blog = await getBlog(id);

  if (!blog) {
    return (
      <div className="p-20 text-center bg-[#1E1E1E] text-white min-h-screen">
        Blog not found
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="bg-[#1E1E1E] text-white px-4 pt-30 min-h-screen">
        <article className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif mb-6">
            {blog.title}
          </h1>

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

          <time
            dateTime={blog.created_at}
            className="text-gray-400 mb-10 block"
          >
            {new Date(blog.created_at).toDateString()}
          </time>

          <div
            className="blog-content text-gray-300 leading-8"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>

        <div className="pt-20">
          <Footer />
        </div>
      </div>
    </>
  );
}
