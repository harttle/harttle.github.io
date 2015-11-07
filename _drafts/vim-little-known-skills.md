---
layout: blog
categories: linux
title: 那些鲜为人知的Vim技巧
tags: Vim Bash
---

# 拷贝替换

当你拷贝了一个词，希望替换光标处的词时，可以在进入`visual`的同时按下`i`，选中后按下`p`。
例如将下面的`eat`替换为`fuck`：

```cpp
void fuck(){}
eat();
```

1. 光标移到`fuck`并复制(`yw`);
2. 光标移到`eat`，按下`viwp`。
