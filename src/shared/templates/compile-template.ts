import handlebars from 'handlebars';

export async function compileTemplate(templateSource: string, data: any): Promise<string> {
    const template = handlebars.compile(templateSource);
    return template(data);
}