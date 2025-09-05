// Definições TypeScript para o SDK
export interface SDKOptions {
  endpoint?: string;
  secret?: string;
  autoCollect?: boolean;
  collectInterval?: number;
  timeout?: number;
  retries?: number;
  debug?: boolean;
}

export interface BrowserInfo {
  userAgent: string;
  language: string;
  languages: string[];
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  vendor: string;
  vendorSub: string;
}

export interface ScreenInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
  orientation: string | null;
  devicePixelRatio: number;
}

export interface TimezoneInfo {
  timezone: string;
  timezoneOffset: number;
  timestamp: number;
  locale: string;
}

export interface MouseEvent {
  x: number;
  y: number;
  timestamp: number;
}

export interface KeyboardEvent {
  key: string;
  timestamp: number;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
}

export interface FocusEvent {
  type: string;
  timestamp: number;
  target: string;
}

export interface ScrollEvent {
  x: number;
  y: number;
  timestamp: number;
}

export interface BehaviorData {
  mouseEvents: MouseEvent[];
  keyboardEvents: KeyboardEvent[];
  focusEvents: FocusEvent[];
  scrollEvents: ScrollEvent[];
}

export interface CollectedData {
  sessionId: string;
  timestamp: number;
  browser: BrowserInfo;
  screen: ScreenInfo;
  timezone: TimezoneInfo;
  plugins: any[];
  adBlock: boolean | undefined;
  storage: Record<string, boolean>;
  behavior: BehaviorData;
  sdkVersion?: string;
  sdkSessionId?: string;
  action?: any;
}

export interface RiskResponse {
  decision: 'allow' | 'review' | 'deny';
  score: number;
  reasons?: string[];
  sessionId?: string;
}

export declare class Veritas {
  constructor(options?: SDKOptions);
  collect(): CollectedData;
  send(data: CollectedData): Promise<RiskResponse>;
  collectAndSend(): Promise<RiskResponse>;
  checkRisk(actionData?: any): Promise<RiskResponse>;
  startAutoCollection(): void;
  stopAutoCollection(): void;
  configure(newOptions: Partial<SDKOptions>): void;
  destroy(): void;
}

export declare function init(options?: SDKOptions): Veritas;

export default Veritas;
