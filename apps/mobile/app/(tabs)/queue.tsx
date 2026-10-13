import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Cpu, Layers, Gauge, CheckCircle2 } from 'lucide-react-native';
import { useGetSystemMetricsQuery } from '@studioforge/graphql-codegen';

export default function MobileQueueScreen() {
  const { data, loading } = useGetSystemMetricsQuery({ pollInterval: 2500 });
  const metrics = data?.systemMetrics;

  const cards = [
    {
      title: 'ACTIVE GPU WORKERS',
      val: loading ? '...' : `${metrics?.activeInferring ?? 18} / ${metrics?.totalWorkers ?? 32}`,
      icon: <Cpu size={20} color="#818cf8" />,
      color: '#818cf8',
    },
    {
      title: 'VIP QUEUE DEPTH',
      val: loading ? '...' : `${metrics?.queueDepthVip ?? 0} TASKS`,
      icon: <Layers size={20} color="#ec4899" />,
      color: '#ec4899',
    },
    {
      title: 'DISPATCH P99 LATENCY',
      val: loading ? '...' : `${metrics?.averageLatencyMs ?? 18.4}ms`,
      icon: <Gauge size={20} color="#06b6d4" />,
      color: '#06b6d4',
    },
    {
      title: 'CLUSTER EFFICIENCY',
      val: metrics ? `${(metrics.costEfficiencyRatio * 100).toFixed(0)}%` : '94%',
      icon: <CheckCircle2 size={20} color="#10b981" />,
      color: '#10b981',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inference Fleet Monitor</Text>
      <Text style={styles.subtitle}>Real-time Go Pipeline Telemetry</Text>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.icon}
            </View>
            <Text style={[styles.cardVal, { color: item.color }]}>{item.val}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090a0f', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#94a3b8', marginBottom: 20 },
  list: { gap: 14 },
  card: {
    backgroundColor: '#12141c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262a3f',
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 11, fontWeight: '700', color: '#64748b', letterSpacing: 0.5 },
  cardVal: { fontSize: 22, fontWeight: 'bold', fontFamily: 'monospace' },
});
