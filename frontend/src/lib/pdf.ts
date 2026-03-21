type JsPDFConstructor = typeof import('jspdf').default;
type AutoTableFunction = typeof import('jspdf-autotable').default;

let cachedJsPDF: JsPDFConstructor | null = null;
let cachedAutoTable: AutoTableFunction | null = null;

export async function loadJsPDF(): Promise<JsPDFConstructor> {
  if (cachedJsPDF) return cachedJsPDF;

  const module = await import('jspdf');
  cachedJsPDF = module.default;
  return cachedJsPDF;
}

export async function loadPdfWithAutoTable(): Promise<{ jsPDF: JsPDFConstructor; autoTable: AutoTableFunction }> {
  if (cachedJsPDF && cachedAutoTable) {
    return { jsPDF: cachedJsPDF, autoTable: cachedAutoTable };
  }

  const [jspdfModule, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  cachedJsPDF = jspdfModule.default;
  cachedAutoTable = autoTableModule.default;

  return {
    jsPDF: cachedJsPDF,
    autoTable: cachedAutoTable,
  };
}
