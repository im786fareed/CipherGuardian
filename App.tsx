
import React, { useState, useCallback, useEffect, lazy, Suspense, useRef } from 'react';
import { LogEntry, AnalysisResult as AnalysisResultType, RecommendedActionType, TextAnalysisResult, ImageAnalysisResult, ScamPattern, UrlAnalysisResult, SensitivityLevel } from './types';
import { analyzeTextMessage, analyzeImageMedia, analyzeUrl } from './services/geminiService';
import OtpInputArea from './components/OtpInputArea';
import MediaAnalysisArea from './components/MediaAnalysisArea';
import UrlAnalysisArea from './components/UrlAnalysisArea';
import AnalysisLog from './components/OtpLog';
import ThreatSimulator from './components/ThreatSimulator';
import NotificationManager from './components/NotificationManager';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useTranslation } from './contexts/LanguageContext';
import { ShieldCheck, LoaderCircle, AlertTriangle, MessageSquareText, Image as ImageIcon, Link as LinkIcon, HelpCircle, X } from 'lucide-react';

const HelpFAQ = lazy(() => import('./components/HelpFAQ'));
const AnalysisResult = lazy(() => import('./components/AnalysisResult'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Settings = lazy(() => import('./components/Settings'));

type AnalysisMode = 'text' | 'image' | 'url';

const App: React.FC = () => {
  const { t, language, getOfflineRules } = useTranslation();
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('text');
  
  // Text state
  const [message, setMessage] = useState<string>('');
  const [isRecentLoginFailure, setIsRecentLoginFailure] = useState<boolean>(false);
  
  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // URL state
  const [urlToScan, setUrlToScan] = useState<string>('');

  // Common state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('standard');
  
  const helpModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial permission state
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    
    // Register Service Worker after page has fully loaded to avoid "invalid state" errors.
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      window.addEventListener('load', () => {
        // Construct the full, absolute URL to the service worker script to avoid origin mismatches.
        const swUrl = `${window.location.origin}/sw.js`;
        navigator.serviceWorker.register(swUrl)
          .then(swReg => console.log('Service Worker registered successfully:', swUrl))
          .catch(error => console.error('Service Worker registration failed:', error, 'Attempted URL:', swUrl));
      });
    }
  }, []);
  
  useEffect(() => {
    try {
      const storedLog = localStorage.getItem('analysisLog');
      if (storedLog) {
        setLog(JSON.parse(storedLog));
      }
      const storedSensitivity = localStorage.getItem('threatSensitivity');
      if (storedSensitivity === 'standard' || storedSensitivity === 'high') {
        setSensitivity(storedSensitivity);
      }
    } catch (e) {
      console.error("Failed to parse data from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('analysisLog', JSON.stringify(log));
      localStorage.setItem('threatSensitivity', sensitivity);
    } catch (e) {
      console.error("Failed to save data to localStorage", e);
    }
  }, [log, sensitivity]);
  
  // Focus trapping and Escape key handling for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsHelpModalOpen(false);
      }
      
      if (event.key === 'Tab' && isHelpModalOpen && helpModalRef.current) {
        const focusableElements = helpModalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    if (isHelpModalOpen && helpModalRef.current) {
        const focusableElements = helpModalRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isHelpModalOpen]);


  const addLogEntry = useCallback((entry: Omit<LogEntry, 'timestamp'>) => {
    setLog(prevLog => [{ ...entry, timestamp: new Date() }, ...prevLog]);
  }, []);

  const showNotification = useCallback((title: string, options: NotificationOptions) => {
    if (notificationPermission !== 'granted' || !('serviceWorker' in navigator)) {
      return; // Don't show if not granted or not supported
    }
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        ...options,
        icon: './vite.svg', // Ensure icon is always set
        badge: './vite.svg',
      });
    });
  }, [notificationPermission]);

  const handleRequestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      showNotification(t('notifications.enabled.title'), {
        body: t('notifications.enabled.body'),
      });
    }
  }, [showNotification, t]);


  const runOfflineAnalysis = (text: string) => {
    const offlineRules = getOfflineRules();
    
    const dangerThreshold = sensitivity === 'high' ? 8 : 10;
    const cautionThreshold = sensitivity === 'high' ? 2 : 3;
    
    let totalScore = 0;
    const detectedReasons: Set<string> = new Set();
    let detectedScamPattern: ScamPattern = 'unknown';
    const lowerText = text.toLowerCase();

    for (const rule of offlineRules) {
        const keywordMatch = rule.keywords && rule.keywords.length > 0 && rule.keywords.some(k => lowerText.includes(k));
        const regexMatch = rule.regex ? rule.regex.test(text) : false;

        let isMatch = false;
        if (rule.matchLogic === 'AND') {
            isMatch = !!(keywordMatch && regexMatch);
        } else { // Default to OR
            isMatch = (rule.keywords && rule.keywords.length > 0 && keywordMatch) || (!!rule.regex && regexMatch);
        }

        if (isMatch) {
            totalScore += rule.score;
            detectedReasons.add(rule.reason);
            // Set scam pattern, with priority for specific types
            if (rule.scamPattern === 'digital_arrest') {
                detectedScamPattern = 'digital_arrest';
            } else if (detectedScamPattern === 'unknown' && rule.scamPattern !== 'unknown') {
                detectedScamPattern = rule.scamPattern;
            }
        }
    }

    let finalThreatLevel: 'safe' | 'caution' | 'danger';
    if (totalScore >= dangerThreshold) {
        finalThreatLevel = 'danger';
    } else if (totalScore >= cautionThreshold) {
        finalThreatLevel = 'caution';
    } else {
        finalThreatLevel = 'safe';
    }
    
    const reasonsArray = Array.from(detectedReasons);
    if (reasonsArray.length === 0) {
        reasonsArray.push(t('offline.noThreats'));
    }
    
    const offlineResult: TextAnalysisResult = {
        type: 'text',
        analysisMode: 'offline',
        threatLevel: finalThreatLevel,
        reason: reasonsArray.join(' '),
        isSuspicious: finalThreatLevel !== 'safe',
        serviceName: t('offline.unknownService'),
        otp: text.match(/\b(\d{4,8})\b/)?.[0] || '',
        amount: null,
        scamPattern: detectedScamPattern,
        url: text.match(/(https?:\/\/[^\s]+)/)?.[0] || null,
        isUrlSuspicious: /https?:\/\/[^\s]+/i.test(text),
        urlSuspicionReason: /https?:\/\/[^\s]+/i.test(text) ? t('offline.urlUnverified') : null,
        senderReputation: 'unverified'
    };

    setAnalysisResult(offlineResult);
    addLogEntry({
        source: t('log.offline.source'),
        threatLevel: finalThreatLevel,
        details: t('log.offline.details'),
    });
    if (finalThreatLevel === 'danger') {
        showNotification(t('notifications.offlineDanger.title'), {
            body: t('notifications.offlineDanger.body')
        });
    }
  };

  const handleTextScan = async () => {
    if (!message.trim()) {
      setError(t('error.emptyMessage'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeTextMessage(message, language);
      
      if (result.scamPattern === 'digital_arrest') {
        const finalResult: TextAnalysisResult = { 
            ...result, 
            type: 'text',
            threatLevel: 'danger', 
            reason: result.reason,
            analysisMode: 'online'
        };
        setAnalysisResult(finalResult);
        addLogEntry({
          source: result.serviceName || t('log.digitalArrest.source'),
          threatLevel: 'danger',
          details: t('log.digitalArrest.details'),
        });
        showNotification(t('notifications.onlineDanger.title'), {
            body: `${t('notifications.onlineDanger.analysisPrefix')}: ${finalResult.reason.substring(0, 100)}...`,
        });
        return;
      }

      // --- Existing OTP Logic ---
      let threatLevel: 'safe' | 'caution' | 'danger' = 'safe';
      const reasons: string[] = [];

      if (result.isSuspicious) {
        threatLevel = 'danger';
        reasons.push(result.reason);
      }
      
      if (isRecentLoginFailure) {
        threatLevel = 'danger';
        reasons.push(t('threats.loginFailure'));
        setIsRecentLoginFailure(false);
      }

      if (result.amount && result.amount > 50000) {
        threatLevel = 'danger';
        reasons.push(`${t('threats.highValue')} ₹${result.amount.toLocaleString('en-IN')}`);
      }
      
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const recentOtps = log.filter(l => new Date(l.timestamp) > fiveMinutesAgo && l.details.includes('OTP'));

      if (recentOtps.length > 0) {
        threatLevel = 'danger';
        reasons.push(t('threats.multipleOtps'));
      }

      if (reasons.length > 0 && threatLevel !== 'danger') {
        threatLevel = 'caution';
      }
      
      const finalResult: TextAnalysisResult = { ...result, type: 'text', threatLevel, reason: reasons.join(' ') || t('threats.standardOtp'), analysisMode: 'online' };
      
       // Simulate advanced context and add senderReputation
      if (finalResult.threatLevel === 'danger') {
          finalResult.threatContext = {
              isPatternAttack: reasons.some(r => r.includes(t('threats.multipleOtps'))),
              otpsInLastHour: recentOtps.length + 1,
              failedLoginAttempts: isRecentLoginFailure ? 3 : 0,
              deviceLocationMatch: false, isNewDevice: true, timeAnomalyScore: 80,
          };
          finalResult.serviceVerification = { isVerified: false, knownSpoof: true, knownPhishingService: true, senderNumber: t('sender.suspicious'), senderReputation: result.senderReputation };
          finalResult.relatedScamType = 'phishing';
      } else if (finalResult.threatLevel === 'caution') {
           finalResult.threatContext = {
              isPatternAttack: false, otpsInLastHour: recentOtps.length + 1, failedLoginAttempts: 0,
              deviceLocationMatch: true, isNewDevice: true, timeAnomalyScore: 50,
          };
          finalResult.serviceVerification = { isVerified: false, knownSpoof: false, knownPhishingService: false, senderNumber: t('sender.unverified'), senderReputation: result.senderReputation };
      } else { // Safe
          finalResult.serviceVerification = { isVerified: true, knownSpoof: false, knownPhishingService: false, senderNumber: t('sender.verified'), senderReputation: result.senderReputation };
      }

      setAnalysisResult(finalResult);
      addLogEntry({
        source: finalResult.serviceName,
        threatLevel: finalResult.threatLevel,
        details: `${t('log.otpAnalysis.prefix')}: ${finalResult.reason}`,
      });
      
      if (finalResult.threatLevel === 'danger') {
        showNotification(t('notifications.onlineDanger.title'), {
            body: `${t('notifications.onlineDanger.analysisPrefix')}: ${finalResult.reason.substring(0, 100)}...`,
        });
      }

    } catch (e) {
      console.error(e);
      setError(t('error.apiFailed'));
      runOfflineAnalysis(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageScan = async () => {
    if (!imageFile || !imageBase64) {
      setError(t('error.selectImage'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeImageMedia(imageBase64, imageFile.type, language);
      const finalResult: ImageAnalysisResult = { ...result, type: 'image' };
      setAnalysisResult(finalResult);
       addLogEntry({
        source: imageFile.name,
        threatLevel: result.riskLevel,
        details: t('log.imageScan.details'),
      });
      if (finalResult.riskLevel === 'danger') {
        showNotification(t('notifications.imageDanger.title'), {
            body: `${t('notifications.imageDanger.recommendationPrefix')}: ${finalResult.recommendation}`,
        });
      }
    } catch (e) {
      console.error(e);
      setError(t('error.imageApiFailed'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUrlScan = async () => {
    if (!urlToScan.trim()) {
      setError(t('error.emptyUrl'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeUrl(urlToScan, language);
      const finalResult: UrlAnalysisResult = { ...result, type: 'url' };
      setAnalysisResult(finalResult);
       addLogEntry({
        source: urlToScan,
        threatLevel: result.riskLevel,
        details: t('log.urlScan.details'),
      });
      if (finalResult.riskLevel === 'danger') {
        showNotification(t('notifications.urlDanger.title'), {
            body: `${t('notifications.urlDanger.recommendationPrefix')}: ${finalResult.recommendation}`,
        });
      }
    } catch (e) {
      console.error(e);
      setError(t('error.urlApiFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
  };

  const handleAction = (action: RecommendedActionType) => {
    const source = (analysisResult?.type === 'text' && analysisResult.serviceName) || (analysisResult?.type === 'image' && t('log.imageScan.source')) || (analysisResult?.type === 'url' && t('log.urlScan.source')) || t('log.lastAnalysis');
    addLogEntry({
        source: t('log.userAction.source'),
        threatLevel: 'safe',
        details: t('log.userAction.details', { action, source }),
    });
    clearAnalysis();
  };
  
  const handleFeedback = useCallback((isCorrect: boolean, result: AnalysisResultType) => {
    const source = result.type === 'text' ? result.serviceName : result.type === 'image' ? t('log.imageScan.source') : t('log.urlScan.source');
    const correctness = isCorrect ? t('feedback.correct') : t('feedback.incorrect');
    addLogEntry({
      source: t('log.userFeedback.source'),
      threatLevel: 'safe',
      details: t('log.userFeedback.details', { source, correctness }),
    });
  }, [addLogEntry, t]);


  useEffect(() => {
    // Reset state when switching modes
    setMessage('');
    setImageFile(null);
    setImageBase64(null);
    setImagePreview(null);
    setUrlToScan('');
    setError(null);
    setAnalysisResult(null);
  }, [analysisMode]);
  
  const loader = (
    <div className="flex justify-center items-center gap-4 text-lg text-blue-300 p-8">
      <LoaderCircle className="h-8 w-8 animate-spin" />
      <span>{t('app.analyzing')}</span>
    </div>
  );
  
  const componentLoader = <div className="text-center p-4">{t('app.analyzing')}</div>;

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="relative text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-4">
            <ShieldCheck className="h-10 w-10 text-blue-400" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
              {t('app.title')}
            </h1>
          </div>
          <p className="mt-4 text-lg text-slate-400">
            {t('app.subtitle')}
          </p>
          <div className="absolute top-0 right-0 flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
              aria-label={t('aria.openHelp')}
            >
              <HelpCircle className="h-7 w-7" />
            </button>
          </div>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            
            <div role="tablist" aria-label={t('app.analysisModeLabel')} className="flex justify-center border-b border-slate-700">
              <button role="tab" aria-selected={analysisMode === 'text'} aria-controls="analysis-panel" onClick={() => setAnalysisMode('text')} className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${analysisMode === 'text' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'}`}>
                <MessageSquareText className="h-5 w-5"/>{t('app.textAnalysisMode')}
              </button>
              <button role="tab" aria-selected={analysisMode === 'image'} aria-controls="analysis-panel" onClick={() => setAnalysisMode('image')} className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${analysisMode === 'image' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'}`}>
                <ImageIcon className="h-5 w-5"/>{t('app.imageAnalysisMode')}
              </button>
              <button role="tab" aria-selected={analysisMode === 'url'} aria-controls="analysis-panel" onClick={() => setAnalysisMode('url')} className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${analysisMode === 'url' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'}`}>
                <LinkIcon className="h-5 w-5"/>{t('app.urlAnalysisMode')}
              </button>
            </div>

            <div id="analysis-panel" role="tabpanel" className="bg-slate-800/50 rounded-xl shadow-lg p-6 border border-slate-700">
              {analysisMode === 'text' ? (
                <OtpInputArea
                  message={message}
                  setMessage={setMessage}
                  onScan={handleTextScan}
                  isLoading={isLoading}
                />
              ) : analysisMode === 'image' ? (
                <MediaAnalysisArea 
                  onScan={handleImageScan}
                  isLoading={isLoading}
                  imageFile={imageFile}
                  setImageFile={setImageFile}
                  setImageBase64={setImageBase64}
                  imagePreview={imagePreview}
                  setImagePreview={setImagePreview}
                />
              ) : (
                 <UrlAnalysisArea
                    url={urlToScan}
                    setUrl={setUrlToScan}
                    onScan={handleUrlScan}
                    isLoading={isLoading}
                />
              )}
              {error && (
                <div role="alert" className="mt-4 text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {isLoading && loader}

            <Suspense fallback={loader}>
              {analysisResult && (
                <AnalysisResult 
                  result={analysisResult} 
                  onTimeout={clearAnalysis}
                  onAction={handleAction}
                  onFeedback={handleFeedback}
                />
              )}
            </Suspense>
            
          </div>

          <div className="space-y-8 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            <Suspense fallback={componentLoader}>
              <Dashboard log={log} />
              <Settings sensitivity={sensitivity} setSensitivity={setSensitivity} />
            </Suspense>
            <ThreatSimulator onSimulateLoginFailure={() => setIsRecentLoginFailure(true)} />
            <NotificationManager 
              permissionStatus={notificationPermission}
              onRequestPermission={handleRequestNotificationPermission}
            />
            <AnalysisLog log={log} />
          </div>
        </main>
        
        {isHelpModalOpen && (
          <div 
              className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 animate-fade-in z-50"
              onClick={() => setIsHelpModalOpen(false)}
          >
              <div 
                  ref={helpModalRef}
                  className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-700 relative"
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="help-modal-title"
              >
                  <button 
                      onClick={() => setIsHelpModalOpen(false)}
                      className="absolute top-3 right-3 p-2 text-slate-500 hover:text-slate-100 transition-colors rounded-full bg-slate-800/50"
                      aria-label={t('aria.closeHelp')}
                  >
                      <X className="h-6 w-6" />
                  </button>
                  <div className="p-2">
                    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
                        <HelpFAQ />
                    </Suspense>
                  </div>
              </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;