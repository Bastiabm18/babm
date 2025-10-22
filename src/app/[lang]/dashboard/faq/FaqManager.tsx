'use client';

import { useState } from 'react';
import { Faq } from '@/app/[lang]/dashboard/faq/actions';
import FaqForm from './FaqForm';
import FaqsTable from './FaqsTable';
interface FaqManagerProps {
  initialFaqs: Faq[];
}

export default function FaqManager({ initialFaqs }: FaqManagerProps) {
  const [faqs, setFaqs] = useState<Faq[]>(initialFaqs);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);

  const handleFaqSaved = (savedFaq: Faq) => {
    if (editingFaq) {
      setFaqs(faqs.map(f => f.id === savedFaq.id ? savedFaq : f));
    } else {
      setFaqs([savedFaq, ...faqs]);
    }
    setEditingFaq(null);
  };

  const handleEdit = (faq: Faq) => {
    setEditingFaq(faq);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingFaq(null);
  };

  return (
    <div className="space-y-8">
      <FaqForm 
        editingFaq={editingFaq}
        onCancelEdit={handleCancelEdit}
        onFaqSaved={handleFaqSaved}
      />
      <FaqsTable 
        faqs={faqs}
        onEdit={handleEdit}
        onFaqDeleted={(faqId) => setFaqs(faqs.filter(f => f.id !== faqId))}
      />
    </div>
  );
}
