
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiTextAnalysisResponse, ImageAnalysisResult, ThreatLevel, DigitalArrestContext, UrlAnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- TEXT ANALYSIS ---

const digitalArrestContextSchema = {
    type: Type.OBJECT,
    description: "Contextual details if a 'digital_arrest' scam is detected. If not this pattern, all booleans should be false and urgency 'none'.",
    properties: {
        isUserIsolated: { type: Type.BOOLEAN, description: "True if the message uses tactics to isolate the user (e.g., 'tell no one', 'do not contact your bank')." },
        fundTransferUrgency: { type: Type.STRING, enum: ['none', 'high', 'critical'], description: "Urgency of the fund transfer demand. 'critical' for immediate threats." },
        matchesKnownScamPattern: { type: Type.BOOLEAN, description: "True if the language strongly matches known digital arrest scam scripts." },
        isolationTactics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific phrases used to isolate the user." },
        requestedAmount: { type: Type.NUMBER, description: "The specific amount of money requested, if any.", nullable: true },
    },
    required: ["isUserIsolated", "fundTransferUrgency", "matchesKnownScamPattern", "isolationTactics"]
};

const textResponseSchema = {
  type: Type.OBJECT,
  properties: {
    isSuspicious: {
      type: Type.BOOLEAN,
      description: "True if the message seems like a scam or phishing attempt, otherwise false.",
    },
    reason: {
      type: Type.STRING,
      description: "A brief explanation for the analysis. E.g., 'Uses urgent language', 'Standard OTP format', 'Threatens legal action'.",
    },
    serviceName: {
      type: Type.STRING,
      description: "The name of the service or authority mentioned (e.g., 'HDFC Bank', 'Delhi Police'). If not clear, return 'Unknown Service'.",
    },
    otp: {
      type: Type.STRING,
      description: "The detected 4 or 6-digit OTP code. If no OTP is found, return an empty string.",
    },
    amount: {
      type: Type.NUMBER,
      description: "The transaction amount in INR if mentioned. If no amount is found, return null.",
      nullable: true,
    },
    scamPattern: {
        type: Type.STRING,
        enum: ['otp', 'digital_arrest', 'unknown'],
        description: "Classify the message pattern. 'otp' for standard one-time passwords. 'digital_arrest' for messages impersonating legal authorities. 'unknown' for anything else."
    },
    digitalArrestContext: digitalArrestContextSchema,
    url: {
      type: Type.STRING,
      description: "The first full URL found in the message (including http/https). If none, return null.",
      nullable: true,
    },
    isUrlSuspicious: {
        type: Type.BOOLEAN,
        description: "True if the URL seems suspicious (e.g., typosquatting, uses a URL shortener like bit.ly, non-standard TLD, doesn't match the serviceName).",
    },
    urlSuspicionReason: {
        type: Type.STRING,
        description: "If isUrlSuspicious is true, provide a brief reason. E.g., 'URL shortener used', 'Domain mimics a known brand', 'Uses non-standard characters'. If not suspicious, return null.",
        nullable: true,
    },
    senderReputation: {
        type: Type.STRING,
        enum: ['verified', 'unverified', 'suspicious'],
        description: "Assessment of the sender ID if provided (e.g., 'VM-HDFCBK'). 'verified' for official-looking IDs, 'suspicious' for personal numbers or unusual IDs, 'unverified' otherwise."
    }
  },
  required: ["isSuspicious", "reason", "serviceName", "otp", "amount", "scamPattern", "digitalArrestContext", "url", "isUrlSuspicious", "urlSuspicionReason", "senderReputation"],
};

