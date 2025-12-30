
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractDocumentInfo = async (base64Image: string): Promise<ExtractedInfo> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: `你是一个专业的《就业失业登记证》信息提取助手。请根据提供的截图提取信息。
          
          逻辑规则：
          1. 识别个人基本信息（姓名、身份证号、性别、出生日期、民族、发证日期、发证机构、证件编号）。
          2. 识别历史记录项：
             - 如果一条记录包含 3 个字段（例如：日期、户籍性质、详细地址，如"20131106 农业 六安市金安区"），请将其放入 householdRecords。
             - 如果一条记录包含 2 个字段（例如：日期、详细地址，如"20251014 九十铺村"），请将其放入 currentAddressRecords。
          
          请务必严格按此逻辑分类，不要混淆。`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          idNumber: { type: Type.STRING },
          gender: { type: Type.STRING },
          birthDate: { type: Type.STRING },
          ethnicity: { type: Type.STRING },
          issueDate: { type: Type.STRING },
          issueAuthority: { type: Type.STRING },
          docNumber: { type: Type.STRING },
          householdRecords: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                type: { type: Type.STRING },
                address: { type: Type.STRING }
              },
              required: ["date", "type", "address"]
            }
          },
          currentAddressRecords: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                address: { type: Type.STRING }
              },
              required: ["date", "address"]
            }
          }
        },
        required: ["name", "idNumber", "householdRecords", "currentAddressRecords"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("无法从图像中提取信息，请确保图片清晰且包含所需字段。");
  return JSON.parse(text) as ExtractedInfo;
};
