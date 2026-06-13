import { useState } from 'react';
import OpenAI from 'openai';

export const useOpenAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTopics = async (apiKey: string, grade: string, count: number): Promise<string[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });

      const prompt = `초등학교 ${grade}학년 학생 수준에 맞는 창의적이고 재미있는 글쓰기 주제 ${count}개를 생성해주세요. 주제는 쉼표로 구분해서 텍스트로만 나열해주세요. (예: 만약 내가 마법사라면, 가장 좋아했던 여행의 기억, 투명인간이 된다면 하루 동안 할 일)`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices[0].message.content || "";
      const topics = content.split(',').map(t => t.trim()).filter(t => t.length > 0);
      
      return topics;
    } catch (err: any) {
      console.error(err);
      setError(err.message || '주제 생성에 실패했습니다.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return { generateTopics, isLoading, error };
};
