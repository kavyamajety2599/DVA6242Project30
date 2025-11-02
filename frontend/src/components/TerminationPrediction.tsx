import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import type { Grant } from './data/GrantData';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface TerminationPredictionProps {
  grants: Grant[];
  showAdjusted: boolean;
}

export function TerminationPrediction({  }: TerminationPredictionProps) {
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [prestige, setPrestige] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [experience, setExperience] = useState([10]);
  const [sentiment, setSentiment] = useState([0.5]);
  const [complexity, setComplexity] = useState([0.5]);
  const [readability, setReadability] = useState([60]);

  // Calculate prediction
  let prediction = 0.15; // base rate

  if (gender === 'Female') prediction += 0.08;
  if (prestige === 'Low') prediction += 0.12;
  if (prestige === 'Medium') prediction += 0.05;
  if (experience[0] < 5) prediction += 0.10;
  else if (experience[0] > 15) prediction -= 0.05;
  if (sentiment[0] < 0.2) prediction += 0.06;
  if (complexity[0] > 0.75) prediction += 0.07;
  if (readability[0] < 50) prediction += 0.05;

  prediction = Math.max(0, Math.min(1, prediction));

  // Risk factors
  const riskFactors = [
    {
      factor: 'Gender Bias',
      impact: gender === 'Female' ? 8 : 0,
      active: gender === 'Female',
    },
    {
      factor: 'Institution Prestige',
      impact: prestige === 'Low' ? 12 : prestige === 'Medium' ? 5 : 0,
      active: prestige !== 'High',
    },
    {
      factor: 'Early Career',
      impact: experience[0] < 5 ? 10 : 0,
      active: experience[0] < 5,
    },
    {
      factor: 'Negative Sentiment',
      impact: sentiment[0] < 0.2 ? 6 : 0,
      active: sentiment[0] < 0.2,
    },
    {
      factor: 'High Complexity',
      impact: complexity[0] > 0.75 ? 7 : 0,
      active: complexity[0] > 0.75,
    },
    {
      factor: 'Low Readability',
      impact: readability[0] < 50 ? 5 : 0,
      active: readability[0] < 50,
    },
  ].filter(f => f.active);

  // Feature importance data
  const featureImportance = [
    { feature: 'Institution Prestige', importance: 24 },
    { feature: 'PI Experience', importance: 18 },
    { feature: 'Language Complexity', importance: 16 },
    { feature: 'Gender', importance: 14 },
    { feature: 'Sentiment', importance: 12 },
    { feature: 'Readability', importance: 10 },
    { feature: 'Technical Density', importance: 6 },
  ];

  // Radar chart data
  const radarData = [
    { category: 'Experience', value: Math.min(100, (experience[0] / 25) * 100) },
    { category: 'Sentiment', value: (sentiment[0] + 0.5) * 100 },
    { category: 'Readability', value: readability[0] },
    { category: 'Simplicity', value: (1 - complexity[0]) * 100 },
    { category: 'Prestige', value: prestige === 'High' ? 100 : prestige === 'Medium' ? 60 : 20 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Termination Risk Predictor</CardTitle>
          <CardDescription>Adjust parameters to predict grant termination probability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>PI Gender</Label>
              <Select value={gender} onValueChange={(val: 'Male' | 'Female') => setGender(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Institution Prestige</Label>
              <Select value={prestige} onValueChange={(val: 'High' | 'Medium' | 'Low') => setPrestige(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Years of Experience</Label>
              <Badge variant="secondary">{experience[0]} years</Badge>
            </div>
            <Slider value={experience} onValueChange={setExperience} min={1} max={25} step={1} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Proposal Sentiment</Label>
              <Badge variant="secondary">{sentiment[0].toFixed(2)}</Badge>
            </div>
            <Slider value={sentiment} onValueChange={setSentiment} min={-0.3} max={0.8} step={0.1} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Language Complexity</Label>
              <Badge variant="secondary">{complexity[0].toFixed(2)}</Badge>
            </div>
            <Slider value={complexity} onValueChange={setComplexity} min={0.3} max={0.95} step={0.05} />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Readability Score</Label>
              <Badge variant="secondary">{readability[0]}</Badge>
            </div>
            <Slider value={readability} onValueChange={setReadability} min={30} max={85} step={5} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prediction Result</CardTitle>
          <CardDescription>Estimated termination probability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-5xl font-bold text-slate-900">
              {(prediction * 100).toFixed(1)}%
            </div>
            <Progress value={prediction * 100} className="h-3" />
            <div className="flex items-center justify-center gap-2">
              {prediction < 0.2 ? (
                <>
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Low Risk</span>
                </>
              ) : prediction < 0.4 ? (
                <>
                  <Minus className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-600">Medium Risk</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">High Risk</span>
                </>
              )}
            </div>
          </div>

          {riskFactors.length > 0 && (
            <div className="space-y-2">
              <Label>Active Risk Factors</Label>
              <div className="space-y-2">
                {riskFactors.map((rf, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-200">
                    <span className="text-sm">{rf.factor}</span>
                    <Badge variant="destructive">+{rf.impact}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              {prediction < 0.2 
                ? 'This grant profile shows favorable characteristics across most metrics.'
                : prediction < 0.4
                ? 'Several factors contribute to moderate risk. Consider addressing highlighted areas.'
                : 'Multiple high-risk factors identified. Mitigation strategies recommended.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Feature Importance</CardTitle>
          <CardDescription>Relative impact of different factors on termination probability</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureImportance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="feature" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="importance" fill="#6366f1" name="Importance %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Analysis</CardTitle>
          <CardDescription>Current grant profile strengths</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
