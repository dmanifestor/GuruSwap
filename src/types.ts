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
  stabilization: boolean;
  expressionRestorer: number;
  faceEnhancer: 'none' | 'GFPGAN' | 'CodeFormer' | 'GPEN';
  faceDetector: 'RetinaFace' | 'YOLOv5' | 'MediaPipe';
  landmarkDetector: '68-points' | '5-points';
  tensorRT: boolean;
  livePortraitExpression: number;
  livePortraitPose: number;
  colorGrading: {
    face: { r: number, g: number, b: number };
    hair: { r: number, g: number, b: number };
    lips: { r: number, g: number, b: number };
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
  stabilization: false,
  expressionRestorer: 50,
  faceEnhancer: 'CodeFormer',
  faceDetector: 'RetinaFace',
  landmarkDetector: '68-points',
  tensorRT: false,
  livePortraitExpression: 0,
  livePortraitPose: 0,
  colorGrading: {
    face: { r: 100, g: 100, b: 100 },
    hair: { r: 100, g: 100, b: 100 },
    lips: { r: 100, g: 100, b: 100 },
  },
};
