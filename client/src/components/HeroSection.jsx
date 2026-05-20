import { useMemo } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"

import "swiper/css"
import "swiper/css/pagination"

import slide1 from "../assets/slider/slide1.jpg"
import slide2 from "../assets/slider/slide2.jpg"
import slide3 from "../assets/slider/slide3.jpg"

import SearchBar from "./SearchBar"

function HeroSection() {

  // ✅ Memoized slides (prevents re-creation on re-render)
  const slides = useMemo(() => [
    {
      img: slide1,
      alt: "Modern house exterior",
    },
    {
      img: slide2,
      alt: "Luxury living room interior",
    },
    {
      img: slide3,
      alt: "Beautiful residential property",
    }
  ], [])

  return (
    <section
      role="region"
      aria-label="Featured properties hero"
      className="w-full"
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        pagination={{ clickable: true }}
        loop
        speed={800}
        className="w-full h-[560px]"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className="w-full h-[560px] bg-cover bg-center relative flex items-center justify-center"
              style={{ backgroundImage: `url(${slide.img})` }}
              role="img"
              aria-label={slide.alt}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>

              {/* Content */}
              <div className="relative z-10 text-center text-white px-6 max-w-4xl">
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  Find Your Dream Home
                </h1>

                <p className="text-lg mb-6 text-gray-200 max-w-2xl mx-auto">
                  Buy, Sell and Rent Properties Easily
                </p>

                {/* Search */}
                <div className="w-full flex justify-center">
                  <SearchBar />
                </div>

              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

export default HeroSection