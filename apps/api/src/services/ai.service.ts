// AI Service for generating scripts from recordings
// Supports both real AI (OpenAI/Anthropic) and mock mode for testing

import { Recording, GeneratedScript } from '../models/recording';

interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'mock';
  apiKey?: string;
  model?: string;
}

class AIService {
  private config: AIServiceConfig;

  constructor(config?: AIServiceConfig) {
    this.config = config || {
      provider: (process.env.AI_PROVIDER as 'openai' | 'anthropic' | 'mock') || 'mock',
      apiKey: process.env.AI_API_KEY,
      model: process.env.AI_MODEL || 'gpt-4-vision-preview',
    };
  }

  /**
   * Generate a script from a recording
   */
  async generateScriptFromRecording(recording: Recording): Promise<GeneratedScript> {
    if (this.config.provider === 'mock') {
      return this.generateMockScript(recording);
    }

    if (this.config.provider === 'openai') {
      return this.generateWithOpenAI(recording);
    }

    if (this.config.provider === 'anthropic') {
      return this.generateWithAnthropic(recording);
    }

    throw new Error(`Unsupported AI provider: ${this.config.provider}`);
  }

  /**
   * Generate a mock script for testing (no API key required)
   */
  private async generateMockScript(recording: Recording): Promise<GeneratedScript> {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const steps = recording.interactions
      .filter((i) => i.type === 'click' || i.type === 'input')
      .map((interaction) => {
        let title = '';
        let description = '';
        let actionType = interaction.type;

        if (interaction.type === 'click') {
          const elementText = interaction.elementText || 'element';
          title = `Click the ${elementText}`;
          description = `Click on the ${elementText} to proceed with the next step. This will ${this.generateClickAction(elementText)}.`;
        } else if (interaction.type === 'input') {
          const elementText = interaction.elementText || 'field';
          title = `Enter information in ${elementText}`;
          description = `Type the required information into the ${elementText}. Make sure to provide accurate data.`;
          actionType = 'input';
        }

        return {
          title,
          description,
          elementSelector: interaction.selector,
          actionType,
        };
      });

    // Generate a title based on the start URL and interactions
    const domain = new URL(recording.startUrl).hostname;
    const title = `${recording.pageTitle || 'Training Script'} - ${domain}`;

    return {
      title,
      steps,
    };
  }

  /**
   * Generate a click action description
   */
  private generateClickAction(elementText: string): string {
    const lowerText = elementText.toLowerCase();
    
    if (lowerText.includes('submit') || lowerText.includes('save')) {
      return 'save your changes';
    }
    if (lowerText.includes('login') || lowerText.includes('sign in')) {
      return 'log you into the system';
    }
    if (lowerText.includes('next') || lowerText.includes('continue')) {
      return 'move to the next step';
    }
    if (lowerText.includes('cancel') || lowerText.includes('close')) {
      return 'cancel the current action';
    }
    if (lowerText.includes('delete') || lowerText.includes('remove')) {
      return 'remove the selected item';
    }
    if (lowerText.includes('add') || lowerText.includes('create')) {
      return 'add a new item';
    }
    if (lowerText.includes('edit') || lowerText.includes('modify')) {
      return 'modify the existing item';
    }
    
    return 'perform the associated action';
  }

  /**
   * Generate script using OpenAI GPT-4 Vision
   */
  private async generateWithOpenAI(_recording: Recording): Promise<GeneratedScript> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Note: This would require the OpenAI SDK to be installed
    // For now, throw an error indicating it's not implemented
    throw new Error('OpenAI integration requires API key configuration and SDK installation');

    // Example implementation (commented out):
    /*
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: this.config.apiKey });

    const prompt = this.buildPrompt(recording);
    const messages = [
      {
        role: 'system',
        content: 'You are an expert technical writer creating training content.',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          ...recording.interactions
            .filter((i) => i.screenshot)
            .map((i) => ({
              type: 'image_url',
              image_url: { url: i.screenshot },
            })),
        ],
      },
    ];

    const response = await openai.chat.completions.create({
      model: this.config.model,
      messages,
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    });

    return JSON.parse(response.choices[0].message.content);
    */
  }

  /**
   * Generate script using Anthropic Claude
   */
  private async generateWithAnthropic(_recording: Recording): Promise<GeneratedScript> {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    throw new Error('Anthropic integration requires API key configuration and SDK installation');
  }

  /**
   * Build the prompt for AI generation
   */
  private buildPrompt(recording: Recording): string {
    return `
You are an expert technical writer creating training content.

I will provide a recording of user interactions on a website, including:
- Screenshots at each step
- Element selectors clicked/interacted with
- Input values entered (sanitized)
- Navigation flow

Generate a training script with the following structure:
- Overall script title (concise, action-oriented)
- For each interaction, generate:
  - Step title (5-7 words, imperative mood: "Click the Login button")
  - Step description (1-2 sentences explaining why and what happens)
  - Keep existing element selector
  - Action type (click, input, etc.)

Output as JSON matching this schema:
{
  "title": "string",
  "steps": [{
    "title": "string",
    "description": "string",
    "elementSelector": "string",
    "actionType": "string"
  }]
}

Recording data:
${JSON.stringify(recording, null, 2)}
`;
  }
}

export const aiService = new AIService();
