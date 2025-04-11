图片用网上的免费图片，确保图片以合适的尺寸加载。如果不需要javascript，请移除footer。CSS样式中font-size优先使用em而非rem。界面要美观大方有设计感，支持各种尺寸的设备。可以使用bootstrap3中定义的样式，如果要用.container，应另外定义一个避免冲突，新添加的样式都要限定在这个section的作用域下。同时需要创建对应的json数据和字段定义，并保存src/data目录下。

# 模板规范
model binding使用的是liquid模板语法，但有些特殊要求，规范如下：
``` src/templates/tpl.liquid
<p property="true" data-property="Heading" method="text">{{this.Model.Heading}}</p>
<p property="true" data-property="HtmlContent" method="html">{{this.Model.HtmlContent | raw}}</p>
<a property="true" data-property="Link" method="attr" para="href" href="{% url this.Model.Link %}">{{this.Model.LinkText}}</a>
{% for item in this.Model.Images %}
<img property="true" data-property="Images[{{forloop.index | minus:1}}].Src" method="attr" para="src" src="{% url item.Src %}" />
</li>
{% endfor %}
```
# JSON data 示例
``` src/data/tpl.json
{"Heading": "标题栏","HtmlContent": "<p>Html text</p>","Images": [{"Src": "https://images.unsplash.com/photo-xxx?w=500&q=80"}]}
```
# 字段定义规范
## 基本要求
1. 字段定义必须使用JSON格式
2. 只支持一级嵌套结构
3. DisplayName必须使用中文
4. 禁止使用的字段名：Description, Status, Title, Position, Thumbnail
5. 字段定义必须包含字段类型(FieldType)和显示名称(DisplayName)

## 字段类型(FieldType)选项
必须是以下值之一：
- SingleLine: 单行文本
- Paragraph: 多行文本
- HtmlBox: HTML内容
- Address: 地址
- Checkbox: 复选框
- Radio: 单选按钮
- Date: 日期
- Dropdown: 下拉菜单
- Email: 邮箱
- Number: 数字
- Phone: 电话
- Media: 媒体文件
- Array: 数组类型(需包含Children定义[数组])

## 字段属性说明
1. 每个字段必须包含：
   - FieldType: 字段类型
   - DisplayName: 显示名称(中文)
   
2. 可选属性：
   - IsRequired: 是否必填(true/false)
   - FieldOptions: 选项列表(仅Checkbox(多选)/Radio/Dropdown类型需要)
     - 每个选项包含:
       - DisplayText: 显示文本
       - Value: 选项值

## 示例模板
``` src/data/tpl.def.json
{
"Heading": {"FieldType": "SingleLine","DisplayName": "标题栏"},
"Summary": {"FieldType": "Paragraph","DisplayName": "概述"},
"HtmlContent": {"FieldType": "HtmlBox","DisplayName": "简介"},
"Address": {"FieldType": "Address","DisplayName": "地址"},
"IsPublished": {"FieldType": "Checkbox","DisplayName": "已发布？"},
"Hobby": {"FieldType": "Checkbox","DisplayName": "爱好","FieldOptions": [{"DisplayText": "看书","Value": "1"},{"DisplayText": "看电影","Value": "2"}]},
"Working": {"FieldType": "Radio","DisplayName": "工作情况","FieldOptions": [{"DisplayText": "在职","Value": "1"},{"DisplayText": "自由职业","Value": "2"}]},
"PublishedDate": {"FieldType": "Date","DisplayName": "发布日期"},
"Gender": {"FieldType": "Dropdown","DisplayName": "性别","FieldOptions": [{"DisplayText": "男","Value": "1"},{"DisplayText": "女","Value": "2"}]},
"Email": {"FieldType": "Email","DisplayName": "邮箱","IsRequired": true},
"Age": {"FieldType": "Number","DisplayName": "年龄"},
"Phone": {"FieldType": "Phone","DisplayName": "电话"},
"Avatar": {"FieldType": "Media","DisplayName": "头像"},
"GalleryItems": {"FieldType": "Array","DisplayName": "数组","Children": [{"Src": {"FieldType": "Media","DisplayName": "图片","IsRequired": true},"Description": {"FieldType": "Paragraph","DisplayName": "描述"} }]}
}
```