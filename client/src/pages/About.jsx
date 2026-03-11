import React from "react";

export default function About() {
  return (
    <div className="bg-[#f4f6fb] min-h-screen py-16 px-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

        <div className="hidden md:flex bg-[#000080] text-white flex-col justify-center p-12">
          <h2 className="text-4xl font-bold mb-4">
            About Our Platform
          </h2>
          <p className="text-lg opacity-90">
            We are redefining real estate with trust, technology and transparency.
          </p>
        </div>

        <div className="p-8 md:p-12 space-y-6">

          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Who We Are</h1>

          <p className="text-gray-600">
            Welcome to <span className="font-semibold">Your Brand</span>, your trusted
            digital partner in buying, selling, renting and building properties.
          </p>

          <div>
            <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
            <p className="text-gray-600">
              To make real estate simple, secure and accessible for everyone.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">What We Offer</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Verified Property Listings</li>
              <li>Smart Location Search</li>
              <li>Construction Planning Support</li>
              <li>Legal Assistance</li>
              <li>Direct Buyer-Seller Communication</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Our Vision</h2>
            <p className="text-gray-600">
              To become India’s most reliable digital property platform.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}