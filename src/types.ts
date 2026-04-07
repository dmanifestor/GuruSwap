export interface MediaItem {
  id: string;
  url: string;
  type: 'video' | 'image';
  name: string;
  thumbnail?: string;
}

export interface FaceItem {
  id: string;
  url: string;
  name: string;
}

export interface SwapSettings {
  swapperModel: string;
  faceAdjustments: boolean;
  keypointsAdjustments: boolean;
  similarityThreshold: number;
  strength: number;
  faceLikeness: number;
  differencing: number;
  borderBlur: number;
  restoreEyes: boolean;
  occlusionMask: boolean;
  dflXSegMask: boolean;
  blendMode: 'normal' | 'multiply' | 'overlay';
  upscaling: boolean;
  upscaleFactor: '2x' | '4x';
  upscaleModel: 'Real-ESRGAN' | 'SwinIR' | 'BSRGAN';
  faceEmbeddings: boolean;
  selectedEmbeddingFaces: string[];
  stabilization: boolean;
  expressionRestorer: number;
  faceEnhancer: 'none' | 'GFPGAN' | 'CodeFormer' | 'GPEN';
  faceDetector: 'RetinaFace' | 'YOLOv5' | 'MediaPipe';
  landmarkDetector: '68-points' | '5-points';
  tensorRT: boolean;
  livePortraitExpression: number;
  livePortraitPose: number;
  granularMasking: {
    eyes: boolean;
    nose: boolean;
    mouth: boolean;
    brows: boolean;
  };
  colorGrading: {
    face: {
      r: { h: number, s: number, l: number };
      g: { h: number, s: number, l: number };
      b: { h: number, s: number, l: number };
    };
    hair: {
      r: { h: number, s: number, l: number };
      g: { h: number, s: number, l: number };
      b: { h: number, s: number, l: number };
    };
    lips: {
      r: { h: number, s: number, l: number };
      g: { h: number, s: number, l: number };
      b: { h: number, s: number, l: number };
    };
  };
}

export const DEFAULT_SETTINGS: SwapSettings = {
  swapperModel: 'InStyleSwapper256 Version C',
  faceAdjustments: false,
  keypointsAdjustments: false,
  similarityThreshold: 50,
  strength: 50,
  faceLikeness: 50,
  differencing: 50,
  borderBlur: 25,
  restoreEyes: false,
  occlusionMask: false,
  dflXSegMask: true,
  blendMode: 'normal',
  upscaling: false,
  upscaleFactor: '2x',
  upscaleModel: 'Real-ESRGAN',
  faceEmbeddings: false,
  selectedEmbeddingFaces: [],
  stabilization: false,
  expressionRestorer: 50,
  faceEnhancer: 'CodeFormer',
  faceDetector: 'RetinaFace',
  landmarkDetector: '68-points',
  tensorRT: false,
  livePortraitExpression: 0,
  livePortraitPose: 0,
  granularMasking: {
    eyes: true,
    nose: true,
    mouth: true,
    brows: true,
  },
  colorGrading: {
    face: {
      r: { h: 0, s: 100, l: 100 },
      g: { h: 0, s: 100, l: 100 },
      b: { h: 0, s: 100, l: 100 },
    },
    hair: {
      r: { h: 0, s: 100, l: 100 },
      g: { h: 0, s: 100, l: 100 },
      b: { h: 0, s: 100, l: 100 },
    },
    lips: {
      r: { h: 0, s: 100, l: 100 },
      g: { h: 0, s: 100, l: 100 },
      b: { h: 0, s: 100, l: 100 },
    },
  },
};
