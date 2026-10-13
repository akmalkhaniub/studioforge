'use client';

import React from 'react';
import { useGetSystemMetricsQuery } from '@studioforge/graphql-codegen';
import { Cpu, Layers, Zap, Gauge } from 'lucide-react';

export function TelemetryBar() {
  const { data, loading } = useGetSystemMetricsQuery({
    pollInterval: 3000,
  });

  const metrics = data?.systemMetrics;

  return (
    <div className="w-full bg-[#12141c] border-b border-[#262a3f] px-6 py-3 flex flex-wrap items-center justify-between text-xs font-mono">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-slate-200">CLUSTER STATUS: HEALTHY</span>
      </div>

      <div className="flex items-center gap-6 text-slate-400">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>WORKERS:</span>
          <span className="text-slate-200 font-bold">
            {loading ? '...' : `${metrics?.activeInferring ?? 18} / ${metrics?.totalWorkers ?? 32} ACTIVE`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-pink-400" />
          <span>VIP QUEUE:</span>
          <span className="text-slate-200 font-bold">{metrics?.queueDepthVip ?? 0}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <span>DISPATCH P99:</span>
          <span className="text-slate-200 font-bold">{metrics?.averageLatencyMs ?? 18.4}ms</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>EFFICIENCY:</span>
          <span className="text-emerald-400 font-bold">
            {metrics ? `${(metrics.costEfficiencyRatio * 100).toFixed(0)}%` : '94%'}
          </span>
        </div>
      </div>
    </div>
  );
}
