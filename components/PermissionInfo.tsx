import React from 'react';
import { FileLock2, ShieldQuestion, Briefcase, Trophy, Gavel, Package, FileCode, Signal, Landmark } from 'lucide-react';

const SecurityTips: React.FC = () => {
  return (
    <div className="bg-slate-800/50 rounded-xl shadow-lg p-6 border border-slate-700 animate-fade-in">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-200">
        <ShieldQuestion className="h-6 w-6 text-blue-400" />
        Security Knowledge Base
      </h3>
      <div className="space-y-4 text-slate-400 text-sm">
        <div>
            <h4 className="font-bold text-slate-300 flex items-center gap-2 mb-2"><FileLock2 className="h-5 w-5" /> Understanding OTP & Phishing Scams</h4>
            <ul className="list-disc list-inside space-y-1 pl-2">
                <li><span className="font-semibold">Urgency is a Red Flag:</span> Scammers create fake emergencies to rush you. Real banks rarely do this.</li>
                <li><span className="font-semibold">Check the Sender ID:</span> Look for official IDs (e.g., "AM-HDFCBK") not personal phone numbers.</li>
                <li><span className="font-semibold">Verify Links:</span> Scammers use lookalike domains. Check URLs carefully before clicking.</li>
            </ul>
        </div>
         <div>
            <h4 className="font-bold text-slate-300 flex items-center gap-2 mb-2"><Gavel className="h-5 w-5" /> Digital Arrest Scam</h4>
            <p>Fraudsters impersonate Law Enforcement officials and threaten arrest. Never share personal info or pay them.</p>
        </div>
        <div>
            <h4 className="font-bold text-slate-300 flex items-center gap-2 mb-2"><Package className="h-5 w-5" /> Fake Parcel Scam</h4>
            <p>Scammers claim your parcel contains illegal items. Don’t click unknown delivery links. Verify with the courier service directly.</p>
        </div>
        <div>
            <h4 className="font-bold text-slate-300 flex items-center gap-2 mb-2"><FileCode className="h-5 w-5" /> .APK File Fraud</h4>
            <p>Fraudsters send malicious .apk file links via SMS or WhatsApp. Only download apps from official app stores.</p>
        </div>
         <div>
            <h4 className="font-bold text-slate-300 flex items-center gap-2 mb-2"><Briefcase className="h-5 w-5" /> Job Offer Fraud</h4>
            <p>Fake job offers ask for fees or banking details. Never pay for a job offer or share sensitive financial information.</p>
        </div>
        <div>
            <h4 className="font-bold text-slate-300 flex items-center gap-2 mb-2"><Signal className="h-5 w-5" /> eSIM Fraud</h4>
            <p>Scammers send fake eSIM activation links to take over your number. Never click suspicious eSIM links or share OTPs.</p>
        </div>
        <div>
            <h4 className="font-bold text-slate-300 flex items-center gap-2 mb-2"><Landmark className="h-5 w-5" /> Money Mule Fraud</h4>
            <p>Fraudsters offer easy money to trick you into moving illicit funds through your bank account. Never let anyone use your account for transactions.</p>
        </div>
         <div>
            <h4 className="font-bold text-slate-300 flex items-center gap-2 mb-2"><Trophy className="h-5 w-5" /> Lottery & Prize Scams</h4>
            <p>If you "won" a prize for a contest you never entered, it's a scam. You should never have to pay a fee to claim a legitimate prize.</p>
        </div>
         <div className="pt-3 mt-3 border-t border-slate-700">
            <p className="font-bold text-slate-300">This is a web simulation. In a real app, we would only analyze messages locally on your device to protect your privacy.</p>
        </div>
      </div>
    </div>
  );
};

export default SecurityTips;