import React, { useEffect, useState } from 'react';
import { AnalysisResult as AnalysisResultType, ThreatLevel, RecommendedActionType, TextAnalysisResult, ImageAnalysisResult, DigitalArrestContext, UrlAnalysisResult } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import {
  ShieldAlert, ShieldCheck, ShieldQuestion, ClipboardX, MessageSquareWarning,
  AlertTriangle, TrendingUp, Clock, MapPin, Smartphone, CheckCircle,
  AlertCircle, Eye, RefreshCw, RotateCw, FileSearch, Zap, Trash2, Gauge, Users, Wallet, Link, ShieldOff,
} from 'lucide-react';

interface AnalysisResultProps {
  result: AnalysisResultType;
  onTimeout: () => void;
  onAction: (action: RecommendedActionType) => void;
  onFeedback: (isCorrect: boolean, result: AnalysisResultType) => void;
}

// --- TEXT ANALYSIS COMPONENTS ---

const UrlAnalysis: React.FC<{ url: string | null; isSuspicious: boolean; reason: string | null }> = ({ url, isSuspicious, reason }) => {
    const { t } = useTranslation();
    if (!url) return null;

    const displayUrl = url.length > 40 ? `${url.substring(0, 37)}...` : url;

    return (
        <div className={`mt-4 p-3 rounded-lg border flex items-start gap-3 ${isSuspicious ? 'bg-red-900/50 border-red-500/50' : 'bg-slate-800 border-slate-600'}`}>
            {isSuspicious ? <ShieldOff className="h-5 w-5 text-red-400 mt-0.5 shrink-0" /> : <Link className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />}
            <div>
                <p className={`font-bold ${isSuspicious ? 'text-red-300' : 'text-slate-200'}`}>{isSuspicious ? t('analysis.url.suspiciousTitle') : t('analysis.url.title')}</p>
                <p className="text-sm font-mono break-all text-slate-400 my-1">{displayUrl}</p>
                {isSuspicious && <p className="text-sm text-red-200">{t('analysis.url.warningPrefix')}: {reason || t('analysis.url.defaultWarning')}</p>}
            </div>
        </div>
    );
};

const OtpDisplay: React.FC<{ otp: string }> = ({ otp }) => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const flipOTP = (o: string): string => o.split('').reverse().join('');
  const displayOtp = isFlipped ? flipOTP(otp) : otp;

  return (
    <div className="mt-6 text-center">
      <p className="font-medium text-slate-400">{t('analysis.otp.label')}:</p>
      <div className="flex justify-center gap-2 my-4">
        {displayOtp.split('').map((digit, index) => (
          <div key={index} className="w-12 h-14 bg-slate-900 border-2 border-slate-600 rounded-md flex items-center justify-center text-3xl font-mono font-bold text-cyan-300 select-none">
            {digit}
          </div>
        ))}
      </div>
      <button 
        onClick={() => setIsFlipped(!isFlipped)} 
        className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors text-slate-300 hover:text-slate-100 text-sm font-medium"
        aria-label={isFlipped ? t('analysis.otp.showNormal') : t('analysis.otp.flip')}
      >
        <RefreshCw className="w-4 h-4" /> {isFlipped ? t('analysis.otp.showNormal') : t('analysis.otp.flip')}
      </button>
      <div className="flex items-center justify-center gap-2 text-sm text-yellow-400 p-2 bg-yellow-900/50 rounded-md mt-3" role="alert">
        <ClipboardX className="h-5 w-5 flex-shrink-0" />
        <span className="font-semibold">{t('analysis.otp.autofillDisabled')}</span>
      </div>
    </div>
  );
};

