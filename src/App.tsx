/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, ChangeEvent, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Save, 
  FolderOpen, 
  Search, 
  Settings, 
  User, 
  Video, 
  Image as ImageIcon, 
  Layers, 
  Cpu, 
  Maximize2, 
  RefreshCw, 
  Check, 
  X,
  Plus,
  Minus,
  Trash2,
  Zap,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Download,
  Info,
  Undo2,
  Redo2,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MediaItem, FaceItem, SwapSettings, DEFAULT_SETTINGS } from './types.ts';

const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#1c1d21] border border-cyan-500/30 rounded shadow-xl text-[9px] leading-relaxed text-cyan-100 pointer-events-none"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#1c1d21]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mock Data
const MOCK_TARGETS: MediaItem[] = [
  { id: 't1', url: 'https://picsum.photos/seed/face1/800/600', type: 'image', name: 'thispersondoesnotexist1.jpg' },
  { id: 't2', url: 'https://picsum.photos/seed/face2/800/600', type: 'image', name: 'ouHAtbDp.jpg' },
  { id: 't3', url: 'https://picsum.photos/seed/face3/800/600', type: 'image', name: 'thispersondoesnotexist4.jpg' },
  { id: 't4', url: 'https://picsum.photos/seed/face4/800/600', type: 'image', name: 'thispersondoesnotexist5.jpg' },
  { id: 'v1', url: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video', name: 'stock_vid1.mp4', thumbnail: 'https://picsum.photos/seed/vid1/200/150' },
  { id: 'v2', url: 'https://www.w3schools.com/html/movie.mp4', type: 'video', name: '3201691-hd_1920_1080.mp4', thumbnail: 'https://picsum.photos/seed/vid2/200/150' },
];

const MOCK_FACES: FaceItem[] = [
  { id: 'f1', url: 'https://picsum.photos/seed/source1/200/200', name: 'Source 1' },
  { id: 'f2', url: 'https://picsum.photos/seed/source2/200/200', name: 'Source 2' },
  { id: 'f3', url: 'https://picsum.photos/seed/source3/200/200', name: 'Source 3' },
  { id: 'f4', url: 'https://picsum.photos/seed/source4/200/200', name: 'Source 4' },
];

const WebcamPreview = ({ stream }: { stream: MediaStream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video 
      ref={videoRef} 
      autoPlay 
      playsInline 
      muted 
      className="max-w-full max-h-full object-contain mirror" 
    />
  );
};

export default function App() {
  const [targets, setTargets] = useState<MediaItem[]>(MOCK_TARGETS);
  const [faces, setFaces] = useState<FaceItem[]>(MOCK_FACES);
  const [selectedTarget, setSelectedTarget] = useState<MediaItem | null>(MOCK_TARGETS[0]);
  const [selectedFace, setSelectedFace] = useState<FaceItem | null>(MOCK_FACES[0]);
  const [settings, setSettings] = useState<SwapSettings>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [swappedResult, setSwappedResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Face Swap');
  const [vramUsage, setVramUsage] = useState(7.16);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStage, setDetectionStage] = useState('');
  const [detectionModel, setDetectionModel] = useState('RetinaFace-ResNet50');
  const [detectedFaces, setDetectedFaces] = useState<{ x: number, y: number, w: number, h: number, confidence: number, isObscured: boolean }[]>([]);
  
  // Export State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [exportResolution, setExportResolution] = useState<'720p' | '1080p' | '4K'>('1080p');
  const [exportFrameRate, setExportFrameRate] = useState<24 | 30 | 60>(30);
  const [exportCodec, setExportCodec] = useState<'H.264' | 'VP9' | 'AV1'>('H.264');
  const [exportAudioBitrate, setExportAudioBitrate] = useState<'128' | '192' | '320'>('192');
  const [exportAudioChannels, setExportAudioChannels] = useState<'Mono' | 'Stereo'>('Stereo');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [isVirtualCameraEnabled, setIsVirtualCameraEnabled] = useState(false);
  const [isLiveSwapping, setIsLiveSwapping] = useState(true);
  const [isLivePlaybackEnabled, setIsLivePlaybackEnabled] = useState(false);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [comparisonModelA, setComparisonModelA] = useState('InStyleSwapper256 Version C');
  const [comparisonModelB, setComparisonModelB] = useState('SimSwap 512px');
  const [faceMappings, setFaceMappings] = useState<Record<number, string>>({});
  const [customDFMModels, setCustomDFMModels] = useState<string[]>([]);
  const swapIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const exportIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup intervals on unmount
  const toggleWebcam = useCallback(async () => {
    if (isWebcamActive) {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
      setWebcamStream(null);
      setIsWebcamActive(false);
      setSelectedTarget(targets[0]);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setWebcamStream(stream);
        setIsWebcamActive(true);
        setSelectedTarget({
          id: 'webcam',
          url: '',
          type: 'video',
          name: 'Live Webcam Feed'
        });
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    }
  }, [isWebcamActive, webcamStream, targets]);

  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamStream]);

  useEffect(() => {
    return () => {
      if (swapIntervalRef.current) clearInterval(swapIntervalRef.current);
      if (exportIntervalRef.current) clearInterval(exportIntervalRef.current);
    };
  }, []);

  // Face Editor State
  const [faceBrightness, setFaceBrightness] = useState(100);
  const [faceContrast, setFaceContrast] = useState(100);
  const [faceSaturation, setFaceSaturation] = useState(100);
  const [faceSharpness, setFaceSharpness] = useState(0);
  const [faceRotation, setFaceRotation] = useState(0);
  const [faceScale, setFaceScale] = useState(1);
  const [isAligning, setIsAligning] = useState(false);

  // History Management
  const [past, setPast] = useState<any[]>([]);
  const [future, setFuture] = useState<any[]>([]);

  const captureState = useCallback(() => ({
    brightness: faceBrightness,
    contrast: faceContrast,
    saturation: faceSaturation,
    sharpness: faceSharpness,
    rotation: faceRotation,
    scale: faceScale,
    similarityThreshold: settings.similarityThreshold,
    strength: settings.strength,
    faceLikeness: settings.faceLikeness,
    differencing: settings.differencing,
    restoreEyes: settings.restoreEyes,
    borderBlur: settings.borderBlur,
    occlusionMask: settings.occlusionMask,
    dflXSegMask: settings.dflXSegMask,
    blendMode: settings.blendMode,
    upscaling: settings.upscaling,
    stabilization: settings.stabilization,
    expressionRestorer: settings.expressionRestorer,
    faceEnhancer: settings.faceEnhancer,
    faceDetector: settings.faceDetector,
    landmarkDetector: settings.landmarkDetector,
    tensorRT: settings.tensorRT,
    livePortraitExpression: settings.livePortraitExpression,
    livePortraitPose: settings.livePortraitPose,
    colorGrading: JSON.parse(JSON.stringify(settings.colorGrading)),
  }), [faceBrightness, faceContrast, faceSaturation, faceSharpness, faceRotation, faceScale, settings]);

  const pushToHistory = useCallback(() => {
    const state = captureState();
    setPast(prev => {
      // Avoid duplicate states
      if (prev.length > 0 && JSON.stringify(prev[prev.length - 1]) === JSON.stringify(state)) {
        return prev;
      }
      return [...prev, state].slice(-20); // Limit history to 20 steps
    });
    setFuture([]);
  }, [captureState]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const current = captureState();
    const previous = past[past.length - 1];
    
    setFuture(prev => [current, ...prev]);
    setPast(prev => prev.slice(0, -1));

    setFaceBrightness(previous.brightness);
    setFaceContrast(previous.contrast);
    setFaceSaturation(previous.saturation);
    setFaceSharpness(previous.sharpness);
    setFaceRotation(previous.rotation);
    setFaceScale(previous.scale);
    setSettings(prev => ({
      ...prev,
      similarityThreshold: previous.similarityThreshold,
      strength: previous.strength,
      faceLikeness: previous.faceLikeness,
      differencing: previous.differencing,
      restoreEyes: previous.restoreEyes,
      borderBlur: previous.borderBlur,
      occlusionMask: previous.occlusionMask,
      dflXSegMask: previous.dflXSegMask,
      blendMode: previous.blendMode,
      upscaling: previous.upscaling,
      stabilization: previous.stabilization,
      expressionRestorer: previous.expressionRestorer,
      faceEnhancer: previous.faceEnhancer,
      faceDetector: previous.faceDetector,
      landmarkDetector: previous.landmarkDetector,
      tensorRT: previous.tensorRT,
      livePortraitExpression: previous.livePortraitExpression,
      livePortraitPose: previous.livePortraitPose,
      colorGrading: previous.colorGrading,
    }));
  }, [past, captureState]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const current = captureState();
    const next = future[0];

    setPast(prev => [...prev, current]);
    setFuture(prev => prev.slice(1));

    setFaceBrightness(next.brightness);
    setFaceContrast(next.contrast);
    setFaceSaturation(next.saturation);
    setFaceSharpness(next.sharpness);
    setFaceRotation(next.rotation);
    setFaceScale(next.scale);
    setSettings(prev => ({
      ...prev,
      similarityThreshold: next.similarityThreshold,
      strength: next.strength,
      faceLikeness: next.faceLikeness,
      differencing: next.differencing,
      restoreEyes: next.restoreEyes,
      borderBlur: next.borderBlur,
      occlusionMask: next.occlusionMask,
      dflXSegMask: next.dflXSegMask,
      blendMode: next.blendMode,
      upscaling: next.upscaling,
      stabilization: next.stabilization,
      expressionRestorer: next.expressionRestorer,
      faceEnhancer: next.faceEnhancer,
      faceDetector: next.faceDetector,
      landmarkDetector: next.landmarkDetector,
      tensorRT: next.tensorRT,
      livePortraitExpression: next.livePortraitExpression,
      livePortraitPose: next.livePortraitPose,
      colorGrading: next.colorGrading,
    }));
  }, [future, captureState]);

  const handleAlignFace = useCallback(() => {
    if (!selectedFace) return;
    pushToHistory();
    setIsAligning(true);
    
    // Simulate AI alignment process
    setTimeout(() => {
      setFaceRotation(0);
      setFaceScale(1.1); // Slight zoom for standard framing
      setIsAligning(false);
    }, 1200);
  }, [selectedFace, pushToHistory]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newFace: FaceItem = {
          id: `f${Date.now()}`,
          url: event.target?.result as string,
          name: file.name
        };
        setFaces(prev => [...prev, newFace]);
        setSelectedFace(newFace);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetectFaces = useCallback(() => {
    if (!selectedTarget) return;
    setIsDetecting(true);
    setDetectedFaces([]);
    
    const stages = [
      { name: 'Initializing Neural Engine...', delay: 400 },
      { name: 'Loading RetinaFace Weights...', delay: 600 },
      { name: 'Scanning Image Pyramid...', delay: 800 },
      { name: 'Refining Bounding Boxes...', delay: 500 },
      { name: 'Calculating Confidence Scores...', delay: 300 }
    ];

    let currentDelay = 0;
    stages.forEach((stage, index) => {
      setTimeout(() => {
        setDetectionStage(stage.name);
        if (index === stages.length - 1) {
          setTimeout(() => {
            setIsDetecting(false);
            setDetectionStage('');
            // Simulate detecting 1-4 faces with detailed metadata
            const count = Math.floor(Math.random() * 4) + 1;
            const newFaces = Array.from({ length: count }).map(() => ({
              x: 15 + Math.random() * 60,
              y: 15 + Math.random() * 60,
              w: 12 + Math.random() * 12,
              h: 12 + Math.random() * 12,
              confidence: 0.85 + Math.random() * 0.14,
              isObscured: Math.random() > 0.8
            }));
            setDetectedFaces(newFaces);
            setFaceMappings({}); // Reset mappings when new faces are detected
          }, stage.delay);
        }
      }, currentDelay);
      currentDelay += stage.delay;
    });
  }, [selectedTarget]);

  const handleRemoveFace = (id: string) => {
    setFaces(prev => prev.filter(f => f.id !== id));
    if (selectedFace?.id === id) {
      setSelectedFace(null);
    }
  };

  const handleSwap = useCallback(() => {
    if (!selectedTarget || (!selectedFace && Object.keys(faceMappings).length === 0)) return;
    
    if (swapIntervalRef.current) clearInterval(swapIntervalRef.current);
    setIsProcessing(true);
    setProgress(0);
    setSwappedResult(null);

    swapIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (swapIntervalRef.current) clearInterval(swapIntervalRef.current);
          swapIntervalRef.current = null;
          setIsProcessing(false);
          // Simulate a result by adding a blur or different seed to the target
          // In a real app, this would send settings, faceMappings, and granularMasking to the backend
          setSwappedResult(`${selectedTarget.url}?swapped=${Date.now()}&mappings=${Object.keys(faceMappings).length}&masking=${Object.values(settings.granularMasking).filter(Boolean).length}`);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  }, [selectedTarget, selectedFace, faceMappings, settings.granularMasking]);

  const clearVram = () => {
    setVramUsage(0.5 + Math.random());
  };

  const calculateEstimatedSize = () => {
    // Video size calculation (simulated)
    const baseSizeMB = exportResolution === '720p' ? 5 : exportResolution === '1080p' ? 15 : 60;
    const fpsMultiplier = exportFrameRate / 30;
    const codecMultiplier = exportCodec === 'H.264' ? 1 : exportCodec === 'VP9' ? 0.7 : 0.5;
    const videoSizeMB = baseSizeMB * fpsMultiplier * codecMultiplier * 0.25; // 15 seconds (0.25 min)

    // Audio size calculation: (bitrate in kbps * duration in seconds) / (8 bits/byte * 1024 bytes/KB)
    const audioBitrateKbps = parseInt(exportAudioBitrate);
    const channelsMultiplier = exportAudioChannels === 'Mono' ? 1 : exportAudioChannels === 'Stereo' ? 2 : 6;
    const audioSizeMB = (audioBitrateKbps * 15 * channelsMultiplier) / (8 * 1024);

    return (videoSizeMB + audioSizeMB).toFixed(1);
  };

  const handleExport = () => {
    if (exportIntervalRef.current) clearInterval(exportIntervalRef.current);
    setIsExporting(true);
    setExportProgress(0);
    exportIntervalRef.current = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          if (exportIntervalRef.current) clearInterval(exportIntervalRef.current);
          exportIntervalRef.current = null;
          setTimeout(() => {
            setIsExporting(false);
            setIsSaveModalOpen(false);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div className="flex h-screen w-full bg-[#0b0c0e] text-[#e1e1e1] font-sans selection:bg-cyan-500/30 overflow-hidden">
      {/* Save Options Modal */}
      <AnimatePresence>
        {isSaveModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[#151619] border border-[#2a2b2e] rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-[#2a2b2e] flex items-center justify-between bg-[#1c1d21]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
                    <Save className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest">Export Settings</h2>
                    <p className="text-[10px] text-[#8e9299]">Configure output quality and format</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSaveModalOpen(false)}
                  disabled={isExporting}
                  className="p-2 hover:bg-[#2a2b2e] disabled:opacity-20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Resolution */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase text-[#8e9299] tracking-widest">Resolution</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(['720p', '1080p', '4K'] as const).map(res => (
                      <button
                        key={res}
                        onClick={() => setExportResolution(res)}
                        className={`py-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                          exportResolution === res 
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' 
                            : 'border-[#2a2b2e] hover:border-[#3a3b3e] text-[#8e9299]'
                        }`}
                      >
                        <span className="text-xs font-bold">{res}</span>
                        <span className="text-[8px] opacity-60">
                          {res === '720p' ? '1280x720' : res === '1080p' ? '1920x1080' : '3840x2160'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Codec & Frame Rate */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold uppercase text-[#8e9299] tracking-widest">Codec</h3>
                    <select 
                      value={exportCodec}
                      onChange={(e) => setExportCodec(e.target.value as any)}
                      className="w-full bg-[#1c1d21] border border-[#2a2b2e] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option>H.264</option>
                      <option>VP9</option>
                      <option>AV1</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold uppercase text-[#8e9299] tracking-widest">Frame Rate</h3>
                    <select 
                      value={exportFrameRate}
                      onChange={(e) => setExportFrameRate(parseInt(e.target.value) as any)}
                      className="w-full bg-[#1c1d21] border border-[#2a2b2e] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value={24}>24 FPS</option>
                      <option value={30}>30 FPS</option>
                      <option value={60}>60 FPS</option>
                    </select>
                  </div>
                </div>

                {/* Audio Settings */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase text-[#8e9299] tracking-widest">Audio Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[8px] text-[#8e9299] uppercase">Bitrate</span>
                      <select 
                        value={exportAudioBitrate}
                        onChange={(e) => setExportAudioBitrate(e.target.value as any)}
                        className="w-full bg-[#1c1d21] border border-[#2a2b2e] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="64">64 kbps</option>
                        <option value="96">96 kbps</option>
                        <option value="128">128 kbps</option>
                        <option value="192">192 kbps</option>
                        <option value="256">256 kbps</option>
                        <option value="320">320 kbps</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[8px] text-[#8e9299] uppercase">Channels</span>
                      <select 
                        value={exportAudioChannels}
                        onChange={(e) => setExportAudioChannels(e.target.value as any)}
                        className="w-full bg-[#1c1d21] border border-[#2a2b2e] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option>Mono</option>
                        <option>Stereo</option>
                        <option>5.1 Surround</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Estimation */}
                <div className="bg-[#1c1d21] rounded-xl p-4 border border-[#2a2b2e] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Info className="w-4 h-4 text-cyan-500" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#8e9299] uppercase font-bold">Estimated Size</span>
                      <span className="text-sm font-mono text-white">{calculateEstimatedSize()} MB</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#8e9299] uppercase font-bold">Format</span>
                    <div className="text-xs font-bold text-white">MP4 ({exportCodec})</div>
                  </div>
                </div>

                {/* Export Button */}
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 rounded-xl font-bold text-sm tracking-widest uppercase transition-all shadow-lg shadow-orange-900/40 flex items-center justify-center gap-3 relative overflow-hidden"
                >
                  {isExporting ? (
                    <>
                      <motion.div 
                        className="absolute inset-0 bg-orange-400/20"
                        initial={{ width: 0 }}
                        animate={{ width: `${exportProgress}%` }}
                      />
                      <RefreshCw className="w-4 h-4 animate-spin relative z-10" />
                      <span className="relative z-10">Exporting {exportProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Start Export</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Left Sidebar: Media & Faces */}
      <aside className="w-72 border-r border-[#2a2b2e] bg-[#151619] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#2a2b2e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">GuruSwap <span className="text-[10px] opacity-50 font-mono">v1.2.0</span></h1>
          </div>
          <MoreVertical className="w-4 h-4 opacity-40 cursor-pointer hover:opacity-100 transition-opacity" />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Target Media Section */}
          <section className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8e9299]">Target Videos/Images</h2>
              <div className="flex items-center gap-2">
                <Tooltip text="Open local folder">
                  <FolderOpen className="w-4 h-4 text-orange-400 cursor-pointer hover:scale-110 transition-transform" />
                </Tooltip>
                <Tooltip text={isWebcamActive ? "Stop Webcam" : "Use Webcam as target source"}>
                  <button 
                    onClick={toggleWebcam}
                    className={`p-1 rounded transition-colors group ${isWebcamActive ? 'bg-cyan-500/20' : 'hover:bg-[#2a2b2e]'}`}
                  >
                    <Video className={`w-4 h-4 group-hover:scale-110 transition-transform ${isWebcamActive ? 'text-cyan-400' : 'text-[#8e9299]'}`} />
                  </button>
                </Tooltip>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40" />
              <input 
                type="text" 
                placeholder="Search Videos/Images" 
                className="w-full bg-[#1c1d21] border border-[#2a2b2e] rounded-md py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {targets.map(item => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTarget(item)}
                  className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedTarget?.id === item.id ? 'border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'border-transparent hover:border-[#3a3b3e]'
                  }`}
                >
                  <img 
                    src={item.thumbnail || item.url} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 backdrop-blur-sm text-[9px] truncate">
                    {item.name}
                  </div>
                  {item.type === 'video' && (
                    <div className="absolute top-1 right-1 bg-black/40 rounded p-0.5">
                      <Video className="w-3 h-3 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>

          <div className="h-px bg-[#2a2b2e] mx-4" />

          {/* Input Faces Section */}
          <section className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8e9299]">Input Faces</h2>
              <div className="flex items-center gap-2">
                <Tooltip text="Enable multiple source faces for better accuracy (Face Embeddings)">
                  <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded cursor-pointer hover:bg-cyan-500/20 transition-colors">
                    <span className="text-[8px] font-bold uppercase text-cyan-400">Multi</span>
                    <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]" />
                  </div>
                </Tooltip>
                <FolderOpen className="w-4 h-4 text-orange-400 cursor-pointer hover:scale-110 transition-transform" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {faces.map(face => {
                const isSelected = settings.faceEmbeddings 
                  ? settings.selectedEmbeddingFaces.includes(face.id)
                  : selectedFace?.id === face.id;

                return (
                  <motion.div
                    key={face.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (settings.faceEmbeddings) {
                        const newSelection = settings.selectedEmbeddingFaces.includes(face.id)
                          ? settings.selectedEmbeddingFaces.filter(id => id !== face.id)
                          : [...settings.selectedEmbeddingFaces, face.id];
                        setSettings({ ...settings, selectedEmbeddingFaces: newSelection });
                      } else {
                        setSelectedFace(face);
                      }
                    }}
                    className={`aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all relative ${
                      isSelected ? 'border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'border-transparent hover:border-[#3a3b3e]'
                    }`}
                  >
                    <img 
                      src={face.url} 
                      alt={face.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {settings.faceEmbeddings && isSelected && (
                      <div className="absolute top-1 right-1 bg-cyan-500 rounded-full p-0.5">
                        <Check className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
              <label className="aspect-square rounded-md border-2 border-dashed border-[#2a2b2e] flex items-center justify-center hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all group cursor-pointer">
                <Plus className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-opacity" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
            
            {/* Drag & Drop Area */}
            <div 
              className="border-2 border-dashed border-[#2a2b2e] rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const newFace: FaceItem = {
                      id: `f${Date.now()}`,
                      url: event.target?.result as string,
                      name: file.name
                    };
                    setFaces(prev => [...prev, newFace]);
                    setSelectedFace(newFace);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            >
              <Download className="w-6 h-6 opacity-20 group-hover:opacity-100 group-hover:text-cyan-500 transition-all" />
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-40 group-hover:opacity-100">Drop New Face Here</span>
            </div>

            {/* Selected Face Preview & Remove */}
            <AnimatePresence>
              {selectedFace && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-[#1c1d21] rounded-lg border border-[#2a2b2e] p-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-cyan-500">Selected Preview</span>
                    <button 
                      onClick={() => handleRemoveFace(selectedFace.id)}
                      className="p-1 hover:bg-red-500/20 rounded-md transition-colors group"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400 group-hover:text-red-300" />
                    </button>
                  </div>
                  <div className="aspect-square rounded-md overflow-hidden border border-[#2a2b2e]">
                    <img 
                      src={selectedFace.url} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-[10px] text-center opacity-50 truncate">{selectedFace.name}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </aside>

      {/* Main Content: Preview & Controls */}
      <main className="flex-1 flex flex-col bg-[#0b0c0e] relative">
        {/* Top Bar: View Options */}
        <header className="h-12 border-b border-[#2a2b2e] bg-[#151619] flex items-center px-4 gap-6">
          <div className="flex items-center gap-4 text-xs font-medium">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" defaultChecked className="accent-cyan-500" />
              <span className="group-hover:text-cyan-400 transition-colors">Media Panel</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" defaultChecked className="accent-cyan-500" />
              <span className="group-hover:text-cyan-400 transition-colors">Faces Panel</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" defaultChecked className="accent-cyan-500" />
              <span className="group-hover:text-cyan-400 transition-colors">Parameters Panel</span>
            </label>
            <div className="h-4 w-px bg-[#2a2b2e]" />
            <Tooltip text="Enable Live Swapping: See the swap result in real-time during playback.">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div 
                  onClick={() => setIsLiveSwapping(!isLiveSwapping)}
                  className={`w-8 h-4 rounded-full border border-[#2a2b2e] relative transition-all group-hover:border-cyan-500/50 ${isLiveSwapping ? 'bg-cyan-500/20' : 'bg-[#1c1d21]'}`}
                >
                  <motion.div 
                    animate={{ x: isLiveSwapping ? 16 : 4 }}
                    className={`absolute top-1 w-2 h-2 rounded-full shadow-[0_0_5px_rgba(6,182,212,0.5)] ${isLiveSwapping ? 'bg-cyan-500' : 'bg-[#8e9299]'}`} 
                  />
                </div>
                <span className={`text-[9px] font-bold uppercase transition-colors ${isLiveSwapping ? 'text-cyan-400' : 'text-[#8e9299]'}`}>Live Swap</span>
              </label>
            </Tooltip>
            <div className="h-4 w-px bg-[#2a2b2e]" />
            <Tooltip text="Stream processed video to Virtual Camera for Twitch, Zoom, or YouTube.">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div 
                  onClick={() => setIsVirtualCameraEnabled(!isVirtualCameraEnabled)}
                  className={`w-8 h-4 rounded-full border border-[#2a2b2e] relative transition-all group-hover:border-cyan-500/50 ${isVirtualCameraEnabled ? 'bg-orange-500/20' : 'bg-[#1c1d21]'}`}
                >
                  <motion.div 
                    animate={{ x: isVirtualCameraEnabled ? 16 : 4 }}
                    className={`absolute top-1 w-2 h-2 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.5)] ${isVirtualCameraEnabled ? 'bg-orange-500' : 'bg-[#8e9299]'}`} 
                  />
                </div>
                <span className={`text-[9px] font-bold uppercase transition-colors ${isVirtualCameraEnabled ? 'text-orange-400' : 'text-[#8e9299]'}`}>Virtual Cam</span>
              </label>
            </Tooltip>
          </div>
          <div className="h-4 w-px bg-[#2a2b2e]" />
          <div className="flex items-center gap-4 text-xs font-medium">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" defaultChecked className="accent-cyan-500" />
              <span className="group-hover:text-cyan-400 transition-colors">View Face Compare</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="accent-cyan-500" />
              <span className="group-hover:text-cyan-400 transition-colors">View Face Mask</span>
            </label>
          </div>
        </header>

        {/* Preview Area */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 flex gap-4 min-h-0">
            {/* Original Preview */}
            <div className="flex-1 bg-[#151619] rounded-xl border border-[#2a2b2e] overflow-hidden flex flex-col shadow-2xl relative">
              <div className="p-3 border-b border-[#2a2b2e] flex items-center justify-between bg-[#1c1d21]">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-cyan-500">Original Target</span>
                  <select 
                    value={detectionModel}
                    onChange={(e) => setDetectionModel(e.target.value)}
                    className="bg-black/40 border border-[#2a2b2e] rounded px-2 py-0.5 text-[9px] text-[#8e9299] focus:outline-none focus:border-cyan-500/50"
                  >
                    <option>RetinaFace-ResNet50</option>
                    <option>MTCNN-v2</option>
                    <option>YOLOv8-Face</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleDetectFaces}
                    disabled={isDetecting}
                    className={`p-1 rounded transition-all flex items-center gap-1.5 px-2 ${isDetecting ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-[#2a2b2e] text-[#8e9299] hover:text-white'}`}
                  >
                    <Search className={`w-3.5 h-3.5 ${isDetecting ? 'animate-pulse' : ''}`} />
                    <span className="text-[9px] font-bold uppercase">{isDetecting ? 'Analyzing...' : 'Detect Faces'}</span>
                  </button>
                  <Maximize2 className="w-3.5 h-3.5 opacity-40 hover:opacity-100 cursor-pointer" />
                </div>
              </div>
              <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                {isWebcamActive && webcamStream ? (
                  <WebcamPreview stream={webcamStream} />
                ) : selectedTarget?.type === 'video' ? (
                  <video src={selectedTarget.url} className="max-w-full max-h-full" controls />
                ) : (
                  <img src={selectedTarget?.url} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                )}

                {/* Face Detection Overlays */}
                <AnimatePresence>
                  {isDetecting && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none z-20"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <RefreshCw className="w-10 h-10 text-cyan-500 animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 bg-cyan-500 rounded-full animate-ping" />
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-[0.2em]">{detectionStage}</span>
                          <div className="w-48 h-0.5 bg-white/10 mt-2 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-cyan-500"
                              initial={{ width: "0%" }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 2.5, ease: "linear" }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {!isDetecting && detectedFaces.map((face, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`absolute border-2 shadow-[0_0_15px_rgba(6,182,212,0.5)] pointer-events-none transition-colors ${face.isObscured ? 'border-orange-500/80 border-dashed' : 'border-cyan-500'}`}
                      style={{
                        left: `${face.x}%`,
                        top: `${face.y}%`,
                        width: `${face.w}%`,
                        height: `${face.h}%`,
                      }}
                    >
                      <div className={`absolute -top-5 left-0 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase flex items-center gap-1.5 whitespace-nowrap ${face.isObscured ? 'bg-orange-500' : 'bg-cyan-500'}`}>
                        <span>Face #{i + 1}</span>
                        <span className="opacity-60">|</span>
                        <span>{(face.confidence * 100).toFixed(1)}%</span>
                        {face.isObscured && (
                          <>
                            <span className="opacity-60">|</span>
                            <span className="flex items-center gap-0.5"><EyeOff className="w-2 h-2" /> Obscured</span>
                          </>
                        )}
                      </div>
                      {/* Corner Accents */}
                      <div className={`absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 ${face.isObscured ? 'border-orange-300' : 'border-white'}`} />
                      <div className={`absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 ${face.isObscured ? 'border-orange-300' : 'border-white'}`} />
                      <div className={`absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 ${face.isObscured ? 'border-orange-300' : 'border-white'}`} />
                      <div className={`absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 ${face.isObscured ? 'border-orange-300' : 'border-white'}`} />
                      
                      {/* Landmark Points (Visual Flair) */}
                      {!face.isObscured && (
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40">
                          <div className="w-0.5 h-0.5 bg-white rounded-full place-self-center" style={{ gridArea: '1/1' }} />
                          <div className="w-0.5 h-0.5 bg-white rounded-full place-self-center" style={{ gridArea: '1/3' }} />
                          <div className="w-0.5 h-0.5 bg-white rounded-full place-self-center" style={{ gridArea: '2/2' }} />
                          <div className="w-0.5 h-0.5 bg-white rounded-full place-self-center" style={{ gridArea: '3/1' }} />
                          <div className="w-0.5 h-0.5 bg-white rounded-full place-self-center" style={{ gridArea: '3/3' }} />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Swapped Result Preview */}
            <div className="flex-1 bg-[#151619] rounded-xl border border-[#2a2b2e] overflow-hidden flex flex-col shadow-2xl relative">
              <div className="p-3 border-b border-[#2a2b2e] flex items-center justify-between bg-[#1c1d21]">
                <span className="text-[10px] uppercase tracking-widest font-bold text-orange-500">Swapped Result</span>
                <div className="flex gap-2">
                  <Download className="w-3.5 h-3.5 opacity-40 hover:opacity-100 cursor-pointer" />
                  <Maximize2 className="w-3.5 h-3.5 opacity-40 hover:opacity-100 cursor-pointer" />
                </div>
              </div>
              <div className="flex-1 relative bg-black flex items-center justify-center">
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <Tooltip text="Enable real-time preview of the processed video.">
                    <button 
                      onClick={() => setIsLivePlaybackEnabled(!isLivePlaybackEnabled)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                        isLivePlaybackEnabled 
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                          : 'bg-black/40 border-[#2a2b2e] text-[#8e9299] hover:text-white'
                      }`}
                    >
                      <Play className={`w-3 h-3 ${isLivePlaybackEnabled ? 'animate-pulse' : ''}`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Live Playback</span>
                    </button>
                  </Tooltip>
                </div>

                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
                    >
                      <div className="w-64 h-1 bg-[#2a2b2e] rounded-full overflow-hidden mb-4">
                        <motion.div 
                          className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-xs font-mono text-cyan-400 animate-pulse">
                        PROCESSING FACE SWAP... {Math.round(progress)}%
                      </div>
                      <div className="mt-8 grid grid-cols-3 gap-4 opacity-50">
                        <div className="flex flex-col items-center">
                          <Cpu className="w-4 h-4 mb-1 animate-spin-slow" />
                          <span className="text-[8px] uppercase">GPU Compute</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Layers className="w-4 h-4 mb-1 animate-bounce" />
                          <span className="text-[8px] uppercase">Alignment</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <RefreshCw className="w-4 h-4 mb-1 animate-spin" />
                          <span className="text-[8px] uppercase">Blending</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : isWebcamActive && isLiveSwapping && webcamStream ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <WebcamPreview stream={webcamStream} />
                      <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-full px-3 py-1">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Live Swapping Active</span>
                      </div>
                      {isVirtualCameraEnabled && (
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-orange-500/20 backdrop-blur-md border border-orange-500/30 rounded-full px-3 py-1">
                          <Radio className="w-3 h-3 text-orange-400 animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Streaming to Virtual Cam</span>
                        </div>
                      )}
                    </div>
                  ) : isComparisonMode && swappedResult ? (
                    <div className="w-full h-full flex gap-1 p-1">
                      <div className="flex-1 relative bg-black/40 rounded overflow-hidden group">
                        <img src={swappedResult} className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                        {isLivePlaybackEnabled && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-full h-1 bg-cyan-500/20 absolute bottom-0">
                              <motion.div 
                                className="h-full bg-cyan-500"
                                animate={{ width: ['0%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded text-[8px] font-bold text-cyan-400 uppercase tracking-tighter">
                          Model A: {comparisonModelA}
                        </div>
                      </div>
                      <div className="w-px bg-cyan-500/20 self-stretch" />
                      <div className="flex-1 relative bg-black/40 rounded overflow-hidden group">
                        <img src={swappedResult} className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" style={{ filter: 'hue-rotate(15deg) contrast(1.1)' }} referrerPolicy="no-referrer" />
                        {isLivePlaybackEnabled && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-full h-1 bg-orange-500/20 absolute bottom-0">
                              <motion.div 
                                className="h-full bg-orange-500"
                                animate={{ width: ['0%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md border border-orange-500/30 rounded text-[8px] font-bold text-orange-400 uppercase tracking-tighter">
                          Model B: {comparisonModelB}
                        </div>
                      </div>
                    </div>
                  ) : swappedResult ? (
                    <motion.div 
                      key={swappedResult}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative w-full h-full flex items-center justify-center"
                    >
                      <img 
                        src={swappedResult} 
                        className="max-w-full max-h-full object-contain" 
                        referrerPolicy="no-referrer"
                      />
                      {isLivePlaybackEnabled && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-cyan-500/20 rounded-full flex items-center justify-center">
                            <Play className="w-4 h-4 text-cyan-500 fill-current animate-pulse" />
                          </div>
                          <div className="w-full h-1 bg-cyan-500/10 absolute bottom-0">
                            <motion.div 
                              className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                              animate={{ width: ['0%', '100%'] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                          </div>
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded px-2 py-1 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-[8px] font-bold text-white uppercase tracking-widest">Live Preview</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center opacity-20">
                      <Zap className="w-16 h-16 mb-4" />
                      <span className="text-sm font-medium">Ready to Swap</span>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="h-32 bg-[#151619] rounded-xl border border-[#2a2b2e] p-4 flex items-center justify-between shadow-lg">
            <div className="flex flex-col gap-4 w-1/4">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-[#2a2b2e] rounded-md transition-colors"><SkipBack className="w-4 h-4" /></button>
                <button className="p-3 bg-cyan-600 hover:bg-cyan-500 rounded-full transition-all shadow-lg shadow-cyan-900/20"><Play className="w-5 h-5 text-white fill-current" /></button>
                <button className="p-2 hover:bg-[#2a2b2e] rounded-md transition-colors"><SkipForward className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono opacity-50">
                <span>00:00:00:00</span>
                <div className="flex-1 h-1 bg-[#2a2b2e] rounded-full relative">
                  <div className="absolute left-0 top-0 h-full w-1/3 bg-cyan-500/50 rounded-full" />
                </div>
                <span>00:00:15:24</span>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col gap-2">
                <Tooltip text="Start the face swapping process using current settings.">
                  <button 
                    onClick={handleSwap}
                    disabled={isProcessing || !selectedTarget || !selectedFace}
                    className="w-full px-8 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-sm tracking-widest uppercase transition-all shadow-lg shadow-cyan-900/40 flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    Swap Faces
                  </button>
                </Tooltip>
                <Tooltip text="Automatically detect and extract faces from the target media.">
                  <button className="w-full px-8 py-2 border border-[#2a2b2e] hover:bg-[#2a2b2e] rounded-lg font-bold text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2">
                    <User className="w-3 h-3" />
                    Find Faces
                  </button>
                </Tooltip>
              </div>
              <div className="flex flex-col gap-2">
                <Tooltip text="Configure export settings and save the result.">
                  <button 
                    onClick={() => setIsSaveModalOpen(true)}
                    className="w-full px-8 py-3 bg-orange-600 hover:bg-orange-500 rounded-lg font-bold text-sm tracking-widest uppercase transition-all shadow-lg shadow-orange-900/40 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Result
                  </button>
                </Tooltip>
                <Tooltip text="Remove the current swapped result and reset the preview.">
                  <button className="w-full px-8 py-2 border border-[#2a2b2e] hover:bg-[#2a2b2e] rounded-lg font-bold text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2">
                    <Trash2 className="w-3 h-3" />
                    Clear Result
                  </button>
                </Tooltip>
              </div>
            </div>

            <div className="w-1/4 flex flex-col gap-2 items-end">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-tighter opacity-50">Selected Face</span>
                <div className="w-12 h-12 rounded-md border border-cyan-500/50 overflow-hidden bg-black">
                  {selectedFace && <img src={selectedFace.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-tighter opacity-50">Target Embed</span>
                <div className="w-12 h-12 rounded-md border border-[#2a2b2e] overflow-hidden bg-black flex items-center justify-center">
                  <Search className="w-4 h-4 opacity-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar: Control Options */}
      <aside className="w-80 border-l border-[#2a2b2e] bg-[#151619] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#2a2b2e] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest">Control Options</h2>
            <Settings className="w-4 h-4 opacity-40" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <Tooltip text="GPU: NVIDIA GeForce RTX 3070 Ti (8GB GDDR6X) | Driver: 535.104.05 | Compute: CUDA 12.2">
                <span className="text-cyan-400 cursor-help">{vramUsage.toFixed(2)} GB / 8.0 GB ({(vramUsage / 8 * 100).toFixed(0)}%)</span>
              </Tooltip>
              <button onClick={clearVram} className="hover:text-white transition-colors">Clear VRAM</button>
            </div>
            <div className="h-1.5 w-full bg-[#1c1d21] rounded-full overflow-hidden border border-[#2a2b2e]">
              <motion.div 
                className={`h-full transition-colors ${vramUsage > 6 ? 'bg-red-500' : 'bg-cyan-500'}`}
                animate={{ width: `${(vramUsage / 8) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2b2e]">
          {['Face Swap', 'Face Editor', 'Common', 'Settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-tighter transition-all relative ${
                activeTab === tab ? 'text-cyan-400' : 'text-[#8e9299] hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {activeTab === 'Face Swap' && (
            <div className="space-y-6">
              {/* Swapper Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[11px] font-bold uppercase text-[#8e9299]">Swapper</h3>
                    <Tooltip text="The AI engine responsible for the face swap process.">
                      <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                    </Tooltip>
                  </div>
                  <RefreshCw className="w-3 h-3 opacity-40 cursor-pointer hover:opacity-100" />
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[10px] text-[#8e9299]">Swapper Model</label>
                        <Tooltip text="Choose between different AI models. Higher resolution models (512px) provide better detail but require more VRAM.">
                          <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                        </Tooltip>
                      </div>
                    </div>

                    <div 
                      className="relative group"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-cyan-500/50', 'bg-cyan-500/5');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-cyan-500/50', 'bg-cyan-500/5');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-cyan-500/50', 'bg-cyan-500/5');
                        const file = e.dataTransfer.files[0];
                        if (file && (file.name.endsWith('.dfm') || file.type === 'image/png')) {
                          setCustomDFMModels([...customDFMModels, file.name]);
                          setSettings({...settings, swapperModel: file.name});
                        }
                      }}
                    >
                      <select 
                        value={settings.swapperModel}
                        onChange={e => setSettings({...settings, swapperModel: e.target.value})}
                        className="w-full bg-[#1c1d21] border border-[#2a2b2e] rounded-md py-1.5 px-3 text-xs focus:outline-none focus:border-cyan-500/50 transition-colors"
                      >
                        <option>InStyleSwapper256 Version C</option>
                        <option>SimSwap 512px</option>
                        <option>InsightFace 128px</option>
                        <option>DeepFaceLab DFM (Custom)</option>
                        {customDFMModels.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                      
                      <label className="absolute right-8 top-1/2 -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                        <input 
                          type="file" 
                          accept=".dfm,.png" 
                          className="hidden" 
                          onChange={e => {
                            if (e.target.files?.[0]) {
                              setCustomDFMModels([...customDFMModels, e.target.files[0].name]);
                              setSettings({...settings, swapperModel: e.target.files[0].name});
                            }
                          }}
                        />
                        <Tooltip text="Upload .dfm model or .png image">
                          <Plus className="w-3 h-3 text-cyan-500 hover:text-cyan-400" />
                        </Tooltip>
                      </label>
                    </div>
                    
                    <div className="text-[8px] text-[#8e9299] italic px-1">
                      Drag & drop .dfm or .png here to load custom models
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-black/20 rounded border border-[#2a2b2e]">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-bold text-[#8e9299]">Face Embeddings</span>
                      <Tooltip text="Use multiple source faces to create a more accurate face embedding for the swap.">
                        <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                      </Tooltip>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.faceEmbeddings}
                      onChange={e => {
                        pushToHistory();
                        setSettings({
                          ...settings, 
                          faceEmbeddings: e.target.checked,
                          selectedEmbeddingFaces: e.target.checked && selectedFace ? [selectedFace.id] : []
                        });
                      }}
                      className="accent-cyan-500"
                    />
                  </div>

                  {/* Model Comparison Section */}
                  <div className="pt-2 space-y-3 border-t border-[#2a2b2e]/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider">Model Comparison</label>
                        <Tooltip text="Compare the output of two different models side-by-side.">
                          <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                        </Tooltip>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={isComparisonMode}
                        onChange={e => setIsComparisonMode(e.target.checked)}
                        className="accent-cyan-500"
                      />
                    </div>
                    
                    {isComparisonMode && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] text-[#8e9299] uppercase">Model A</label>
                            <select 
                              value={comparisonModelA}
                              onChange={e => setComparisonModelA(e.target.value)}
                              className="w-full bg-[#0b0c0e] border border-[#2a2b2e] rounded py-1 px-1.5 text-[9px] focus:outline-none focus:border-cyan-500/50"
                            >
                              <option>InStyleSwapper256 Version C</option>
                              <option>SimSwap 512px</option>
                              <option>InsightFace 128px</option>
                              <option>DeepFaceLab DFM (Custom)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-[#8e9299] uppercase">Model B</label>
                            <select 
                              value={comparisonModelB}
                              onChange={e => setComparisonModelB(e.target.value)}
                              className="w-full bg-[#0b0c0e] border border-[#2a2b2e] rounded py-1 px-1.5 text-[9px] focus:outline-none focus:border-cyan-500/50"
                            >
                              <option>InStyleSwapper256 Version C</option>
                              <option>SimSwap 512px</option>
                              <option>InsightFace 128px</option>
                              <option>DeepFaceLab DFM (Custom)</option>
                            </select>
                          </div>
                        </div>
                        <div className="p-2 bg-cyan-500/5 border border-cyan-500/20 rounded text-[8px] text-cyan-100/70 leading-tight">
                          Comparison mode will split the result preview to show both models simultaneously.
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] text-[#8e9299]">TensorRT Acceleration</label>
                      <Tooltip text="Enables NVIDIA TensorRT for ultra-fast GPU processing. Requires compatible GPU.">
                        <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                      </Tooltip>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.tensorRT}
                      onChange={e => setSettings({...settings, tensorRT: e.target.checked})}
                      className="accent-cyan-500"
                    />
                  </div>
                </div>

                {/* Face Mapping Section */}
                {detectedFaces.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-[#2a2b2e]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[11px] font-bold uppercase text-cyan-500">Multi-Face Mapping</h3>
                      <Tooltip text="Map detected target faces to specific source faces.">
                        <Info className="w-3 h-3 text-cyan-500/50 cursor-help" />
                      </Tooltip>
                    </div>
                    <div className="space-y-2">
                      {detectedFaces.map((face, i) => (
                        <div key={i} className="flex items-center gap-3 bg-[#1c1d21] p-2 rounded-lg border border-[#2a2b2e] group hover:border-cyan-500/30 transition-colors">
                          <div className="w-10 h-10 bg-black rounded border border-[#2a2b2e] flex items-center justify-center text-[10px] font-bold text-cyan-500">
                            #{i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-[9px] text-[#8e9299] uppercase mb-1">Target Face #{i + 1}</div>
                            <select 
                              value={faceMappings[i] || ''}
                              onChange={e => setFaceMappings({...faceMappings, [i]: e.target.value})}
                              className="w-full bg-black/40 border border-[#2a2b2e] rounded py-1 px-2 text-[10px] focus:outline-none focus:border-cyan-500/50"
                            >
                              <option value="">Auto-Swap (Closest Match)</option>
                              {faces.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                              ))}
                            </select>
                          </div>
                          {faceMappings[i] && (
                            <div className="w-10 h-10 rounded border border-cyan-500/50 overflow-hidden">
                              <img 
                                src={faces.find(f => f.id === faceMappings[i])?.url} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Detection Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase text-[#8e9299]">Detection Engines</h3>
                  <Tooltip text="Configure how faces and landmarks are detected in the media.">
                    <Info className="w-3 h-3 text-cyan-500/50 cursor-help" />
                  </Tooltip>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#8e9299]">Face Detector</label>
                    <select 
                      value={settings.faceDetector}
                      onChange={e => setSettings({...settings, faceDetector: e.target.value as any})}
                      className="w-full bg-[#1c1d21] border border-[#2a2b2e] rounded-md py-1 px-2 text-[10px] focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="RetinaFace">RetinaFace</option>
                      <option value="YOLOv5">YOLOv5</option>
                      <option value="MediaPipe">MediaPipe</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#8e9299]">Landmarks</label>
                    <select 
                      value={settings.landmarkDetector}
                      onChange={e => setSettings({...settings, landmarkDetector: e.target.value as any})}
                      className="w-full bg-[#1c1d21] border border-[#2a2b2e] rounded-md py-1 px-2 text-[10px] focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="68-points">68 Points (High)</option>
                      <option value="5-points">5 Points (Fast)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Correction Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase text-[#8e9299]">Corrections</h3>
                  <Tooltip text="Apply automatic adjustments to improve the swap quality.">
                    <Info className="w-3 h-3 text-cyan-500/50 cursor-help" />
                  </Tooltip>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full border border-[#2a2b2e] ${settings.faceAdjustments ? 'bg-cyan-500' : ''}`} />
                        Face Adjustments
                      </label>
                      <Tooltip text="Enables automatic color and lighting correction for the swapped face.">
                        <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                      </Tooltip>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.faceAdjustments}
                      onChange={e => setSettings({...settings, faceAdjustments: e.target.checked})}
                      className="accent-cyan-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full border border-[#2a2b2e] ${settings.keypointsAdjustments ? 'bg-cyan-500' : ''}`} />
                        Keypoints Adjustments
                      </label>
                      <Tooltip text="Refines the alignment of facial features like eyes, nose, and mouth.">
                        <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                      </Tooltip>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.keypointsAdjustments}
                      onChange={e => setSettings({...settings, keypointsAdjustments: e.target.checked})}
                      className="accent-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase text-[#8e9299]">Face Similarity</h3>
                  <Tooltip text="Adjust how closely the swapped face matches the target features.">
                    <Info className="w-3 h-3 text-cyan-500/50 cursor-help" />
                  </Tooltip>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Similarity Threshold', key: 'similarityThreshold', min: 0, max: 100, tooltip: 'Controls how closely the swapped face must match the target face\'s features.' },
                    { label: 'Strength', key: 'strength', min: 0, max: 100, tooltip: 'The overall intensity of the face swap effect.' },
                    { label: 'Face Likeness', key: 'faceLikeness', min: 0, max: 100, tooltip: 'Adjusts how much of the source face\'s unique characteristics are preserved.' },
                    { label: 'Differencing', key: 'differencing', min: 0, max: 100, tooltip: 'Fine-tunes the color and lighting match between the source and target faces.' },
                  ].map(slider => (
                    <div key={slider.key} className="space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#8e9299]">{slider.label}</span>
                          <Tooltip text={slider.tooltip}>
                            <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                          </Tooltip>
                        </div>
                        <span className="font-mono text-cyan-400">{(settings as any)[slider.key]}</span>
                      </div>
                      <input 
                        type="range" 
                        min={slider.min} 
                        max={slider.max} 
                        value={(settings as any)[slider.key]}
                        onMouseDown={pushToHistory}
                        onChange={e => setSettings({...settings, [slider.key]: parseInt(e.target.value)})}
                        className="w-full accent-cyan-500 h-1 bg-[#1c1d21] rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Expression & Enhancement */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase text-[#8e9299]">Expression & Enhancement</h3>
                  <Tooltip text="Transfer expressions and enhance facial details.">
                    <Info className="w-3 h-3 text-cyan-500/50 cursor-help" />
                  </Tooltip>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#8e9299]">Expression Restorer</span>
                        <Tooltip text="Transfers original expressions from the target face to the swapped face.">
                          <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                        </Tooltip>
                      </div>
                      <span className="font-mono text-cyan-400">{settings.expressionRestorer}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={settings.expressionRestorer}
                      onMouseDown={pushToHistory}
                      onChange={e => setSettings({...settings, expressionRestorer: parseInt(e.target.value)})}
                      className="w-full accent-cyan-500 h-1 bg-[#1c1d21] rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] text-[#8e9299]">Face Enhancer</label>
                      <Tooltip text="Select a model to restore and enhance the swapped face. GFPGAN and CodeFormer are popular choices for high-quality restoration.">
                        <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                      </Tooltip>
                    </div>
                    <select 
                      value={settings.faceEnhancer}
                      onChange={e => setSettings({...settings, faceEnhancer: e.target.value as any})}
                      className="w-full bg-[#1c1d21] border border-[#2a2b2e] rounded-md py-1.5 px-3 text-xs focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="none">None</option>
                      <option value="GFPGAN">GFPGAN v1.4</option>
                      <option value="CodeFormer">CodeFormer</option>
                      <option value="GPEN">GPEN-BFR-512</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Masking */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase text-[#8e9299]">Face Mask</h3>
                  <Tooltip text="Define how the face is isolated and blended with the target.">
                    <Info className="w-3 h-3 text-cyan-500/50 cursor-help" />
                  </Tooltip>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px]">Occlusion Mask</label>
                      <Tooltip text="Automatically detects and masks objects (like hair or hands) that are in front of the face.">
                        <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                      </Tooltip>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.occlusionMask}
                      onChange={e => {
                        pushToHistory();
                        setSettings({...settings, occlusionMask: e.target.checked});
                      }}
                      className="accent-cyan-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px]">DFL XSeg Mask</label>
                      <Tooltip text="Uses advanced segmentation to create a more precise mask around the face boundaries.">
                        <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                      </Tooltip>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.dflXSegMask}
                      onChange={e => {
                        pushToHistory();
                        setSettings({...settings, dflXSegMask: e.target.checked});
                      }}
                      className="accent-cyan-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#8e9299]">Border Blur</span>
                        <Tooltip text="Softens the edges of the swapped face to blend it more naturally with the target media.">
                          <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                        </Tooltip>
                      </div>
                      <span className="font-mono text-cyan-400">{settings.borderBlur}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={settings.borderBlur}
                      onMouseDown={pushToHistory}
                      onChange={e => setSettings({...settings, borderBlur: parseInt(e.target.value)})}
                      className="w-full accent-cyan-500 h-1 bg-[#1c1d21] rounded-full appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Post-processing */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase text-[#8e9299]">Post-Processing</h3>
                  <Tooltip text="Advanced enhancements applied after the swap.">
                    <Info className="w-3 h-3 text-cyan-500/50 cursor-help" />
                  </Tooltip>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] flex items-center gap-2">
                        <Eye className="w-3 h-3 text-cyan-400" />
                        Restore Eyes
                      </label>
                      <Tooltip text="Enhances and sharpens the eye area for a more lifelike appearance.">
                        <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                      </Tooltip>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.restoreEyes}
                      onChange={e => {
                        pushToHistory();
                        setSettings({...settings, restoreEyes: e.target.checked});
                      }}
                      className="accent-cyan-500"
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] flex items-center gap-2">
                          <Maximize2 className="w-3 h-3 text-cyan-400" />
                          AI Upscaling
                        </label>
                        <Tooltip text="Uses AI to increase the resolution and detail of the swapped face.">
                          <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                        </Tooltip>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.upscaling}
                        onChange={e => {
                          pushToHistory();
                          setSettings({...settings, upscaling: e.target.checked});
                        }}
                        className="accent-cyan-500"
                      />
                    </div>
                    {settings.upscaling && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pl-5 space-y-3 border-l border-cyan-500/20"
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[8px] uppercase text-[#8e9299]">
                            <span>Upscale Model</span>
                          </div>
                          <select 
                            value={settings.upscaleModel}
                            onChange={e => setSettings({...settings, upscaleModel: e.target.value as any})}
                            className="w-full bg-[#1c1d21] border border-[#2a2b2e] rounded px-2 py-1 text-[10px] text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option>Real-ESRGAN</option>
                            <option>SwinIR</option>
                            <option>BSRGAN</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[8px] uppercase text-[#8e9299]">
                            <span>Upscale Factor</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {(['2x', '4x'] as const).map(factor => (
                              <button
                                key={factor}
                                onClick={() => setSettings({...settings, upscaleFactor: factor})}
                                className={`py-1 rounded border text-[9px] font-bold transition-all ${
                                  settings.upscaleFactor === factor 
                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                                    : 'bg-black/20 border-[#2a2b2e] text-[#8e9299] hover:border-[#3a3b3e]'
                                }`}
                              >
                                {factor}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] flex items-center gap-2">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        Stabilization
                      </label>
                      <Tooltip text="Reduces camera shake in the target video for a steadier result.">
                        <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                      </Tooltip>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.stabilization}
                      onChange={e => {
                        pushToHistory();
                        setSettings({...settings, stabilization: e.target.checked});
                      }}
                      className="accent-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Face Editor' && (
            <div className="space-y-6">
              <div className="bg-[#1c1d21] rounded-lg border border-[#2a2b2e] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[11px] font-bold uppercase text-cyan-500">Fine-Tune Face</h3>
                    <div className="flex items-center gap-1">
                      <Tooltip text="Undo last adjustment">
                        <button 
                          onClick={undo}
                          disabled={past.length === 0}
                          className="p-1 hover:bg-[#2a2b2e] rounded disabled:opacity-20 transition-colors"
                        >
                          <Undo2 className="w-3 h-3" />
                        </button>
                      </Tooltip>
                      <Tooltip text="Redo last adjustment">
                        <button 
                          onClick={redo}
                          disabled={future.length === 0}
                          className="p-1 hover:bg-[#2a2b2e] rounded disabled:opacity-20 transition-colors"
                        >
                          <Redo2 className="w-3 h-3" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                  <Tooltip text="Reset all face adjustments to default">
                    <RefreshCw 
                      className={`w-3 h-3 opacity-40 cursor-pointer hover:opacity-100 ${isAligning ? 'animate-spin' : ''}`} 
                      onClick={() => {
                        pushToHistory();
                        setFaceBrightness(100);
                        setFaceContrast(100);
                        setFaceSaturation(100);
                        setFaceSharpness(0);
                        setFaceRotation(0);
                        setFaceScale(1);
                      }}
                    />
                  </Tooltip>
                </div>
                
                <div className="aspect-square rounded-md overflow-hidden border border-[#2a2b2e] bg-black relative group">
                  {selectedFace ? (
                    <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
                      <motion.img 
                        src={selectedFace.url} 
                        alt="Editor Preview" 
                        className="max-w-none w-full h-full object-cover"
                        animate={{
                          rotate: faceRotation,
                          scale: faceScale,
                          filter: `brightness(${faceBrightness}%) contrast(${faceContrast}%) saturate(${faceSaturation}%) blur(${faceSharpness / 10}px) drop-shadow(0 0 ${settings.strength / 10}px rgba(6,182,212,${settings.strength / 200}))`
                        }}
                        style={{ mixBlendMode: settings.blendMode as any }}
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Granular Masking Visualization Overlay */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {settings.granularMasking.eyes && (
                          <motion.path 
                            d="M25,40 Q35,35 45,40 Q35,45 25,40 M55,40 Q65,35 75,40 Q65,45 55,40" 
                            fill="rgba(6,182,212,0.2)" 
                            stroke="rgba(6,182,212,0.5)" 
                            strokeWidth="0.5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                        {settings.granularMasking.nose && (
                          <motion.path 
                            d="M45,45 Q50,40 55,45 L52,60 Q50,65 48,60 Z" 
                            fill="rgba(6,182,212,0.2)" 
                            stroke="rgba(6,182,212,0.5)" 
                            strokeWidth="0.5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                        {settings.granularMasking.mouth && (
                          <motion.path 
                            d="M35,70 Q50,65 65,70 Q50,80 35,70" 
                            fill="rgba(6,182,212,0.2)" 
                            stroke="rgba(6,182,212,0.5)" 
                            strokeWidth="0.5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                        {settings.granularMasking.brows && (
                          <motion.path 
                            d="M20,35 Q35,30 45,35 M55,35 Q65,30 80,35" 
                            fill="none" 
                            stroke="rgba(6,182,212,0.5)" 
                            strokeWidth="1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                      </svg>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] opacity-30 uppercase font-bold tracking-widest">No Face Selected</div>
                  )}
                  
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded px-1.5 py-0.5 text-[8px] font-mono text-cyan-400 uppercase">
                      Sim: {settings.similarityThreshold}%
                    </div>
                    <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded px-1.5 py-0.5 text-[8px] font-mono text-cyan-400 uppercase">
                      Str: {settings.strength}%
                    </div>
                  </div>
                  
                  {isAligning && (
                    <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 text-cyan-500 animate-spin" />
                      <span className="text-[8px] font-mono text-cyan-500 uppercase tracking-widest">Aligning...</span>
                    </div>
                  )}
                  <div className="absolute inset-0 border-2 border-cyan-500/20 pointer-events-none" />
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Brightness', value: faceBrightness, setter: setFaceBrightness, min: 0, max: 200, default: 100, tooltip: 'Adjusts the overall light level of the swapped face.' },
                    { label: 'Contrast', value: faceContrast, setter: setFaceContrast, min: 0, max: 200, default: 100, tooltip: 'Increases or decreases the difference between light and dark areas.' },
                    { label: 'Saturation', value: faceSaturation, setter: setFaceSaturation, min: 0, max: 200, default: 100, tooltip: 'Controls the intensity of colors in the swapped face.' },
                    { label: 'Sharpness', value: faceSharpness, setter: setFaceSharpness, min: 0, max: 100, default: 0, tooltip: 'Enhances the fine details and edges of the face.' },
                  ].map(slider => (
                    <div key={slider.label} className="space-y-1.5 group/slider">
                      <div className="flex justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#8e9299] group-hover/slider:text-white transition-colors">{slider.label}</span>
                          <Tooltip text={slider.tooltip}>
                            <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                          </Tooltip>
                        </div>
                        <div className="flex items-center gap-2">
                          {slider.value !== slider.default && (
                            <button 
                              onClick={() => { pushToHistory(); slider.setter(slider.default); }}
                              className="text-[8px] text-cyan-500/50 hover:text-cyan-500 uppercase font-bold"
                            >
                              Reset
                            </button>
                          )}
                          <span className="font-mono text-cyan-400">{slider.value}%</span>
                        </div>
                      </div>
                      <div className="relative h-1 w-full bg-[#1c1d21] rounded-full overflow-hidden border border-[#2a2b2e]">
                        <motion.div 
                          className="absolute inset-y-0 left-0 bg-cyan-500/30"
                          initial={false}
                          animate={{ width: `${(slider.value / slider.max) * 100}%` }}
                        />
                        <input 
                          type="range" 
                          min={slider.min} 
                          max={slider.max} 
                          value={slider.value}
                          onMouseDown={pushToHistory}
                          onChange={e => slider.setter(parseInt(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1c1d21] rounded-lg border border-[#2a2b2e] p-4 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold uppercase text-[#8e9299]">LivePortrait (Expressions & Pose)</h3>
                    <Tooltip text="Manually adjust facial expressions and head poses using LivePortrait models.">
                      <Info className="w-3 h-3 text-cyan-500/50 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#8e9299]">Expression</span>
                        <span className="font-mono text-cyan-400">{settings.livePortraitExpression}</span>
                      </div>
                      <input 
                        type="range" 
                        min="-100" 
                        max="100" 
                        value={settings.livePortraitExpression}
                        onMouseDown={pushToHistory}
                        onChange={e => setSettings({...settings, livePortraitExpression: parseInt(e.target.value)})}
                        className="w-full accent-cyan-500 h-1 bg-[#1c1d21] rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#8e9299]">Pose</span>
                        <span className="font-mono text-cyan-400">{settings.livePortraitPose}</span>
                      </div>
                      <input 
                        type="range" 
                        min="-100" 
                        max="100" 
                        value={settings.livePortraitPose}
                        onMouseDown={pushToHistory}
                        onChange={e => setSettings({...settings, livePortraitPose: parseInt(e.target.value)})}
                        className="w-full accent-cyan-500 h-1 bg-[#1c1d21] rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold uppercase text-[#8e9299]">Advanced Color Grading</h3>
                    <Tooltip text="Fine-tune colors for specific face parts using HSL adjustments for each RGB channel.">
                      <Info className="w-3 h-3 text-cyan-500/50 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="space-y-6">
                    {(['face', 'hair', 'lips'] as const).map(part => (
                      <div key={part} className="space-y-3 p-3 bg-black/20 rounded-lg border border-[#2a2b2e]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-cyan-500">{part}</span>
                          <button 
                            onClick={() => {
                              pushToHistory();
                              setSettings({
                                ...settings,
                                colorGrading: {
                                  ...settings.colorGrading,
                                  [part]: {
                                    r: { h: 0, s: 100, l: 100 },
                                    g: { h: 0, s: 100, l: 100 },
                                    b: { h: 0, s: 100, l: 100 },
                                  }
                                }
                              });
                            }}
                            className="text-[8px] text-[#8e9299] hover:text-white uppercase"
                          >
                            Reset {part}
                          </button>
                        </div>
                        <div className="space-y-4">
                          {(['r', 'g', 'b'] as const).map(channel => (
                            <div key={channel} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${channel === 'r' ? 'bg-red-500' : channel === 'g' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                <span className="text-[9px] uppercase opacity-50">{channel} Channel</span>
                              </div>
                              <div className="grid grid-cols-1 gap-2 pl-3">
                                {(['h', 's', 'l'] as const).map(param => (
                                  <div key={param} className="space-y-1">
                                    <div className="flex justify-between text-[8px]">
                                      <span className="uppercase opacity-40">{param === 'h' ? 'Hue' : param === 's' ? 'Saturation' : 'Lightness'}</span>
                                      <span className="font-mono text-cyan-400">
                                        {(settings.colorGrading[part][channel] as any)[param]}
                                        {param === 'h' ? '°' : '%'}
                                      </span>
                                    </div>
                                    <input 
                                      type="range" 
                                      min={param === 'h' ? "-180" : "0"} 
                                      max={param === 'h' ? "180" : "200"} 
                                      value={(settings.colorGrading[part][channel] as any)[param]}
                                      onMouseDown={pushToHistory}
                                      onChange={e => {
                                        const newVal = parseInt(e.target.value);
                                        setSettings({
                                          ...settings,
                                          colorGrading: {
                                            ...settings.colorGrading,
                                            [part]: {
                                              ...settings.colorGrading[part],
                                              [channel]: {
                                                ...settings.colorGrading[part][channel],
                                                [param]: newVal
                                              }
                                            }
                                          }
                                        });
                                      }}
                                      className={`w-full h-0.5 bg-[#1c1d21] rounded-full appearance-none cursor-pointer accent-cyan-500`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#1c1d21] rounded-lg border border-[#2a2b2e] p-4 space-y-4">
                <h3 className="text-[11px] font-bold uppercase text-[#8e9299]">Masking & Blending</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-black/20 rounded border border-[#2a2b2e]">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-bold text-[#8e9299]">Face Embeddings</span>
                      <Tooltip text="Use multiple source faces to create a more accurate face embedding for the swap.">
                        <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                      </Tooltip>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.faceEmbeddings}
                      onChange={e => {
                        pushToHistory();
                        setSettings({
                          ...settings, 
                          faceEmbeddings: e.target.checked,
                          selectedEmbeddingFaces: e.target.checked && selectedFace ? [selectedFace.id] : []
                        });
                      }}
                      className="accent-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-[#8e9299] uppercase font-bold">Blending Mode</label>
                    <Tooltip text="Determines how the swapped face is composited onto the target. Normal is standard, Multiply darkens, and Overlay increases contrast.">
                      <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['normal', 'multiply', 'overlay'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => {
                          pushToHistory();
                          setSettings({...settings, blendMode: mode});
                        }}
                        className={`py-1.5 rounded border text-[9px] font-bold uppercase transition-all ${
                          settings.blendMode === mode 
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                            : 'bg-black/20 border-[#2a2b2e] text-[#8e9299] hover:border-[#3a3b3e]'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-2 bg-black/20 rounded border border-[#2a2b2e]">
                    <span className="text-[9px] uppercase font-bold text-[#8e9299]">Occlusion</span>
                    <input 
                      type="checkbox" 
                      checked={settings.occlusionMask}
                      onChange={e => {
                        pushToHistory();
                        setSettings({...settings, occlusionMask: e.target.checked});
                      }}
                      className="accent-cyan-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-black/20 rounded border border-[#2a2b2e]">
                    <span className="text-[9px] uppercase font-bold text-[#8e9299]">XSeg Mask</span>
                    <input 
                      type="checkbox" 
                      checked={settings.dflXSegMask}
                      onChange={e => {
                        pushToHistory();
                        setSettings({...settings, dflXSegMask: e.target.checked});
                      }}
                      className="accent-cyan-500"
                    />
                  </div>

                  <div className="pt-2 space-y-2 border-t border-[#2a2b2e]/50">
                    <label className="text-[9px] text-[#8e9299] uppercase font-bold">Granular Masking</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(settings.granularMasking).map(([part, enabled]) => (
                        <div key={part} className="flex items-center justify-between bg-[#1c1d21] p-1.5 rounded border border-[#2a2b2e]">
                          <span className="text-[9px] capitalize">{part}</span>
                          <input 
                            type="checkbox" 
                            checked={enabled}
                            onChange={e => {
                              pushToHistory();
                              setSettings({
                                ...settings, 
                                granularMasking: {
                                  ...settings.granularMasking,
                                  [part]: e.target.checked
                                }
                              });
                            }}
                            className="accent-cyan-500 scale-75"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 group/slider">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#8e9299] group-hover/slider:text-white transition-colors">Border Blur</span>
                    <span className="font-mono text-cyan-400">{settings.borderBlur}px</span>
                  </div>
                  <div className="relative h-1 w-full bg-[#1c1d21] rounded-full overflow-hidden border border-[#2a2b2e]">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-cyan-500/30"
                      initial={false}
                      animate={{ width: `${settings.borderBlur}%` }}
                    />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={settings.borderBlur}
                      onMouseDown={pushToHistory}
                      onChange={e => setSettings({...settings, borderBlur: parseInt(e.target.value)})}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase text-[#8e9299]">Blending Mode</span>
                    <Tooltip text="Determines how the swapped face's pixels are combined with the target's pixels.">
                      <Info className="w-2.5 h-2.5 text-cyan-500/30 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['normal', 'multiply', 'overlay'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => {
                          pushToHistory();
                          setSettings({...settings, blendMode: mode});
                        }}
                        className={`py-1.5 rounded text-[9px] uppercase font-bold border transition-all ${
                          settings.blendMode === mode 
                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' 
                            : 'border-[#2a2b2e] hover:border-[#3a3b3e] text-[#8e9299]'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#1c1d21] rounded-lg border border-[#2a2b2e] p-4 space-y-4">
                <h3 className="text-[11px] font-bold uppercase text-[#8e9299]">Swap Parameters</h3>
                
                <div className="flex items-center justify-between">
                  <label className="text-[10px] flex items-center gap-2">
                    <Eye className="w-3 h-3 text-cyan-400" />
                    Restore Eyes
                  </label>
                  <input 
                    type="checkbox" 
                    checked={settings.restoreEyes}
                    onChange={e => {
                      pushToHistory();
                      setSettings({...settings, restoreEyes: e.target.checked});
                    }}
                    className="accent-cyan-500"
                  />
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Similarity Threshold', key: 'similarityThreshold', min: 0, max: 100 },
                    { label: 'Strength', key: 'strength', min: 0, max: 100 },
                    { label: 'Face Likeness', key: 'faceLikeness', min: 0, max: 100 },
                    { label: 'Differencing', key: 'differencing', min: 0, max: 100 },
                  ].map(slider => (
                    <div key={slider.key} className="space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#8e9299]">{slider.label}</span>
                        <span className="font-mono text-cyan-400">{(settings as any)[slider.key]}</span>
                      </div>
                      <input 
                        type="range" 
                        min={slider.min} 
                        max={slider.max} 
                        value={(settings as any)[slider.key]}
                        onMouseDown={pushToHistory}
                        onChange={e => setSettings({...settings, [slider.key]: parseInt(e.target.value)})}
                        className="w-full accent-cyan-500 h-1 bg-[#1c1d21] rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase text-[#8e9299]">Advanced Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 bg-[#1c1d21] border border-[#2a2b2e] rounded-lg hover:border-cyan-500/50 transition-all flex flex-col items-center gap-2 group">
                    <Maximize2 className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:text-cyan-500" />
                    <span className="text-[9px] uppercase font-bold">Auto Crop</span>
                  </button>
                  <button 
                    onClick={handleAlignFace}
                    disabled={isAligning || !selectedFace}
                    className="p-3 bg-[#1c1d21] border border-[#2a2b2e] rounded-lg hover:border-cyan-500/50 disabled:opacity-30 transition-all flex flex-col items-center gap-2 group"
                  >
                    <RefreshCw className={`w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:text-cyan-500 ${isAligning ? 'animate-spin' : ''}`} />
                    <span className="text-[9px] uppercase font-bold">Align Face</span>
                  </button>
                  <button className="p-3 bg-[#1c1d21] border border-[#2a2b2e] rounded-lg hover:border-cyan-500/50 transition-all flex flex-col items-center gap-2 group">
                    <Eye className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:text-cyan-500" />
                    <span className="text-[9px] uppercase font-bold">Eye Fix</span>
                  </button>
                  <button className="p-3 bg-[#1c1d21] border border-[#2a2b2e] rounded-lg hover:border-cyan-500/50 transition-all flex flex-col items-center gap-2 group">
                    <User className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:text-cyan-500" />
                    <span className="text-[9px] uppercase font-bold">Skin Retouch</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="space-y-6">
              <div className="p-4 bg-cyan-500/5 rounded-lg border border-cyan-500/20 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Pro Tip</span>
                </div>
                <p className="text-[10px] leading-relaxed text-[#8e9299]">
                  Higher similarity thresholds lead to more realistic results but may require better source face quality.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase text-[#8e9299]">Global Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px]">Auto-Save Results</span>
                    <input type="checkbox" className="accent-cyan-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px]">High Performance Mode</span>
                    <input type="checkbox" defaultChecked className="accent-cyan-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px]">Dark Mode UI</span>
                    <input type="checkbox" defaultChecked className="accent-cyan-500" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#2a2b2e] bg-[#1c1d21]">
          <button className="w-full py-2 bg-[#2a2b2e] hover:bg-[#3a3b3e] rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
            <Download className="w-3 h-3" />
            Export Project
          </button>
        </div>
      </aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a2b2e;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3a3b3e;
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
