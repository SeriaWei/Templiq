# 基本规范
完成模板代码，界面要精致美观有设计感，支持各种尺寸的设备，注意要有良好的用户体验。用网上的免费图片时，确保图片以合适的尺寸加载。然后初始化(文件已创建)模板对应的JSON数据(src/data/{template-name}.json)和字段定义(src/data/{template-name}.def.json)。注意必须保证模板，数据和字段定义三者的一致性。

# 模板规范
- 模板的第一行用HTML注释写上模板的中文名字，要简短，不要出现“区块”，“模板”之类的字眼
- 如果不需要javascript，请移除footer
- CSS样式中font-size优先使用em而非rem
- 可以使用bootstrap3中定义的样式，但禁止使用.container这个类，如果需要请重新定义一个避免冲突。
- 如果要限制section宽度，请使用max-width。例如:max-width:1170px;padding-right:15px;padding-left:15px;margin: 0 auto;
- 所有的样式都要限定在这个section的作用域下。
Model binding使用的是liquid模板语法，注意添加条件判断以避免生成空标签，还有些特殊要求，规范如下：
``` src/templates/tpl.liquid
{% if this.Model.heading %}
<p property="true" data-property="heading" method="text">{{this.Model.heading}}</p>
{% endif %}
{% if this.Model.html_content %}
<p property="true" data-property="html_content" method="html">{{this.Model.html_content | raw}}</p>
{% endif %}
{% if this.Model.link_text %}
<a property="true" data-property="link" method="attr" para="href" href="{% url this.Model.link %}">{{this.Model.link_text}}</a>
{% endif %}
{% for item in this.Model.images %}
<img property="true" data-property="images[{{forloop.index | minus:1}}].src" method="attr" para="src" src="{% url item.src %}" />
</li>
{% endfor %}
```
# JSON 数据规范
## 基本要求
- 不要使用placeholder形式的数据，请使用专业真实数据
- 属性必须使用snake_case命名法
- 数组类型的属性值必须是对象
## 示例
``` src/data/tpl.json
{
    "heading": "标题栏",
    "html_content": "<p>Html text</p>",
    "images": [
        {
            "src": "https://images.unsplash.com/photo-xxx?w=500&q=80"
        }
    ]
}
```
# 字段定义规范
## 基本要求
- 字段定义必须使用JSON格式
- 字段名必须使用snake_case命名法
- 字段定义必须包含字段类型(FieldType)和中文显示名称(DisplayName)
- 仅当字段类型是Array的时候，才使用Children定义子字段

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
- Array: 数组类型(需包含Children定义)

## 字段属性说明   
可选属性：
- IsRequired: 是否必填(true/false)
- FieldOptions: 选项列表(仅Checkbox(多选)/Radio/Dropdown类型需要)
  - 每个选项包含:
  - DisplayText: 显示文本
  - Value: 选项值

## 示例
``` src/data/tpl.def.json
{
    "heading": {
        "FieldType": "SingleLine",
        "DisplayName": "标题栏"
    },
    "summary": {
        "FieldType": "Paragraph",
        "DisplayName": "概述"
    },
    "html_content": {
        "FieldType": "HtmlBox",
        "DisplayName": "简介"
    },
    "gender": {
        "FieldType": "Dropdown",
        "DisplayName": "性别",
        "FieldOptions": [
            {
                "DisplayText": "男",
                "Value": "1"
            },
            {
                "DisplayText": "女",
                "Value": "2"
            }
        ]
    },
    "email": {
        "FieldType": "Email",
        "DisplayName": "邮箱",
        "IsRequired": true
    },
    "avatar": {
        "FieldType": "Media",
        "DisplayName": "头像"
    },
    "gallery_items": {
        "FieldType": "Array",
        "DisplayName": "图片集合",
        "Children": [
            {
                "src": {
                    "FieldType": "Media",
                    "DisplayName": "图片",
                    "IsRequired": true
                },
                "caption": {
                    "FieldType": "Paragraph",
                    "DisplayName": "描述"
                }
            }
        ]
    }
}
```