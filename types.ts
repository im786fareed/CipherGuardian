
export type ThreatLevel = 'safe' | 'caution' | 'danger';
export type RecommendedActionType = 'BLOCK' | 'VERIFY' | 'PROCEED' | 'REPORT' | 'DELETE' | 'CONTACT_SUPPORT';
export type ScamPattern = 'otp' | 'digital_arrest' | 'unknown';
export type SensitivityLevel = 'standard' | 'high';

export interface LogEntry {
  timestamp: Date;
  source: string;
  threatLevel: ThreatLevel;
  details: string;
}

// --- SHARED ANALYSIS STRUCTURES ---

export interface DigitalArrestContext {
  isUserIsolated: boolean;
  fundTransferUrgency: 'none' | 'high' | 'critical';
  matchesKnownScamPattern: boolean;
  isolationTactics: string[];
  requestedAmount?: number;
}

// --- TEXT ANALYSIS ---

export interface GeminiTextAnalysisResponse {
  isSuspicious: boolean;
  reason: string;
  serviceName: string;
  otp: string;
  amount: number | null;
  scamPattern: ScamPattern;
  digitalArrestContext?: DigitalArrestContext;
  url: string | null;
  isUrlSuspicious: boolean;
  senderReputation: 'verified' | 'unverified' | 'suspicious';
  urlSuspicionReason: string | null;
}

export interface TextAnalysisResult extends GeminiTextAnalysisResponse {
  type: 'text';
  threatLevel: ThreatLevel;
  analysisMode?: 'online' | 'offline';

  threatContext?: {
    isPatternAttack: boolean;
    otpsInLastHour: number;
    failedLoginAttempts: number;
    deviceLocationMatch: boolean;
    isNewDevice: boolean;
    timeAnomalyScore: number;
  };

  serviceVerification?: {
    isVerified: boolean;
    senderNumber?: string;
    knownSpoof: boolean;
    knownPhishingService: boolean;
    senderReputation?: 'verified' | 'unverified' | 'suspicious';
  };

  recommendedActions?: Array<{
    action: RecommendedActionType;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    label?: string;
    color?: string;
  }>;

  educationTip?: string;
  relatedScamType?: 'sim_swap' | 'phishing' | 'account_takeover' | 'digital_arrest';
}

// --- IMAGE ANALYSIS ---

export interface ImageAnalysisResult {
    type: 'image';
    riskLevel: ThreatLevel;
    findings: string[];
    recommendation: string;
    steganographyConfidence: number; // 0-100
    hiddenContent?: {
        qrCodesDetected: number;
        metadataAnomalies: string[];
        colorAnomalyScore: number; // 0-100
        embeddedCodeSignatures: string[];
    };
}

// --- URL ANALYSIS ---
export interface UrlAnalysisResult {
    type: 'url';
    riskLevel: ThreatLevel;
    threatType: 'phishing' | 'malware' | 'scam' | 'safe' | 'unknown';
    findings: string[];
    recommendation: string;
    domainInfo?: {
        domain: string;
        isNew: boolean;
        usesHttps: boolean;
    };
}

// --- UNION TYPE ---

export type AnalysisResult = TextAnalysisResult | ImageAnalysisResult | UrlAnalysisResult;