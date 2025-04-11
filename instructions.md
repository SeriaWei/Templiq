图片用网上的免费图片，确保图片以合适的尺寸加载。如果不需要javascript，请移除footer。CSS样式中font-size优先使用em而非rem。界面要美观大方有设计感，支持各种尺寸的设备。可以使用bootstrap3中定义的样式但是不要用.container，新添加的样式都要限定在这个section的作用域下。同时需要创建对应的json数据和字段定义，并保存src/data目录下。在定义json数据的时候，要避免使用以下字段名:[Properties,PropertySchema,IsInDesign,InitPartialView,AssemblyName,FormView,IsSystem,IsTemplate,LayoutId,PageId,PartialView,Position,ServiceTypeName,StyleClass,Thumbnail,ViewModelTypeName,WidgetName,ZoneId,CreateBy,CreatebyName,CreateDate,Description,Status,Title,ExtendData,ActionType,RuleID,InnerStyle,CustomClass,CustomStyle,DataSourceLink,DataSourceLinkTitle,EditTemplateOnline]。
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
json data 示例
``` src/data/tpl.json
{
    "Heading": "标题栏",
    "HtmlContent": "<p>Html text</p>",
    "Images": [
        {
            "Src": "https://images.unsplash.com/photo-1501785888041-af3ef285b470"
        }
    ]
}
```
以下是完整的字段定义，定义字段时请严格参照这个规范，注意只支持一级嵌套，DisplayName始终使用中文
``` src/data/tpl.def.json
{
    "Heading": {
        "FieldType": "SingleLine",            
        "DisplayName": "标题栏"
    },
    "Summary": {
        "FieldType": "Paragraph",            
        "DisplayName": "概述"
    },
    "HtmlContent": {
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
                    "DisplayName": "图片",
                    "IsRequired": true
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