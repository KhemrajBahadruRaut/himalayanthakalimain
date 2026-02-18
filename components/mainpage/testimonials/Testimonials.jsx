import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from "framer-motion"

const testimonials = [
  {
    name: "Abhash Jha",
    role: "Local Guide · 29 reviews · 15 photos",
    time: "6 months ago",
    dining: "Dine in  |  Rs 500–1,000",
    review:
      "Tried thakali khana, it tasted really good. Other snacks were also good. Was totally value for money.",
    food: 5,
    service: 4,
    atmosphere: 4,
    extras: ["Quiet, easy to talk", "No wait"],
  },
  {
    name: "Shradha Kharel",
    role: "6 reviews",
    time: "6 months ago",
    dining: null,
    review:
      "The staff here are incredibly nice and helpful. They went out of their way to make everything possible just to keep my paralyzed mom comfortable. Their friendly nature and caring attitude really touched us. On top of that, the atmosphere is warm and welcoming, which made the whole experience even better. Highly recommend this place!!",
    food: 5,
    service: 5,
    atmosphere: 5,
    extras: [],
  },
  {
    name: "Nick Magar",
    role: "Local Guide · 181 reviews · 4216 photos",
    time: "2 months ago",
    dining: "Other",
    review: "Good coffee and good thali set",
    food: 4,
    service: 4,
    atmosphere: 4,
    extras: [],
  },
  {
    name: "Samigya Acharya",
    role: "Local Guide · 69 reviews · 540 photos",
    time: "7 months ago",
    dining: "Dine in  |  Rs 1–500",
    review: "This place offers good ambience with good food.",
    food: 4,
    service: 4,
    atmosphere: 4,
    extras: ["Quiet, easy to talk", "Plenty of parking"],
  },
  {
    name: "Mr. Ram",
    role: "6 reviews",
    time: "6 months ago",
    dining: null,
    review:
      "I had the veg thali, and it was absolutely delicious! Every item was fresh, flavorful, and perfectly balanced. 😊 I highly recommend this place to anyone who loves tasty vegetarian food. If you're in Mid-Baneshwor, definitely check out this Himalayan Thakali restaurant! 😊😊",
    food: 5,
    service: 5,
    atmosphere: 5,
    extras: [],
  },
]

function StarRating({ value }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={s <= value ? "#D97634" : "none"}
          stroke="#D97634"
          strokeWidth="1.5"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  )
}

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const COLORS = ["#D97634", "#b05a20", "#c46828", "#e08840", "#9a4e1a"]

