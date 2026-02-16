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
export default async function BlogDetails(props) {
  const id = props.searchParams?.id;

  if (!id) {
    return <div style={{ padding: "100px" }}>No ID provided</div>;
  }

  const blog = await getBlog(id);

  if (!blog) {
    return <div style={{ padding: "100px" }}>Blog not found (ID: {id})</div>;
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: "100px", color: "white" }}>
        <h1>{blog.title}</h1>
      </div>
      <Footer />
    </>
  );
}

