---
layout: blog
categories: reading
title: C# 学习笔记
tags: C# Windows .NET WPF
redirect_from:
  - /reading/csharp-note.html
  - /2015/05/14/csharp-note/
---

## 参数传递

基本类型默认传值，类默认穿引用。
使用`ref`与`out`指定传引用；其中`out`参数需事先进行初始化。

```csharp
void func1(ref int n){
	n = 1;
}
void func2(out int n){
	n = 2;
}

int n = -1, m;
//n 赋值为 1
func1(ref n);
//异常
func1(out m);

//n 赋值为 2
func2(ref n);
//m 赋值为 2
func1(out m);
```

## 类型转换

```csharp
//转换不成功会产生异常
int int.Parse(string s)

//返回是否转换成功，若转换失败 i 将赋值为0
bool int.TtyParse(string s, out int i);
```

<!--more-->

## 应用程序路径

1.获取模块的完整路径。
```csharp	
System.Diagnostics.Process.GetCurrentProcess().MainModule.FileName
```	
	
2.获取和设置当前目录(该进程从中启动的目录)的完全限定目录。
```csharp	
System.Environment.CurrentDirectory
```
    
3.获取应用程序的当前工作目录。
```csharp	
System.IO.Directory.GetCurrentDirectory() 
```
4.获取程序的基目录。
```csharp	
System.AppDomain.CurrentDomain.BaseDirectory
``` 
5.获取和设置包括该应用程序的目录的名称。
```csharp	
System.AppDomain.CurrentDomain.SetupInformation.ApplicationBase
```
6.获取启动了应用程序的可执行文件的路径。效果和2、5一样。只是5返回的字符串后面多了一个"\"而已
```csharp		
System.Windows.Forms.Application.StartupPath 
```    
7.获取启动了应用程序的可执行文件的路径及文件名，效果和1一样。
```csharp	
System.Windows.Forms.Application.ExecutablePath
```    
## 随机数

产生随机数

```csharp
Random rand=new Random();//每次产生的序列是一样的。
```


## 应用程序设置

1. 添加属性

    右击项目->属性->设置，添加相应类型的设置数据项。

2. 操作属性

    ```csharp	
    using namespace_of_app.Properties;
            
    Settings.Default.var1 = 333;
    Settings.Default.save();
    ```
    
## 文件读写

```csharp	
//读文件
StreamReader sr = new StreamReader ("i.txt");
sr.ReadLine();
sr.Close();

//写文件
StreamWriter sw = new StreamWriter("i.txt");
sw.WriteLine("");
sw.Close();
```

## 文件系统

访问文件系统

```csharp
using System.IO
DirectoryInfo dir = new DirectoryInfo(szPath);
FileInfo[] fs = dir.getFiles();
DirectoryInfo[] ds = dir.getDirectories();
```

文件系统对话框

```csharp	
//浏览文件
OpenFileDialog openDialog = new OpenFileDialog();
if(DialogResult.OK == openDialog.ShowDialog)
{
	string filename = openDialog.FileName;
} 

//浏览目录
using System.Windows.Forms;
FolderBrowserDialog openFolder = new FolderBrowserDialog();
if (DialogResult.OK == openFolder.ShowDialog())
{
	string dirname = openFolder.SelectedPath;
}
```

## WPF ListView 数据绑定

在设置UI控件的DataContex之后，它和它的子元素都可以访问该DataContex的属性（public，并且置有读的访问器）。

绑定：将itemsource置为Dictionary的Values

自动更新：实现INotifyPropertyChanged接口，更简便的方法是用ObservableCollection（它默认实现了该接口）

## WPF 技巧

获取ContexMenuItem的触发控件

```csharp	
ContextMenuService.GetPlacementTarget((sender as MenuItem).Parent) as StackPanel
```

设置父控件

```csharp	
Window.Owner = AnotherWindow
```

获得子窗口

```csharp	
Window.OwnedWindows
```	
