import React from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ComingSoon() {
  return (
    <>
      <Head>
        <title>Coming Soon | Ecodify</title>
        <meta name="description" content="User profiles and additional features coming soon to Ecodify" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-ecodify-primary/10 to-ecodify-secondary/10">
        {/* Back button to dashboard */}
        <div className="absolute top-4 left-4 z-20">
          <Link href="/dashboard" className="flex items-center text-ecodify-primary hover:text-ecodify-secondary transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl"
          >
            {/* Decorative elements */}
            <div className="relative mb-8">
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-ecodify-primary/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-ecodify-secondary/20 rounded-full blur-xl"></div>
              
              <div className="relative z-10 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-ecodify-primary to-ecodify-secondary rounded-full mb-6 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              User Profiles Coming Soon
            </h1>
            
            <p className="text-xl text-gray-700 mb-8">
              We're working hard to bring you personalized profiles, settings, and more. 
              Stay tuned for updates as we continue to enhance your Ecodify experience.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="px-6 py-3 bg-ecodify-primary text-white rounded-lg hover:bg-ecodify-primary/90 transition-colors">
                Return to Dashboard
              </Link>
              <Link href="/" className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Back to Home
              </Link>
            </div>
            
            {/* Progress indicator */}
            <div className="mt-16 max-w-md mx-auto">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-ecodify-primary">Development Progress</span>
                <span className="text-sm font-medium text-ecodify-primary">65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-ecodify-primary to-ecodify-secondary h-2.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
} 