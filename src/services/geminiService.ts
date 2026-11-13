export async function askAITutor(params: {
  action?: 'ask' | 'summarize' | 'generate_quiz';
  prompt: string;
  topic?: string;
}): Promise<string> {
  try {
    const res = await fetch('/api/ai-tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const data = await res.json();
    return data.result || 'No response received from AI service.';
  } catch (error: any) {
    console.error('AI Tutor request failed:', error);
    return `Unable to reach AI Tutor right now (${error.message}). Please check your connection and secrets configuration.`;
  }
}
