  const handleGeneratePDF = async () => {
    try {
      const response = await fetch(`/api/reconciliations/${id}/pdf`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('PDF oluşturulamadı');
      }

      const htmlContent = await response.text();
      
      // Open HTML content in new window
      const newWindow = window.open('', '_blank', 'width=800,height=600');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        newWindow.focus();
      } else {
        // Fallback: create and download as HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mutabakat_${reconciliation?.reference_number}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF oluşturma hatası');
    }
  };