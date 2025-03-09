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

function About() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Site header */}
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">About EmPushy</h1>
            <p className="text-xl text-gray-600">
              At EmPushy, we track mobile and web notifications pushed by brands, identify trends, and recommend engaging campaigns.
            </p>
          </div>
        </section>

        {/* Our Approach */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Approach</h2>
            <p className="text-lg text-gray-600 mb-4">
              We analyze millions of notifications across various industries to uncover emerging trends and insights.
            </p>
            <p className="text-lg text-gray-600">
              Our proprietary algorithms identify under-the-radar strategies and campaigns months before they become mainstream.
            </p>
          </div>
        </section>

        {/* Meet the Team */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Meet the Team</h2>
            <div className="flex flex-wrap justify-center">
              {teamMembers.map((member) => (
                <div key={member.name} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4">
                  <div className="bg-gray-100 p-6 rounded-lg">
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-32 h-32 mx-auto rounded-full mb-4"
                    />
                    <h3 className="text-xl font-bold text-gray-700">{member.name}</h3>
                    <p className="text-gray-600">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4 text-center">
            We'll put a CTA box here to sign up
          </div>
        </section>
      </main>

      {/* Site footer */}
      <Footer />
    </div>
  );
}

export default About;
