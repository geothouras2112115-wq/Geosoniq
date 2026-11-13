import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';

function aiApiPlugin(): Plugin {
  return {
    name: 'ai-tutor-api',
    configureServer(server) {
      server.middlewares.use('/api/ai-tutor', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const { action, prompt, topic } = data;

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  result: `[AI Assistant Note]: GEMINI_API_KEY is not set in environment secrets. Here is a simulated AI tutor answer for "${topic || 'Class Concept'}":\n\n1. **Key Insight**: Attention mechanisms compute dynamic relevance weights across sequence elements using query-key matrix multiplication.\n2. **Practical Context**: Softmax normalization ensures probabilities sum to 1.0, enabling gradient-based backpropagation across multi-head projections.\n3. **Recommended Study**: Review Module 2 slides in the Class File Vault.`,
                })
              );
              return;
            }

            const ai = new GoogleGenAI({ apiKey });

            let systemInstruction = 'You are EduStream AI Tutor, an encouraging, articulate, and highly knowledgeable educational assistant for university-level online classes. Provide clear, well-structured markdown answers with bullet points, code snippets or mathematical expressions where helpful.';

            let userPrompt = prompt;
            if (action === 'summarize') {
              userPrompt = `Please summarize the following class lecture content / topic into bullet points, key takeaways, and 3 review quiz questions:\n\nTopic: ${topic}\nContent: ${prompt}`;
            } else if (action === 'generate_quiz') {
              userPrompt = `Generate a 3-question multiple choice pop quiz based on this class topic: "${topic}". Include explanations for the correct answers.`;
            }

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: userPrompt,
              config: {
                systemInstruction,
              }
            });

            const replyText = response.text || 'No response generated.';

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ result: replyText }));
          } catch (err: any) {
            console.error('Error in Gemini API route:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Failed to communicate with AI Tutor service' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), aiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
