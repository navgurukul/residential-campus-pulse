export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that contain commas or quotes
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (elementId: string, filename: string) => {
  // This is a placeholder for PDF export functionality
  // In a real application, you would use a library like jsPDF or html2canvas
  alert('PDF export functionality would be implemented using libraries like jsPDF or html2canvas');
};

export const prepareCampusDataForExport = (campuses: any[]) => {
  return campuses.map(campus => ({
    'Campus Name': campus.name,
    'Location': campus.location,
    'Average Score': campus.averageScore,
    'Total Resolvers': campus.totalResolvers,
    'Ranking': campus.ranking,
    'Last Evaluated': new Date(campus.lastEvaluated).toLocaleDateString()
  }));
};

export const prepareResolverDataForExport = (resolvers: any[]) => {
  return resolvers.map(resolver => ({
    'Resolver Name': resolver.name,
    'Email': resolver.email,
    'Campuses Evaluated': resolver.campusesEvaluated,
    'Average Score Given': resolver.averageScoreGiven,
    'Total Evaluations': resolver.totalEvaluations,
    'Last Activity': new Date(resolver.lastActivity).toLocaleDateString()
  }));
};

export const prepareEvaluationDataForExport = (evaluations: any[]) => {
  return evaluations.map(evaluation => ({
    'Campus': evaluation.campusName,
    'Resolver': evaluation.resolverName,
    'Overall Score': evaluation.overallScore,
    'Date Evaluated': new Date(evaluation.dateEvaluated).toLocaleDateString(),
    'Status': evaluation.status,
    'Feedback': evaluation.feedback
  }));
};