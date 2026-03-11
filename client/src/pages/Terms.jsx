import React from "react";

export default function Terms() {
  return (
    <div className="bg-[#f4f6fb] min-h-screen py-16 px-6">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

        <div className="hidden md:flex bg-[#000080] text-white flex-col justify-center p-12">
          <h2 className="text-4xl font-bold mb-4">Terms of Use</h2>
          <p className="text-lg opacity-90">
            Understand your rights and responsibilities.
          </p>
        </div>

        <div className="p-8 md:p-12 space-y-6">

          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Terms & Conditions</h1>

          <div>
            <h2 className="text-xl font-semibold">1. Acceptance</h2>
            <p className="text-gray-600">
              By using our platform, you agree to these terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">2. User Responsibilities</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Provide accurate information</li>
              <li>Avoid fake listings</li>
              <li>Use platform lawfully</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">3. Property Listings</h2>
            <p className="text-gray-600">
              We do not guarantee ownership accuracy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">4. Prohibited Activities</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Fraud</li>
              <li>Unauthorized access</li>
              <li>Misuse of data</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">5. Limitation</h2>
            <p className="text-gray-600">
              We act only as a digital facilitator.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}