import { BillItemEntry } from './BillPage';

// Helper function to escape HTML special characters (prevents XSS)
const escapeHtml = (value: string): string =>
  value.replace(/[&<>"'`]/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      case '`':
        return '&#96;';
      default:
        return char;
    }
  });

// Number to words function (Pakistani numbering system)
const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
  }
  
  function convertToPakistaniSystem(n: number): string {
    if (n === 0) return 'Zero';
    
    let result = '';
    
    // Crores (10^7)
    if (n >= 10000000) {
      result += convertLessThanThousand(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    
    // Lakhs (10^5)
    if (n >= 100000) {
      result += convertLessThanThousand(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    
    // Thousands (10^3)
    if (n >= 1000) {
      result += convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    
    // Hundreds and below
    if (n > 0) {
      result += convertLessThanThousand(n);
    }
    
    return result.trim();
  }
  
  return convertToPakistaniSystem(Math.floor(num));
};

function moveMonthBack(monthStr: string): string {
  // Parse "March 2025" safely
  const date: Date = new Date(`${monthStr} 1`);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid month format: ${monthStr}`);
  }

  // Move one month back
  date.setMonth(date.getMonth() - 1);

  // Format back to "Month YYYY"
  return date.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric'
  });
}

export const generateCustomerPdf = (
  items: BillItemEntry[],
  totalAmount: number,
  customerName: string,
  month: string
) => {
  if (!items || items.length === 0) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const safeCustomerName = escapeHtml(customerName);
  const safeMonth: string = escapeHtml(moveMonthBack(month));
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const tableRows = items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(item.inwardNumber)}</td>
      <td>${escapeHtml(item.dateRange || '')}</td>
      <td>${escapeHtml(item.itemName || 'N/A')}</td>
      <td class="text-right">${(item.storedQuantity || 0).toLocaleString('en-PK')}</td>
      <td class="text-right">${(item.rate || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
      <td class="text-right">${(item.labourCost || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
      <td class="text-right">${(item.sum || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  const amountInWords = numberToWords(totalAmount);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bill - ${safeCustomerName} - ${safeMonth}</title>
        <style>
          @page {
            size: A4;
            margin: 10mm 12mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 9pt;
            line-height: 1.35;
            color: #000;
            background: #fff;
            width: 210mm;
            min-height: 297mm;
            padding: 8mm 10mm;
            margin: 0 auto;
          }
          
          /* PRINT OPTIMIZATION */
          @media print {
            body {
              padding: 0;
              margin: 0;
              -webkit-print-color-adjust: economy;
              print-color-adjust: economy;
            }
            .no-print {
              display: none !important;
            }
          }
          
          /* HEADER */
          .header {
            border-bottom: 1px solid #000;
            padding-bottom: 6px;
            margin-bottom: 10px;
          }
          
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          
          .company-name {
            font-size: 18pt;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          
          .company-tagline,
          .company-contact {
            font-size: 7.5pt;
            line-height: 1.4;
          }
          
          .bill-title-box {
            border: 1px solid #000;
            padding: 6px 16px;
          }
          
          .bill-title {
            font-size: 11pt;
            font-weight: 700;
            letter-spacing: 1px;
          }
          
          /* BILL INFO */
          .bill-info {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 6px 8px;
            border: 1px solid #000;
          }
          
          .bill-to h3 {
            font-size: 7.5pt;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          
          .customer-name {
            font-size: 11pt;
            font-weight: 700;
          }
          
          .bill-details {
            text-align: right;
            font-size: 8pt;
          }
          
          /* PERIOD */
          .period-banner {
            text-align: center;
            padding: 4px;
            margin-bottom: 8px;
            font-size: 9.5pt;
            font-weight: 700;
            border: 1px solid #000;
          }
          
          /* TABLE */
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
            margin-bottom: 8px;
          }
          
          th,
          td {
            border: 0.7px solid #000;
            padding: 4px;
          }
          
          th {
            font-weight: 700;
            text-transform: uppercase;
            font-size: 7.5pt;
          }
          
          .text-right {
            text-align: right;
          }
          
          /* TOTAL */
          .total-row td {
            font-weight: 700;
            border-top: 1.2px solid #000;
          }
          
          /* AMOUNT IN WORDS */
          .amount-words {
            border: 1px solid #000;
            padding: 6px 8px;
            margin: 10px 0;
            font-size: 8pt;
          }
          
          /* FOOTER */
          .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #000;
          }
          
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 25px;
          }
          
          .signature-box {
            width: 45%;
            text-align: center;
          }
          
          .signature-line {
            border-top: 1px solid #000;
            margin-top: 35px;
            padding-top: 4px;
            font-size: 8pt;
          }
          
          /* NO PRINT CONTROLS */
          .no-print {
            margin-bottom: 15px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="btn-print" onclick="window.print()">Print Invoice</button>
          <button class="btn-close" onclick="window.close()">Close</button>
        </div>

        <div class="header">
          <div class="header-top">
            <div class="company-info">
              <div class="company-name">ZAMZAM COLD STORAGE</div>
              <div class="company-tagline">Cold Storage Services</div>
              <div class="company-contact">
                <strong>Address:</strong> Faisalabad, Pakistan<br>
                <strong>Phone:</strong> +92-XXX-XXXXXXX &nbsp;|&nbsp; <strong>Mobile:</strong> +92-3XX-XXXXXXX<br>
                <strong>Email:</strong> info@zamzamcoldstorage.com
              </div>
            </div>
            <div class="bill-title-box">
              <div class="bill-title">INVOICE</div>
            </div>
          </div>
        </div>

        <div class="bill-info">
          <div class="bill-to">
            <h3>Bill To</h3>
            <div class="customer-name">${safeCustomerName}</div>
          </div>
          <div class="bill-details">
            <p><strong>Invoice Date:</strong> ${currentDate}</p>
            <p><strong>Invoice No:</strong> INV-${Date.now().toString().slice(-8)}</p>
            <p><strong>Billing Period:</strong> ${safeMonth}</p>
          </div>
        </div>

        <div class="period-banner">
          STORAGE CHARGES FOR ${safeMonth.toUpperCase()}
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%;" class="text-center">S.No</th>
              <th style="width: 10%;">Inward No.</th>
              <th style="width: 18%;">Date (From - To)</th>
              <th style="width: 20%;">Item Name</th>
              <th style="width: 10%;" class="text-right">Stored Qty</th>
              <th style="width: 10%;" class="text-right">Rate (PKR)</th>
              <th style="width: 12%;" class="text-right">Labour (PKR)</th>
              <th style="width: 15%;" class="text-right">Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="7" class="text-right"><strong>TOTAL AMOUNT:</strong></td>
              <td class="text-right"><strong>PKR ${totalAmount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div class="amount-words">
          <strong>Amount in Words:</strong> Pakistani Rupees ${amountInWords} Only
        </div>

        <div class="footer">
          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-label">Customer Signature</div>
                <div class="signature-sublabel">Name & Date</div>
              </div>
            </div>
            <div class="signature-box">
              <div class="signature-line">
                <div class="signature-label">For Zamzam Cold Storage</div>
                <div class="signature-sublabel">Authorized Signature</div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
};

export const generateMonthlyPrint = (
  printContent: HTMLDivElement,
  searchedMonth: string
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const safeSearchedMonth = escapeHtml(searchedMonth);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Monthly Bill Summary - ${safeSearchedMonth}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            text-align: center;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
            color: #6b7280;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .total-row {
            background-color: #dcfce7 !important;
            font-weight: bold;
          }
          .total-row td {
            color: #166534;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
