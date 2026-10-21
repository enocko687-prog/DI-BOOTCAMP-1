export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isRead: boolean;
  progress: number;
  addedAt: string;
}

export type NewBook = Pick<Book, "title" | "author" | "category">;

export class BookItem implements Book {
  constructor(
    public readonly id: string,
    public title: string,
    public author: string,
    public category: string,
    public isRead: boolean,
    public progress: number,
    public addedAt: string,
  ) {}

  get readStatus(): string {
    return this.isRead ? "Read" : "Unread";
  }

  static create(details: NewBook): BookItem {
    return new BookItem(
      crypto.randomUUID(),
      details.title.trim(),
      details.author.trim(),
      details.category.trim(),
      false,
      0,
      new Date().toISOString(),
    );
  }

  static fromJSON(value: unknown): BookItem {
    if (typeof value !== "object" || value === null) {
      throw new Error("Book data must be an object.");
    }

    const book = value as Record<string, unknown>;
    if (
      typeof book.id !== "string" ||
      typeof book.title !== "string" ||
      typeof book.author !== "string" ||
      typeof book.category !== "string" ||
      typeof book.isRead !== "boolean" ||
      typeof book.progress !== "number" ||
      !Number.isFinite(book.progress) ||
      book.progress < 0 ||
      book.progress > 100 ||
      typeof book.addedAt !== "string" ||
      Number.isNaN(Date.parse(book.addedAt))
    ) {
      throw new Error("Book data is missing required fields or has invalid values.");
    }

    return new BookItem(
      book.id,
      book.title,
      book.author,
      book.category,
      book.isRead,
      book.progress,
      book.addedAt,
    );
  }

  serialize(): Book {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      category: this.category,
      isRead: this.isRead,
      progress: this.progress,
      addedAt: this.addedAt,
    };
  }
}