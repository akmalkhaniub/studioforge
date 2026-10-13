'use client';

import React, { useState } from 'react';
import {
  useCreateGenerationMutation,
  useOnGenerationProgressSubscription,
  GenerationType,
} from '@studioforge/graphql-codegen';
import { Play, Sparkles, Video, Image as ImageIcon, Loader2 } from 'lucide-react';

export function GenerationStudio() {
  const [prompt, setPrompt] = useState(
    'Cinematic hyper-realistic establishing shot of a futuristic metropolis, volumetric lighting, 8k resolution, octane render'
  );
  const [genType, setGenType] = useState<GenerationType>(GenerationType.ImageTextToImage);
  const [modelId, setModelId] = useState('model_flux_dev');
  const [steps, setSteps] = useState(25);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const [createGen, { loading: creating }] = useCreateGenerationMutation({
    onCompleted: (data) => {
      if (data?.createGeneration?.id) {
        setActiveTaskId(data.createGeneration.id);
      }
    },
  });

  const { data: subData } = useOnGenerationProgressSubscription({
    variables: { taskId: activeTaskId || '' },
    skip: !activeTaskId,
  });

  const progress = subData?.generationProgress;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGen({
      variables: {
        input: {
          prompt,
          type: genType,
          modelId,
          steps,
          width: 1024,
          height: 1024,
        },
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
      {/* Left Column: Prompting & Controls */}
      <div className="lg:col-span-5 bg-[#12141c] rounded-xl border border-[#262a3f] p-6 flex flex-col justify-between">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Generation Engine
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setGenType(GenerationType.ImageTextToImage);
                  setModelId('model_flux_dev');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition ${
                  genType === GenerationType.ImageTextToImage
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                    : 'bg-[#1c1f2e] border-[#262a3f] text-slate-400 hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Image (FLUX.1)
              </button>

              <button
                type="button"
                onClick={() => {
                  setGenType(GenerationType.VideoTextToVideo);
                  setModelId('model_svd_xt');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition ${
                  genType === GenerationType.VideoTextToVideo
                    ? 'bg-pink-600/20 border-pink-500 text-pink-200'
                    : 'bg-[#1c1f2e] border-[#262a3f] text-slate-400 hover:text-slate-200'
                }`}
              >
                <Video className="w-4 h-4" />
                Video (SVD XT)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Prompt Specification
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full bg-[#090a0f] border border-[#262a3f] rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
              placeholder="Describe your scene or motion trajectory..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                <span>Sampling Steps</span>
                <span className="text-indigo-400">{steps}</span>
              </div>
              <input
                type="range"
                min={15}
                max={50}
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                <span>Resolution</span>
                <span className="text-indigo-400">1024x1024</span>
              </div>
              <select className="w-full bg-[#090a0f] border border-[#262a3f] rounded-md px-2 py-1.5 text-xs text-slate-300">
                <option>1024x1024 (1:1)</option>
                <option>1920x1080 (16:9)</option>
                <option>1080x1920 (9:16)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={creating || !prompt}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold text-sm hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Dispatching to GPU Cluster...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Render
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#262a3f] flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>PIPELINE: GO 1.26 ASYNC</span>
          <span>ROUTING: WARM VRAM</span>
        </div>
      </div>

      {/* Right Column: Active Canvas & Realtime Streaming Monitor */}
      <div className="lg:col-span-7 bg-[#12141c] rounded-xl border border-[#262a3f] p-6 flex flex-col justify-between min-h-[480px]">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-400" />
              Live Inference & Transcode Monitor
            </h3>
            {progress?.status && (
              <span
                className={`text-xs px-2.5 py-1 rounded font-mono font-semibold ${
                  progress.status === 'COMPLETED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse'
                }`}
              >
                {progress.status}
              </span>
            )}
          </div>

          {/* Denoising Stage / Video Preview */}
          <div className="relative w-full h-[320px] rounded-lg bg-[#090a0f] border border-[#262a3f] flex flex-col items-center justify-center overflow-hidden">
            {progress ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="text-4xl font-bold font-mono text-indigo-400 mb-2">
                  {progress.progressPct}%
                </div>
                <div className="text-sm text-slate-300 mb-4 font-mono">
                  Denoising Step {progress.currentStep} of {progress.totalSteps}
                </div>
                {progress.etaSeconds != null && (
                  <div className="text-xs text-slate-500 font-mono mb-4">
                    ETA: {progress.etaSeconds.toFixed(1)}s remaining
                  </div>
                )}
                {progress.status === 'COMPLETED' ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs">
                    Render complete! Assembled via FFmpeg 7 AV1 pipeline and pushed to Cloudflare R2 CDN.
                  </div>
                ) : (
                  <div className="w-3/4 bg-[#1c1f2e] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full transition-all duration-150"
                      style={{ width: `${progress.progressPct}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-500 text-sm">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                Submit a prompt to observe live GPU denoising and FFmpeg transcoding.
              </div>
            )}
          </div>
        </div>

        {activeTaskId && (
          <div className="mt-4 pt-3 border-t border-[#262a3f] flex items-center justify-between text-xs font-mono text-slate-400">
            <span>TASK UUID: {activeTaskId}</span>
            <span>BACKPRESSURE: ADMITTED</span>
          </div>
        )}
      </div>
    </div>
  );
}
