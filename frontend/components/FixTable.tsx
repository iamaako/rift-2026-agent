import React, { useState } from 'react';
import { FixRecord, FixStatus, BugType } from '../types';
import { CheckCircleIcon, XCircleIcon, ActivityIcon, ShieldIcon, DownloadIcon, FilterIcon, PdfIcon } from './Icons';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface FixTableProps {
  fixes: FixRecord[];
}

export const FixTable: React.FC<FixTableProps> = ({ fixes }) => {
  const [activeFilter, setActiveFilter] = useState<BugType | 'ALL'>('ALL');
  const [isExporting, setIsExporting] = useState(false);

  const getBugTypeStyle = (type: BugType) => {
    switch (type) {
      case BugType.SECURITY: return 'bg-red-100 text-red-700 border-red-200';
      case BugType.SYNTAX: return 'bg-orange-100 text-orange-700 border-orange-200';
      case BugType.LINTING: return 'bg-blue-100 text-blue-700 border-blue-200';
      case BugType.PERFORMANCE: return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: FixStatus) => {
    switch (status) {
      case FixStatus.FIXED: return <CheckCircleIcon className="w-4 h-4 text-emerald-500" />;
      case FixStatus.FAILED: return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case FixStatus.IN_PROGRESS: return <ActivityIcon className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-slate-300" />;
    }
  };

  const downloadCSV = () => {
    const headers = ['ID', 'Timestamp', 'Status', 'File', 'Line', 'Bug Type', 'Description', 'Commit Message'];
    const rows = fixes.map(fix => [
      fix.id,
      fix.timestamp,
      fix.status,
      fix.file,
      fix.line,
      fix.bugType,
      `"${fix.description.replace(/"/g, '""')}"`,
      `"${fix.commitMessage.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rift_fixes_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = async () => {
    const tableElement = document.getElementById('fixes-table');
    if (!tableElement) return;

    setIsExporting(true);

    try {
      // Create a specific container for export off-screen
      const exportContainer = document.createElement('div');
      exportContainer.style.position = 'absolute';
      exportContainer.style.top = '0';
      exportContainer.style.left = '-9999px';
      // Use a fixed width that allows the table to expand naturally without cramping
      exportContainer.style.width = '1200px'; 
      exportContainer.style.backgroundColor = '#ffffff';
      exportContainer.style.padding = '40px';
      exportContainer.style.zIndex = '-1000';
      
      // Add Title
      const title = document.createElement('h1');
      title.innerText = 'RIFT 2026 - Vulnerability Report';
      title.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';
      title.style.fontSize = '24px';
      title.style.fontWeight = 'bold';
      title.style.marginBottom = '10px';
      title.style.color = '#1e293b';
      exportContainer.appendChild(title);

      const subtitle = document.createElement('p');
      subtitle.innerText = `Generated on ${new Date().toLocaleString()}`;
      subtitle.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';
      subtitle.style.fontSize = '14px';
      subtitle.style.color = '#64748b';
      subtitle.style.marginBottom = '30px';
      exportContainer.appendChild(subtitle);

      // Clone Table
      const clone = tableElement.cloneNode(true) as HTMLElement;
      
      // Clean up clone styles for PDF
      clone.style.width = '100%';
      clone.style.border = '1px solid #e2e8f0';
      clone.style.borderRadius = '8px';
      clone.style.backgroundColor = '#ffffff';
      
      // Remove sticky headers from clone to prevent issues with html2canvas
      const thead = clone.querySelector('thead');
      if (thead) {
        thead.classList.remove('sticky', 'top-0');
        thead.style.position = 'static';
      }

      // Remove truncation classes from paragraphs and cells in the clone
      // This ensures text wraps naturally in the PDF instead of being cut off
      const paragraphs = clone.querySelectorAll('p');
      paragraphs.forEach((p) => {
        const el = p as HTMLElement;
        el.classList.remove('truncate');
        el.classList.remove('max-w-[200px]');
        el.style.whiteSpace = 'normal';
        el.style.overflow = 'visible';
        el.style.maxWidth = 'none';
      });
      
      const cells = clone.querySelectorAll('td');
      cells.forEach((td) => {
        const el = td as HTMLElement;
        el.style.whiteSpace = 'normal';
        el.classList.remove('whitespace-nowrap');
      });

      exportContainer.appendChild(clone);
      document.body.appendChild(exportContainer);

      // Capture
      const canvas = await html2canvas(exportContainer, {
        scale: 2, // Retina quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1400 // Ensure viewport is wide enough
      });

      // Cleanup DOM
      document.body.removeChild(exportContainer);

      // Initialize PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const ratio = pdfWidth / canvas.width;
      const canvasHeightInPdf = canvas.height * ratio;
      
      const imgData = canvas.toDataURL('image/png');
      
      let heightRemaining = canvasHeightInPdf;
      let yOffset = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, canvasHeightInPdf);
      heightRemaining -= pdfHeight;

      // Add subsequent pages
      while (heightRemaining > 0) {
        yOffset -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, canvasHeightInPdf);
        heightRemaining -= pdfHeight;
      }

      pdf.save(`rift_report_${new Date().toISOString()}.pdf`);

    } catch (error) {
      console.error('PDF Generation failed', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const filteredFixes = activeFilter === 'ALL' 
    ? fixes 
    : fixes.filter(fix => fix.bugType === activeFilter);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Header with Controls */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldIcon className="w-5 h-5 text-rift-700" />
          <h3 className="font-semibold text-slate-800">Detected Vulnerabilities</h3>
          <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {filteredFixes.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
           {/* Filter Dropdown */}
           <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <FilterIcon className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as BugType | 'ALL')}
              className="pl-8 pr-8 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rift-500 text-slate-600 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="ALL">All Issues</option>
              {Object.values(BugType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Download CSV Button */}
          <button
            onClick={downloadCSV}
            disabled={fixes.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-rift-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download CSV"
          >
            <DownloadIcon className="w-3.5 h-3.5" />
            CSV
          </button>

           {/* Download PDF Button */}
           <button
            onClick={downloadPDF}
            disabled={fixes.length === 0 || isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rift-700 border border-rift-700 rounded-lg hover:bg-rift-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            title="Download PDF"
          >
            {isExporting ? (
              <ActivityIcon className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <PdfIcon className="w-3.5 h-3.5" />
            )}
            PDF
          </button>
        </div>
      </div>

      {/* Scrollable Table Body */}
      <div className="overflow-auto custom-scrollbar flex-1">
        <table id="fixes-table" className="w-full text-left text-sm relative bg-white">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-500 whitespace-nowrap">Status</th>
              <th className="px-6 py-3 font-semibold text-slate-500 whitespace-nowrap">File Location</th>
              <th className="px-6 py-3 font-semibold text-slate-500 whitespace-nowrap">Issue Type</th>
              <th className="px-6 py-3 font-semibold text-slate-500 whitespace-nowrap">AI Action</th>
              <th className="px-6 py-3 font-semibold text-slate-500 whitespace-nowrap">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredFixes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  {fixes.length === 0 
                    ? "No issues detected yet. Start the agent to begin analysis." 
                    : "No issues match the selected filter."}
                </td>
              </tr>
            ) : (
              filteredFixes.map((fix) => (
                <tr key={fix.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(fix.status)}
                      <span className={`text-xs font-bold ${
                        fix.status === FixStatus.FIXED ? 'text-emerald-700' : 
                        fix.status === FixStatus.FAILED ? 'text-red-700' : 'text-slate-600'
                      }`}>
                        {fix.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                    {fix.file} <span className="text-slate-400">:{fix.line}</span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getBugTypeStyle(fix.bugType)}`}>
                      {fix.bugType}
                    </span>
                  </td>
                  <td className="px-6 py-3 min-w-[200px]">
                    <p className="text-slate-800 font-medium truncate max-w-[200px]" title={fix.commitMessage}>
                      {fix.commitMessage}
                    </p>
                    <p className="text-slate-400 text-xs truncate max-w-[200px]" title={fix.description}>
                      {fix.description}
                    </p>
                  </td>
                  <td className="px-6 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(fix.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};