/**
 * OpenAI-compatible Client
 * Supports both OpenAI and Zhipu AI APIs
 */

import { getAIConfig } from '../../config/ai.config';
import {
  AIMessage,
  AIChatOptions,
  AIChatResponse,
  AIError,
  AIErrorType,
} from '../../internal/ai/types/ai-config.types';

/**
 * OpenAI-compatible Client
 */
export class OpenAIClient {
  private readonly config = getAIConfig();
  private readonly headers: Record<string, string>;

  constructor() {
    // Validate configuration
    if (!this.config.apiKey) {
      throw new AIError(
        AIErrorType.CONFIGURATION_ERROR,
        'AI API key is not configured'
      );
    }

    // Set up headers
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };

    // Log initialization (without exposing key)
    console.log('✅ AI Client initialized:', {
      provider: this.config.provider,
      endpoint: this.config.apiEndpoint,
      model: this.config.model,
    });
  }

  /**
   * Send chat completion request
   * @param messages Array of chat messages
   * @param options Chat options
   * @returns AI response
   */
  async chat(
    messages: AIMessage[],
    options?: AIChatOptions
  ): Promise<AIChatResponse> {
    const requestOptions = {
      temperature: options?.temperature ?? this.config.temperature,
      max_tokens: options?.maxTokens ?? this.config.maxTokens,
      top_p: options?.topP ?? this.config.topP,
      stream: options?.stream ?? false,
    };

    const requestBody = {
      model: this.config.model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      ...requestOptions,
    };

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retry attempt ${attempt}/${this.config.maxRetries}`);
          await this.delay(this.config.retryDelay * attempt);
        }

        const response = await this.makeRequest(requestBody, options?.timeout);
        return response;

      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (error instanceof AIError) {
          if (
            error.type === AIErrorType.API_KEY_INVALID ||
            error.type === AIErrorType.QUOTA_EXCEEDED ||
            error.type === AIErrorType.PARSE_ERROR
          ) {
            throw error;
          }
        }

        // Log retry attempt
        console.warn(`⚠️  Request failed (attempt ${attempt + 1}):`, error);
      }
    }

    // All retries failed
    throw new AIError(
      AIErrorType.UNKNOWN_ERROR,
      `Failed after ${this.config.maxRetries} retries`,
      { originalError: lastError?.message }
    );
  }

  /**
   * Make HTTP request to AI API
   * @param requestBody Request body
   * @param timeout Optional timeout override
   * @returns AI response
   */
  private async makeRequest(
    requestBody: any,
    timeout?: number
  ): Promise<AIChatResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      timeout ?? this.config.timeout
    );

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Parse response
      const data = await response.json();

      // Validate response structure
      this.validateResponse(data);

      // Extract content and usage
      const choice = data.choices[0];
      const content = choice.message?.content || '';

      if (!content) {
        throw new AIError(
          AIErrorType.INVALID_RESPONSE,
          'AI returned empty content'
        );
      }

      const usage = data.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      };

      return {
        content,
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        },
        model: data.model || this.config.model,
        finishReason: choice.finish_reason || 'stop',
      };

    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle AbortError (timeout)
      if (error.name === 'AbortError') {
        throw new AIError(
          AIErrorType.TIMEOUT,
          `Request timeout after ${timeout || this.config.timeout}ms`
        );
      }

      // Re-throw AI errors
      if (error instanceof AIError) {
        throw error;
      }

      // Network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new AIError(
          AIErrorType.NETWORK_ERROR,
          'Network error: Unable to reach AI API',
          { originalError: error.message }
        );
      }

      // Unknown errors
      throw new AIError(
        AIErrorType.UNKNOWN_ERROR,
        error.message || 'Unknown error occurred',
        { originalError: error }
      );
    }
  }

  /**
   * Handle error responses from API
   * @param response Fetch response object
   * @throws AIError with appropriate type
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorType = AIErrorType.UNKNOWN_ERROR;

    try {
      const errorData = await response.json();

      // Extract error message from common formats
      if (errorData.error) {
        errorMessage = errorData.error.message || errorMessage;

        // Determine error type
        if (response.status === 401) {
          errorType = AIErrorType.API_KEY_INVALID;
        } else if (response.status === 429) {
          errorType = errorData.error?.type?.includes('quota')
            ? AIErrorType.QUOTA_EXCEEDED
            : AIErrorType.RATE_LIMIT_EXCEEDED;
        }
      }
    } catch {
      // If parsing fails, use default error message
    }

    throw new AIError(errorType, errorMessage, { status: response.status });
  }

  /**
   * Validate response structure
   * @param data Response data
   * @throws AIError if response is invalid
   */
  private validateResponse(data: any): void {
    if (!data) {
      throw new AIError(
        AIErrorType.INVALID_RESPONSE,
        'Empty response from AI API'
      );
    }

    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new AIError(
        AIErrorType.INVALID_RESPONSE,
        'Response missing choices array'
      );
    }

    const choice = data.choices[0];
    if (!choice.message || typeof choice.message.content !== 'string') {
      throw new AIError(
        AIErrorType.INVALID_RESPONSE,
        'Invalid message structure in response'
      );
    }
  }

  /**
   * Delay helper for retries
   * @param ms Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health check - verify API is accessible
   * @returns true if healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.chat([
        { role: 'user', content: 'Hi' }
      ], {
        maxTokens: 10,
        timeout: 5000,
      });

      return response.content.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Estimate cost for a request (in CNY cents)
   * NOTE: Free for users with Zhipu Coding Plan (2M tokens/5 hours)
   * This estimation is for standard paid pricing
   *
   * @param inputTokens Input token count
   * @param outputTokens Output token count
   * @returns Estimated cost in cents (0 for coding plan users)
   */
  estimateCost(inputTokens: number, outputTokens: number): number {
    // Check if user has coding plan (from env or config)
    const hasCodingPlan = process.env.ZHIPU_CODING_PLAN === 'true';

    if (hasCodingPlan) {
      // Coding plan users: FREE (2M tokens per 5 hours)
      return 0;
    }

    // Standard paid pricing (GLM-4-Flash as of 2024)
    // Input: ¥0.1/1k tokens, Output: ¥0.5/1k tokens
    // GLM-4: Input: ¥1/1k tokens, Output: ¥2/1k tokens

    let inputRate = 0.1;   // per 1k tokens
    let outputRate = 0.5;  // per 1k tokens

    if (this.config.model.includes('glm-4') && !this.config.model.includes('flash')) {
      inputRate = 1.0;
      outputRate = 2.0;
    }

    const inputCost = (inputTokens / 1000) * inputRate;
    const outputCost = (outputTokens / 1000) * outputRate;
    const totalCost = inputCost + outputCost;

    // Convert yuan to cents
    return Math.round(totalCost * 100);
  }
}

/**
 * Create singleton instance
 */
let clientInstance: OpenAIClient | null = null;

export function getAIClient(): OpenAIClient {
  if (!clientInstance) {
    clientInstance = new OpenAIClient();
  }
  return clientInstance;
}

/**
 * Reset client instance (for testing)
 */
export function resetAIClient(): void {
  clientInstance = null;
}
