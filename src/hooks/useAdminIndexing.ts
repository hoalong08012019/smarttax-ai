import { useState } from 'react';

export const useAdminIndexing = () => {
  const [adminIndexingTitle, setAdminIndexingTitle] = useState<string>('');
  const [adminIndexingStatus, setAdminIndexingStatus] = useState<string | null>(null);
  const [adminSystemPromptOverride, setAdminSystemPromptOverride] = useState<string>(
    'Bắt buộc áp dụng trích xuất RAG chặt chẽ theo Thông tư 80/133/88.'
  );

  const handleIndex = () => {
    if (!adminIndexingTitle.trim()) return;
    setAdminIndexingStatus('INDEXING');
    setTimeout(() => {
      setAdminIndexingStatus('SUCCESS');
    }, 1200);
  };

  return {
    adminIndexingTitle,
    setAdminIndexingTitle,
    adminIndexingStatus,
    setAdminIndexingStatus,
    adminSystemPromptOverride,
    setAdminSystemPromptOverride,
    handleIndex
  };
};
