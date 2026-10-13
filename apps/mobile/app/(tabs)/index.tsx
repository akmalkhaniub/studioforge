import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Sparkles, Video, Image as ImageIcon } from 'lucide-react-native';
import {
  useCreateGenerationMutation,
  GenerationType,
} from '@studioforge/graphql-codegen';

export default function MobileStudioScreen() {
  const [prompt, setPrompt] = useState('Epic cinematic drone shot of cybernetic oasis, 8k');
  const [genType, setGenType] = useState<GenerationType>(GenerationType.ImageTextToImage);
  const [lastTaskId, setLastTaskId] = useState<string | null>(null);

  const [createGen, { loading }] = useCreateGenerationMutation({
    onCompleted: (data) => {
      if (data?.createGeneration?.id) {
        setLastTaskId(data.createGeneration.id);
      }
    },
  });

  const handleGenerate = () => {
    createGen({
      variables: {
        input: {
          prompt,
          type: genType,
          modelId: genType === GenerationType.VideoTextToVideo ? 'model_svd_xt' : 'model_flux_dev',
          steps: 25,
          width: 1024,
          height: 1024,
        },
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>StudioForge Mobile</Text>
      <Text style={styles.subtitle}>Executive GenAI Diffusion Reviewer</Text>

      {/* Mode Selector */}
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => setGenType(GenerationType.ImageTextToImage)}
          style={[
            styles.typeButton,
            genType === GenerationType.ImageTextToImage && styles.typeButtonActive,
          ]}
        >
          <ImageIcon size={18} color={genType === GenerationType.ImageTextToImage ? '#818cf8' : '#64748b'} />
          <Text
            style={[
              styles.typeText,
              genType === GenerationType.ImageTextToImage && styles.typeTextActive,
            ]}
          >
            FLUX.1 Image
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setGenType(GenerationType.VideoTextToVideo)}
          style={[
            styles.typeButton,
            genType === GenerationType.VideoTextToVideo && styles.typeButtonActivePink,
          ]}
        >
          <Video size={18} color={genType === GenerationType.VideoTextToVideo ? '#ec4899' : '#64748b'} />
          <Text
            style={[
              styles.typeText,
              genType === GenerationType.VideoTextToVideo && styles.typeTextActivePink,
            ]}
          >
            SVD Video
          </Text>
        </TouchableOpacity>
      </View>

      {/* Prompt Input */}
      <View style={styles.inputCard}>
        <Text style={styles.label}>PROMPT SPECIFICATION</Text>
        <TextInput
          style={styles.input}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={4}
          placeholder="Describe prompt..."
          placeholderTextColor="#64748b"
        />
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[styles.button, (!prompt || loading) && styles.buttonDisabled]}
        onPress={handleGenerate}
        disabled={!prompt || loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <View style={styles.buttonContent}>
            <Sparkles size={18} color="#ffffff" />
            <Text style={styles.buttonText}>Dispatch to Cluster</Text>
          </View>
        )}
      </TouchableOpacity>

      {lastTaskId && (
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>ACTIVE TASK DISPATCHED</Text>
          <Text style={styles.statusValue}>{lastTaskId}</Text>
          <Text style={styles.statusNote}>
            Enqueued via Go Redis Streams. Switch to Queue tab for live progress.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090a0f' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f8fafc', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#94a3b8', marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#12141c',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#262a3f',
  },
  typeButtonActive: { borderColor: '#6366f1', backgroundColor: '#1c1f2e' },
  typeButtonActivePink: { borderColor: '#ec4899', backgroundColor: '#1c1f2e' },
  typeText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  typeTextActive: { color: '#818cf8' },
  typeTextActivePink: { color: '#ec4899' },
  inputCard: {
    backgroundColor: '#12141c',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262a3f',
    padding: 16,
    marginBottom: 20,
  },
  label: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 },
  input: {
    color: '#f8fafc',
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  statusCard: {
    marginTop: 24,
    backgroundColor: '#12141c',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10b981',
    padding: 16,
  },
  statusLabel: { fontSize: 11, fontWeight: '700', color: '#10b981', marginBottom: 4 },
  statusValue: { fontSize: 12, fontFamily: 'monospace', color: '#f8fafc', marginBottom: 6 },
  statusNote: { fontSize: 11, color: '#94a3b8' },
});
