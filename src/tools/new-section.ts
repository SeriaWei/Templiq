import fs from 'fs';
import path from 'path';

export function createNewSection(customName?: string) {
    const sectionName = customName || new Date().getTime().toString(36);
    const newSectionTemplate = 
`<!-- Template name placeholder -->
{% header %}
<style>
.section-${sectionName} {
    padding:1em 0;
}
</style>
{% endheader %}

<section class="section-${sectionName}">
</section>

{% footer %}
<script type="text/javascript">
</script>
{% endfooter %}`;

    const newSectionFile = path.join(__dirname, '..', 'templates', `section-${sectionName}.liquid`);
    fs.writeFileSync(newSectionFile, newSectionTemplate);

    const newDataFile = path.join(__dirname, '..', 'data', `section-${sectionName}.json`);
    fs.writeFileSync(newDataFile, "{}");

    const newDefFile = path.join(__dirname, '..', 'data', `section-${sectionName}.def.json`);
    fs.writeFileSync(newDefFile, "{}");

    console.log(`New section ${sectionName} created at ${newSectionFile}`);
    return { sectionName, filePath: newSectionFile };
}

if (require.main === module) {
    createNewSection();
}