"use client";

import { FAQItem } from "./faq-item";
import { helpFaqs as faqs } from "@/data";

interface HelpFAQProps {
  searchQuery?: string;
}

export function HelpFAQ({ searchQuery = "" }: HelpFAQProps) {
  const query = searchQuery.toLowerCase();
  
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(query) || 
    faq.answer.toLowerCase().includes(query)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-10">
      <div className="lg:col-span-4">
        <h2 className="text-2xl font-bold mb-4">Perguntas Frequentes</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Tudo o que precisa de saber sobre o sistema e outras informações. Não encontra a resposta que procura?
        </p>
        <p className="text-sm text-muted-foreground">
          Diga olá em <a href="mailto:suporte@medproject.pt" className="text-primary hover:underline font-medium">suporte@medproject.pt</a>
        </p>
      </div>
      
      <div className="lg:col-span-8 flex flex-col pt-1">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <FAQItem 
              key={index} 
              question={faq.question} 
              answer={faq.answer} 
              isOpenByDefault={index === 0 && !query} 
            />
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            Não foram encontradas perguntas para "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  );
}
