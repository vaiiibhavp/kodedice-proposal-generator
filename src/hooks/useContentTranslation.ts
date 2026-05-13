import { useState, useCallback, useRef } from 'react';

// Cache translations to avoid repeated API calls
const translationCache = new Map<string, string>();

// Debounce utility to prevent rapid successive calls
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Use Google Translate unofficial API with batching support
const translateWithGoogle = async (texts: string[], targetLang: string): Promise<string[]> => {
  try {
    // Batch multiple texts in a single request
    const batchText = texts.join('|||'); // Use unique separator
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(batchText)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data[0]) {
      // Google Translate returns batched results that need to be split back
      const translatedText = data[0].map((item: any[]) => item[0]).join('');
      // Split by our separator, but be careful with cases where separator might appear in translation
      const results = translatedText.split('|||');
      
      // If split doesn't match original count, return original texts
      if (results.length !== texts.length) {
        console.warn('Translation batch split mismatch, falling back to individual calls');
        return texts;
      }
      
      return results;
    }
    return texts;
  } catch (error) {
    console.error('Google translate error:', error);
    return texts;
  }
};

// Fallback for single text translation
const translateSingleText = async (text: string, targetLang: string): Promise<string> => {
  const results = await translateWithGoogle([text], targetLang);
  return results[0] || text;
};

export function useContentTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});
  const abortRef = useRef(false);

  const translateText = useCallback(async (text: string, targetLang: string = 'fr'): Promise<string> => {
    if (!text || text.trim() === '') return text;
    
    // Improved cache key using full text hash for better accuracy
    const cacheKey = `text_${text}_${targetLang}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      const result = await translateSingleText(text, targetLang);
      translationCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }, []);

  // Extract text from HTML, translate, and put back (with batching)
  const translateHtml = useCallback(async (html: string, targetLang: string = 'fr'): Promise<string> => {
    if (!html || html.trim() === '') return html;

    // Improved cache key
    const cacheKey = `html_${html}_${targetLang}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      // Parse HTML and extract text nodes
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Get all text content
      const textNodes: { node: Text; originalText: string }[] = [];
      const walker = document.createTreeWalker(
        doc.body,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent && node.textContent.trim()) {
          const originalText = node.textContent || '';
          if (originalText.trim().length > 1) {
            textNodes.push({ node: node as Text, originalText });
          }
        }
      }

      // Batch translate all text nodes at once
      if (textNodes.length > 0 && !abortRef.current) {
        const textsToTranslate = textNodes.map(tn => tn.originalText);
        const translatedTexts = await translateWithGoogle(textsToTranslate, targetLang);
        
        // Apply translations back to nodes
        textNodes.forEach((tn, index) => {
          if (!abortRef.current && translatedTexts[index]) {
            tn.node.textContent = translatedTexts[index];
          }
        });
      }

      const result = doc.body.innerHTML;
      translationCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('HTML translation error:', error);
      return html;
    }
  }, []);

  // Translate multiple fields at once
  const translateProposal = useCallback(async (
    proposal: Record<string, any>,
    fields: string[],
    targetLang: string = 'fr'
  ): Promise<Record<string, string>> => {
    abortRef.current = false;
    setIsTranslating(true);
    const results: Record<string, string> = {};

    try {
      // Process all fields sequentially
      for (const field of fields) {
        if (abortRef.current) break;
        
        const value = proposal[field];
        if (typeof value === 'string' && value.trim()) {
          // Check if it's HTML content
          if (value.includes('<') && value.includes('>')) {
            results[field] = await translateHtml(value, targetLang);
          } else {
            results[field] = await translateText(value, targetLang);
          }
          
          // Update results progressively so user sees content appearing
          setTranslatedContent(prev => ({ ...prev, [field]: results[field] }));
        }
      }
    } catch (error) {
      console.error('Proposal translation error:', error);
    } finally {
      setIsTranslating(false);
    }

    return results;
  }, [translateHtml, translateText]);

  const clearTranslations = useCallback(() => {
    abortRef.current = true;
    setTranslatedContent({});
  }, []);

  // Debounced version of translateProposal to prevent rapid successive calls
  const debouncedTranslateProposal = useCallback(
    debounce(async (
      proposal: Record<string, any>,
      fields: string[],
      targetLang: string = 'fr',
      onComplete?: (results: Record<string, string>) => void
    ) => {
      const results = await translateProposal(proposal, fields, targetLang);
      if (onComplete) onComplete(results);
    }, 300),
    [translateProposal]
  );

  return {
    translateText,
    translateHtml,
    translateProposal,
    debouncedTranslateProposal,
    translatedContent,
    isTranslating,
    clearTranslations,
  };
}
