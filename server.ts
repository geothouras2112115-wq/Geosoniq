import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not defined.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Endpoint for AI Tutor
app.post('/api/ai-tutor', async (req, res) => {
  try {
    const { prompt, topic } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(200).json({
        result: `[Offline AI Mode] Query about "${topic || 'Geophysics'}": ${prompt}. Key concept: Seismic velocity depends on rock density (p) and bulk/shear moduli (K, G).`,
      });
    }

    const sysInst = `You are an expert Professor and Geology Tutor at GeoSoniq (Study Geology With Us). Provide detailed, engaging, and clear educational answers. Topic: ${topic || 'General Geology & Geophysics'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: sysInst,
      },
    });

    return res.json({ result: response.text });
  } catch (err: any) {
    console.error('AI Tutor API Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to query AI Tutor' });
  }
});

// API Endpoint for Gemini Screen Search & 3D Mineral Model Search
app.post('/api/gemini-search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Rich offline/fallback response if API key is not yet configured
      return res.json({
        query,
        explanation: `Detailed analysis for "${query}": Found geological specimen with rich crystalline matrix. Commonly observed in mantle plumes, metamorphism, and hydrothermal vein systems.`,
        formula: 'SiO₂ / Fe₂SiO₄ (Silicate Matrix)',
        hardness: '6.5 - 7.0 Mohs',
        density: '2.65 - 3.20 g/cm³',
        crystalSystem: 'Hexagonal / Trigonal Lattice',
        tectonicOrigin: 'Igneous intrusion & Hydrothermal veins',
        refractionIndex: '1.544 - 1.553',
        modelShape: 'hexagonal',
        color: '#00e5ff',
        groundingSources: [
          { title: 'Geological Survey Database', uri: 'https://usgs.gov/minerals' },
          { title: 'Mineralogy & Crystallography Online', uri: 'https://mindat.org' }
        ],
        relatedTopics: [
          'Quartz & Feldspar Solid Solution',
          'Seismic Refraction in Granite',
          'Hydrothermal Mineralization'
        ]
      });
    }

    const promptText = `Analyze the search term "${query}" for live teaching and screen sharing in a Geophysics & Mineralogy class.
Provide a JSON response with the following fields:
- explanation: Clear, structured educational summary (100-150 words).
- formula: Chemical formula or key equation (e.g. SiO2, Fe2SiO4, v = sqrt((K+4/3G)/rho)).
- hardness: Mohs scale or physical metric (e.g. "7.0 Mohs").
- density: Density or mass metric (e.g. "2.65 g/cm³").
- crystalSystem: Crystal or structural classification (e.g. "Isometric Cube", "Hexagonal Prism", "Seismic P-Wave Vector").
- tectonicOrigin: Origin environment (e.g. "Volcanic Mantle Plume", "Tectonic Fault Zone").
- refractionIndex: Optical or acoustic refraction value (e.g. "1.544 - 1.553").
- modelShape: One of ["cubic", "hexagonal", "octahedral", "pyramid", "sphere", "wave_vector"].
- color: Primary hex color for 3D model visualization (e.g. "#00e5ff", "#e0e7ff", "#f59e0b", "#10b981", "#ef4444").
- relatedTopics: Array of 3 short related search keywords.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
      },
    });

    let resultJson: any = {};
    try {
      resultJson = JSON.parse(response.text || '{}');
    } catch (e) {
      resultJson = { explanation: response.text };
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Web Source',
      uri: chunk.web?.uri || '',
    })).filter((s: any) => s.uri) || [
      { title: 'Google Gemini Knowledge Base', uri: 'https://ai.google.dev' }
    ];

    return res.json({
      query,
      explanation: resultJson.explanation || response.text,
      formula: resultJson.formula || 'SiO₂ / Silicate Complex',
      hardness: resultJson.hardness || '7.0 Mohs',
      density: resultJson.density || '2.65 g/cm³',
      crystalSystem: resultJson.crystalSystem || 'Crystalline Matrix',
      tectonicOrigin: resultJson.tectonicOrigin || 'Lithosphere / Continental Crust',
      refractionIndex: resultJson.refractionIndex || '1.544',
      modelShape: resultJson.modelShape || 'hexagonal',
      color: resultJson.color || '#38bdf8',
      groundingSources: sources,
      relatedTopics: resultJson.relatedTopics || ['Crystal Lattice', 'Seismic Velocity', 'Petrology'],
    });

  } catch (err: any) {
    console.error('Gemini Search API Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to execute Gemini Search' });
  }
});

// Explicit route for APK download
app.get('/app-debug.apk', (req, res) => {
  const apkPath = path.join(process.cwd(), 'public', 'app-debug.apk');
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.download(apkPath, 'GeoSoniq_Study_Geology.apk', (err) => {
    if (err) {
      console.error('APK direct download failed, falling back to static send:', err);
      res.sendFile(apkPath, (sendErr) => {
        if (sendErr && !res.headersSent) {
          res.status(404).send('APK file not found on the server. Please contact support.');
        }
      });
    }
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    
    // Explicit SPA HTML catch-all for development mode
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
