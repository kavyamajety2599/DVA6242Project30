// import { type  Grant, type BiasFlag } from "./GrantData";

// export async function loadModelData(): Promise<Grant[]> {
//   const y_true = await fetch("/mnt/data/y_true.json").then(r => r.json());
//   const y_pred = await fetch("/mnt/data/y_pred.json").then(r => r.json());
//   const y_prob = await fetch("/mnt/data/y_prob.json").then(r => r.json());

//   const grants: Grant[] = [];

//   for (let i = 0; i < y_true.length; i++) {
//     grants.push({
//       id: `G${i.toString().padStart(5, "0")}`,
//       title: `Project ${i}`,
//       field: "Medicine",
//       year: 2024,
//       agency: "NIH",
//       amount: 1000000,
//       gender: "Male",
//       race: "Non-Minority",
//       institutionPrestige: "Medium",
//       piExperience: 10,
//       sentiment: 0.5,
//       languageComplexity: 0.5,
//       technicalTermDensity: 0.5,
//       readabilityScore: 60,
//       proposalLength: 20,

//       terminated: Boolean(y_true[i]),
//       terminationProbability: y_prob[i],

//       keywords: ["research", "trial"],
//       biasFlags: [],

//       prediction: y_pred[i], 
//     });
//   }

//   return grants;
// }
