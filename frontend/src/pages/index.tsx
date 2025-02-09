import React from 'react'
import FileUpload from '../components/FileUpload'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Climate Concept Worksheet Enhancer
      </h1>
      <FileUpload />
    </main>
  )
} 