import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import projectData from './data/final_project_data.json';

// --- 2. DEFINE LOCAL INTERFACE FOR THE JSON STRUCTURE ---
interface ProjectData {
  award_number: string;
  project_title: string;
  recipient_name: string;
  awarding_office: string;
  award_amount: number;
  grant_status: string;
  bias_flags: string | null; // It comes as a string "race, gender" or null
}

// We ignore the props passed from parent since we are using the JSON directly
interface GrantTableProps {
  grants: any[]; 
  showAdjusted: boolean;
}

export function GrantTable({ grants: _ignoredGrants }: GrantTableProps) {
  // Use the imported JSON as the data source
  const data = projectData as ProjectData[];

  const [sortField, setSortField] = useState<keyof ProjectData>('award_amount');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // --- Sorting Logic ---
  const handleSort = (field: keyof ProjectData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Numeric Sort (Amount)
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      // String Sort
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
  }, [data, sortField, sortDirection]);

  // --- Pagination ---
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // --- Helpers ---
  const getStatusColor = (status: string) => {
    if (status === 'Active') return 'outline'; 
    if (status === 'Terminated') return 'destructive';
    return 'secondary';
  };

  const getBiasColor = (bias: string) => {
    const b = bias.toLowerCase();
    if (b.includes('race') || b.includes('gender') || b.includes('equity')) return 'destructive';
    if (b.includes('climate') || b.includes('environment')) return 'default';
    return 'secondary';
  };

  // Helper to parse "race, gender" string into array
  const parseFlags = (flagStr: string | null) => {
    if (!flagStr) return [];
    return flagStr.split(',').map(s => s.trim()).filter(s => s);
  };

  const SortButton = ({ field, label }: { field: keyof ProjectData; label: string }) => (
    <Button variant="ghost" size="sm" onClick={() => handleSort(field)} className="h-8 -ml-3 font-bold text-slate-700">
      {label} <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grant Details</CardTitle>
        <CardDescription>
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} records from Project Data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[140px]"><SortButton field="award_number" label="Award #" /></TableHead>
                <TableHead className="w-[350px]"><SortButton field="project_title" label="Project Title" /></TableHead>
                <TableHead className="w-[200px]"><SortButton field="recipient_name" label="Recipient" /></TableHead>
                <TableHead><SortButton field="awarding_office" label="Agency" /></TableHead>
                <TableHead className="text-right"><SortButton field="award_amount" label="Amount" /></TableHead>
                <TableHead><SortButton field="grant_status" label="Status" /></TableHead>
                {/* <TableHead>Bias Flags</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((item, idx) => (
                <TableRow key={`${item.award_number}-${idx}`} className="hover:bg-slate-50">
                  
                  {/* Award Number */}
                  <TableCell className="font-mono text-xs font-medium text-slate-600">
                    {item.award_number}
                  </TableCell>

                  {/* Title */}
                  <TableCell>
                    <div className="max-w-[350px] text-sm font-medium text-slate-900 truncate" title={item.project_title}>
                      {item.project_title}
                    </div>
                  </TableCell>

                  {/* Recipient */}
                  <TableCell className="text-xs text-slate-600 max-w-[200px] truncate" title={item.recipient_name}>
                    {item.recipient_name}
                  </TableCell>

                  {/* Agency */}
                  <TableCell>
                    <Badge variant="outline" className="font-normal text-slate-600">
                      {item.awarding_office}
                    </Badge>
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="text-right font-mono text-sm text-slate-700">
                    {item.award_amount 
                      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(item.award_amount)
                      : <span className="text-slate-400">-</span>}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={getStatusColor(item.grant_status)} className={item.grant_status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                      {item.grant_status}
                    </Badge>
                  </TableCell>

                  {/* Bias Flags
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {parseFlags(item.bias_flags).length > 0 ? (
                        parseFlags(item.bias_flags).map((flag, i) => (
                          <Badge key={i} variant={getBiasColor(flag)} className="text-[10px] px-1 py-0 h-5">
                            {flag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </div>
                  </TableCell> */}

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}