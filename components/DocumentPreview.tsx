
import React from 'react';
import { ExtractedInfo } from '../types';

interface DocumentPreviewProps {
  data: ExtractedInfo;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ data }) => {
  // Pad tables to maintain form height even if data is short
  const householdRows = [...(data.householdRecords || [])];
  while (householdRows.length < 3) householdRows.push({ date: '', type: '', address: '' });

  const currentAddressRows = [...(data.currentAddressRecords || [])];
  while (currentAddressRows.length < 4) currentAddressRows.push({ date: '', address: '' });

  // Custom style for distributed alignment of Chinese text
  const labelStyle: React.CSSProperties = {
    textAlign: 'justify',
    textAlignLast: 'justify',
    display: 'inline-block',
    width: '100%'
  };

  return (
    <div className="bg-white p-8 md:p-12 shadow-2xl border border-gray-300 rounded-sm w-full max-w-2xl mx-auto print-container relative" style={{ minHeight: '842px' }}>
      {/* Centered Header */}
      <div className="flex justify-center items-center mb-8 border-b-2 border-teal-900 pb-4">
        <h1 className="text-teal-950 font-black text-3xl tracking-[0.1em]">就业失业登记证（相关信息）</h1>
      </div>

      {/* Top Section - Personal Info (No Photo, Full Width) */}
      <div className="relative border-b-2 border-gray-400 pb-8 mb-6">
        <div className="grid grid-cols-1 gap-y-4 max-w-lg mx-auto">
          {[
            { label: '姓 名', value: data.name },
            { label: '身份证号', value: data.idNumber, tracking: 'tracking-wider' },
            { label: '性 别', value: data.gender },
            { label: '出生日期', value: data.birthDate },
            { label: '民 族', value: data.ethnicity },
            { label: '发证日期', value: data.issueDate },
            { label: '发证机构', value: data.issueAuthority },
          ].map((field, idx) => (
            <div key={idx} className="flex items-end border-b border-dotted border-gray-400 pb-1">
              {/* Distributed Alignment Label Container */}
              <div className="w-28 shrink-0 mr-2">
                <span className="font-bold text-gray-800 text-base" style={labelStyle}>
                  {field.label}
                </span>
              </div>
              <span className="font-bold text-gray-800 mr-2">：</span>
              <span className={`flex-1 font-black text-black text-lg ${field.tracking || ''}`}>
                {field.value || '————'}
              </span>
            </div>
          ))}
          
          <div className="flex items-end border-b border-dotted border-gray-400 pb-1 mt-2">
            <div className="w-28 shrink-0 mr-2">
              <span className="font-bold text-gray-800 text-base" style={labelStyle}>
                证件编号
              </span>
            </div>
            <span className="font-bold text-gray-800 mr-2">：</span>
            <span className="flex-1 tracking-widest font-black text-black text-lg font-mono">
              {data.docNumber || '————'}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section - Household Status */}
      <div className="mt-10">
        <div className="text-center font-bold text-base mb-3 text-teal-950 bg-teal-100/60 py-2 border-t-2 border-b-2 border-teal-900 tracking-widest">
          户 籍 性 质、户 籍 地 址 及 变 更 情 况
        </div>
        <table className="w-full border-collapse border-2 border-teal-900 text-sm">
          <thead>
            <tr className="bg-teal-50">
              <th className="border-2 border-teal-900 p-3 w-32 text-teal-950 font-black">日 期</th>
              <th className="border-2 border-teal-900 p-3 w-28 text-teal-950 font-black">户籍性质</th>
              <th className="border-2 border-teal-900 p-3 text-teal-950 font-black">详 细 地 址</th>
            </tr>
          </thead>
          <tbody>
            {householdRows.map((row, i) => (
              <tr key={i} className="h-12">
                <td className="border border-teal-900 p-3 text-center font-bold text-black bg-white">{row.date}</td>
                <td className="border border-teal-900 p-3 text-center font-bold text-black bg-white">{row.type}</td>
                <td className="border border-teal-900 p-3 font-bold text-black bg-white">{row.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Section - Current Address */}
      <div className="mt-10">
        <div className="text-center font-bold text-base mb-3 text-teal-950 bg-teal-100/60 py-2 border-t-2 border-b-2 border-teal-900 tracking-widest">
          常 住 地 址 及 变 更 情 况
        </div>
        <table className="w-full border-collapse border-2 border-teal-900 text-sm">
          <thead>
            <tr className="bg-teal-50">
              <th className="border-2 border-teal-900 p-3 w-32 text-teal-950 font-black">日 期</th>
              <th className="border-2 border-teal-900 p-3 text-teal-950 font-black">详 细 地 址</th>
            </tr>
          </thead>
          <tbody>
            {currentAddressRows.map((row, i) => (
              <tr key={i} className="h-12">
                <td className="border border-teal-900 p-3 text-center font-bold text-black bg-white">{row.date}</td>
                <td className="border border-teal-900 p-3 font-bold text-black bg-white">{row.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="absolute bottom-6 left-8 right-8 flex justify-center items-end text-[12px] text-gray-700 font-bold border-t-2 border-gray-100 pt-3">
        <span>以上信息依据智慧就业系统导出生成。</span>
      </div>
    </div>
  );
};

export default DocumentPreview;
