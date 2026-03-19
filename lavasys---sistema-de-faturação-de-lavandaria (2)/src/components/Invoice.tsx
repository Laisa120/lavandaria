import React from 'react';
import { 
  Printer, 
  Download, 
  X, 
  Receipt, 
  Calendar, 
  User, 
  Phone, 
  MapPin,
  CheckCircle2,
  Globe,
  CreditCard,
  Mail
} from 'lucide-react';
import { Order, Customer, LaundryItem, LaundrySettings, DocumentType } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import { formatCurrencyAO, formatNumberAO } from '../lib/format';

interface InvoiceProps {
  order: Order;
  customer: Customer;
  laundryItems: LaundryItem[];
  settings: LaundrySettings;
  onClose: () => void;
  autoDownload?: boolean;
  type?: DocumentType;
  operator?: string;
  paymentMethod?: string;
  observations?: string;
  totals?: {
    subtotal: number;
    totalDiscount: number;
    totalIva: number;
    total: number;
  };
}

export const Invoice: React.FC<InvoiceProps> = ({ 
  order, 
  customer, 
  laundryItems, 
  settings,
  onClose,
  autoDownload = false,
  type = 'fatura_recibo',
  operator,
  paymentMethod,
  observations,
  totals
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

  React.useEffect(() => {
    if (autoDownload && !isGeneratingPDF) {
      const timer = setTimeout(() => {
        handleDownloadPDF();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoDownload]);

  const handlePrint = () => {
    window.print();
    onClose();
  };

  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;
    
    try {
      setIsGeneratingPDF(true);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      let y = 14;
      const lineGap = 6;

      const write = (text: string, x = 14, size = 10, bold = false) => {
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.setFontSize(size);
        pdf.text(text, x, y);
        y += lineGap;
      };

      const money = (value: number) => formatCurrencyAO(value);

      write(`${type === 'proforma' ? 'FATURA PROFORMA' : 'FATURA'} - LavaSys`, 14, 14, true);
      y += 2;
      write(`Empresa: ${settings.companyName || '-'}`);
      write(`NIF: ${settings.nif || '-'}`);
      write(`Telefone: ${settings.phone || '-'}`);
      write(`Endereco: ${settings.fullAddress || '-'}`);
      y += 2;

      write(`Fatura: ${order.id.slice(0, 8)}`, 14, 10, true);
      write(`Data: ${format(new Date(order.createdAt), 'dd/MM/yyyy')}`);
      write(`Cliente: ${customer.name}`);
      write(`Telefone Cliente: ${customer.phone || '-'}`);
      write(`Endereco Cliente: ${customer.address || '-'}`);
      y += 2;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Servico', 14, y);
      pdf.text('Qtd', 110, y);
      pdf.text('Preco', 135, y);
      pdf.text('Total', 170, y);
      y += 4;
      pdf.line(14, y, 196, y);
      y += 5;

      for (const item of order.items) {
        const laundryItem = laundryItems.find((li) => li.id === item.itemId);
        const name = laundryItem?.name || 'Servico';
        const total = item.quantity * item.priceAtTime;

        if (y > 270) {
          pdf.addPage();
          y = 20;
        }

        pdf.setFont('helvetica', 'normal');
        pdf.text(name.slice(0, 45), 14, y);
        pdf.text(String(item.quantity), 112, y);
        pdf.text(formatNumberAO(item.priceAtTime), 135, y);
        pdf.text(formatNumberAO(total), 170, y);
        y += 6;
      }

      y += 2;
      pdf.line(110, y, 196, y);
      y += 7;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Subtotal: ${money(totals?.subtotal || order.total)}`, 110, y);
      y += 6;
      pdf.text(`IVA (${settings.defaultIvaRate}%): ${money(totals?.totalIva || 0)}`, 110, y);
      y += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.text(`TOTAL: ${money(totals?.total || order.total)}`, 110, y);
      y += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.text(`Pagamento: ${paymentMethod || 'Dinheiro'}`, 14, y);
      y += 6;
      pdf.text(`Atendido por: ${operator || 'Sistema'}`, 14, y);
      y += 8;
      pdf.text('Obrigado pela preferencia!', 14, y);

      pdf.save(`fatura-${order.id.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-0 sm:p-2 overflow-y-auto print:bg-white print:p-0 print:static print:inset-auto"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md sm:rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col min-h-screen sm:min-h-0 sm:my-4 print:my-0 print:shadow-none print:rounded-none print:max-w-none print:min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Actions */}
        <div className="p-2 sm:p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10 print:hidden">
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full transition-colors order-first"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const subject = encodeURIComponent(`${type === 'proforma' ? 'Proforma' : 'Fatura'} #${order.id}`);
                const body = encodeURIComponent(`Olá ${customer.name},\n\nSegue em anexo a sua fatura.\n\nObrigado pela preferência.`);
                window.open(`mailto:${customer.email}?subject=${subject}&body=${body}`);
              }}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Email</span>
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Imprimir</span>
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-100"
            >
              {isGeneratingPDF ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden xs:inline">{isGeneratingPDF ? '...' : 'PDF'}</span>
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-5 sm:p-8 bg-white print:p-0 font-mono text-slate-800">
          <div className="text-center mb-4">
            <p className="text-slate-400 text-[9px] tracking-[0.3em]">---------------------------------------</p>
            <h1 className="text-lg font-black tracking-[0.1em] uppercase my-2">
              {type === 'proforma' ? 'Fatura Proforma' : 
               type === 'nota_credito' ? 'Nota de Crédito' :
               type === 'nota_debito' ? 'Nota de Débito' :
               'FATURA'}
            </h1>
            <div className="mt-3 space-y-0.5 text-[11px]">
              <p><span className="font-bold">Empresa:</span> {settings.companyName}</p>
              <p><span className="font-bold">NIF:</span> {settings.nif}</p>
              <p className="truncate"><span className="font-bold">Endereço:</span> {settings.fullAddress}</p>
              <p><span className="font-bold">Telefone:</span> {settings.phone}</p>
              <p><span className="font-bold">Email:</span> {settings.email}</p>
            </div>
            <p className="text-slate-400 mt-3 text-[9px] tracking-[0.3em]">---------------------------------------</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-[11px]">
            <div className="space-y-0.5">
              <p><span className="font-bold">Fatura Nº:</span> {order.id.slice(0, 8)}</p>
              <p><span className="font-bold">Data:</span> {format(new Date(order.createdAt), 'dd/MM/yyyy')}</p>
            </div>
            <div className="space-y-0.5">
              <p><span className="font-bold">Cliente:</span> {customer.name}</p>
              <p><span className="font-bold">NIF:</span> {customer.nif || '999999999'}</p>
              <p className="truncate"><span className="font-bold">Endereço:</span> {customer.address}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-slate-400 text-[9px] tracking-[0.3em]">---------------------------------------</p>
            <div className="grid grid-cols-[1fr_35px_65px_75px] gap-1.5 text-[10px] font-black py-1.5 uppercase border-b border-slate-100">
              <span>Serviço</span>
              <span className="text-center">Qtd</span>
              <span className="text-right">Preço</span>
              <span className="text-right">Total</span>
            </div>
            <div className="divide-y divide-slate-50 py-0.5">
              {order.items.map((item, index) => {
                const laundryItem = laundryItems.find(li => li.id === item.itemId);
                return (
                  <div key={index} className="grid grid-cols-[1fr_35px_65px_75px] gap-1.5 text-[10px] py-1.5">
                    <span className="truncate">{laundryItem?.name || 'Serviço'}</span>
                    <span className="text-center">{item.quantity}</span>
                    <span className="text-right">{formatNumberAO(item.priceAtTime)}</span>
                    <span className="text-right font-bold">{formatNumberAO(item.quantity * item.priceAtTime)}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-slate-400 text-[9px] tracking-[0.3em]">---------------------------------------</p>
          </div>

          <div className="flex justify-end mb-6">
            <div className="w-full sm:w-64 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-bold">{formatCurrencyAO(totals?.subtotal || order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IVA ({settings.defaultIvaRate}%):</span>
                <span className="font-bold">{formatCurrencyAO(totals?.totalIva || 0)}</span>
              </div>
              <div className="flex justify-between text-[13px] border-t-2 border-slate-900 pt-2 mt-2">
                <span className="font-black uppercase tracking-tighter">TOTAL:</span>
                <span className="font-black">{formatCurrencyAO(totals?.total || order.total)}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] space-y-4">
            <p className="text-slate-400 text-[9px] tracking-[0.3em]">---------------------------------------</p>
            <div className="space-y-0.5">
              <p><span className="font-bold">Pagamento:</span> {paymentMethod || 'Dinheiro'}</p>
              <p><span className="font-bold">Atendido:</span> {operator || 'Sistema'}</p>
              <p className="font-black mt-3 uppercase tracking-[0.1em] text-[11px]">Obrigado pela preferência</p>
            </div>
            <p className="text-slate-400 text-[9px] tracking-[0.3em]">---------------------------------------</p>
          </div>
        </div>
            
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 mt-auto print:hidden" data-html2canvas-ignore>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button 
              onClick={handlePrint}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 shadow-lg shadow-slate-200"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-50"
            >
              {isGeneratingPDF ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {isGeneratingPDF ? '...' : 'Baixar PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
