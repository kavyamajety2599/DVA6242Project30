import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { type Grant } from './data/GrantData';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

type SortField = 'title' | 'field' | 'probability' | 'confidence';

interface GrantTableProps {
  grants: Grant[];
  showAdjusted: boolean;
}

type SortDirection = 'asc' | 'desc';

export function GrantTable({ grants, showAdjusted }: GrantTableProps) {
  const [sortField, setSortField] = useState<SortField>('probability');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedGrants = useMemo(() => {
    const sorted = [...grants].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'field':
          aValue = a.field;
          bValue = b.field;
          break;
        case 'probability':
        case 'confidence':
          aValue = showAdjusted && (a as any).adjustedTerminationProb !== undefined
            ? (a as any).adjustedTerminationProb
            : a.terminationProbability;
          bValue = showAdjusted && (b as any).adjustedTerminationProb !== undefined
            ? (b as any).adjustedTerminationProb
            : b.terminationProbability;
          break;
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }, [grants, sortField, sortDirection, showAdjusted]);

  const totalPages = Math.ceil(sortedGrants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGrants = sortedGrants.slice(startIndex, endIndex);

  const getSeverityColor = (severity: 'Low' | 'Moderate' | 'High') => {
    switch (severity) {
      case 'High': return 'destructive';
      case 'Moderate': return 'default';
      case 'Low': return 'secondary';
    }
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-8 -ml-3"
    >
      {label}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grant Details</CardTitle>
        <CardDescription>
          Showing {startIndex + 1}-{Math.min(endIndex, sortedGrants.length)} of {sortedGrants.length} grants
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">
                  <SortButton field="title" label="Title" />
                </TableHead>
                {/* <TableHead>
                  <SortButton field="agency" label="Agency" />
                </TableHead> */}
                <TableHead>
                  <SortButton field="field" label="Field" />
                </TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>
                  <SortButton field="confidence" label="Confidence" />
                </TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead>Bias Flags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentGrants.map((grant) => {
                const confidence = showAdjusted && (grant as any).adjustedTerminationProb !== undefined
                  ? (grant as any).adjustedTerminationProb
                  : grant.terminationProbability;

                return (
                  <TableRow key={grant.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      <div className="max-w-[300px] truncate" title={grant.title}>
                        {grant.title}
                      </div>
                    </TableCell>
                    {/* <TableCell>
                      <Badge variant="outline">{grant.agency}</Badge>
                    </TableCell> */}
                    <TableCell>
                      <span className="text-sm text-slate-600">{grant.field}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={grant.terminated ? "destructive" : "default"}>
                        {grant.terminated ? 'Terminated' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              confidence > 0.6 ? 'bg-red-500' : confidence > 0.3 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {(confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {grant.keywords.slice(0, 3).map((keyword, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {grant.keywords.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{grant.keywords.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {grant.biasFlags.length > 0 ? (
                          grant.biasFlags.map((flag, i) => (
                            <Badge
                              key={i}
                              variant={getSeverityColor(flag.severity)}
                              className="text-xs"
                              title={`${flag.type}: +${flag.impact.toFixed(1)}%`}
                            >
                              {flag.type}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400">None</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
