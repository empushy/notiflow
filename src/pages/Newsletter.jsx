import React, { useState, useEffect } from 'react';
import Header from '../partials/Header';
import Footer from '../partials/Footer';

const teamMembers = [
  {
    name: 'Jane Doe',
    role: 'Co-Founder & CEO',
    imageUrl: '/images/jane.jpg',
  },
  {
    name: 'John Smith',
    role: 'Co-Founder & CTO',
    imageUrl: '/images/john.jpg',
  },
  // Add more team members as needed
];

function Newsletter() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Site header */}
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 text-center">
            We'll put some image here
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Stay Informed</h2>
            <p className="text-lg text-gray-600 mb-6">
              Subscribe to our weekly newsletter to receive the latest insights and trends in push notifications.
            </p>
            <form className="max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg"
              />
              <button
                type="submit"
                className="w-full bg-pink-400 text-white font-bold py-2 rounded-lg hover:bg-yellow-400 transition duration-300"
              >
                Sign Up
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Site footer */}
      <Footer />
    </div>
  );
}

export default Newsletter;
