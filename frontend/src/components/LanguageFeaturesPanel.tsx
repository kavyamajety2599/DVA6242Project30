// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend, BarChart, Bar } from 'recharts';
// import { type Grant } from './data/GrantData.ts';

// interface LanguageFeaturesPanelProps {
//   grants: Grant[];
//   showAdjusted: boolean;
// }

// export function LanguageFeaturesPanel({ grants, showAdjusted }: LanguageFeaturesPanelProps) {

//   const sentimentData = grants.slice(0, 150).map(g => ({
//     sentiment: g.sentiment,
//     probability: (showAdjusted ? (g as any).adjustedTerminationProb || g.terminationProbability : g.terminationProbability) * 100,
//     terminated: g.terminated,
//   }));

//   const complexityBins = [
//     { range: '0.0-0.3', min: 0, max: 0.3 },
//     { range: '0.3-0.5', min: 0.3, max: 0.5 },
//     { range: '0.5-0.7', min: 0.5, max: 0.7 },
//     { range: '0.7-1.0', min: 0.7, max: 1.0 },
//   ];

//   const complexityData = complexityBins.map(bin => {
//     const binGrants = grants.filter(g => g.languageComplexity >= bin.min && g.languageComplexity < bin.max);
//     return {
//       range: bin.range,
//       avgProb: binGrants.length > 0 
//         ? binGrants.reduce((sum, g) => 
//             sum + (showAdjusted ? (g as any).adjustedTerminationProb || g.terminationProbability : g.terminationProbability), 0
//           ) / binGrants.length * 100
//         : 0,
//       count: binGrants.length,
//     };
//   });

//   const readabilityBins = [
//     { range: '0-40', min: 0, max: 40 },
//     { range: '40-60', min: 40, max: 60 },
//     { range: '60-80', min: 60, max: 80 },
//     { range: '80-100', min: 80, max: 100 },
//   ];

//   const readabilityData = readabilityBins.map(bin => {
//     const binGrants = grants.filter(g => g.readabilityScore >= bin.min && g.readabilityScore < bin.max);
//     return {
//       range: bin.range,
//       avgProb: binGrants.length > 0 
//         ? binGrants.reduce((sum, g) => 
//             sum + (showAdjusted ? (g as any).adjustedTerminationProb || g.terminationProbability : g.terminationProbability), 0
//           ) / binGrants.length * 100
//         : 0,
//       count: binGrants.length,
//     };
//   });

//   const technicalData = grants.slice(0, 150).map(g => ({
//     density: g.technicalTermDensity,
//     probability: (showAdjusted ? (g as any).adjustedTerminationProb || g.terminationProbability : g.terminationProbability) * 100,
//     terminated: g.terminated,
//   }));

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//       <Card>
//         <CardHeader>
//           <CardTitle>Sentiment Analysis</CardTitle>
//           <CardDescription>Proposal sentiment vs termination probability</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ResponsiveContainer width="100%" height={300}>
//             <ScatterChart>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="sentiment" name="Sentiment" domain={[-0.5, 1]} />
//               <YAxis dataKey="probability" name="Probability %" />
//               <Tooltip cursor={{ strokeDasharray: '3 3' }} />
//               <Scatter name="Grants" data={sentimentData}>
//                 {sentimentData.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={entry.terminated ? '#ef4444' : '#3b82f6'} />
//                 ))}
//               </Scatter>
//             </ScatterChart>
//           </ResponsiveContainer>
//           <div className="mt-4 p-3 bg-slate-50 rounded-lg">
//             <p className="text-sm text-slate-600">
//               Negative sentiment correlates with higher termination rates. Positive, confident language tends to perform better.
//             </p>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Language Complexity</CardTitle>
//           <CardDescription>Average termination probability by complexity level</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={complexityData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="range" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="avgProb" fill="#8b5cf6" name="Avg Termination %" />
//             </BarChart>
//           </ResponsiveContainer>
//           <div className="mt-4 p-3 bg-slate-50 rounded-lg">
//             <p className="text-sm text-slate-600">
//               Higher complexity (0.7+) shows increased termination probability. Clear, accessible language may be preferred.
//             </p>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Readability Score</CardTitle>
//           <CardDescription>Impact of readability on termination rates</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={readabilityData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="range" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line type="monotone" dataKey="avgProb" stroke="#06b6d4" strokeWidth={2} name="Avg Termination %" />
//             </LineChart>
//           </ResponsiveContainer>
//           <div className="mt-4 p-3 bg-slate-50 rounded-lg">
//             <p className="text-sm text-slate-600">
//               Lower readability scores (less than 50) correlate with higher termination probabilities.
//             </p>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Technical Term Density</CardTitle>
//           <CardDescription>Relationship between jargon density and outcomes</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ResponsiveContainer width="100%" height={300}>
//             <ScatterChart>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="density" name="Technical Density" domain={[0, 1]} />
//               <YAxis dataKey="probability" name="Probability %" />
//               <Tooltip cursor={{ strokeDasharray: '3 3' }} />
//               <Scatter name="Grants" data={technicalData}>
//                 {technicalData.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={entry.terminated ? '#ef4444' : '#3b82f6'} />
//                 ))}
//               </Scatter>
//             </ScatterChart>
//           </ResponsiveContainer>
//           <div className="mt-4 p-3 bg-slate-50 rounded-lg">
//             <p className="text-sm text-slate-600">
//               Moderate technical term density appears optimal. Very high density may hinder comprehension.
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