const ContextIndicators: React.FC<{ context?: TextAnalysisResult['threatContext'] }> = ({ context }) => {
  const { t } = useTranslation();
  if (!context) return null;
  const indicators = [
    { icon: TrendingUp, label: t('analysis.context.pattern'), value: context.isPatternAttack ? t('analysis.context.patternValue', { count: context.otpsInLastHour }) : t('analysis.context.patternNormal'), isWarning: context.isPatternAttack },
    { icon: Clock, label: t('analysis.context.time'), value: t('analysis.context.timeValue', { score: context.timeAnomalyScore }), isWarning: context.timeAnomalyScore > 60 },
    { icon: MapPin, label: t('analysis.context.location'), value: context.deviceLocationMatch ? t('analysis.context.locationExpected') : t('analysis.context.locationUnexpected'), isWarning: !context.deviceLocationMatch },
    { icon: Smartphone, label: t('analysis.context.device'), value: context.isNewDevice ? t('analysis.context.deviceNew') : t('analysis.context.deviceKnown'), isWarning: context.isNewDevice },
  ];
  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
      {indicators.map((ind, i) => (
        <div key={i} className={`p-3 rounded-lg border ${ind.isWarning ? 'border-yellow-500/50 bg-yellow-900/20' : 'border-slate-600/50 bg-slate-800/50'}`}>
          <div className="flex items-center gap-2 mb-1"><ind.icon className={`h-4 w-4 ${ind.isWarning ? 'text-yellow-400' : 'text-slate-400'}`} /><span className="text-xs font-semibold text-slate-300">{ind.label}</span></div>
          <p className={`text-sm font-bold truncate ${ind.isWarning ? 'text-yellow-300' : 'text-slate-200'}`}>{ind.value}</p>
        </div>
      ))}
    </div>
  );
};

const ServiceVerificationBadge: React.FC<{ verification?: TextAnalysisResult['serviceVerification']; serviceName: string }> = ({ verification, serviceName }) => {
  const { t } = useTranslation();
  if (!verification) return null;

  // Prioritize known spoof over anything else
  if (verification.knownSpoof) return (
    <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg flex items-start gap-2"><AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" /><div><p className="font-bold text-red-300">⚠️ {t('analysis.verification.spoofedTitle')}</p><p className="text-sm text-red-200">{t('analysis.verification.spoofedBody', { serviceName })}</p></div></div>
  );

  // Use senderReputation for more granular feedback
  switch (verification.senderReputation) {
    case 'verified':
      return <div className="mt-4 p-3 bg-green-900/50 border border-green-500/50 rounded-lg flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-400 mt-0.5 shrink-0" /><div><p className="font-bold text-green-300">✓ {t('analysis.verification.verifiedTitle')}</p><p className="text-sm text-green-200">{t('analysis.verification.verifiedBody')}</p></div></div>;
    case 'suspicious':
      return <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg flex items-start gap-2"><AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" /><div><p className="font-bold text-red-300">⚠️ {t('analysis.verification.suspiciousTitle')}</p><p className="text-sm text-red-200">{t('analysis.verification.suspiciousBody', { serviceName })}</p></div></div>;
    default: // 'unverified' or undefined
      return <div className="mt-4 p-3 bg-yellow-900/50 border border-yellow-500/50 rounded-lg flex items-start gap-2"><Eye className="h-5 w-5 text-yellow-400 mt-0.5 shrink-0" /><div><p className="font-bold text-yellow-300">⚠️ {t('analysis.verification.unverifiedTitle')}</p><p className="text-sm text-yellow-200">{t('analysis.verification.unverifiedBody')}</p></div></div>;
  }
};

