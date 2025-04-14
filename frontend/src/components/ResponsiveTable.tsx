import * as React from 'react';

interface Column {
  header: string;
  accessor: string;
  cell?: (item: any) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  width?: string;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  keyField: string;
  className?: string;
  mobileCardTitle?: (item: any) => string;
  emptyMessage?: string;
  responsive?: boolean;
  compactOnMobile?: boolean;
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  keyField,
  className = '',
  mobileCardTitle,
  emptyMessage = 'No hay datos disponibles',
  responsive = true,
  compactOnMobile = true
}: ResponsiveTableProps) => {
  // Si no hay datos, mostrar mensaje
  if (data.length === 0) {
    return (
      <div className="text-center py-6 bg-white rounded-lg shadow">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow overflow-hidden rounded-lg ${className}`}>
      {/* Vista de escritorio */}
      <div className={`${responsive && compactOnMobile ? 'hidden md:block' : 'block'}`}>
        <div className="overflow-hidden">
          <div className="overflow-x-auto max-w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column: Column, index: number) => (
                    <th 
                      key={index} 
                      scope="col" 
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                      style={column.width ? { width: column.width } : {}}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item: any) => (
                  <tr key={item[keyField]} className="hover:bg-gray-50">
                    {columns.map((column: Column, index: number) => (
                      <td 
                        key={index} 
                        className={`px-6 py-4 text-sm ${column.className || ''}`}
                        style={column.width ? { width: column.width } : {}}
                      >
                        <div className="truncate">
                          {column.cell ? column.cell(item) : item[column.accessor]}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Vista móvil (tarjetas) */}
      {responsive && compactOnMobile && (
        <div className="md:hidden divide-y divide-gray-200">
          {data.map((item: any) => (
            <div key={item[keyField]} className="p-4 space-y-3">
              {/* Título de la tarjeta (si se proporciona) */}
              {mobileCardTitle && (
                <div className="font-medium text-indigo-600 pb-2 border-b border-gray-200 break-words">
                  {mobileCardTitle(item)}
                </div>
              )}
              
              {/* Contenido de las columnas como pares clave/valor */}
              {columns.filter((col: Column) => !col.hideOnMobile).map((column: Column, index: number) => (
                <div key={index} className="flex flex-col">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    {column.header}
                  </div>
                  <div className="text-sm break-words">
                    {column.cell ? column.cell(item) : item[column.accessor]}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResponsiveTable; 