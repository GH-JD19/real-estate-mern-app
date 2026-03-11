import React from "react";

export default function Privacy() {
  return (
    <div className="bg-[#f4f6fb] min-h-screen py-16 px-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

        <div className="hidden md:flex bg-[#000080] text-white flex-col justify-center p-12">
          <h2 className="text-4xl font-bold mb-4">Privacy Matters</h2>
          <p className="text-lg opacity-90">
            Your data security is our top priority.
          </p>
        </div>

        <div className="p-8 md:p-12 space-y-6">

          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Privacy Policy</h1>

          <div>
            <h2 className="text-xl font-semibold">Information We Collect</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Name & Contact Details</li>
              <li>Location Data</li>
              <li>Usage Behavior</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">How We Use Data</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Personalized Listings</li>
              <li>Improve Platform</li>
              <li>Security & Fraud Prevention</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Data Protection</h2>
            <p className="text-gray-600">
              We use modern security practices to protect your information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Your Rights</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Access your data</li>
              <li>Update information</li>
              <li>Request deletion</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}