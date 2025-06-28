import emojisData from "../../../emojis.json\" assert { type: "json" };

export interface EmojiData {
  name: string;
  unicode: string;
  category: string;
  subcategory?: string;
  keywords: string[];
}

export class EmojiManager {
  private emojis: EmojiData[] = emojisData as EmojiData[];

  getRandomEmoji(): EmojiData {
    const randomIndex = Math.floor(Math.random() * this.emojis.length);
    return this.emojis[randomIndex];
  }

  getEmojiByName(name: string): EmojiData | undefined {
    return this.emojis.find(emoji => 
      emoji.name.toLowerCase() === name.toLowerCase()
    );
  }

  getEmojisByCategory(category: string): EmojiData[] {
    return this.emojis.filter(emoji => 
      emoji.category.toLowerCase() === category.toLowerCase()
    );
  }

  searchEmojis(query: string): EmojiData[] {
    const lowerQuery = query.toLowerCase();
    return this.emojis.filter(emoji =>
      emoji.name.toLowerCase().includes(lowerQuery) ||
      emoji.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
    );
  }

  getCategories(): string[] {
    const categories = new Set(this.emojis.map(emoji => emoji.category));
    return Array.from(categories);
  }

  getEmojisBySubcategory(subcategory: string): EmojiData[] {
    return this.emojis.filter(emoji => 
      emoji.subcategory?.toLowerCase() === subcategory.toLowerCase()
    );
  }

  formatEmoji(emoji: EmojiData): string {
    return emoji.unicode;
  }

  formatEmojiWithName(emoji: EmojiData): string {
    return `${emoji.unicode} ${emoji.name}`;
  }

  getEmojiCount(): number {
    return this.emojis.length;
  }

  getCategoryCount(): number {
    return this.getCategories().length;
  }

  getRandomEmojiFromCategory(category: string): EmojiData | undefined {
    const categoryEmojis = this.getEmojisByCategory(category);
    if (categoryEmojis.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * categoryEmojis.length);
    return categoryEmojis[randomIndex];
  }

  validateEmoji(unicode: string): boolean {
    return this.emojis.some(emoji => emoji.unicode === unicode);
  }

  getEmojiInfo(unicode: string): EmojiData | undefined {
    return this.emojis.find(emoji => emoji.unicode === unicode);
  }
}

export const emojiManager = new EmojiManager();