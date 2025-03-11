import React from 'react';
import Head from 'next/head';
import { SidebarDemo } from '../components/SidebarDemo';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Ecodify - Dashboard</title>
        <meta name="description" content="Ecodify Dashboard - Manage your climate-enhanced documents" />
      </Head>
      
      <main className="min-h-screen">
        <SidebarDemo />
      </main>
    </>
  );
} 