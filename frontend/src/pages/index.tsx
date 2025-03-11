import React from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import Link from 'next/link'
import ScrollBoundedCursor from '../components/ScrollBoundedCursor'

export default function Home() {
  return (
    <>
      <Head>
        <title>Ecodify - Climate-Enhanced Learning</title>
        <meta name="description" content="Transform your educational materials with climate-conscious content" />
      </Head>
      
      {/* Scroll-bounded splash cursor - threshold is adjusted to match the wave position */}
      <ScrollBoundedCursor scrollThreshold={700} />
      
      <Navbar />
      <HeroSection />
      
      <main className="relative bg-white">
        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Enhance Your Educational Content with Climate Context
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Our AI-powered platform automatically integrates relevant climate information into your learning materials.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-gray-50 rounded-lg p-8 border border-gray-100 shadow-sm text-center">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-ecodify-primary text-white mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">PDF Enhancement</h3>
                <p className="text-gray-600">
                  Upload your worksheets and materials as PDFs and get climate-enhanced versions instantly.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-gray-50 rounded-lg p-8 border border-gray-100 shadow-sm text-center">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-ecodify-primary text-white mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600">
                  Our advanced AI identifies opportunities to integrate relevant climate concepts in your content.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-gray-50 rounded-lg p-8 border border-gray-100 shadow-sm text-center">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-ecodify-primary text-white mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Easy Integration</h3>
                <p className="text-gray-600">
                  Seamlessly download or share your enhanced materials with students and colleagues.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link href="/dashboard" passHref legacyBehavior>
                <a className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-ecodify-primary hover:bg-ecodify-secondary transition-colors">
                  Get Started Today
                </a>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
} 