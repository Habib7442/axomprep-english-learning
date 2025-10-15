// CBSE Class 9 Science Chapters Data
export interface CBSEChapter {
  class: string;
  subject: string;
  chapter_number: number;
  chapter_name: string;
}

export const cbseChapters: CBSEChapter[] = [
  {
    class: "CBSE 9",
    subject: "Chemistry",
    chapter_number: 1,
    chapter_name: "Matter in Our Surroundings"
  },
  {
    class: "CBSE 9",
    subject: "Chemistry",
    chapter_number: 2,
    chapter_name: "Is Matter Around Us Pure"
  },
  {
    class: "CBSE 9",
    subject: "Chemistry",
    chapter_number: 3,
    chapter_name: "Atoms and Molecules"
  },
  {
    class: "CBSE 9",
    subject: "Chemistry",
    chapter_number: 4,
    chapter_name: "Structure of the Atom"
  },
  {
    class: "CBSE 9",
    subject: "Biology",
    chapter_number: 5,
    chapter_name: "The Fundamental Unit of Life (Cell)"
  },
  {
    class: "CBSE 9",
    subject: "Biology",
    chapter_number: 6,
    chapter_name: "Tissues"
  },
  {
    class: "CBSE 9",
    subject: "Biology",
    chapter_number: 7,
    chapter_name: "Diversity in Living Organisms"
  },
  {
    class: "CBSE 9",
    subject: "Biology",
    chapter_number: 8,
    chapter_name: "Why Do We Fall Ill (Health and Diseases)"
  },
  {
    class: "CBSE 9",
    subject: "Physics",
    chapter_number: 9,
    chapter_name: "Motion"
  },
  {
    class: "CBSE 9",
    subject: "Physics",
    chapter_number: 10,
    chapter_name: "Force and Laws of Motion"
  },
  {
    class: "CBSE 9",
    subject: "Physics",
    chapter_number: 11,
    chapter_name: "Gravitation"
  },
  {
    class: "CBSE 9",
    subject: "Physics",
    chapter_number: 12,
    chapter_name: "Work and Energy"
  },
  {
    class: "CBSE 9",
    subject: "Physics",
    chapter_number: 13,
    chapter_name: "Sound"
  },
  {
    class: "CBSE 9",
    subject: "Environmental Science/Biology",
    chapter_number: 14,
    chapter_name: "Natural Resources"
  }
];

// Function to get chapters by class and subject
export const getChaptersByClassAndSubject = (className: string, subject: string) => {
  return cbseChapters.filter(
    chapter => 
      chapter.class.includes(className) && 
      chapter.subject.toLowerCase() === subject.toLowerCase()
  );
};

// Function to get all subjects for a class
export const getSubjectsByClass = (className: string) => {
  const subjects = cbseChapters
    .filter(chapter => chapter.class.includes(className))
    .map(chapter => chapter.subject);
  
  // Remove duplicates
  return [...new Set(subjects)];
};

// Function to get all chapters for a class
export const getChaptersByClass = (className: string) => {
  return cbseChapters.filter(chapter => chapter.class.includes(className));
};