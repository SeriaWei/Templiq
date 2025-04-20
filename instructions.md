图片用网上的免费图片，确保图片以合适的尺寸加载。如果不需要javascript，请移除footer。CSS样式中font-size优先使用em而非rem。界面要美观大方有设计感，支持各种尺寸的设备。可以使用bootstrap3中定义的样式，但如果要用.container，应另外定义一个避免冲突，所有的样式都要限定在这个section的作用域下。同时需要创建模板对应的JSON数据和字段定义，并保存src/data目录下。

# 模板规范
model binding使用的是liquid模板语法，注意添加条件判断以避免生成空标签，还有些特殊要求，规范如下：
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