const DigitalArrestWarning: React.FC<{ context?: DigitalArrestContext }> = ({ context }) => {
    const { t } = useTranslation();
    return (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg" role="alert">
            <h3 className="text-lg font-bold text-red-300 flex items-center gap-2">
                <MessageSquareWarning className="h-6 w-6" />
                🚨 {t('analysis.digitalArrest.title')}
            </h3>
            {context && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className={`flex items-center gap-2 p-2 rounded ${context.isUserIsolated ? 'bg-red-800/50 text-red-200' : 'bg-green-800/50 text-green-200'}`}>
                        <Users className="h-5 w-5 shrink-0"/>
                        <span>{t('analysis.digitalArrest.isolationTactics')}: <strong>{context.isUserIsolated ? t('analysis.digitalArrest.detected') : t('analysis.digitalArrest.notDetected')}</strong></span>
                    </div>
                     <div className={`flex items-center gap-2 p-2 rounded ${context.fundTransferUrgency !== 'none' ? 'bg-red-800/50 text-red-200' : 'bg-green-800/50 text-green-200'}`}>
                        <Wallet className="h-5 w-5 shrink-0"/>
                        <span>{t('analysis.digitalArrest.paymentUrgency')}: <strong>{context.fundTransferUrgency.toUpperCase()}</strong></span>
                    </div>
                </div>
            )}
            <div className="mt-4 border-t border-red-400/30 pt-4">
                <h4 className="font-semibold text-red-200 mb-2">{t('analysis.digitalArrest.checklistTitle')}:</h4>
                <ul className="space-y-2 text-red-200/90 text-sm">
                    <li className="flex items-start gap-2"><ShieldAlert className="h-4 w-4 mt-0.5 shrink-0"/><span><strong>{t('analysis.digitalArrest.checklist1Title')}:</strong> {t('analysis.digitalArrest.checklist1Body')}</span></li>
                    <li className="flex items-start gap-2"><ShieldAlert className="h-4 w-4 mt-0.5 shrink-0"/><span><strong>{t('analysis.digitalArrest.checklist2Title')}:</strong> {t('analysis.digitalArrest.checklist2Body')}</span></li>
                    <li className="flex items-start gap-2"><ShieldAlert className="h-4 w-4 mt-0.5 shrink-0"/><span><strong>{t('analysis.digitalArrest.checklist3Title')}:</strong> {t('analysis.digitalArrest.checklist3Body')}</span></li>
                </ul>
            </div>
        </div>
    );
};

const EducationTip: React.FC<{ scamType?: string }> = ({ scamType }) => {
  const { t } = useTranslation();
  if (!scamType) return null;

  const titleKey = `education.${scamType}.title`;
  const textKey = `education.${scamType}.text`;
  
  // A simple check to see if the translation exists. In a bigger app, you might have a more robust check.
  const title = t(titleKey);
  if (title === titleKey) return null; // Key doesn't exist, don't render.

  return (
    <div className="mt-4 p-4 bg-blue-900/50 border border-blue-500/50 rounded-lg">
      <h4 className="font-bold text-blue-300 mb-2">💡 {t('education.about')} {title}</h4>
      <p className="text-sm text-blue-200 leading-relaxed">{t(textKey)}</p>
    </div>
  );
};


// --- IMAGE ANALYSIS COMPONENTS ---

const SteganographyDetails: React.FC<{ result: ImageAnalysisResult }> = ({ result }) => {
    const { t } = useTranslation();
    const confidence = result.steganographyConfidence;
    const confidenceColor = confidence > 75 ? 'text-danger' : confidence > 40 ? 'text-caution' : 'text-safe';
    
    return (
        <div className="mt-4 p-4 bg-slate-800/50 border border-slate-600/50 rounded-lg">
            <h4 className="font-semibold text-slate-100 mb-3">{t('analysis.image.steganographyDetails')}</h4>
            <div className="flex items-center justify-between gap-4 p-3 bg-slate-900 rounded-md">
                <div className="flex items-center gap-2">
                    <Gauge className={`h-6 w-6 ${confidenceColor}`} />
                    <span className="font-bold text-slate-200">{t('analysis.image.confidenceScore')}</span>
                </div>
                <div className={`text-2xl font-bold ${confidenceColor}`}>
                    {confidence}<span className="text-base">%</span>
                </div>
            </div>
            {result.hiddenContent && (
                 <div className="mt-3 text-sm text-slate-300 space-y-2 pt-3 border-t border-slate-700">
                    {result.hiddenContent.qrCodesDetected > 0 && <p className="flex justify-between"><span>{t('analysis.image.foundQRCodes', { count: result.hiddenContent.qrCodesDetected })}</span> <span className="font-mono text-slate-100">{result.hiddenContent.qrCodesDetected}</span></p>}
                    {result.hiddenContent.metadataAnomalies.length > 0 && <p className="flex justify-between"><span>{t('analysis.image.foundMetadataAnomalies')}</span> <span className="font-mono text-slate-100">{result.hiddenContent.metadataAnomalies.length}</span></p>}
                    {result.hiddenContent.embeddedCodeSignatures.length > 0 && <p className="flex justify-between"><span>{t('analysis.image.foundFileSignatures')}</span> <span className="font-mono text-slate-100">{result.hiddenContent.embeddedCodeSignatures.length}</span></p>}
                    {result.hiddenContent.colorAnomalyScore > 0 && <p className="flex justify-between"><span>{t('analysis.image.colorAnomalyScore')}</span> <span className="font-mono text-slate-100">{result.hiddenContent.colorAnomalyScore}/100</span></p>}
                 </div>
            )}
        </div>
    );
};

