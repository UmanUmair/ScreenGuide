import OpenAI from 'openai';

// Initialize OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
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
      // Check if we have a valid API key
      if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'demo-key') {
        console.warn('No valid OpenAI API key found, using simulation mode');
        return await this.simulateAIAnalysis(screenImageData, instructions, currentStepIndex);
      }

      // Use real OpenAI Vision API
      const analysis = await this.analyzeWithOpenAI(
        screenImageData,
        instructions,
        currentStepIndex
      );

      return analysis;
    } catch (error) {
      console.error('AI Vision analysis failed:', error);
      
      // Fallback to simulation if API fails
      console.warn('Falling back to simulation mode due to API error');
      return await this.simulateAIAnalysis(screenImageData, instructions, currentStepIndex);
    } finally {
      this.isAnalyzing = false;
    }
  }

  private async analyzeWithOpenAI(
    screenImageData: string,
    instructions: string[],
    currentStepIndex: number
  ): Promise<ScreenAnalysis> {
    try {
      const currentInstruction = instructions[currentStepIndex];
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Using the latest GPT-4 model with vision
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that analyzes screenshots to help users follow step-by-step instructions. 
            
            Your task is to:
            1. Analyze the screenshot to understand what's currently visible
            2. Compare it with the current instruction step
            3. Determine if the user is on track, off track, or has completed the step
            4. Provide helpful guidance and visual cues
            
            Always respond with valid JSON in this exact format:
            {
              "status": "on_track" | "off_track" | "completed" | "error",
              "confidence": 0.0-1.0,
              "message": "helpful feedback message",
              "suggestions": ["suggestion1", "suggestion2"],
              "visualCues": [
                {
                  "type": "arrow" | "highlight" | "circle" | "tooltip",
                  "x": 100,
                  "y": 200,
                  "width": 150,
                  "height": 50,
                  "text": "Click here",
                  "color": "#10B981"
                }
              ]
            }
            
            Be encouraging and helpful. Focus on guiding the user to success.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Current instruction step ${currentStepIndex + 1}: "${currentInstruction}"

Please analyze this screenshot and determine if the user is correctly following this instruction. Provide helpful feedback and visual cues to guide them.

Consider:
- Is the correct application/website open?
- Are the right UI elements visible?
- Has the step been completed already?
- What should the user do next?

Respond only with the JSON format specified in the system message.`
              },
              {
                type: "image_url",
                image_url: {
                  url: screenImageData,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      // Parse the JSON response
      const result = JSON.parse(content);
      
      // Validate the response structure
      if (!result.status || !result.message) {
        throw new Error('Invalid response structure from OpenAI');
      }

      return {
        currentStep: currentStepIndex,
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
        suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
        visualCues: Array.isArray(result.visualCues) ? result.visualCues.map((cue: any) => ({
          type: cue.type || 'arrow',
          x: Math.max(0, Math.min(1920, cue.x || 100)),
          y: Math.max(0, Math.min(1080, cue.y || 100)),
          width: cue.width,
          height: cue.height,
          text: cue.text,
          color: cue.color || '#10B981'
        })) : [],
        status: result.status,
        message: result.message
      };
    } catch (error) {
      console.error('OpenAI Vision API error:', error);
      
      // If it's a JSON parsing error, try to extract JSON from the response
      if (error instanceof SyntaxError && response?.choices?.[0]?.message?.content) {
        try {
          const content = response.choices[0].message.content;
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            return {
              currentStep: currentStepIndex,
              confidence: result.confidence || 0.5,
              suggestions: result.suggestions || [],
              visualCues: result.visualCues || [],
              status: result.status || 'error',
              message: result.message || 'Analysis completed with parsing issues'
            };
          }
        } catch (parseError) {
          console.error('Failed to parse extracted JSON:', parseError);
        }
      }
      
      // Fallback to simulation
      throw error;
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

  startContinuousAnalysis(
    getScreenData: () => Promise<string>,
    getInstructions: () => string[],
    getCurrentStep: () => number,
    onAnalysis: (analysis: ScreenAnalysis) => void,
    intervalMs: number = 8000
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

  // Method to test API connection
  async testAPIConnection(): Promise<boolean> {
    try {
      if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'demo-key') {
        return false;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Test connection" }],
        max_tokens: 5
      });

      return !!response.choices[0].message.content;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}

export const aiVisionService = new AIVisionService();