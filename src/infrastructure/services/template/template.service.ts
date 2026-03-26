import Handlebars from 'handlebars';
import fs from 'node:fs';
import path from 'node:path';

// -- change -- xxx
export type TemplateServiceProps = {
    templatePath: string;
    data: {
        email: string;
        otp: string;
        subject?: string;
        message?: string;
    };
};

export class TemplateService {
    private _fs: typeof fs;
    private _templateEngine: typeof Handlebars;

    constructor() {
        this._fs = fs;
        this._templateEngine = Handlebars;
    }

    public async render(data: TemplateServiceProps) {
        const templateFile = this._fs.readFileSync(
            path.join(
                process.cwd(),
                'src/infrastructure/templates',
                data.templatePath,
            ),
            'utf8',
        );
        const template = this._templateEngine.compile(templateFile);
        const html = template(data.data);
        return html;
    }
}
