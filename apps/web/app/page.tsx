import React from 'react';
import { TelemetryBar } from '../components/TelemetryBar';
import { GenerationStudio } from '../components/GenerationStudio';
import { ThreeCanvas } from '../components/ThreeCanvas';
import { Sparkles, Terminal } from 'lucide-react';

export default function StudioPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#090a0f] text-slate-100">
      {/* Top Header */}
      <header className="border-b border-[#262a3f] bg-[#0c0e17] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            SF
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              StudioForge
              <span className="text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                GenAI Scale Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Next.js 16.2 • Go 1.26 Pipeline • FFmpeg 7 AV1 • Apollo Subscriptions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#12141c] border border-[#262a3f]">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>CONTRACT: SPEC-03 GRAPHQL</span>
          </div>
        </div>
      </header>

      {/* Cluster Telemetry Bar */}
      <TelemetryBar />

      {/* Studio Generation Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto">
        <GenerationStudio />

        {/* 3D Spatial Staging Section */}
        <div className="px-6 pb-8">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            3D Frustum Staging & Perspective Alignment
          </div>
          <div className="h-[280px]">
            <ThreeCanvas />
          </div>
        </div>
      </div>
    </main>
  );
}
