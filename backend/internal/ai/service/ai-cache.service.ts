/**
 * AI Cache Service
 * Implements intelligent caching for AI analysis results to reduce costs and improve performance
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { getAIConfig } from '../../../config/ai.config';

interface CacheEntry {
  analysisId: number;
  reportId: number;
  mbtiType: string;
  dimensionScores: Record<string, number>;
  analysisType: string;
  createdAt: string;
  expiresAt: string;
}

interface SimilarityScore {
  score: number;
  entry: CacheEntry;
}

@Injectable()
export class AICacheService {
  private readonly logger = new Logger(AICacheService.name);
  private readonly redis: Redis;
  private readonly CACHE_PREFIX = 'ai:analysis:';
  private readonly CACHE_TTL = 60 * 60 * 24; // 24 hours default TTL
  private readonly SIMILARITY_THRESHOLD = 0.85; // 85% similarity threshold

  constructor(@Inject('REDIS_CLIENT') redis: Redis) {
    this.redis = redis;
  }

  /**
   * Cache an AI analysis result
   */
  async cacheAnalysis(
    analysisId: number,
    reportId: number,
    mbtiType: string,
    dimensionScores: Record<string, number>,
    analysisType: string,
    ttl: number = this.CACHE_TTL
  ): Promise<void> {
    try {
      const key = this.buildCacheKey(reportId, analysisType);
      const entry: CacheEntry = {
        analysisId,
        reportId,
        mbtiType,
        dimensionScores,
        analysisType,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
      };

      await this.redis.setex(key, ttl, JSON.stringify(entry));
      this.logger.log(`Cached analysis ${analysisId} for report ${reportId}`);
    } catch (error) {
      this.logger.error(`Failed to cache analysis: ${error.message}`, error.stack);
    }
  }

  /**
   * Get cached analysis for a specific report
   */
  async getCachedAnalysis(
    reportId: number,
    analysisType: string
  ): Promise<CacheEntry | null> {
    try {
      const key = this.buildCacheKey(reportId, analysisType);
      const data = await this.redis.get(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data) as CacheEntry;
    } catch (error) {
      this.logger.error(`Failed to get cached analysis: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Find similar cached analyses based on MBTI type and dimension scores
   * This enables reusing analyses for similar personality profiles
   */
  async findSimilarAnalysis(
    mbtiType: string,
    dimensionScores: Record<string, number>,
    analysisType: string,
    maxAgeHours: number = 24
  ): Promise<CacheEntry | null> {
    try {
      const pattern = `${this.CACHE_PREFIX}*:${analysisType}`;
      const keys = await this.redis.keys(pattern);

      if (keys.length === 0) {
        return null;
      }

      const similarities: SimilarityScore[] = [];

      for (const key of keys) {
        const data = await this.redis.get(key);
        if (!data) continue;

        const entry: CacheEntry = JSON.parse(data);

        // Skip if not same MBTI type or analysis type
        if (entry.mbtiType !== mbtiType || entry.analysisType !== analysisType) {
          continue;
        }

        // Check if entry is too old
        const createdAt = new Date(entry.createdAt);
        const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        if (ageHours > maxAgeHours) {
          continue;
        }

        // Calculate similarity score
        const similarity = this.calculateSimilarity(dimensionScores, entry.dimensionScores);
        if (similarity >= this.SIMILARITY_THRESHOLD) {
          similarities.push({ score: similarity, entry });
        }
      }

      if (similarities.length === 0) {
        return null;
      }

      // Sort by similarity score (descending) and return the best match
      similarities.sort((a, b) => b.score - a.score);
      const bestMatch = similarities[0];

      this.logger.log(
        `Found similar analysis ${bestMatch.entry.analysisId} with similarity ${bestMatch.score.toFixed(2)}`
      );

      return bestMatch.entry;
    } catch (error) {
      this.logger.error(`Failed to find similar analysis: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Calculate similarity between two dimension score profiles
   * Uses weighted Euclidean distance
   */
  private calculateSimilarity(
    scores1: Record<string, number>,
    scores2: Record<string, number>
  ): number {
    const dimensions = ['EI', 'SN', 'TF', 'JP'];
    let totalDistance = 0;

    for (const dim of dimensions) {
      const score1 = scores1[dim] || 50;
      const score2 = scores2[dim] || 50;
      const distance = Math.abs(score1 - score2);
      totalDistance += distance;
    }

    // Maximum possible distance is 200 (50 per dimension)
    // Convert distance to similarity score (1 - normalized_distance)
    const maxDistance = 200;
    const normalizedDistance = totalDistance / maxDistance;
    const similarity = 1 - normalizedDistance;

    return similarity;
  }

  /**
   * Invalidate cache for a specific report
   */
  async invalidateCache(reportId: number): Promise<void> {
    try {
      const pattern = `${this.CACHE_PREFIX}${reportId}:*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.log(`Invalidated ${keys.length} cache entries for report ${reportId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to invalidate cache: ${error.message}`, error.stack);
    }
  }

  /**
   * Clear all AI analysis cache
   */
  async clearAllCache(): Promise<void> {
    try {
      const pattern = `${this.CACHE_PREFIX}*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.log(`Cleared ${keys.length} AI analysis cache entries`);
      }
    } catch (error) {
      this.logger.error(`Failed to clear cache: ${error.message}`, error.stack);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalEntries: number;
    entriesByType: Record<string, number>;
    entriesByMBTI: Record<string, number>;
  }> {
    try {
      const pattern = `${this.CACHE_PREFIX}*`;
      const keys = await this.redis.keys(pattern);

      const entriesByType: Record<string, number> = {};
      const entriesByMBTI: Record<string, number> = {};

      for (const key of keys) {
        const data = await this.redis.get(key);
        if (!data) continue;

        const entry: CacheEntry = JSON.parse(data);

        // Count by analysis type
        entriesByType[entry.analysisType] = (entriesByType[entry.analysisType] || 0) + 1;

        // Count by MBTI type
        entriesByMBTI[entry.mbtiType] = (entriesByMBTI[entry.mbtiType] || 0) + 1;
      }

      return {
        totalEntries: keys.length,
        entriesByType,
        entriesByMBTI,
      };
    } catch (error) {
      this.logger.error(`Failed to get cache stats: ${error.message}`, error.stack);
      return {
        totalEntries: 0,
        entriesByType: {},
        entriesByMBTI: {},
      };
    }
  }

  /**
   * Build cache key
   */
  private buildCacheKey(reportId: number, analysisType: string): string {
    return `${this.CACHE_PREFIX}${reportId}:${analysisType}`;
  }
}
