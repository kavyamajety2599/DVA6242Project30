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
  sentiment: number; // -1 to 1
  languageComplexity: number; // 0 to 1
  technicalTermDensity: number; // 0 to 1
  readabilityScore: number; // 0 to 100
  proposalLength: number; // pages
  terminated: boolean;
  terminationProbability: number; // 0 to 1
  keywords: string[];
  biasFlags: BiasFlag[];
}

export interface BiasFlag {
  type: "Gender" | "Race" | "Institution" | "Experience";
  severity: "Low" | "Moderate" | "High";
  impact: number; // percentage points added to termination probability
}

export interface BiasAdjustments {
  genderBias: number;
  raceBias: number;
  institutionBias: number;
  experienceBias: number;
}

export interface KeywordData {
  keyword: string;
  terminationWeight: number; // correlation with termination (-1 to 1)
  frequency: number;
  avgTerminationRate: number; // 0 to 1
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

const fields = [
  "Medicine",
  "Engineering",
  "Social Sciences",
  "Biology",
  "Physics",
  "Computer Science",
  "Chemistry",
  "Psychology",
];
const agencies = ["NIH", "NSF", "DOE", "NASA", "DARPA"];
const genders: ("Male" | "Female")[] = ["Male", "Female"];
const races: ("Minority" | "Non-Minority")[] = [
  "Minority",
  "Non-Minority",
];
const prestiges: ("High" | "Medium" | "Low")[] = [
  "High",
  "Medium",
  "Low",
];

const keywordPool = [
  "mental health",
  "substance use",
  "HIV",
  "pilot study",
  "training",
  "outreach",
  "community health",
  "clinical trial",
  "adolescent",
  "recovery",
  "intervention",
  "machine learning",
  "neural networks",
  "climate change",
  "renewable energy",
  "cancer research",
  "genomics",
  "biomarker",
  "stem cells",
  "vaccine",
  "quantum computing",
  "artificial intelligence",
  "data analysis",
  "algorithm",
  "social impact",
  "equity",
  "diversity",
  "underserved",
  "disparities",
  "education",
  "workforce",
  "innovation",
  "collaboration",
  "interdisciplinary",
  "longitudinal study",
  "randomized control",
  "cohort",
  "epidemiology",
  "protein structure",
  "molecular dynamics",
  "crystallography",
  "synthesis",
  "behavioral",
  "cognitive",
  "neuroimaging",
  "psychotherapy",
];

const grantTitlePrefixes = [
  "Understanding",
  "Investigating",
  "Exploring",
  "Developing",
  "Advancing",
  "Novel Approaches to",
  "Comprehensive Study of",
  "Innovative Strategies for",
  "Integrated Framework for",
  "Community-Based",
  "Longitudinal Analysis of",
  "Mechanisms of",
  "Impact of",
  "Efficacy of",
  "Evaluation of",
];

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(random(min, max + 1));
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomChoices<T>(arr: T[], count: number): T[] {
  const result: T[] = [];
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function generateTitle(
  keywords: string[],
  field: string,
): string {
  const prefix = randomChoice(grantTitlePrefixes);
  const mainKeyword = keywords[0] || field;
  return `${prefix} ${mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)} in ${field}`;
}

export function generateGrantData(): Grant[] {
  const grants: Grant[] = [];

  for (let i = 0; i < 500; i++) {
    const gender = randomChoice(genders);
    const race = randomChoice(races);
    const institutionPrestige = randomChoice(prestiges);
    const piExperience = randomInt(1, 25);
    const sentiment = random(-0.3, 0.8);
    const languageComplexity = random(0.3, 0.95);
    const technicalTermDensity = random(0.2, 0.85);
    const readabilityScore = random(30, 85);
    const proposalLength = randomInt(10, 50);
    const field = randomChoice(fields);
    const year = randomInt(2020, 2024);
    const agency = randomChoice(agencies);
    const keywords = randomChoices(
      keywordPool,
      randomInt(2, 5),
    );

    // Calculate termination probability based on various factors
    let terminationProb = 0.15; // base rate
    const biasFlags: BiasFlag[] = [];

    // Gender bias
    if (gender === "Female") {
      const impact = 0.08;
      terminationProb += impact;
      biasFlags.push({
        type: "Gender",
        severity: "Moderate",
        impact: impact * 100,
      });
    }

    // Race bias
    if (race === "Minority") {
      const impact = 0.07;
      terminationProb += impact;
      biasFlags.push({
        type: "Race",
        severity: "Moderate",
        impact: impact * 100,
      });
    }

    // Institution prestige bias
    if (institutionPrestige === "Low") {
      const impact = 0.12;
      terminationProb += impact;
      biasFlags.push({
        type: "Institution",
        severity: "High",
        impact: impact * 100,
      });
    } else if (institutionPrestige === "Medium") {
      const impact = 0.05;
      terminationProb += impact;
      biasFlags.push({
        type: "Institution",
        severity: "Low",
        impact: impact * 100,
      });
    }

    // Experience bias
    if (piExperience < 5) {
      const impact = 0.1;
      terminationProb += impact;
      biasFlags.push({
        type: "Experience",
        severity: "High",
        impact: impact * 100,
      });
    }

    // Language features
    if (sentiment < 0) terminationProb += 0.06;
    if (languageComplexity > 0.75) terminationProb += 0.07;
    if (technicalTermDensity > 0.7) terminationProb += 0.04;
    if (readabilityScore < 50) terminationProb += 0.05;

    // Keyword-based patterns
    if (
      keywords.includes("mental health") ||
      keywords.includes("substance use")
    )
      terminationProb += 0.05;
    if (keywords.includes("pilot study"))
      terminationProb += 0.06;
    if (
      keywords.includes("HIV") ||
      keywords.includes("vaccine")
    )
      terminationProb -= 0.03;
    if (
      keywords.includes("machine learning") ||
      keywords.includes("artificial intelligence")
    )
      terminationProb -= 0.02;

    // Proposal length
    if (proposalLength < 15) terminationProb += 0.03;

    // Agency specific patterns
    if (agency === "DARPA") terminationProb += 0.05;
    if (
      agency === "NIH" &&
      field !== "Medicine" &&
      field !== "Biology"
    )
      terminationProb += 0.08;

    // Clamp probability
    terminationProb = Math.max(
      0.02,
      Math.min(0.85, terminationProb),
    );

    // Determine if actually terminated
    const terminated = Math.random() < terminationProb;

    const title = generateTitle(keywords, field);

    grants.push({
      id: `G${i.toString().padStart(5, "0")}`,
      title,
      field,
      year,
      agency,
      amount: randomInt(100000, 2000000),
      gender,
      race,
      institutionPrestige,
      piExperience,
      sentiment,
      languageComplexity,
      technicalTermDensity,
      readabilityScore,
      proposalLength,
      terminated,
      terminationProbability: terminationProb,
      keywords,
      biasFlags,
    });
  }

  return grants;
}

export function calculateKeywordData(
  grants: Grant[],
): KeywordData[] {
  const keywordMap = new Map<
    string,
    {
      totalCount: number;
      terminatedCount: number;
      sampleGrants: {
        title: string;
        terminated: boolean;
        confidence: number;
      }[];
    }
  >();

  grants.forEach((grant) => {
    grant.keywords.forEach((keyword) => {
      if (!keywordMap.has(keyword)) {
        keywordMap.set(keyword, {
          totalCount: 0,
          terminatedCount: 0,
          sampleGrants: [],
        });
      }
      const data = keywordMap.get(keyword)!;
      data.totalCount++;
      if (grant.terminated) data.terminatedCount++;
      if (data.sampleGrants.length < 5) {
        data.sampleGrants.push({
          title: grant.title,
          terminated: grant.terminated,
          confidence: grant.terminationProbability,
        });
      }
    });
  });

  const overallTerminationRate =
    grants.filter((g) => g.terminated).length / grants.length;

  const keywordData: KeywordData[] = [];
  keywordMap.forEach((data, keyword) => {
    const avgTerminationRate =
      data.terminatedCount / data.totalCount;
    const terminationWeight =
      avgTerminationRate - overallTerminationRate; // relative to baseline

    keywordData.push({
      keyword,
      terminationWeight,
      frequency: data.totalCount,
      avgTerminationRate,
      sampleGrants: data.sampleGrants,
    });
  });

  return keywordData.sort(
    (a, b) =>
      Math.abs(b.terminationWeight) -
      Math.abs(a.terminationWeight),
  );
}

export function calculateFairnessMetrics(
  grants: Grant[],
  showAdjusted: boolean = false,
): FairnessMetrics {
  const getProbability = (g: Grant) =>
    showAdjusted &&
    (g as any).adjustedTerminationProb !== undefined
      ? (g as any).adjustedTerminationProb
      : g.terminationProbability;

  // Gender metrics
  const maleProb =
    grants
      .filter((g) => g.gender === "Male")
      .reduce((sum, g) => sum + getProbability(g), 0) /
    grants.filter((g) => g.gender === "Male").length;
  const femaleProb =
    grants
      .filter((g) => g.gender === "Female")
      .reduce((sum, g) => sum + getProbability(g), 0) /
    grants.filter((g) => g.gender === "Female").length;
  const genderDP =
    Math.min(maleProb, femaleProb) /
    Math.max(maleProb, femaleProb);

  const maleTermRate =
    grants.filter((g) => g.gender === "Male" && g.terminated)
      .length /
    grants.filter((g) => g.gender === "Male").length;
  const femaleTermRate =
    grants.filter((g) => g.gender === "Female" && g.terminated)
      .length /
    grants.filter((g) => g.gender === "Female").length;
  const genderEO =
    Math.min(maleTermRate, femaleTermRate) /
    Math.max(maleTermRate, femaleTermRate);

  // Race metrics
  const minorityProb =
    grants
      .filter((g) => g.race === "Minority")
      .reduce((sum, g) => sum + getProbability(g), 0) /
    grants.filter((g) => g.race === "Minority").length;
  const nonMinorityProb =
    grants
      .filter((g) => g.race === "Non-Minority")
      .reduce((sum, g) => sum + getProbability(g), 0) /
    grants.filter((g) => g.race === "Non-Minority").length;
  const raceDP =
    Math.min(minorityProb, nonMinorityProb) /
    Math.max(minorityProb, nonMinorityProb);

  const minorityTermRate =
    grants.filter((g) => g.race === "Minority" && g.terminated)
      .length /
    grants.filter((g) => g.race === "Minority").length;
  const nonMinorityTermRate =
    grants.filter(
      (g) => g.race === "Non-Minority" && g.terminated,
    ).length /
    grants.filter((g) => g.race === "Non-Minority").length;
  const raceEO =
    Math.min(minorityTermRate, nonMinorityTermRate) /
    Math.max(minorityTermRate, nonMinorityTermRate);

  // Institution metrics
  const highProb =
    grants
      .filter((g) => g.institutionPrestige === "High")
      .reduce((sum, g) => sum + getProbability(g), 0) /
    grants.filter((g) => g.institutionPrestige === "High")
      .length;
  const lowProb =
    grants
      .filter((g) => g.institutionPrestige === "Low")
      .reduce((sum, g) => sum + getProbability(g), 0) /
    grants.filter((g) => g.institutionPrestige === "Low")
      .length;
  const institutionDP =
    Math.min(highProb, lowProb) / Math.max(highProb, lowProb);

  const highTermRate =
    grants.filter(
      (g) => g.institutionPrestige === "High" && g.terminated,
    ).length /
    grants.filter((g) => g.institutionPrestige === "High")
      .length;
  const lowTermRate =
    grants.filter(
      (g) => g.institutionPrestige === "Low" && g.terminated,
    ).length /
    grants.filter((g) => g.institutionPrestige === "Low")
      .length;
  const institutionEO =
    Math.min(highTermRate, lowTermRate) /
    Math.max(highTermRate, lowTermRate);

  return {
    demographicParity: {
      gender: genderDP,
      race: raceDP,
      institution: institutionDP,
    },
    equalityOfOpportunity: {
      gender: genderEO,
      race: raceEO,
      institution: institutionEO,
    },
  };
}

export interface KeywordData {
  keyword: string;              
  frequency: number;            
  terminationWeight: number;    
  avgTerminationRate: number; 
  sampleGrants: {
    title: string;
    confidence: number;
    terminated: boolean;
  }[];
}
