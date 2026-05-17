"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewSection = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function createNewSection(customName) {
    const sectionName = customName || new Date().getTime().toString(36);
    const newSectionTemplate = `<!-- Template name placeholder -->
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
    const newSectionFile = path_1.default.join(__dirname, '..', 'templates', `section-${sectionName}.liquid`);
    fs_1.default.writeFileSync(newSectionFile, newSectionTemplate);
    console.log(`New template file created at ${newSectionFile}`);
    const newDataFile = path_1.default.join(__dirname, '..', 'data', `section-${sectionName}.json`);
    fs_1.default.writeFileSync(newDataFile, `{"content": "Hello World!"}`);
    console.log(`New data file created at ${newDataFile}`);
    const newDefFile = path_1.default.join(__dirname, '..', 'data', `section-${sectionName}.def.json`);
    fs_1.default.writeFileSync(newDefFile, `{"content":{"FieldType":"SingleLine","DisplayName":"Content"}}`);
    console.log(`New field definition file created at ${newDefFile}`);
    return { sectionName, filePath: newSectionFile };
}
exports.createNewSection = createNewSection;
if (require.main === module) {
    createNewSection();
}
//# sourceMappingURL=new-section.js.map