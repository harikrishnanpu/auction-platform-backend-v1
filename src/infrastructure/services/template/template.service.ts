import Handlebars from 'handlebars';
import fs from 'node:fs';

export type TemplateServiceProps = {
  templatePath: string;
  data: {
    email: string;
    otp: string;
  };
};

export class TemplateService {
  constructor(
    private _fs: typeof fs,
    private _templateEngine: typeof Handlebars,
  ) {}

  public async render(data: TemplateServiceProps) {
    const templateFile = this._fs.readFileSync(data.templatePath, 'utf8');
    const template = this._templateEngine.compile(templateFile);
    const html = template(data.data);
    return html;
  }
}
