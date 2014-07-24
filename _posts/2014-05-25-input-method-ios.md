---
layout: blog
categories: development
title: IOS软键盘视图处理
tags: ios objective-c
---

IOS 软键盘的行为是直接由开发者控制的，操作系统只提供很少的管理策略。这造成了很麻烦的问题：

1. 关闭软键盘也需要编程。
2. 软键盘造成的界面遮挡需要开发者处理。

当然也有一些好处。在Android中，靠输入法中按键只能提交字符，比如QQ只能先确定输入，再执行发送；而在IOS中，输入法是直接由开发者控制，IOS版QQ可以在软键盘中直接执行发送。

以下记录IOS软键盘编程中一些问题的解决方案。

## 关闭软键盘

IOS的软键盘在输入结束后不会自动关闭，而需要编程方式来手动关闭：

1. 设置TextField的代理为当前对象。可以在Storyboard中将TextField拖动至ViewController，选择delegate。也可以使用编程方式：

    ```cpp
    - (void)viewDidLoad{
        [super viewDidLoad];

        // 首先为textField创建Outlet

        // 设置代理
        self.textField.delegate = self;
    }
    ```
2. 在ViewController中添加事件处理函数：

    ```cpp
    - (BOOL)textFieldShouldReturn:(UITextField *)textField {
        // 激活文本框即可
        [textField resignFirstResponder];
        return YES;
    }
    ```

另外，我们也希望在用户点击界面其他部分时，软键盘自动关闭。

1. 添加gestureRecognizer。在Storyboard中，从对象库将Tap手势拖动到ViewController
2. 绑定gestureRecognizer。按Ctrl将画布拖动至gestureRecognizer，并选择gestureRecognizer。
3. 添加action。按Ctrl将gestureRecognizer拖动至ViewController.h，并选择Action。
4. 添加Action处理函数：

    ```cpp
    - (IBAction)Tap:(id)sender {
        [[UIApplication sharedApplication] sendAction:@selector(resignFirstResponder) to:nil from:nil forEvent:nil];
    }
    ```

## 界面重布局

考虑一个聊天页面，在软键盘出现时，会遮挡输入框。此时需要减小页面其他部分的高度，使得输入框上移。然而，在输入中文的过程中软键盘的高度还会发生变化。于是我们需要监听软键盘的大小变化。

1. 注册通知：

    ```cpp
    - (void)viewWillAppear:(BOOL)animated{
        self.navigationItem.title = [NSString stringWithFormat: @"%@", self.session.remoteJid.user];
        
        [self updateList:nil];
        
        // viewsize update event
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(KeyboardWillChangeFrame:)
                                                     name:UIKeyboardWillChangeFrameNotification
                                                   object:nil];
        
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(keyboardDidChangeFrame:)
                                                     name:UIKeyboardDidChangeFrameNotification
    }                                               object:nil];

    // 不要忘了取消注册
    - (void)viewWillDisappear:(BOOL)animated{
        // viewsize update
        [[NSNotificationCenter defaultCenter] removeObserver:self
                                                        name:UIKeyboardWillChangeFrameNotification
                                                      object:nil];
        
        [[NSNotificationCenter defaultCenter] removeObserver:self
                                                        name:UIKeyboardDidChangeFrameNotification
                                                      object:nil];
    }
    ```
2. 在软键盘框更新时，上移界面：

    ```cpp
    -(void)KeyboardWillChangeFrame: (NSNotification *)notification {
        
        // Get the keyboard rect
        CGRect kbBeginrect = [[[notification userInfo]
                               objectForKey:UIKeyboardFrameBeginUserInfoKey] CGRectValue];
        CGRect kbEndrect   = [[[notification userInfo]
                               objectForKey:UIKeyboardFrameEndUserInfoKey] CGRectValue];
        NSTimeInterval duration = [[[notification userInfo]
                                    objectForKey:UIKeyboardAnimationDurationUserInfoKey] doubleValue];
        UIViewAnimationCurve curve = (UIViewAnimationCurve)[[notification userInfo]
                                                            objectForKey:UIKeyboardAnimationCurveUserInfoKey];

        
        // set animation
        [UIView beginAnimations:nil context:NULL];
        [UIView setAnimationDuration:duration];
        [UIView setAnimationCurve:curve];
        
        CGRect rect = self.view.frame;
        double height_change = kbEndrect.origin.y - kbBeginrect.origin.y;
        rect.size.height += height_change;
        self.view.frame = rect;
    }

    -(void)keyboardDidChangeFrame:(NSNotification*)notification{
        
        [UIView commitAnimations];
    }
    ```

同时，如果有子界面也需要更新，同样在`KeyboardWillChangeFrame`中进行设置。要注意的是，更新子界面时软键盘还没有出现，使用`UIView.layoutIfNeeded`进行强制更新。例如，在软键盘出现时，要将聊天内容滚动到底部：

```cpp
-(void)KeyboardWillChangeFrame: (NSNotification *)notification {
    
    // blabla...
   
    [self.tableView layoutIfNeeded];    // important! recompute size of tableview
    [self ScrollToBottom];
}
```


