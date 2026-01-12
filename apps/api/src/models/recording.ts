// Recording data structures for AI script generation

export interface RecordingInteraction {
  type: 'click' | 'input' | 'navigation' | 'scroll';
  timestamp: number;
  selector: string;
  value?: string;
  url?: string;
  scrollPosition?: { x: number; y: number };
  screenshot?: string; // Base64 encoded image
  elementText?: string;
  elementType?: string;
}

export interface Recording {
  id?: string;
  sessionId: string;
  startUrl: string;
  pageTitle: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  interactions: RecordingInteraction[];
  metadata?: {
    userAgent?: string;
    viewport?: { width: number; height: number };
  };
}

export interface GenerationJob {
  id: string;
  recordingId: string;
  productId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scriptId?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedScript {
  title: string;
  steps: Array<{
    title: string;
    description: string;
    elementSelector: string;
    actionType?: string;
  }>;
}
