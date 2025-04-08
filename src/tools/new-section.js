"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sectionName = Math.random().toString(36).substring(2, 8);
const newSectionTemplate = `{% header %}
<style>
.section-${sectionName} {}
</style>
{% endheader %}

<section class="section-${sectionName}">
</section>

{% footer %}
<script type="text/javascript">
</script>
{% endfooter %}`;
const newSectionFile = path_1.default.join(__dirname, '..', 'templates', `section-${sectionName}.liquid`);
fs_1.default.writeFileSync(newSectionFile, newSectionTemplate);
console.log(`New section ${sectionName} created at ${newSectionFile}`);
//# sourceMappingURL=new-section.js.map