import dynamic from "next/dynamic";

const MainPage = dynamic(() => import("../components/mainpage/MainPage.jsx"), {
  loading: () => <div className="min-h-screen bg-[#1E1E1E]" />,
});

export default function Home() {
  return (
   <>
   <MainPage/>
   </>
  );
}
