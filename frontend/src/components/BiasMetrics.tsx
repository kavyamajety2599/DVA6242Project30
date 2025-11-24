import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Info } from 'lucide-react';
import avgBiasData from './data/bias_avg_delta.json';
import maxBiasData from './data/bias_strongest_delta.json';

interface BiasMetricsProps {
  grants: any[];
  fairnessMetrics: any;
  showAdjusted: boolean;
}

export function BiasMetrics({ }: BiasMetricsProps) {
  
  const categories = [
    { label: 'Race/Ethnicity', jsonKey: 'race/ethnicity' },
    { label: 'Gender', jsonKey: 'gender' },
    { label: 'Mental Health', jsonKey: 'mental health/mental disorders' },
    { label: 'LGBTQ+', jsonKey: 'lgbtq' },
    { label: 'Climate', jsonKey: 'climate change' },
  ];

  const chartData = categories.map(cat => {
    // @ts-ignore
    const rawAvg = avgBiasData[cat.jsonKey] || 0;
    // @ts-ignore
    const rawMax = maxBiasData[cat.jsonKey] || 0;

    return {
      group: cat.label,
      "Average Impact": rawAvg * -100, 
      "Max Impact": rawMax * -100
    };
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Bias Impact Analysis</CardTitle>
        <CardDescription>
          Global impact of topic terms on termination probability (Signed Delta %).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              barGap={8} 
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              
              <XAxis 
                dataKey="group" 
                tick={{ fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
              />
              
              <YAxis 
                label={{ value: 'Impact on Risk %', angle: -90, position: 'insideLeft' }} 
                domain={['auto', 'auto']} 
              />
              
              <Tooltip 
                formatter={(value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`}
                contentStyle={{ borderRadius: '8px' }}
                cursor={{ fill: '#f1f5f9' }}
              />
              
              <ReferenceLine y={0} stroke="#000" />
              
              
              {/* Average Impact Bar (Blue when negative, Red when positive) */}
              <Bar 
                dataKey="Average Impact" 
                name="Avg Impact" 
                barSize={20}
                radius={[2, 2, 2, 2]} 
                minPointSize={3}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-avg-${index}`} 
                    fill={entry["Average Impact"] >= 0 ? "#ef4444" : "#3b82f6"} 
                  />
                ))}
              </Bar>

              {/* Max Impact Bar (Dynamic Color) */}
              <Bar 
                dataKey="Max Impact" 
                name="Max Impact" 
                barSize={15}
                radius={[2, 2, 2, 2]} 
                fillOpacity={0.8}
                minPointSize={3}
              >
                 {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-max-${index}`} 
                    fill={entry["Max Impact"] >= 0 ? "#cc4444" : "#4455dd"} 
                  />
                ))}
              </Bar>

            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 p-3 bg-slate-50 rounded-md text-xs text-slate-600 border border-slate-100">
          <div className="flex items-start gap-2 mb-1">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p><strong>Interpretation:</strong></p>
          </div>
          <ul className="list-disc pl-9 space-y-1">
            <li className="text-red-600"><strong>Positive (Red):</strong> Terms <u>increased</u> termination risk (Bias against topic).</li>
            <li className="text-blue-600"><strong>Negative (Blue):</strong> Terms <u>reduced</u> termination risk (Protective topic).</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}