const Testimonials = () => {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const dragStartX = useRef(null)
  const autoSlideRef = useRef(null)

  const goTo = (index, dir) => {
    setDirection(dir)
    setCurrent((index + testimonials.length) % testimonials.length)
  }

  const next = () => goTo(current + 1, 1)
  const prev = () => goTo(current - 1, -1)

  // Auto-slide
  useEffect(() => {
    autoSlideRef.current = setInterval(next, 4500)
    return () => clearInterval(autoSlideRef.current)
  }, [current])

  // Touch / mouse drag
  const handleDragStart = (e) => {
    dragStartX.current = e.type === "touchstart" ? e.touches[0].clientX : e.clientX
  }
  const handleDragEnd = (e) => {
    if (dragStartX.current === null) return
    const endX = e.type === "touchend" ? e.changedTouches[0].clientX : e.clientX
    const diff = dragStartX.current - endX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    dragStartX.current = null
  }

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
  }

  const t = testimonials[current]

  return (
    <div>
      {/* Divider */}
      <div className="flex items-center justify-center gap-4 py-8 px-8">
        <div className="h-px bg-linear-to-r from-transparent via-[#D97634] to-transparent w-80" />
        <div className="flex items-center gap-2 text-[#D97634] text-sm tracking-widest">
          <span className="text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="24" viewBox="0 0 28 24">
              <path fill="currentColor" d="m14 2l-.128-.001c-2.098 0-4.102.399-5.942 1.124l.11-.038a11.3 11.3 0 0 0-4.4 2.922l-.007.007A5.88 5.88 0 0 0 2 9.994v.005a5.68 5.68 0 0 0 1.131 3.351l-.011-.015a9.6 9.6 0 0 0 3.096 2.719l.049.025l1.36.782l-.426 1.498A11.2 11.2 0 0 1 6.077 21.1l.029-.054a15.5 15.5 0 0 0 4.313-2.686l-.017.014l.672-.594l.89.094a17 17 0 0 0 2.028.125h.004l.128.001c2.098 0 4.102-.399 5.942-1.124l-.11.038a11.3 11.3 0 0 0 4.4-2.922l.007-.007c1.009-1.025 1.632-2.432 1.632-3.984s-.623-2.96-1.633-3.985l.001.001a11.25 11.25 0 0 0-4.329-2.904l-.078-.025c-1.73-.687-3.735-1.086-5.833-1.086l-.132.001h.007zm14 8a7.76 7.76 0 0 1-1.884 5.033l.009-.01a12.7 12.7 0 0 1-5.008 3.611l-.086.03c-2.023.846-4.374 1.337-6.839 1.337L13.99 20H14q-1.2-.003-2.363-.134l.097.009a17 17 0 0 1-7.069 3.756l-.118.026c-.503.145-1.107.266-1.726.339l-.055.005h-.08a.62.62 0 0 1-.422-.164a.8.8 0 0 1-.249-.424l-.001-.005v-.016a.2.2 0 0 1-.027-.102q0-.05.021-.091l-.001.001a.4.4 0 0 0 .031-.159v-.002q-.008-.031.07-.149l.094-.141l.11-.133l.125-.141q.11-.125.484-.539l.539-.594q.164-.18.484-.617c.174-.231.343-.493.491-.767l.017-.033q.187-.359.422-.922c.137-.317.276-.712.39-1.117l.017-.07a11.6 11.6 0 0 1-3.844-3.405l-.024-.035A7.52 7.52 0 0 1-.001 9.999v-.002a7.76 7.76 0 0 1 1.884-5.033l-.009.01a12.7 12.7 0 0 1 5.008-3.611l.086-.03C8.991.487 11.342-.004 13.807-.004l.202.001h-.01l.192-.001c2.465 0 4.816.491 6.959 1.381l-.12-.044a12.7 12.7 0 0 1 5.078 3.622l.015.018a7.75 7.75 0 0 1 1.875 5.021v.003z" />
            </svg>
          </span>
          <span>Testimonials</span>
        </div>
        <div className="h-px bg-linear-to-r from-transparent via-[#D97634] to-transparent w-80" />
      </div>

      {/* Section */}
      <section className="px-8 py-8 max-w-5xl mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-center mb-6">Guest Experiences</h2>
          <p className="text-gray-400 text-center leading-relaxed max-w-2xl mx-auto mb-16">
            Real words from our valued guests who dined with us and shared their heartfelt experiences.
          </p>

          <div className="relative">
            {/* Opening quote */}
            <div className="absolute -left-18 -top-10 text-[#D97634] -scale-x-100 -scale-y-100 hidden lg:flex">
              <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1" d="M10.99 9.449c.178 3.09-1.998 7.444-6.88 9.551L3 17.08c1.997-1.123 3.507-2.95 4.306-5.15c-2.886-.234-3.729-2.013-3.729-3.464c0-1.967 1.51-3.512 3.374-3.465c1.775-.047 3.817 1.311 4.039 4.448m10 0c.178 3.09-1.997 7.444-6.88 9.551L13 17.08c1.998-1.123 3.507-2.95 4.306-5.15c-2.886-.234-3.729-2.013-3.729-3.464c0-1.967 1.51-3.512 3.374-3.465c1.775-.047 3.817 1.311 4.039 4.448" />
              </svg>
            </div>

            {/* Slider wrapper */}
            <div
              className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleDragStart}
              onMouseUp={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchEnd={handleDragEnd}
            >
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={current}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                >
                  <div className="border-2 border-[#D97634] rounded-lg p-6 sm:p-12 relative">
                    {/* Overall star rating */}
                    <div className="flex justify-center mb-6">
                      <StarRating value={Math.round((t.food + t.service + t.atmosphere) / 3)} />
                    </div>

                    {/* Review text */}
                    <p className="text-gray-300 text-center leading-relaxed text-lg mb-8">
                      {t.review}
                    </p>

                    {/* Avatar & name */}
                    <div className="flex items-center justify-center gap-4">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                        style={{ background: COLORS[current % COLORS.length] }}
                      >
                        {getInitials(t.name)}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-white">{t.name}</p>
                        <p className="text-[#D97634] text-xs">{t.role}</p>
                        <p className="text-gray-500 text-xs">{t.time}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Closing quote */}
            <div className="absolute -right-18 lg:flex hidden -bottom-10 text-[#D97634]">
              <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 24 24">
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1" d="M10.99 9.449c.178 3.09-1.998 7.444-6.88 9.551L3 17.08c1.997-1.123 3.507-2.95 4.306-5.15c-2.886-.234-3.729-2.013-3.729-3.464c0-1.967 1.51-3.512 3.374-3.465c1.775-.047 3.817 1.311 4.039 4.448m10 0c.178 3.09-1.997 7.444-6.88 9.551L13 17.08c1.998-1.123 3.507-2.95 4.306-5.15c-2.886-.234-3.729-2.013-3.729-3.464c0-1.967 1.51-3.512 3.374-3.465c1.775-.047 3.817 1.311 4.039 4.448" />
              </svg>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-3 mt-12">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > current ? 1 : -1)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "w-5 h-3 bg-[#D97634]" : "w-3 h-3 bg-gray-600 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Testimonials