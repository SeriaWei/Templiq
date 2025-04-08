import fs from 'fs';
import path from 'path';
const sectionName = new Date().getTime().toString(36).substring(2);
const newSectionTemplate = 
`{% header %}
<style>
.section-${sectionName} {}
</style>
{% endheader %}

<section class="section-${sectionName}">
</section>

{% footer %}
<script type="text/javascript">
</script>
{% endfooter %}`

const newSectionFile = path.join(__dirname, '..', 'templates', `section-${sectionName}.liquid`);
fs.writeFileSync(newSectionFile, newSectionTemplate);

console.log(`New section ${sectionName} created at ${newSectionFile}`);