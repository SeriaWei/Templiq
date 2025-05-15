# 基本规范
使用响应式设计完成模板代码，代码要格式化并采用适当的缩进。界面要精致美观有设计感，注意要有良好的用户体验。用网上的免费图片时，确保图片以合适的尺寸加载。然后初始化模板对应的JSON数据(src/data/{template-name}.json)和字段定义(src/data/{template-name}.def.json)。注意必须保证模板，数据和字段定义三者的一致性。

# CSS样式规范
- CSS样式中font-size优先使用em而非rem
- 可以使用bootstrap3中定义的样式
- 禁止使用container这个类名字
- section内容如果限宽居中，最大宽度请使用1170px，例如.section-tpl .content{max-width:1170px;margin:0 auto;}
- 所有的样式都要限定在这个section的作用域下，可以使用BEM命名方式，避免冲突。
- 不要在SVG中添加class属性，因为SVG会被用户换掉

# 模板规范
- 模板的第一行用HTML注释写上模板的中文名字，要简短，不要出现“区块”，“模板”之类的字眼
- 数据在{{this.Model}}中
- 使用的是liquid模板语法
- 绑定时需添加property="true",data-property="{property_path}",method="{text|attr|html}",para="href"。para只在method="attr"时要添加，它们是jQuery的method，例如：$(this).attr("href")
- 嵌套循环时不要使用forloop.parentloop来取索引，而是在父循环中定义一个变量来保存索引，例如：{% assign index = forloop.index0 %}，然后在子循环中使用这个变量
- 注意添加条件判断以避免生成空标签
- 如果有javascript要放到footer中 {% footer %}<script type="text/javascript"></script>{% endfooter %}
- 绑定SVG图标时，由于完整的SVG图标代码都在属性中，所以不要在模板里面写"<svg>"标签以避免重复,也不要加[property="true"]，直接输出即可。例如：{{this.Model.svg | raw}}


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