const ImageFindings: React.FC<{ result: ImageAnalysisResult }> = ({ result }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-6 space-y-4">
      <div>
        <h3 className="font-semibold text-slate-100 flex items-center gap-2 mb-2"><FileSearch className="h-5 w-5 text-blue-400" />{t('analysis.image.findings')}</h3>
        {result.findings.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300">
            {result.findings.map((finding, i) => <li key={i}>{finding}</li>)}
          </ul>
        ) : <p className="text-slate-400">{t('analysis.image.noFindings')}</p>}
      </div>
      <SteganographyDetails result={result} />
      <div>
        <h3 className="font-semibold text-slate-100 flex items-center gap-2 mb-2"><Zap className="h-5 w-5 text-blue-400" />{t('analysis.image.recommendation')}</h3>
        <p className="text-slate-300">{result.recommendation}</p>
      </div>
    </div>
  );
};


// --- URL ANALYSIS COMPONENTS ---
const UrlDetails: React.FC<{ result: UrlAnalysisResult }> = ({ result }) => {
    const { t } = useTranslation();
    const { domainInfo } = result;
    if (!domainInfo) return null;
    
    return (
        <div className="mt-4 p-4 bg-slate-800/50 border border-slate-600/50 rounded-lg">
            <h4 className="font-semibold text-slate-100 mb-3">{t('analysis.url.domainDetails')}</h4>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center"><span className="text-slate-400">{t('analysis.url.domain')}</span><span className="font-mono text-slate-200 bg-slate-700 px-2 py-0.5 rounded">{domainInfo.domain}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">{t('analysis.url.secureConnection')}</span>{domainInfo.usesHttps ? <span className="font-semibold text-safe">{t('analysis.url.yes')}</span> : <span className="font-semibold text-danger">{t('analysis.url.no')}</span>}</div>
                <div className="flex justify-between items-center"><span className="text-slate-400">{t('analysis.url.newDomain')}</span>{domainInfo.isNew ? <span className="font-semibold text-caution">{t('analysis.url.yes')}</span> : <span className="font-semibold text-slate-200">{t('analysis.url.no')}</span>}</div>
            </div>
        </div>
    );
};

const UrlFindings: React.FC<{ result: UrlAnalysisResult }> = ({ result }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-6 space-y-4">
      <div>
        <h3 className="font-semibold text-slate-100 flex items-center gap-2 mb-2"><FileSearch className="h-5 w-5 text-blue-400" />{t('analysis.url.findings')}</h3>
        {result.findings.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300">
            {result.findings.map((finding, i) => <li key={i}>{finding}</li>)}
          </ul>
        ) : <p className="text-slate-400">{t('analysis.image.noFindings')}</p>}
      </div>
      <UrlDetails result={result} />
      <div>
        <h3 className="font-semibold text-slate-100 flex items-center gap-2 mb-2"><Zap className="h-5 w-5 text-blue-400" />{t('analysis.url.recommendation')}</h3>
        <p className="text-slate-300">{result.recommendation}</p>
      </div>
    </div>
  );
};


// --- MAIN COMPONENT ---

const ThreatIndicator: React.FC<{ level: ThreatLevel }> = ({ level }) => {
  const { t } = useTranslation();
  const config = { 
      safe: {i: ShieldCheck, c: 'text-safe', t: t('threatLevels.safe')}, 
      caution: {i: ShieldQuestion, c: 'text-caution', t: t('threatLevels.caution')}, 
      danger: {i: ShieldAlert, c: 'text-danger', t: t('threatLevels.danger')} 
  };
  const { i: Icon, c: color, t: text } = config[level];
  return <div className={`flex items-center gap-2 font-bold text-xl ${color}`}><Icon className="h-7 w-7" /><span>{text}</span></div>;
};

