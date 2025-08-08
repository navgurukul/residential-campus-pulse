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

export const exportToPDF = async (elementId: string, filename: string) => {
  try {
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found for PDF export');
      return;
    }

    // Create canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
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

export const prepareCampusDetailDataForExport = (campus: any, evaluations: any[]) => {
  const campusEvaluations = evaluations.filter(evaluation => evaluation.campusId === campus.id);
  
  return {
    campusInfo: {
      'Campus Name': campus.name,
      'Location': campus.location,
      'Overall Score': campus.averageScore,
      'Total Resolvers': campus.totalResolvers,
      'Ranking': campus.ranking,
      'Last Evaluated': new Date(campus.lastEvaluated).toLocaleDateString()
    },
    evaluations: campusEvaluations.map(evaluation => ({
      'Resolver': evaluation.resolverName,
      'Overall Score': evaluation.overallScore,
      'Date Evaluated': new Date(evaluation.dateEvaluated).toLocaleDateString(),
      'Competencies': evaluation.competencies.map(comp => 
        `${comp.category}: ${comp.score}/${comp.maxScore}`
      ).join('; '),
      'Feedback': evaluation.feedback
    }))
  };
};