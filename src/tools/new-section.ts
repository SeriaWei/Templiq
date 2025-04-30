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
    padding:0 15px;
    margin:0 auto;
}
</style>
{% endheader %}

<section class="section-${sectionName}">
    <div class="content">Hello world</div>
</section>
`;

    const newSectionFile = path.join(__dirname, '..', 'templates', `section-${sectionName}.liquid`);
    fs.writeFileSync(newSectionFile, newSectionTemplate);

    // const newDataFile = path.join(__dirname, '..', 'data', `section-${sectionName}.json`);
    // fs.writeFileSync(newDataFile, "{}");

    // const newDefFile = path.join(__dirname, '..', 'data', `section-${sectionName}.def.json`);
    // fs.writeFileSync(newDefFile, "{}");

    console.log(`New section ${sectionName} created at ${newSectionFile}`);
    return { sectionName, filePath: newSectionFile };
}

if (require.main === module) {
    createNewSection();
}