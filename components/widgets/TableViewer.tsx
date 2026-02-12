import React from 'react';
import { TableData } from '../../types';

interface TableViewerProps {
  data: TableData;
}

const TableViewer: React.FC<TableViewerProps> = ({ data }) => {
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-machine-highlight bg-machine-surface/50">
      {data.title && (
        <div className="bg-machine-highlight/30 px-4 py-2 border-b border-machine-highlight">
          <h3 className="text-sm font-semibold text-machine-cyan">{data.title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-machine-base text-slate-400">
            <tr>
              {data.headers.map((header, i) => (
                <th key={i} className="px-6 py-3 border-b border-machine-highlight">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr key={i} className="border-b border-machine-highlight/50 hover:bg-machine-highlight/30 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-6 py-4 font-mono text-slate-300 whitespace-nowrap">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableViewer;