import { GoogleGenerativeAI } from '@google/generative-ai';
import { getApiKey, getGeminiModel } from './storage';
import type { ChatMessage } from './types';

const SYSTEM_PROMPT = `أنت مساعد ذكي لطلاب الثانوية العامة في مصر. اسمك "المستشار الدوادي الذكي". 
تساعد الطلاب في دروس اللغة العربية والفيزياء والكيمياء والأحياء والإنجليزي.
يجب أن تجيب باللغة العربية بأسلوب واضح ومبسط ومناسب لطلاب الثانوية العامة.
عندما يطلب الطالب شرح درس، قم بشرحه بشكل منظم مع الأمثلة.
كن مشجعاً وداعماً للطلاب.`;

export async function generateResponse(
  userMessage: string,
  history: ChatMessage[]
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return 'لم يتم ضبط مفتاح API الخاص بـ Gemini. يرجى التواصل مع الإدارة لضبط المفتاح من لوحة التحكم.';
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: getGeminiModel(),
      systemInstruction: SYSTEM_PROMPT,
    });

    const formattedHistory = history.slice(-20).map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'خطأ غير معروف';
    return `حدث خطأ أثناء الاتصال بـ Gemini: ${msg}`;
  }
}