export async function analyzeTextMessage(message: string, language: string): Promise<GeminiTextAnalysisResponse> {
  const prompt = `
    You are a security analysis system for mobile messages for users in India. Analyze the following message for multiple threat vectors:
    1.  **OTP Scams**: Look for suspicious OTP messages (urgency, bad grammar, fake links).
    2.  **Digital Arrest Scams**: This is a CRITICAL threat. Look for messages impersonating police or government agencies that threaten arrest, demand immediate payment, and force secrecy.
    3.  **URL Phishing**: Analyze any URLs for signs of phishing. Check for typosquatting (e.g., 'go0gle.com'), use of URL shorteners (e.g., bit.ly), non-standard characters, or a mismatch with the claimed sender. If you find a suspicious URL, explain *why* it is suspicious in the 'urlSuspicionReason' field.
    4.  **Sender Reputation**: Assess the sender ID (e.g., 'VM-HDFCBK' vs a phone number). Official brand IDs are 'verified', personal numbers are 'suspicious' for official business, and others are 'unverified'.

    Message: "${message}"

    Analyze the message and return your findings in a structured JSON format. For Digital Arrest scams, pay close attention to isolation tactics and payment demands.
    **IMPORTANT**: All string values in the JSON response (like 'reason', 'serviceName', etc.) MUST be in the following language: ${language}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: textResponseSchema,
      },
    });

    const parsedJson = JSON.parse(response.text.trim());
    return parsedJson as GeminiTextAnalysisResponse;

  } catch (error) {
    console.error("Error calling Gemini API for text analysis:", error);
    throw new Error("Failed to get a valid response from the AI model for text analysis.");
  }
}

// --- IMAGE ANALYSIS ---

const hiddenContentSchema = {
    type: Type.OBJECT,
    description: "Specific details about detected hidden content.",
    properties: {
        qrCodesDetected: { type: Type.NUMBER, description: "The number of QR codes found in the image." },
        metadataAnomalies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of suspicious metadata findings, e.g., 'Missing camera model', 'Edited with unknown software'." },
        colorAnomalyScore: { type: Type.NUMBER, description: "A score from 0-100 indicating the likelihood of data hidden in color channels (LSB steganography)." },
        embeddedCodeSignatures: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Signatures of any detected embedded files or code, e.g., 'ZIP archive header', 'Executable file signature'." },
    }
};

const imageResponseSchema = {
    type: Type.OBJECT,
    properties: {
        riskLevel: {
            type: Type.STRING,
            enum: ['safe', 'caution', 'danger'],
            description: "Overall risk assessment. 'danger' if hidden content or clear manipulation is found. 'caution' for suspicious but inconclusive signs. 'safe' if it appears to be a normal image."
        },
        findings: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of user-friendly strings describing what was found. E.g., 'QR code detected.', 'Unusual metadata suggests tampering.'"
        },
        recommendation: {
            type: Type.STRING,
            description: "A clear, non-technical recommendation for the user. E.g., 'This image appears safe.', 'Warning: This image contains a hidden QR code. Do not scan it.'"
        },
        steganographyConfidence: {
            type: Type.NUMBER,
            description: "A confidence score from 0-100 on how likely it is that this image contains steganographically hidden data."
        },
        hiddenContent: { ...hiddenContentSchema, nullable: true }
    },
    required: ["riskLevel", "findings", "recommendation", "steganographyConfidence"]
};

export async function analyzeImageMedia(base64Data: string, mimeType: string, language: string): Promise<Omit<ImageAnalysisResult, 'type'>> {
  const prompt = `
    You are a digital forensics expert specializing in steganography and image-based malware detection.
    Analyze the following image for any signs of hidden content or malicious manipulation.

    Your analysis must be thorough. Look for:
    -   **Embedded QR codes or barcodes.** Report the number found.
    -   **Hidden text** concealed within the image.
    -   **EXIF Metadata Anomalies**: Check for stripped metadata, unusual software tags, or modification dates that don't match creation dates.
    -   **Color & Compression Anomalies**: Look for patterns that suggest data has been hidden (e.g., Least Significant Bit steganography). Provide a score for this.
    -   **Embedded File Signatures**: Check for headers of common file types (ZIP, PDF, EXE) hidden within the image data.

    Provide a risk assessment and a confidence score for steganography based on your findings.
    **IMPORTANT**: All string values in the JSON response (like 'findings', 'recommendation') MUST be in the following language: ${language}.
  `;
  
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: { parts: [{ text: prompt }, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: imageResponseSchema,
      },
    });

    const parsedJson = JSON.parse(response.text.trim());
    return parsedJson as Omit<ImageAnalysisResult, 'type'>;

  } catch (error) {
    console.error("Error calling Gemini API for image analysis:", error);
    throw new Error("Failed to get a valid response from the AI model for image analysis.");
  }
}

// --- URL ANALYSIS ---

const domainInfoSchema = {
    type: Type.OBJECT,
    description: "Information about the URL's domain.",
    properties: {
        domain: { type: Type.STRING, description: "The root domain of the URL (e.g., 'example.com')." },
        isNew: { type: Type.BOOLEAN, description: "True if the domain appears to be newly registered or obscure, a common tactic for scams." },
        usesHttps: { type: Type.BOOLEAN, description: "True if the URL uses a secure HTTPS connection." },
    }
};

const urlResponseSchema = {
    type: Type.OBJECT,
    properties: {
        riskLevel: {
            type: Type.STRING,
            enum: ['safe', 'caution', 'danger'],
            description: "Overall risk assessment. 'danger' for known malicious links. 'caution' for suspicious signs (e.g., shorteners, new domains). 'safe' if it appears legitimate."
        },
        threatType: {
            type: Type.STRING,
            enum: ['phishing', 'malware', 'scam', 'safe', 'unknown'],
            description: "The primary type of threat detected. 'phishing' for credential theft, 'malware' for malicious downloads, 'scam' for fraudulent schemes."
        },
        findings: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of user-friendly strings describing what was found. E.g., 'URL uses a shortener, which can hide the final destination.', 'Domain name contains suspicious keywords.'"
        },
        recommendation: {
            type: Type.STRING,
            description: "A clear, non-technical recommendation for the user. E.g., 'This link appears safe to visit.', 'CRITICAL WARNING: Do not visit this URL. It is flagged for phishing.'"
        },
        domainInfo: { ...domainInfoSchema, nullable: true }
    },
    required: ["riskLevel", "threatType", "findings", "recommendation"]
};

export async function analyzeUrl(url: string, language: string): Promise<Omit<UrlAnalysisResult, 'type'>> {
  const prompt = `
    You are a premier cybersecurity analysis engine named "Guardian URLScan". Your task is to analyze the following URL for any potential threats.

    URL to analyze: "${url}"

    Conduct a comprehensive analysis, checking for:
    - **Phishing**: Does it imitate a known brand (e.g., 'micros0ft.com')? Does it have a suspicious path that might ask for credentials?
    - **Malware Distribution**: Does the URL point to a file download? Does the domain have a bad reputation for hosting malware?
    - **Scams**: Does the domain promise unrealistic rewards (e.g., 'free-crypto-now.net')?
    - **Domain Trustworthiness**: Is the domain new? Does it use HTTPS? Is the TLD unusual (.xyz, .top, .live)?
    - **URL Shorteners**: Identify if services like bit.ly, tinyurl, etc., are used, as they can obscure the final destination.

    Provide a concise, expert analysis in the requested JSON format.
    **IMPORTANT**: All string values in the JSON response (like 'findings', 'recommendation') MUST be in the following language: ${language}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: urlResponseSchema,
      },
    });

    const parsedJson = JSON.parse(response.text.trim());
    return parsedJson as Omit<UrlAnalysisResult, 'type'>;

  } catch (error) {
    console.error("Error calling Gemini API for URL analysis:", error);
    throw new Error("Failed to get a valid response from the AI model for URL analysis.");
  }
}