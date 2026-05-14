import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface CompanyInfo {
  name: string;
  address: string;
}

export interface FormField {
  label: string;
  originalText: string;
  suggestedValue: string;
  pageNumber?: number;
  confidence: number;
}

export interface TenderAnalysisResult {
  formIdentified: boolean;
  formType: string;
  fields: FormField[];
  summary: string;
}

export async function analyzeTenderDocument(
  fileBase64: string,
  mimeType: string,
  companyInfo: CompanyInfo
): Promise<TenderAnalysisResult> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    You are an expert Engineering Tender Consultant. 
    Analyze the uploaded tender document and identify sections that require the bidder's information (Standard Submission Forms).
    
    The company bidding for this tender is:
    - Company Name: ${companyInfo.name}
    - Company Address: ${companyInfo.address}
    
    Your task:
    1. Identify if this document contains standard tender submission forms (e.g., Form of Tender, Appendix to Tender, Technical Schedule, etc.).
    2. Extract fields that need to be filled with bidder information.
    3. For each field, provide:
       - The label/title of the field as it appears in the document.
       - The original text context.
       - The suggest value to fill based on the provided Company Info.
       - The approximate page number.
       - Your confidence level (0-1).
    4. Provide a brief summary of what you found.

    Return the result in strict JSON format matching the following schema.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          formIdentified: { type: Type.BOOLEAN },
          formType: { type: Type.STRING },
          summary: { type: Type.STRING },
          fields: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                originalText: { type: Type.STRING },
                suggestedValue: { type: Type.STRING },
                pageNumber: { type: Type.NUMBER },
                confidence: { type: Type.NUMBER },
              },
              required: ["label", "originalText", "suggestedValue", "confidence"],
            },
          },
        },
        required: ["formIdentified", "formType", "summary", "fields"],
      },
    },
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(response.text) as TenderAnalysisResult;
}
