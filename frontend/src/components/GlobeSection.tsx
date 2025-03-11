import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from "@/components/ui/globe";

export function GlobeSection() {
  return (
    <div className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-lg text-ecodify-secondary mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.893 13.393l-1.135-1.135a2.252 2.252 0 01-.421-.585l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 01-1.81 1.025 1.055 1.055 0 01-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 01-1.383-2.46l.007-.042a2.25 2.25 0 01.29-.787l.09-.15a2.25 2.25 0 012.37-1.048l1.178.236a1.125 1.125 0 001.302-.795l.208-.73a1.125 1.125 0 00-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 01-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 01-1.458-1.137l1.411-2.353a2.25 2.25 0 00.286-.76m11.928 9.869A9 9 0 008.965 3.525m11.928 9.868A9 9 0 118.965 3.525" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900">Global Climate Education</h2>
            
            <p className="text-lg text-gray-700">
              At Ecodify, we're committed to making climate education accessible to everyone, everywhere. Our platform breaks down geographical barriers, allowing educators and students from around the world to access equitable climate education resources.
            </p>
            
            <p className="text-lg text-gray-700">
              Whether you're in a classroom in New York, a learning center in Tokyo, or a remote school in rural areas, Ecodify provides the tools to integrate climate literacy into your educational materials.
            </p>
          </motion.div>
          
          {/* Globe visualization */}
          <motion.div 
            className="relative h-[500px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Globe />
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0),rgba(255,255,255,0.8))] pointer-events-none"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 