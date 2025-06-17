import OpenAI from 'openai';

// Initialize OpenAI client (you'll need to add your API key)
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  dangerouslyAllowBrowser: true // Only for demo - use backend in production
});

export interface ScreenAnalysis {
  currentStep: number;
  confidence: number;
  suggestions: string[];
  visualCues: VisualCue[];
  status: 'on_track' | 'off_track' | 'completed' | 'error';
  message: string;
}

export interface VisualCue {
  type: 'arrow' | 'highlight' | 'circle' | 'tooltip';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color?: string;
}

class AIVisionService {
  private isAnalyzing = false;
  private analysisInterval: NodeJS.Timeout | null = null;

  async analyzeScreen(
    screenImageData: string,
    instructions: string[],
    currentStepIndex: number
  ): Promise<ScreenAnalysis> {
    if (this.isAnalyzing) {
      throw new Error('Analysis already in progress');
    }

    this.isAnalyzing = true;

    try {
      // For demo purposes, we'll simulate AI analysis
      // In production, you'd send this to OpenAI Vision API
      const analysis = await this.simulateAIAnalysis(
        screenImageData,
        instructions,
        currentStepIndex
      );

      return analysis;
    } catch (error) {
      console.error('AI Vision analysis failed:', error);
      return {
        currentStep: currentStepIndex,
        confidence: 0,
        suggestions: ['Unable to analyze screen. Please continue manually.'],
        visualCues: [],
        status: 'error',
        message: 'Analysis failed. Continuing with manual guidance.'
      };
    } finally {
      this.isAnalyzing = false;
    }
  }

  private async simulateAIAnalysis(
    screenImageData: string,
    instructions: string[],
    currentStepIndex: number
  ): Promise<ScreenAnalysis> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const currentInstruction = instructions[currentStepIndex];
    
    // Simulate different analysis scenarios
    const scenarios = [
      {
        status: 'on_track' as const,
        confidence: 0.85,
        message: 'Perfect! You\'re following the instructions correctly.',
        suggestions: ['Continue with the current step', 'You\'re doing great!'],
        visualCues: [
          {
            type: 'arrow' as const,
            x: Math.random() * 800 + 100,
            y: Math.random() * 600 + 100,
            text: 'Click here next',
            color: '#10B981'
          }
        ]
      },
      {
        status: 'off_track' as const,
        confidence: 0.65,
        message: 'It looks like you might be on the wrong page or element.',
        suggestions: [
          'Try looking for the element mentioned in the instruction',
          'Make sure you\'re on the correct page',
          'Check if any popups or dialogs are blocking the view'
        ],
        visualCues: [
          {
            type: 'highlight' as const,
            x: Math.random() * 600 + 200,
            y: Math.random() * 400 + 150,
            width: 200,
            height: 50,
            text: 'Look for this area',
            color: '#F59E0B'
          }
        ]
      },
      {
        status: 'completed' as const,
        confidence: 0.95,
        message: 'Excellent! This step appears to be completed.',
        suggestions: ['Ready to move to the next step'],
        visualCues: [
          {
            type: 'circle' as const,
            x: Math.random() * 700 + 150,
            y: Math.random() * 500 + 100,
            text: '✓ Completed',
            color: '#10B981'
          }
        ]
      }
    ];

    // Randomly select a scenario for demo
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    return {
      currentStep: currentStepIndex,
      ...scenario
    };
  }

  async analyzeWithOpenAI(
    screenImageData: string,
    instructions: string[],
    currentStepIndex: number
  ): Promise<ScreenAnalysis> {
    try {
      const currentInstruction = instructions[currentStepIndex];
      
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this screenshot and determine if the user is correctly following this instruction: "${currentInstruction}". 
                
                Respond with a JSON object containing:
                - status: "on_track" | "off_track" | "completed" | "error"
                - confidence: number between 0-1
                - message: helpful feedback message
                - suggestions: array of helpful suggestions
                - visualCues: array of objects with {type, x, y, text, color} for UI overlays
                
                Focus on being helpful and encouraging.`
              },
              {
                type: "image_url",
                image_url: {
                  url: screenImageData
                }
              }
            ]
          }
        ],
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        currentStep: currentStepIndex,
        confidence: result.confidence || 0.5,
        suggestions: result.suggestions || [],
        visualCues: result.visualCues || [],
        status: result.status || 'on_track',
        message: result.message || 'Analysis completed'
      };
    } catch (error) {
      console.error('OpenAI Vision API error:', error);
      // Fallback to simulation
      return this.simulateAIAnalysis(screenImageData, instructions, currentStepIndex);
    }
  }

  startContinuousAnalysis(
    getScreenData: () => Promise<string>,
    getInstructions: () => string[],
    getCurrentStep: () => number,
    onAnalysis: (analysis: ScreenAnalysis) => void,
    intervalMs: number = 5000
  ) {
    this.stopContinuousAnalysis();
    
    this.analysisInterval = setInterval(async () => {
      try {
        const screenData = await getScreenData();
        const instructions = getInstructions();
        const currentStep = getCurrentStep();
        
        if (screenData && instructions.length > 0) {
          const analysis = await this.analyzeScreen(screenData, instructions, currentStep);
          onAnalysis(analysis);
        }
      } catch (error) {
        console.error('Continuous analysis error:', error);
      }
    }, intervalMs);
  }

  stopContinuousAnalysis() {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }

  isAnalysisRunning(): boolean {
    return this.isAnalyzing;
  }
}

export const aiVisionService = new AIVisionService();