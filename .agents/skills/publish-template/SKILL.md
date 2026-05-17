---
name: publish-template
description: Publish the template to the CMS website. Use this skill when the user asks to publish a template.
---

# 获取模板信息

根据用户提供的模板文件或者模板名称，获取模板信息，模板保存在 `src/templates` 目录下。模板对应的数据存放在 `src/data` 目录下，与模板同名的json文件，例如：模板名称为`aboutus`，则模板数据文件为`src/data/aboutus.json`。

# 模板发布

请根据模板代码整理模板的相关信息，使用ZKEACMS的 `post_product` MCP工具提交到CMS网站上。信息整理的基本要求如下：
- 使用中文来整理模板信息
- 注意不要出现bootstrap字眼
- 标题使用中文，不用特意强调风格，可以是xxx模板，列如：关于我们模板
- 模板名作为产品的url，
- 产品内容中要包含产品描述，产品图片（放最后），模板特点，适用场景，下载链接（免费下载），下载链接使用bootstrap3的button样式，单独一个段落，链接格式为： https://cloud.zkeasoft.com/file/zkeasoft/widgets/{template-name}.wgt
- 产品图片ImageUrl的地址格式为：https://cloud.zkeasoft.com/file/zkeasoft/widgets/thumb/{template-name}.png，
- 产品缩略图ImageThumbUrl的地址格式为：https://cloud.zkeasoft.com/file/zkeasoft/widgets/thumb/{template-name}-m.png，
- 产品类别ID设置为`2`