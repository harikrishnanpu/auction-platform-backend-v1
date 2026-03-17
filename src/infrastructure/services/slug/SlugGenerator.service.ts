import { ISlugGeneratorService } from '@application/interfaces/services/ISlugGeneratorService';
import slugify from 'slugify';

export class SlugGeneratorService implements ISlugGeneratorService {
  generateSlug(input: string, parentSlug: string | null): string {
    const slug = slugify(input, { lower: true, strict: true });

    if (parentSlug) {
      return `${parentSlug}-${slug}`;
    }

    return slug;
  }
}
