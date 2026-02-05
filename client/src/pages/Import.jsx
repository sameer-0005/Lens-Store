import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import api from '../api/axios';

const Import = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);

  const columnMappings = {
    boxNumber: ['boxNumber', 'BoxNumber', 'box_number', 'Box Number', 'box'],
    quantity: ['quantity', 'Quantity', 'qty', 'Qty', 'QTY'],
    sph: ['sph', 'SPH', 'Sph', 'spherical'],
    cyl: ['cyl', 'CYL', 'Cyl', 'cylindrical'],
    axis: ['axis', 'AXIS', 'Axis'],
    addition: ['addition', 'Addition', 'ADD', 'add', 'Add']
  };

  const findColumn = (headers, mappings) => {
    for (const mapping of mappings) {
      const found = headers.find(h => h === mapping);
      if (found) return found;
    }
    return null;
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: null });

        if (jsonData.length === 0) {
          toast.error('File is empty');
          return;
        }

        const headers = Object.keys(jsonData[0]);
        const boxCol = findColumn(headers, columnMappings.boxNumber);
        const qtyCol = findColumn(headers, columnMappings.quantity);

        if (!boxCol || !qtyCol) {
          toast.error('Missing required columns: boxNumber and quantity');
          return;
        }

        const sphCol = findColumn(headers, columnMappings.sph);
        const cylCol = findColumn(headers, columnMappings.cyl);
        const axisCol = findColumn(headers, columnMappings.axis);
        const addCol = findColumn(headers, columnMappings.addition);

        const validEntries = [];
        const errors = [];

        jsonData.forEach((row, index) => {
          const rowNum = index + 2; // Excel row (1-indexed + header)
          const entry = {
            boxNumber: row[boxCol],
            quantity: row[qtyCol],
            sph: sphCol ? row[sphCol] : null,
            cyl: cylCol ? row[cylCol] : null,
            axis: axisCol ? row[axisCol] : null,
            addition: addCol ? row[addCol] : null
          };

          // Validation
          const rowErrors = [];
          if (!entry.boxNumber) rowErrors.push('Missing box number');
          if (entry.quantity === null || entry.quantity === undefined || entry.quantity < 0) {
            rowErrors.push('Invalid quantity');
          }
          if (entry.sph !== null && (entry.sph < -20 || entry.sph > 20)) {
            rowErrors.push('SPH out of range');
          }
          if (entry.cyl !== null && (entry.cyl < -6 || entry.cyl > 6)) {
            rowErrors.push('CYL out of range');
          }
          if (entry.axis !== null && (entry.axis < 0 || entry.axis > 180)) {
            rowErrors.push('Axis out of range');
          }

          if (rowErrors.length > 0) {
            errors.push({ row: rowNum, errors: rowErrors });
          } else {
            validEntries.push(entry);
          }
        });

        setPreview({
          validEntries,
          errors,
          total: jsonData.length,
          previewData: jsonData.slice(0, 10)
        });
      } catch (error) {
        toast.error('Failed to parse file');
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      parseFile(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleImport = async () => {
    if (!preview?.validEntries.length) return;

    setImporting(true);
    try {
      const res = await api.post('/lens/import', { lenses: preview.validEntries });
      toast.success(res.data.message);
      navigate('/search');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const downloadSample = () => {
    const sampleData = [
      { boxNumber: 'A1', sph: -2.00, cyl: -1.00, axis: 90, addition: '', quantity: 10 },
      { boxNumber: 'A2', sph: 1.50, cyl: '', axis: '', addition: 2.00, quantity: 8 },
      { boxNumber: 'B1', sph: -3.25, cyl: -0.75, axis: 180, addition: '', quantity: 15 }
    ];
    
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lenses');
    XLSX.writeFile(wb, 'sample_lenses.xlsx');
  };

  const resetImport = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="page-container px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Import Lenses
        </h1>
      </div>

      {!preview ? (
        <>
          {/* Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="card p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-primary-500 transition-colors"
          >
            <div className="text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                Drop your file here
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Supports .csv, .xlsx, .xls
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Format Guide */}
          <div className="mt-6 card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary-600" />
              File Format Guide
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-gray-400">Required columns:</p>
              <ul className="list-disc list-inside text-gray-500 dark:text-gray-400 ml-2">
                <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">boxNumber</code> - Location identifier</li>
                <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">quantity</code> - Stock count</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-3">Optional columns:</p>
              <ul className="list-disc list-inside text-gray-500 dark:text-gray-400 ml-2">
                <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">sph</code> - Spherical power (-20 to +20)</li>
                <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">cyl</code> - Cylindrical power (-6 to +6)</li>
                <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">axis</code> - Axis degree (0-180)</li>
                <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">addition</code> - Addition power</li>
              </ul>
            </div>
            <button
              onClick={downloadSample}
              className="mt-4 flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium text-sm"
            >
              <Download className="h-4 w-4" />
              Download Sample File
            </button>
          </div>
        </>
      ) : (
        /* Preview */
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{preview.validEntries.length}</p>
                <p className="text-sm text-gray-500">Valid entries</p>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{preview.errors.length}</p>
                <p className="text-sm text-gray-500">Errors</p>
              </div>
            </div>
          </div>

          {/* Errors */}
          {preview.errors.length > 0 && (
            <div className="card p-4">
              <h3 className="font-medium text-red-600 mb-3">Errors found:</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {preview.errors.map((error, i) => (
                  <p key={i} className="text-sm text-gray-600 dark:text-gray-400">
                    Row {error.row}: {error.errors.join(', ')}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Preview Table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Preview (first 10 rows)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left">Box</th>
                    <th className="px-4 py-2 text-left">SPH</th>
                    <th className="px-4 py-2 text-left">CYL</th>
                    <th className="px-4 py-2 text-left">Axis</th>
                    <th className="px-4 py-2 text-left">Add</th>
                    <th className="px-4 py-2 text-left">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {preview.validEntries.slice(0, 10).map((entry, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2">{entry.boxNumber}</td>
                      <td className="px-4 py-2">{entry.sph ?? '-'}</td>
                      <td className="px-4 py-2">{entry.cyl ?? '-'}</td>
                      <td className="px-4 py-2">{entry.axis ?? '-'}</td>
                      <td className="px-4 py-2">{entry.addition ?? '-'}</td>
                      <td className="px-4 py-2">{entry.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={resetImport} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={importing || preview.validEntries.length === 0}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${preview.validEntries.length} Lenses`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Import;