const formatTime = (seconds: number): string => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, onTimeout, onAction, onFeedback }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(result.type === 'text' && result.scamPattern === 'otp' ? 120 : Infinity);
  const [actionState, setActionState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [actionMessage, setActionMessage] = useState('');
  const [lastAction, setLastAction] = useState<RecommendedActionType | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const isOtp = result.type === 'text' && result.scamPattern === 'otp';
  const threatLevel = result.type === 'text' ? result.threatLevel : result.riskLevel;

  useEffect(() => {
    if (!isOtp) return;
    const timer = setInterval(() => setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [isOtp]);

  useEffect(() => { if (timeLeft === 0 && isOtp) onTimeout(); }, [timeLeft, onTimeout, isOtp]);

  const handleAction = async (action: RecommendedActionType) => {
    setLastAction(action);
    setActionState('loading');
    try {
      await new Promise(res => setTimeout(res, 1000));
      setActionState('success');
      setActionMessage(t('analysis.actionSuccess', { action }));
      onAction(action);
    } catch (error) {
      setActionState('error');
      setActionMessage(t('analysis.actionError'));
    }
  };
  
  const handleFeedbackClick = (isCorrect: boolean) => {
    onFeedback(isCorrect, result);
    setFeedbackGiven(true);
  };


  const threatConfig = { safe: 'border-safe/50 bg-safe/10', caution: 'border-caution/50 bg-caution/10', danger: 'border-danger/50 bg-danger/10' };

  if (actionState === 'success') return (
    <div className="p-6 rounded-xl border-2 border-green-500/50 bg-green-900/20 animate-fade-in"><div className="flex items-center gap-3"><CheckCircle className="h-8 w-8 text-green-400 shrink-0" /><div><h2 className="text-2xl font-bold text-green-300">{t('analysis.successTitle')}</h2><p className="text-green-200 mt-1">{actionMessage}</p></div></div></div>
  );
  if (actionState === 'error') return (
    <div className="p-6 rounded-xl border-2 border-red-500/50 bg-red-900/20 animate-fade-in"><div className="flex items-start gap-3"><AlertCircle className="h-8 w-8 text-red-400 shrink-0" /><div><h2 className="text-2xl font-bold text-red-300">{t('analysis.errorTitle')}</h2><p className="text-red-200 mt-1 mb-4">{actionMessage}</p><button onClick={() => lastAction && handleAction(lastAction)} className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg"><RotateCw className="w-4 h-4" />{t('analysis.retry')}</button></div></div></div>
  );
  
  if (timeLeft === 0 && isOtp) return (
    <div className="p-6 rounded-xl border-2 border-red-500/50 bg-red-900/10 animate-fade-in"><h2 className="text-2xl font-bold text-red-300">⏰ {t('analysis.otpExpiredTitle')}</h2><p className="text-red-200 mt-2">{t('analysis.otpExpiredBody')}</p></div>
  );

  const defaultActions = {
    danger: [{ action: 'BLOCK' as const, label: t('actions.block'), color: 'bg-red-600 hover:bg-red-700' }],
    caution: [{ action: 'VERIFY' as const, label: t('actions.verify'), color: 'bg-yellow-600 hover:bg-yellow-700' }, { action: 'PROCEED' as const, label: t('actions.proceedCautiously'), color: 'bg-slate-600 hover:bg-slate-700' }],
    safe: [{ action: 'PROCEED' as const, label: t('actions.proceed'), color: 'bg-green-600 hover:bg-green-700' }]
  };
  const digitalArrestActions = [
    { action: 'CONTACT_SUPPORT' as const, label: t('actions.contactPolice'), color: 'bg-blue-600 hover:bg-blue-700' },
    { action: 'BLOCK' as const, label: t('actions.blockSender'), color: 'bg-red-600 hover:bg-red-700' }
  ];
  const imageActions = [
    { action: 'DELETE' as const, label: t('actions.deleteImage'), color: 'bg-red-600 hover:bg-red-700' },
  ];
  
  const getActionsToDisplay = () => {
    if (result.type === 'text') {
      if (result.scamPattern === 'digital_arrest') {
        return digitalArrestActions;
      }
      return result.recommendedActions || defaultActions[threatLevel];
    }
    if (result.type === 'image') {
      if (threatLevel === 'danger' || threatLevel === 'caution') {
        return imageActions;
      }
      return defaultActions[threatLevel];
    }
    if (result.type === 'url') {
      if (threatLevel === 'danger' || threatLevel === 'caution') {
        return [{ action: 'BLOCK' as const, label: t('actions.blockUrl'), color: 'bg-red-600 hover:bg-red-700' }];
      }
      return defaultActions[threatLevel];
    }
    return [];
  };
  const actionsToDisplay = getActionsToDisplay();


  return (
    <div 
      className={`p-6 rounded-xl shadow-lg border-2 animate-fade-in ${threatConfig[threatLevel]}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex justify-between items-start">
        <div>
           <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
            {result.type === 'text' ? t('analysis.textAnalysisTitle') : result.type === 'image' ? t('analysis.imageAnalysisTitle') : t('analysis.urlAnalysisTitle')}
            {result.type === 'text' && result.analysisMode === 'offline' && (
              <span className="text-sm font-medium px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full">{t('analysis.offlineMode')}</span>
            )}
          </h2>
          {isOtp && <p className="text-sm mt-1 text-slate-400">{t('analysis.expiresIn')}: {formatTime(timeLeft)}</p>}
        </div>
        <ThreatIndicator level={threatLevel} />
      </div>

      {result.type === 'text' && (
        <>
            <div className="mt-4 text-slate-300">
                <p><span className="font-semibold text-slate-100">{t('analysis.source')}:</span> {result.serviceName}</p>
                {result.reason && <p className="mt-2"><span className="font-semibold text-slate-100">{t('analysis.analysis')}:</span> {result.reason}</p>}
            </div>
            {result.scamPattern === 'otp' ? (
                <>
                    {result.otp && <OtpDisplay otp={result.otp} />}
                    <UrlAnalysis url={result.url} isSuspicious={result.isUrlSuspicious} reason={result.urlSuspicionReason} />
                    <ContextIndicators context={result.threatContext} />
                    <ServiceVerificationBadge verification={result.serviceVerification} serviceName={result.serviceName} />
                    {threatLevel === 'danger' && <EducationTip scamType={result.relatedScamType || 'phishing'} />}
                </>
            ) : ( // Digital Arrest or other non-OTP patterns
                <>
                    <UrlAnalysis url={result.url} isSuspicious={result.isUrlSuspicious} reason={result.urlSuspicionReason} />
                    {result.scamPattern === 'digital_arrest' && <DigitalArrestWarning context={result.digitalArrestContext} />}
                    <EducationTip scamType="digital_arrest" />
                </>
            )}
        </>
      )}

      {result.type === 'image' && <ImageFindings result={result} />}
      
      {result.type === 'url' && <UrlFindings result={result} />}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actionsToDisplay.map(action => (
            <button key={action.action} onClick={() => handleAction(action.action)} disabled={actionState === 'loading'} className={`py-3 px-4 rounded-lg font-bold text-white transition-all transform hover:scale-105 ${action.color || 'bg-slate-600 hover:bg-slate-700'}`}>
                {actionState === 'loading' ? t('analysis.processing') : action.label}
            </button>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        {!feedbackGiven ? (
            <div className="flex items-center justify-center gap-4 animate-fade-in">
                <p className="text-sm text-slate-400">{t('feedback.prompt')}</p>
                <button onClick={() => handleFeedbackClick(true)} className="px-3 py-1 text-sm font-semibold rounded-md bg-slate-700 hover:bg-slate-600 transition-colors">👍 {t('feedback.yes')}</button>
                <button onClick={() => handleFeedbackClick(false)} className="px-3 py-1 text-sm font-semibold rounded-md bg-slate-700 hover:bg-slate-600 transition-colors">👎 {t('feedback.no')}</button>
            </div>
        ) : (
            <p className="text-center text-sm text-green-400 animate-fade-in">✓ {t('feedback.thanks')}</p>
        )}
      </div>
    </div>
  );
};

export default AnalysisResult;