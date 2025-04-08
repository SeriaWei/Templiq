帮我完成这个section，图片请使用网上的免费图片。界面要美观大方有设计感，支持各种尺寸的设备。可以使用bootstrap3中定义的样式，新添加的样式都要限定在这个section的作用域下。同时需要创建对应的json数据和相关的字段定义，放到src/data目录下。
model binding使用的是liquid模板语法，但有些特殊要求，规范如下：
``` src/templates/_base.liquid
<p property="true" data-property="Heading" method="text">{{this.Model.Heading}}</p>
<p property="true" data-property="HtmlContent" method="html">{{this.Model.HtmlContent | raw}}</p>
{% for item in this.Model.Images %}
<img property="true" data-property="Images[{{forloop.index | minus:1}}].Src" method="attr" para="src" src="{% url item.Src %}" />
</li>
{% endfor %}
```
json data 示例
``` src/data/_base.json
{
    "Heading": "标题栏",
    "HtmlContent": "<p>Html text</p>",
    "Images": [
        {
            "Src": "https://images.unsplash.com/photo-1501785888041-af3ef285b470"
        },
        {
            "Src": "https://images.unsplash.com/photo-1449034446853-66c86144b0ad"
        }
    ]
}
```
以下是完整的字段定义，定义字段时请严格参照这个规范，并且只支持一级嵌套
``` src/data/_base.def.json
{
    "Heading": {
        "FieldType": "SingleLine",            
        "DisplayName": "标题栏"
    },
    "Summary": {
        "FieldType": "Paragraph",            
        "DisplayName": "概述"
    },
    "RowContent": {
        "FieldType": "HtmlBox",            
        "DisplayName": "简介"
    },
    "Address": {
        "FieldType": "Address",
        "DisplayName": "地址"
    },
    "IsPublished": {
        "FieldType": "Checkbox",
        "DisplayName": "已发布？"
    },
    "Hobby": {
        "FieldType": "Checkbox",
        "DisplayName": "爱好",
        "FieldOptions": [
            {
                "DisplayText": "看书",
                "Value": "1"
            },
            {
                "DisplayText": "看电影",
                "Value": "2"
            }
        ]
    },
    "Working": {
        "FieldType": "Radio",
        "DisplayName": "工作情况",
        "FieldOptions": [
            {
                "DisplayText": "在职",
                "Value": "1"
            },
            {
                "DisplayText": "自由职业",
                "Value": "2"
            }
        ]
    },
    "PublishedDate": {
        "FieldType": "Date",
        "DisplayName": "发布日期"
    },
    "Gender": {
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
    "Email": {
        "FieldType": "Email",
        "DisplayName": "邮箱",        
        "IsRequired": true
    },
    "Age": {
        "FieldType": "Number",
        "DisplayName": "年龄"
    },
    "Phone": {
        "FieldType": "Phone",
        "DisplayName": "电话"
    },
    "Avatar": {
        "FieldType": "Media",
        "DisplayName": "头像"
    }，
    "GalleryItems": {
        "FieldType": "Array",
        "DisplayName": "数组",
        "Children": [
            {
                "Src": {
                    "FieldType": "Media",
                    "DisplayName": "图片"
                },
                "Description": {
                    "FieldType": "Paragraph",
                    "DisplayName": "描述"
                }
            }
        ]
    }
}
```