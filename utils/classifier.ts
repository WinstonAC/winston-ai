import { ClassificationResult } from '@/types/agent';
import { classificationPrompt } from '@/prompts';

export async function classifyReply(
  emailContent: string,
  options: { detailed?: boolean } = {}
): Promise<ClassificationResult> {
  try {
    // TODO: Implement actual OpenAI API call
    // This is a placeholder for demonstration
    const mockClassification: ClassificationResult = {
      label: 'interested',
      confidence: 0.85,
      reasoning: options.detailed ? 'Positive language and explicit interest shown' : undefined
    };

    return mockClassification;
  } catch (error) {
    return {
      label: 'unknown',
      confidence: 0,
      reasoning: error instanceof Error ? error.message : 'Classification failed'
    };
  }
}

export function aggregateClassifications(
  classifications: ClassificationResult[]
): { label: string; confidence: number } {
  const counts: Record<string, { count: number; totalConfidence: number }> = {};

  classifications.forEach(c => {
    if (!counts[c.label]) {
      counts[c.label] = { count: 0, totalConfidence: 0 };
    }
    counts[c.label].count++;
    counts[c.label].totalConfidence += c.confidence;
  });

  let maxCount = 0;
  let maxLabel = 'unknown';
  let maxConfidence = 0;

  Object.entries(counts).forEach(([label, data]) => {
    if (data.count > maxCount) {
      maxCount = data.count;
      maxLabel = label;
      maxConfidence = data.totalConfidence / data.count;
    }
  });

  return { label: maxLabel, confidence: maxConfidence };
} 