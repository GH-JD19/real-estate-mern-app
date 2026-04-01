import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

import slide1 from "../assets/slider/slide1.jpg"
import slide2 from "../assets/slider/slide2.jpg"
import slide3 from "../assets/slider/slide3.jpg"

import SearchBar from "./SearchBar"

function HeroSection() {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 4000 }}
      pagination={{ clickable: true }}
      loop
      className="w-full h-[560px]"
    >
      {[slide1, slide2, slide3].map((img, index) => (
        <SwiperSlide key={index}>
          <div
            className="w-full h-[560px] bg-cover bg-center relative flex items-center justify-center"
            style={{ backgroundImage: `url(${img})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>

            <div className="relative z-10 text-center text-white px-6 max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Find Your Dream Home
              </h1>

              <p className="text-lg mb-6 text-gray-200">
                Buy, Sell and Rent Properties Easily
              </p>
              <SearchBar />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default HeroSection