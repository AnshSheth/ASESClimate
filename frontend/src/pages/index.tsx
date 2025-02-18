import React from 'react'
import FileUpload from '../components/FileUpload'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Ecodify - Climate-Enhanced Learning</title>
        <meta name="description" content="Transform your educational materials with climate-conscious content" />
      </Head>
      
      <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-ecodify-moss mb-4 tracking-tight">
              Ecodify
            </h1>
            <p className="text-xl text-ecodify-earth/80 max-w-2xl mx-auto">
              Transform your educational materials with climate-conscious content, 
              making learning more relevant for a sustainable future.
            </p>
          </div>

          {/* Main Content Card */}
          <div className="eco-card">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-ecodify-sage/30"></div>
                <span className="px-4 py-2 rounded-full bg-ecodify-sage/10 text-ecodify-moss font-medium">
                  Upload Your Worksheet
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-ecodify-sage/30"></div>
              </div>
              
              <FileUpload />
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="eco-card">
              <div className="text-ecodify-autumn text-2xl mb-2">🌱</div>
              <h3 className="text-lg font-semibold text-ecodify-moss mb-2">
                Climate Integration
              </h3>
              <p className="text-ecodify-earth/80">
                Seamlessly weave climate concepts into your existing educational materials.
              </p>
            </div>
            
            <div className="eco-card">
              <div className="text-ecodify-autumn text-2xl mb-2">🎯</div>
              <h3 className="text-lg font-semibold text-ecodify-moss mb-2">
                Subject-Specific
              </h3>
              <p className="text-ecodify-earth/80">
                Tailored climate connections for various subjects and topics.
              </p>
            </div>
            
            <div className="eco-card">
              <div className="text-ecodify-autumn text-2xl mb-2">📚</div>
              <h3 className="text-lg font-semibold text-ecodify-moss mb-2">
                Easy Export
              </h3>
              <p className="text-ecodify-earth/80">
                Download your enhanced materials in PDF format, ready for the classroom.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
} 