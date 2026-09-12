import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function HostingerBridge({ phpFile, session }) {
  const [isLoading, setIsLoading] = useState(true);
  
  // إعادة التحميل إذا تغير الملف
  useEffect(() => {
    setIsLoading(true);
  }, [phpFile]);

  // تمرير التوكن لملف PHP ليتعرف على جلسة المستخدم
  const token = session?.access_token || '';
  const separator = phpFile.includes('?') ? '&' : '?';
  const url = `https://souqbtp.ma/app/${phpFile}${separator}access_token=${token}&embedded=true`;

  return (
    <div className="w-full h-full relative bg-slate-50 rounded-xl overflow-hidden shadow-sm border border-gray-100">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
          <p className="text-sm font-bold text-slate-500">جاري تحميل مساحة العمل...</p>
        </div>
      )}
      <iframe
        src={url}
        onLoad={() => setIsLoading(false)}
        className="w-full h-full border-none min-h-[75vh]"
        title="SouqBTP Internal View"
      />
    </div>
  );
}