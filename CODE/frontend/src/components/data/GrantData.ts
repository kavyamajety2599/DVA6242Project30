import grantsData from './grants.json';
import wordBiasData from './word_bias.json';
import grantTableData from './final_project_data.json';

export interface Grant {
  id: string;
  awardNumber: string;
  title: string;
  recipient: string;
  agency: string;
  amount: number;
  status: string;
  year: number;
  
  terminated: boolean;
  terminationProbability: number;
  modelPrediction: number;
  
  keywords: string[];
  biasFlags: BiasFlag[];
  
  gender: string;
  race: string;
  institutionPrestige: string;
  piExperience: number;
  sentiment: number;
  readabilityScore: number;
  proposalLength: number;
}

export interface BiasFlag {
  type: string;
  severity: "Low" | "Moderate" | "High";
  impact: number; 
}

export interface KeywordData {
  keyword: string;
  frequency: number;          
  riskLevel: string;          
  avgTerminationRate: number; 
  count: number;              
  sampleGrants: { title: string; terminated: boolean; confidence: number; }[];
}

export interface FairnessMetrics {
  demographicParity: {
    gender: number;
    race: number;
    mentalHealth: number;
    lgbtq: number;
    climate: number;
  };
  equalityOfOpportunity: {
    gender: number;
    race: number;
    mentalHealth: number;
    lgbtq: number;
    climate: number;
  };
}

export function generateGrantData(): Grant[] {
  const metadataMap = new Map<string, any>();
  (grantTableData as any[]).forEach((item) => {
    if (item.award_number) {
      metadataMap.set(item.award_number, item);
    }
  });

  return (grantsData as any[]).map((item) => {

    const awardNum = String(item.awardNumber || item.award_number || item.id || "Unknown");
    

    const meta = metadataMap.get(awardNum) || {};
    return {
      ...item,
      id: String(item.id || awardNum),
      awardNumber: awardNum,
      
      title: meta.Project || "Untitled Project",
      recipient: meta.recipient_name || "Unknown Recipient",
      agency: meta.awarding_office || "Unknown Agency",
      amount: Number(meta.award_amount || 0),
      status: meta.grant_status || "Unknown",

      
      year: Number(item.year || 2025),
      terminated: !!item.terminated,
      terminationProbability: Number(item.terminationProbability || 0),
      modelPrediction: Number(item.modelPrediction || 0),
      keywords: Array.isArray(item.keywords) ? item.keywords : [],
      biasFlags: Array.isArray(item.biasFlags) ? item.biasFlags : [],
      
      gender: item.gender || "Unknown",
      race: item.race || "Unknown",
      institutionPrestige: item.institutionPrestige || "Medium",
      piExperience: Number(item.piExperience || 5),
      sentiment: Number(item.sentiment || 0),
      readabilityScore: Number(item.readabilityScore || 50),
      proposalLength: Number(item.proposalLength || 0)
    };
  });
}

export function calculateKeywordData(grants: Grant[]): KeywordData[] {
  const biasLookup = new Map<string, any>();
  const targetWords = (wordBiasData as any[]).slice(-60);
  (targetWords as any[]).forEach((item: any) => {
    if (item.term) biasLookup.set(item.term.toLowerCase(), item);
  });

  const keywordMap = new Map<string, any>();
  grants.forEach((grant) => {
    grant.keywords.forEach((keyword) => {
      const lowerKey = keyword.toLowerCase();
      if (biasLookup.has(lowerKey)) {
        if (!keywordMap.has(lowerKey)) keywordMap.set(lowerKey, { totalCount: 0, terminatedCount: 0, sampleGrants: [] });
        const data = keywordMap.get(lowerKey);
        data.totalCount++;
        if (grant.terminated) data.terminatedCount++;
        if (data.sampleGrants.length < 5) {
          data.sampleGrants.push({ title: grant.title, terminated: grant.terminated, confidence: grant.terminationProbability });
        }
      }
    });
  });

  const keywordData: KeywordData[] = [];
  keywordMap.forEach((data, keyword) => {
    const biasInfo = biasLookup.get(keyword);
    if (biasInfo) {
      keywordData.push({
        keyword: biasInfo.term,
        frequency: biasInfo.avg_tfidf_freq, 
        riskLevel: biasInfo.risk_level,     
        avgTerminationRate: data.terminatedCount / (data.totalCount || 1),
        count: data.totalCount,
        sampleGrants: data.sampleGrants,
      });
    }
  });

  const riskPriority: Record<string, number> = { 'High Risk': 4, 'Mod Risk': 3, 'Low Risk': 2, 'Protective': 1 };
  return keywordData.sort((a, b) => {
    const pA = riskPriority[a.riskLevel] || 0;
    const pB = riskPriority[b.riskLevel] || 0;
    return pA !== pB ? pB - pA : b.frequency - a.frequency;
  });
}

export function calculateFairnessMetrics(grants: Grant[], showAdjusted: boolean = false): FairnessMetrics {
  const getProbability = (g: Grant) => g.terminationProbability;

  const calcMetrics = (biasType: string) => {
    const flagged = grants.filter(g => g.biasFlags.some(f => f.type === biasType));
    const baseline = grants.filter(g => !g.biasFlags.some(f => f.type === biasType));
    
    const probF = flagged.reduce((s, g) => s + getProbability(g), 0) / (flagged.length || 1);
    const probB = baseline.reduce((s, g) => s + getProbability(g), 0) / (baseline.length || 1);
    const dp = Math.min(probF, probB) / (Math.max(probF, probB) || 1);

    const rateF = flagged.filter(g => g.terminated).length / (flagged.length || 1);
    const rateB = baseline.filter(g => g.terminated).length / (baseline.length || 1);
    const eo = Math.min(rateF, rateB) / (Math.max(rateF, rateB) || 1);
    
    return { dp, eo };
  };

  return {
    demographicParity: {
      gender: calcMetrics("Gender").dp,
      race: calcMetrics("Race").dp,
      mentalHealth: calcMetrics("MentalHealth").dp,
      lgbtq: calcMetrics("LGBTQ").dp,
      climate: calcMetrics("Climate").dp,
    },
    equalityOfOpportunity: {
      gender: calcMetrics("Gender").eo,
      race: calcMetrics("Race").eo,
      mentalHealth: calcMetrics("MentalHealth").eo,
      lgbtq: calcMetrics("LGBTQ").eo,
      climate: calcMetrics("Climate").eo,
    },
  };
}