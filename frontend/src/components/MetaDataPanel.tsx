import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import type { Grant } from './data/GrantData';

interface MetadataPanelProps {
  grants: Grant[];
  showAdjusted: boolean;
}

export function MetadataPanel({ grants, showAdjusted }: MetadataPanelProps) {
  // Field analysis
  const fieldData = ['Biology', 'Physics', 'Computer Science', 'Chemistry', 'Medicine', 'Engineering'].map(field => {
    const fieldGrants = grants.filter(g => g.field === field);
    return {
      field,
      terminated: fieldGrants.filter(g => g.terminated).length,
      active: fieldGrants.filter(g => !g.terminated).length,
      avgProb: fieldGrants.length > 0
        ? fieldGrants.reduce((sum, g) => 
            sum + (showAdjusted ? (g as any).adjustedTerminationProb || g.terminationProbability : g.terminationProbability), 0
          ) / fieldGrants.length * 100
        : 0,
    };
  });

  // Year analysis
  const yearData = [2020, 2021, 2022, 2023, 2024].map(year => {
    const yearGrants = grants.filter(g => g.year === year);
    return {
      year: year.toString(),
      terminated: yearGrants.filter(g => g.terminated).length,
      active: yearGrants.filter(g => !g.terminated).length,
      avgProb: yearGrants.length > 0
        ? yearGrants.reduce((sum, g) => 
            sum + (showAdjusted ? (g as any).adjustedTerminationProb || g.terminationProbability : g.terminationProbability), 0
          ) / yearGrants.length * 100
        : 0,
    };
  });

  // Agency analysis
  const agencyData = ['NSF', 'NIH', 'DOE', 'NASA', 'DARPA'].map(agency => {
    const agencyGrants = grants.filter(g => g.agency === agency);
    return {
      agency,
      terminated: agencyGrants.filter(g => g.terminated).length,
      active: agencyGrants.filter(g => !g.terminated).length,
      avgProb: agencyGrants.length > 0
        ? agencyGrants.reduce((sum, g) => 
            sum + (showAdjusted ? (g as any).adjustedTerminationProb || g.terminationProbability : g.terminationProbability), 0
          ) / agencyGrants.length * 100
        : 0,
      count: agencyGrants.length,
    };
  });

  // Funding amount bins
  const amountBins = [
    { range: '$0-500K', min: 0, max: 500000 },
    { range: '$500K-1M', min: 500000, max: 1000000 },
    { range: '$1M-1.5M', min: 1000000, max: 1500000 },
    { range: '$1.5M+', min: 1500000, max: 10000000 },
  ];

  const amountData = amountBins.map(bin => {
    const binGrants = grants.filter(g => g.amount >= bin.min && g.amount < bin.max);
    return {
      range: bin.range,
      avgProb: binGrants.length > 0
        ? binGrants.reduce((sum, g) => 
            sum + (showAdjusted ? (g as any).adjustedTerminationProb || g.terminationProbability : g.terminationProbability), 0
          ) / binGrants.length * 100
        : 0,
      count: binGrants.length,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Research Field Distribution</CardTitle>
          <CardDescription>Termination rates across different research fields</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fieldData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="field" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="terminated" fill="#ef4444" name="Terminated" />
              <Bar dataKey="active" fill="#22c55e" name="Active" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Termination Trends by Year</CardTitle>
          <CardDescription>How termination patterns have evolved over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgProb" stroke="#8b5cf6" strokeWidth={2} name="Avg Termination %" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              Termination probability trends over the 5-year period.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funding Agency Analysis</CardTitle>
          <CardDescription>Termination rates by funding agency</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="agency" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="terminated" fill="#ef4444" name="Terminated" />
              <Bar dataKey="active" fill="#22c55e" name="Active" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg space-y-1">
            {agencyData.map(d => (
              <p key={d.agency} className="text-sm">
                <span className="font-medium">{d.agency}:</span> {d.avgProb.toFixed(1)}% ({d.count} grants)
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Grant Amount vs Termination</CardTitle>
          <CardDescription>Relationship between funding amount and termination probability</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={amountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgProb" fill="#f59e0b" name="Avg Termination %" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              Larger grants may have different risk profiles and oversight requirements.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
