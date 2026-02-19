"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Clock, Phone, X } from "lucide-react";

const Navbar = dynamic(
  () => import("../../components/layout/navbar/Navbar.jsx"),
  {
    loading: () => <div className="h-24" />,
  },
);

const Footer = dynamic(
  () => import("../../components/layout/footer/Footer.jsx"),
  {
    loading: () => <div className="h-40" />,
  },
);

const CONTACT_API =
  // `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost/himalayanthakali_backend"}/contacts/submit-contact.php`;
  `${process.env.NEXT_PUBLIC_API_BASE || "https://api.himalayanthakali.com/himalayanthakali_backend"}/contacts/submit-contact.php`;

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNo: "",
    message: "",
  });
  const [submitState, setSubmitState] = useState({ type: "idle", message: "" });
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const showToast = (message, type = "info", duration = 3000) => {
    setToast({ visible: true, message, type });
    setTimeout(
      () => setToast({ visible: false, message: "", type: "info" }),
      duration,
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "fullName") {
      setValidation((prev) => ({
        ...prev,
        fullName: nameRegex.test(value),
      }));
    }

    if (name === "email") {
      setValidation((prev) => ({
        ...prev,
        email: emailRegex.test(value),
      }));
    }

    if (name === "phoneNo") {
      setValidation((prev) => ({
        ...prev,
        phoneNo: phoneRegex.test(value),
      }));
    }
  };

  const handleSubmit = async (e) => {
    if (!validation.fullName || !validation.email || !validation.phoneNo) {
      showToast("Please correct the highlighted fields.", "error");
      return;
    }

    e.preventDefault();
    setSubmitState({ type: "loading", message: "" });

    try {
      const res = await fetch(CONTACT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to submit form");

      showToast("Message sent successfully!", "success");
      setSubmitState({
        type: "success",
        message: "",
      });
      setFormData({
        fullName: "",
        email: "",
        phoneNo: "",
        message: "",
      });
      setValidation({
        fullName: null,
        email: null,
        phoneNo: null,
      });
    } catch (error) {
      console.error("Contact form submission failed:", error);
      showToast("Could not send your message. Please try again.", "error");
      setSubmitState({
        type: "error",
        message: "",
      });
    }
  };
  const nameRegex = /^[A-Za-z][A-Za-z0-9\s]*$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(98|97|96)\d{8}$/;

  const [validation, setValidation] = useState({
    fullName: null,
    email: null,
    phoneNo: null,
  });

  return (
    <>
      <Navbar />
      <div className="bg-[#1E1E1E] px-4 pt-30 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl pb-10">
          {/* Toast Notification */}
          {toast.visible && (
            <div
              className={`fixed top-4 right-4 z-50 max-w-sm rounded border p-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 ${
                toast.type === "success"
                  ? "border-green-300 bg-emerald-50 text-green-600"
                  : toast.type === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-800"
                    : "border-slate-200 bg-white text-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{toast.message}</p>
                <button
                  onClick={() =>
                    setToast({ visible: false, message: "", type: "info" })
                  }
                  className="ml-2 inline-flex shrink-0 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          <header className="mb-12 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-px w-50 bg-linear-to-r from-transparent to-[#D97634]" />
              <div className="flex items-center gap-2 text-sm font-medium text-[#D97634]">
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>CONTACT US</span>
              </div>
              <div className="h-px w-50 bg-linear-to-l from-transparent to-[#D97634]" />
            </div>

            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Get in Touch
            </h1>

            <p className="mx-auto max-w-2xl leading-relaxed text-gray-400">
              Share your questions or feedback and our team will get back to you
              soon.
            </p>
          </header>

          <div className="grid items-start gap-20 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
                aria-label="Contact form"
              >
                <div className="relative">
                  <fieldset className="group rounded-lg border border-zinc-600 px-2.5 py-1 transition-all focus-within:border-dashed focus-within:border-[#D97634]">
                    <legend className="px-2 text-xs tracking-wider text-[#D97634] uppercase">
                      Full Name
                    </legend>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      autoComplete="name"
                      className="mb-1.5 w-full rounded-md bg-[#444444] px-4 py-2 text-white placeholder-gray-500 focus:outline-none"
                      required
                    />
                  </fieldset>
                  {validation.fullName !== null && (
                    <p
                      className={`text-[12px] pl-4  ${validation.fullName ? "text-green-400" : "text-red-400"}`}
                    >
                      {validation.fullName
                        ? "Valid name"
                        : "Must start with a letter and contain only letters or numbers."}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <fieldset className="group rounded-lg border border-zinc-600 px-2.5 py-1 transition-all focus-within:border-dashed focus-within:border-[#D97634]">
                    <legend className="px-2 text-xs tracking-wider text-gray-400 uppercase">
                      Email Address
                    </legend>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      className="mb-1.5 w-full rounded-md bg-[#444444] px-4 py-2 text-white placeholder-gray-500 focus:outline-none"
                      required
                    />
                  </fieldset>
                  {validation.email !== null && (
                    <p
                      className={`text-[12px] pl-4  ${validation.email ? "text-green-400" : "text-red-400"}`}
                    >
                      {validation.email
                        ? "Valid email address"
                        : "Invalid email format"}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <fieldset className="group rounded-lg border border-zinc-600 px-2.5 py-1 transition-all focus-within:border-dashed focus-within:border-[#D97634]">
                    <legend className="px-2 text-xs tracking-wider text-gray-400 uppercase">
                      Phone Number
                    </legend>
                    <input
                      type="tel"
                      id="phoneNo"
                      name="phoneNo"
                      value={formData.phoneNo}
                      onChange={handleChange}
                      autoComplete="tel"
                      className="mb-1.5 w-full rounded-md bg-[#444444] px-4 py-2 text-white placeholder-gray-500 focus:outline-none"
                      required
                    />
                  </fieldset>
                  {validation.phoneNo !== null && (
                    <p
                      className={`text-[12px] pl-4  ${validation.phoneNo ? "text-green-400" : "text-red-400"}`}
                    >
                      {validation.phoneNo
                        ? "Valid phone number"
                        : "Must start with 98, 97, or 96 and be exactly 10 digits"}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <fieldset className="group rounded-lg border border-zinc-600 px-2.5 py-1 transition-all focus-within:border-dashed focus-within:border-[#D97634]">
                    <legend className="px-2 text-xs tracking-wider text-gray-400 uppercase">
                      Message
                    </legend>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      className="w-full resize-none rounded-md bg-[#444444] px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
                      required
                    />
                  </fieldset>
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={submitState.type === "loading"}
                    className="rounded-md bg-[#D97634] px-8 py-3 text-sm font-semibold tracking-wider text-black uppercase transition-colors duration-200 hover:bg-orange-600 disabled:bg-orange-400 disabled:cursor-not-allowed"
                  >
                    {submitState.type === "loading"
                      ? "Sending..."
                      : "Send Message"}
                  </button>
                </div>

                <p
                  role="status"
                  aria-live="polite"
                  className={`text-center text-sm ${
                    submitState.type === "success"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {submitState.message}
                </p>
              </form>
            </div>

            <div className="order-1 space-y-4 md:order-2">
              <div className="rounded-lg bg-zinc-800 p-3 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D97634]">
                  <MapPin className="h-8 w-8 text-white" aria-hidden="true" />
                </div>
                <h2 className="mb-2 font-semibold text-white">Visit Us</h2>
                <p className="text-[#D97634]">Mid Baneshwor, Kathmandu</p>
              </div>

              <div className="rounded-lg bg-zinc-800 p-3 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D97634]">
                  <Clock className="h-8 w-8 text-white" aria-hidden="true" />
                </div>
                <h2 className="mb-2 font-semibold text-white">Opening Hours</h2>
                <p className="text-[#D97634]">10:00 AM - 10:00 PM</p>
              </div>

              <div className="rounded-lg bg-zinc-800 p-3 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D97634]">
                  <Phone className="h-8 w-8 text-white" aria-hidden="true" />
                </div>
                <h2 className="mb-2 font-semibold text-white">Contact Us</h2>
                <div className="space-y-1 text-[#D97634]">
                  <a href="tel:+985-1158465" className="hover:underline">
                    +977 9851158465
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
