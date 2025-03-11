import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { GlobeSection } from '@/components/GlobeSection';
import Head from 'next/head';

export default function About() {
  return (
    <>
      <Head>
        <title>About Ecodify | Climate Education Platform</title>
        <meta name="description" content="Learn about Ecodify's mission to provide equitable climate education and our team." />
      </Head>
      
      <div className="min-h-screen bg-white">
        <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
          {/* Back button to main page */}
          <div className="absolute top-4 left-4 z-20">
            <Link href="/" className="flex items-center text-white hover:text-green-200 transition-colors">
              <ArrowLeft className="mr-1 h-4 w-4" />
              <span>Ecodify</span>
            </Link>
          </div>

          {/* Header with wave bottom */}
          <div className="relative">
            {/* Animated color-shifting background */}
            <div className="h-64 md:h-80 overflow-hidden">
              <motion.div 
                className="absolute inset-0"
                animate={{ 
                  background: [
                    'linear-gradient(to right, #2E7D32, #1565C0)',
                    'linear-gradient(to right, #1565C0, #2E7D32)',
                    'linear-gradient(to right, #2E7D32, #1565C0)'
                  ]
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear"
                }}
              />
              
              <motion.div 
                className="absolute inset-0 opacity-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ duration: 1.5 }}
              >
                {/* Animated pattern overlay */}
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
              </motion.div>
              
              <div className="relative z-10 h-full flex items-center justify-center flex-col">
                <motion.h1 
                  className="text-4xl md:text-5xl font-display font-bold text-white text-center px-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7 }}
                >
                  About Ecodify
                </motion.h1>
                <motion.p
                  className="text-lg md:text-xl text-white text-center mt-3 max-w-2xl px-4 opacity-90"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  Bringing AI-powered climate education to classrooms worldwide
                </motion.p>
              </div>
            </div>
            
            {/* Wave shape at bottom of colored section */}
            <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
              <svg 
                className="relative block w-full h-[70px]" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 1200 120" 
                preserveAspectRatio="none"
                style={{ fill: 'currentColor' }}
              >
                <path 
                  d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z" 
                  className="text-white"
                ></path>
              </svg>
            </div>
          </div>
          
          {/* Content section */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Left column - Mission */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center justify-center p-2 bg-green-100 rounded-lg text-ecodify-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                
                <p className="text-lg text-gray-700">
                  At Ecodify, we're committed to making climate education accessible and integrated into everyday learning. Our AI-powered platform enhances educational materials with relevant climate context, helping educators and students connect traditional subjects with environmental awareness.
                </p>
                
                <div className="pt-4">
                  <Link href="/dashboard" passHref legacyBehavior>
                    <a className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-ecodify-primary hover:bg-ecodify-secondary transition-colors">
                      Try Our Platform
                    </a>
                  </Link>
                </div>
              </motion.div>
              
              {/* Right column - Vision */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="bg-white rounded-2xl p-8 shadow-natural border border-gray-100"
              >
                <div className="space-y-6">
                  <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-lg text-ecodify-secondary mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
                  
                  <p className="text-lg text-gray-700">
                    We envision a world where climate literacy is seamlessly woven into education across all disciplines. By making climate connections relevant and accessible, we aim to empower the next generation with the knowledge they need to address our planet's most pressing challenges.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-ecodify-primary">Education</h3>
                      <p className="text-sm text-gray-600">Transforming how climate is taught</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-ecodify-primary">Innovation</h3>
                      <p className="text-sm text-gray-600">Using AI to enhance learning</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Globe Section */}
            <GlobeSection />
            
            {/* Team section with actual names */}
            <motion.div 
              className="mt-24 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                We're a dedicated group of educators, technologists, and climate scientists working together to create meaningful educational tools.
              </p>
              
              {/* Team cards with actual names */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-natural border border-gray-100 flex flex-col items-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-ecodify-primary to-ecodify-secondary rounded-full mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    D
                  </div>
                  <h3 className="text-lg font-semibold">Danica</h3>
                  <p className="text-gray-600">Co-Founder</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-natural border border-gray-100 flex flex-col items-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-ecodify-sage to-ecodify-leaf rounded-full mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    A
                  </div>
                  <h3 className="text-lg font-semibold">Ansh</h3>
                  <p className="text-gray-600">Co-Founder</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-natural border border-gray-100 flex flex-col items-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-ecodify-sky to-ecodify-secondary rounded-full mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    H
                  </div>
                  <h3 className="text-lg font-semibold">Harsh</h3>
                  <p className="text-gray-600">Co-Founder</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Call to action */}
          <div className="bg-gradient-to-r from-ecodify-primary to-ecodify-secondary py-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-6">Ready to transform your educational materials?</h2>
              <Link href="/dashboard" passHref legacyBehavior>
                <a className="inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-md text-ecodify-primary bg-white hover:bg-gray-100 transition-colors">
                  Get Started Today
                </a>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
} 