---
name: convert-to-cms-tpl
description: Convert an design(Html pages in src/designs/<design-name> folder) to a ZKEACMS template. Use this skill when the user asks to convert a design to a CMS template.
---

# 任务和步骤

请先阅读design的相关代码，并理解里面的内容。然后根据design的内容将每一个Section转换成一个对应的ZKEACMS模板。
每一个Section转换模板的步骤如下：

1. 分析这个Section的内容和结构，理解它需要哪些css,js来支持它的展示，你将要提取出这些css,js到liquid模板文件(.liquid)中。如果Section较多，请考虑使用`todo`工具来标记需要处理的Section。
2. 运行命令`npm run new`，这个命令会创建对应的脚手架：liquid模板文件(.liquid)，模板所需的数据文件(.json)，数据字段的定义文件(.def.json)。请直接使用这个命令创建创建的文件，并且保持文件名不变，不要手动创建文件。
3. 根据Section的html的内容定义数据文件({template-name}.json)
4. 根据数据文件({template-name}.json)创建对应的字段定义文件({template-name}.def.json)
5. 根据html的内容和数据完成模板绑定({template-name}.liquid)

# 基本规范

- 模板中不需要引用bootstrap，jQuery等基础库，ZKEACMS已包含基础库。
- **必须**保证模板(src/templates/{template-name}.liquid)，数据(src/data/{template-name}.json)和字段定义(src/data/{template-name}.def.json)三者的一致性。

# 模板规范
- 模板的第一行用HTML注释写上模板的中文名字，要简短，不要出现“区块”，“模板”之类的字眼
- 数据在{{this.Model}}中
- 使用的是liquid模板语法
- 绑定时需添加property="true",data-property="{property_path}",method="{text|attr|html}",para="href"。para只在method="attr"时要添加，它们是jQuery的method，例如：$(this).attr("href")
- 嵌套循环时不要使用forloop.parentloop来取索引，而是在父循环中定义一个变量来保存索引，例如：{% assign index = forloop.index0 %}，然后在子循环中使用这个变量
- 注意添加条件判断以避免生成空标签
- 如果有javascript要放到footer中 {% footer %}<script type="text/javascript"></script>{% endfooter %}
- 绑定SVG图标时，由于完整的SVG图标代码都在属性中，所以不要在模板里面写"<svg>"标签以避免重复,也不要加[property="true"]，直接输出即可。例如：{{this.Model.svg | raw}}
- 对于图片，链接的URL，要使用url tag，例如: `<img src="{% url image.src %}" />`


## Model binding示例：
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
<img property="true" data-property="images[{{forloop.index0}}].src" method="attr" para="src" src="{% url item.src %}" />
</li>
{% endfor %}
```
# JSON 数据规范
## 基本要求
- 不要使用placeholder形式的数据，请使用真实专业数据
- 属性必须使用snake_case命名法
- 属性都是简单类型，不能是Object
- 数组不能是简单类型，必须是Object
- JSON要格式化并采用适当的缩进
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
- 字段定义必须使用JSON格式并且要格式化并采用适当的缩进
- 字段名必须使用snake_case命名法
- 字段定义必须包含字段类型(FieldType)和中文显示名称(DisplayName)
- 仅当字段类型是Array的时候，才使用Children定义子字段

## 字段类型(FieldType)选项
必须是以下值之一，注意没有Object：
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