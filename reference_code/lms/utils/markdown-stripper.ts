/**
 * Utility function to strip markdown syntax from text
 * This helps improve text-to-speech quality by removing markdown artifacts
 */

export function stripMarkdown(text: string): string {
  if (!text) return '';
  
  // Remove headers (### Header)
  let cleanText = text.replace(/^#{1,6}\s*(.*?)\s*#*$/gm, '$1');
  
  // Remove bold (**bold** or __bold__)
  cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '$1');
  cleanText = cleanText.replace(/__(.*?)__/g, '$1');
  
  // Remove italic (*italic* or _italic_)
  cleanText = cleanText.replace(/\*(.*?)\*/g, '$1');
  cleanText = cleanText.replace(/_(.*?)_/g, '$1');
  
  // Remove code blocks (```code```)
  cleanText = cleanText.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code (`code`)
  cleanText = cleanText.replace(/`(.*?)`/g, '$1');
  
  // Remove links ([text](url))
  cleanText = cleanText.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
  // Remove images (![alt](url))
  cleanText = cleanText.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');
  
  // Remove blockquotes (> quote)
  cleanText = cleanText.replace(/^>\s*(.*)$/gm, '$1');
  
  // Remove horizontal rules
  cleanText = cleanText.replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '');
  
  // Remove unordered lists (* item, - item, + item)
  cleanText = cleanText.replace(/^[\*\-\+]\s+(.*)$/gm, '$1');
  
  // Remove ordered lists (1. item)
  cleanText = cleanText.replace(/^\d+\.\s+(.*)$/gm, '$1');
  
  // Remove extra whitespace
  cleanText = cleanText.replace(/\n{3,}/g, '\n\n');
  cleanText = cleanText.trim();
  
  return cleanText;
}

export default stripMarkdown;