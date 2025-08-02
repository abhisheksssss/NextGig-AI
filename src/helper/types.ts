export interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string; // ISO 8601 date string
  content: string | null;
}

export interface NewsApiResponse {
  status: "ok" | "error";
  totalResults?: number;
  articles?: Article[];
  code?: string;         // only present on error
  message?: string;      // only present on error
}


export interface CustomSearchResult {
  kind: string; // e.g., 'customsearch#result'
  title: string;
  htmlTitle: string;
  link: string;
  displayLink: string;
  snippet: string;
  htmlSnippet: string;
  formattedUrl: string;
  htmlFormattedUrl: string;
  pagemap?: PageMap; // optional, as sometimes pagemap might not exist
}

// Define the structure of pagemap
export interface PageMap {
  metatags?: Array<Record<string, string>>; // meta tags like og:title, og:description, etc.
  cse_image?: Array<{ src: string }>;
  cse_thumbnail?: Array<{ src: string; width?: string; height?: string }>;
 // fallback for other possible structured types like article, person, etc.
}