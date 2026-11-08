---
layout: home
title: Home
pagination:
  data: collections.posts
  size: 5
  reverse: true
  alias: posts
  generatePageOnEmptyData: true
permalink: "{% if pagination.pageNumber > 0 %}/page/{{ pagination.pageNumber | plus: 1 }}/{% else %}/{% endif %}"
---
