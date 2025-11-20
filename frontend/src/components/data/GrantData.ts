import grantsData from './grants.json';

export interface Grant {
  id: string;
  title: string;
  field: string;
  year: number;
  agency: string;
  amount: number;
  gender: "Male" | "Female";
  race: "Minority" | "Non-Minority";
  institutionPrestige: "High" | "Medium" | "Low";
  piExperience: number;
  sentiment: number;
  languageComplexity: number; 
  technicalTermDensity: number;
  readabilityScore: number; 
  proposalLength: number; 
  terminated: boolean;
  terminationProbability: number; 
  modelPrediction: number;
  keywords: string[];
  biasFlags: BiasFlag[];
}

export interface BiasFlag {
  type: "Gender" | "Race" | "Institution" | "Experience";
  severity: "Low" | "Moderate" | "High";
  impact: number; 
}

export interface BiasAdjustments {
  genderBias: number;
  raceBias: number;
  institutionBias: number;
  experienceBias: number;
}

export interface KeywordData {
  keyword: string;
  terminationWeight: number; 
  frequency: number;
  avgTerminationRate: number; 
  sampleGrants: {
    title: string;
    terminated: boolean;
    confidence: number;
  }[];
}

export interface FairnessMetrics {
  demographicParity: {
    gender: number;
    race: number;
    institution: number;
  };
  equalityOfOpportunity: {
    gender: number;
    race: number;
    institution: number;
  };
}

// --- Main Data Loading Function ---
export function generateGrantData(): Grant[] {
  // Directly return the imported JSON data
  // We cast it to Grant[] to ensure TypeScript is happy with the types
  return grantsData as unknown as Grant[];
}

// --- Metric Calculation Functions ---

export function calculateKeywordData(grants: Grant[]): KeywordData[] {
  const keywordMap = new Map<string, {
      totalCount: number;
      terminatedCount: number;
      sampleGrants: { title: string; terminated: boolean; confidence: number; }[];
    }>();

  grants.forEach((grant) => {
    grant.keywords.forEach((keyword) => {
      if (!keywordMap.has(keyword)) {
        keywordMap.set(keyword, { totalCount: 0, terminatedCount: 0, sampleGrants: [] });
      }
      const data = keywordMap.get(keyword)!;
      data.totalCount++;
      if (grant.terminated) data.terminatedCount++;
      
      // Keep a sample of up to 5 grants for the tooltip
      if (data.sampleGrants.length < 5) {
        data.sampleGrants.push({
          title: grant.title,
          terminated: grant.terminated,
          confidence: grant.terminationProbability,
        });
      }
    });
  });

  const overallTerminationRate = grants.filter((g) => g.terminated).length / (grants.length || 1);
  const keywordData: KeywordData[] = [];
  
  keywordMap.forEach((data, keyword) => {
    const avgTerminationRate = data.terminatedCount / (data.totalCount || 1);
    const terminationWeight = avgTerminationRate - overallTerminationRate;

    keywordData.push({
      keyword,
      terminationWeight,
      frequency: data.totalCount,
      avgTerminationRate,
      sampleGrants: data.sampleGrants,
    });
  });

  return keywordData.sort((a, b) => Math.abs(b.terminationWeight) - Math.abs(a.terminationWeight));
}

export function calculateFairnessMetrics(grants: Grant[], showAdjusted: boolean = false): FairnessMetrics {
  const getProbability = (g: Grant) =>
    showAdjusted && (g as any).adjustedTerminationProb !== undefined
      ? (g as any).adjustedTerminationProb
      : g.terminationProbability;

  const calculateMetrics = (groupKey: keyof Grant, groupA: string, groupB: string) => {
    const groupAData = grants.filter((g) => g[groupKey] === groupA);
    const groupBData = grants.filter((g) => g[groupKey] === groupB);
    
    const probA = groupAData.reduce((sum, g) => sum + getProbability(g), 0) / (groupAData.length || 1);
    const probB = groupBData.reduce((sum, g) => sum + getProbability(g), 0) / (groupBData.length || 1);
    const dp = Math.min(probA, probB) / (Math.max(probA, probB) || 1);

    // Equality of Opportunity: Ratio of Actual Termination Rates
    const rateA = groupAData.filter(g => g.terminated).length / (groupAData.length || 1);
    const rateB = groupBData.filter(g => g.terminated).length / (groupBData.length || 1);
    const eo = Math.min(rateA, rateB) / (Math.max(rateA, rateB) || 1);
    
    return { dp, eo };
  };

  const genderMetrics = calculateMetrics('gender', 'Male', 'Female');
  const raceMetrics = calculateMetrics('race', 'Minority', 'Non-Minority');
  const institutionMetrics = calculateMetrics('institutionPrestige', 'High', 'Low');

  return {
    demographicParity: {
      gender: genderMetrics.dp,
      race: raceMetrics.dp,
      institution: institutionMetrics.dp,
    },
    equalityOfOpportunity: {
      gender: genderMetrics.eo,
      race: raceMetrics.eo,
      institution: institutionMetrics.eo,
    },
  };
}