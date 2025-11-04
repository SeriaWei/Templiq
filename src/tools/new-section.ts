import fs from 'fs';
import path from 'path';

export function createNewSection(customName?: string) {
    const sectionName = customName || new Date().getTime().toString(36);
    const newSectionTemplate = 
`<!-- Template name placeholder -->
{% header %}
<style>
.section-${sectionName} {
    background-color: #f0f0f0;
    padding: 2em 0;
}
.section-${sectionName} .content {
    max-width:1170px;
    margin:0 auto;
}
</style>
{% endheader %}

<section class="section-${sectionName}">
    <div class="content">{{this.Model.content}}</div>
</section>
`;

    console.log(`Creating new section template: section-${sectionName}`);

    const newSectionFile = path.join(__dirname, '..', 'templates', `section-${sectionName}.liquid`);
    fs.writeFileSync(newSectionFile, newSectionTemplate);
    console.log(`New template file created at ${newSectionFile}`);

    const newDataFile = path.join(__dirname, '..', 'data', `section-${sectionName}.json`);
    fs.writeFileSync(newDataFile, `{"content": "Hello World!"}`);
    console.log(`New data file created at ${newDataFile}`);

    const newDefFile = path.join(__dirname, '..', 'data', `section-${sectionName}.def.json`);
    fs.writeFileSync(newDefFile, `{"content":{"FieldType":"SingleLine","DisplayName":"Content"}}`);
    console.log(`New field definition file created at ${newDefFile}`);

    return { sectionName, filePath: newSectionFile };
}

if (require.main === module) {
    createNewSection();
}