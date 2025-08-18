// TypeScript
export interface BookResponse {
  id: string; // UUID as string
  isbn?: string | null;
  title: string;
  author: string;
  genre: string; // server expects enum name string
  description?: string | null;
  shelfLocation: string;
  numberOfCopies: number;
  availableCopies: number;
  publicationYear?: string | null;
}

export interface CreateBookRequest {
  isbn?: string | null;
  title: string;
  author: string;
  genre: string; // enum string
  description?: string | null;
  shelfLocation: string;
  numberOfCopies: number;
  availableCopies: number;
  publicationYear?: string | null;
}

export interface UpdateBookRequest {
  isbn?: string | null;
  title?: string | null;
  author?: string | null;
  genre?: string | null;
  description?: string | null;
  shelfLocation?: string | null;
  numberOfCopies?: number | null;
  availableCopies?: number | null;
  publicationYear?: string | null;
}
