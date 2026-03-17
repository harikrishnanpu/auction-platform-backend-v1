export interface ISlugGeneratorService {
  generateSlug(input: string, parentSlug?: string | null): string;
}
