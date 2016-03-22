---
layout: blog 
title: Accessing the System Clipboard with JavaScript
tags: Flash JavaScript 剪切板 inline
---

Origin Post: https://brooknovak.wordpress.com/2009/07/28/accessing-the-system-clipboard-with-javascript/

> I am developing an API written in JavaScript for a project which requires the ability to copy data to, and retrieve data from, a clipboard within a web browser. A simple/common problem definition – but due to tight browser security, finding a solution is a bit of a nightmare. This article outlines and discusses a number of approaches for implementing a clipboard feature into your JavaScript applications.

# The Ideal JavaScript Clipboard Interface

The concept of the “clipboard” is simple; it is essentially a place for storing and retrieving a single unit/piece of cloned data. The code snippet below describes this clipboard concept in terms of a JavaScript interface.

```javascript
Clipboard = {
    copy : function(data) {
        //... implemention …
    },
     getData : function() {
        // … implementation …
     }
};
```

A simple concept, a self explanatory interface. However, the description above is vague; it does not state where “the clipboard” resides, nor does it mention if there can be more than one clipboard.

## Multiple Clipboards

Unfortunately there can be more than one clipboard present. There is one “System clipboard” present when a user is logged into their profile/account (some strange people might install/configure some features on their OS to support multiple system clipboards). Ideally, all applications should use the system clipboard when copying and pasting so its users can copy and paste between all applications. However this is not always the case. For example, Cygwin uses its own clipboard for Cygwin applications and unless the user explicitly turns on a clipboard integration option, the user cannot copy and paste between Cygwin applications and non-Cygwin applications.

## The Web’s Sandbox Environment

Web applications run in a sandbox environment to prevent malicious scripts from infecting a visitor’s computer. The sandbox environment restricts access to system resources, such as the file system, and unfortunately, the system clipboard. Check out this article for one example why the system clipboard is a restricted resource. Fortunately restrictions for accessing the system clipboard can be overcome. There are many approaches for accessing the system clipboard – each approach has its own trade-offs.

# Internet Explorer’s clipboardData Object

Microsoft’s Internet Explorer family makes life very easy to access the system clipboard. To set the system clipboard’s text, just use the clipboardData object. Here is an example:

```javascript
var didSucceed = window.clipboardData.setData('Text', 'text to copy');
```

To access the system’s clipboard data (in a textual format) you simply invoke:

```javascript
var clipText = window.clipboardData.getData('Text');
```

The first time the clipboardData object is accessed IE will prompt the user to allow the script to access the system clipboard (note: if you run the script locally IE does not bother with the confirmation and automatically allows it). IE version 6 and below will not bother asking the users (unless they have some non-default security features set to a “high level”). We cannot assume that users will choose to allow the script to access the system clipboard. If they decline, the clipboardData.setData method returns false. Unfortunately the clipboardData.getData method is vague: as it returns an empty string if the user chooses to decline. This is ambiguous since the system clipboard’s contents could actually be empty! Ideally it would return null. You could either always assume that empty string is a signal for failure to access the clipboard and try use a different method (read on), or you could attempt to verify that it was a failure:

```javascript
var clipText = window.clipboardData.getData('Text');
if (clipText == “”) { // Could be empty, or failed
    // Verify failure
    if (!window.clipboardData.setData('Text', clipText))
        clipText = null;
}
```

Note: the verification method will not display two prompts, since the first prompt will be remembered for the session.

<!--more-->

# A Sketchy Work-around: The Flash Copy Hack

Jeffrey Larson came up with a nifty solution using Adobe Flash. To copy text to the system clipboard a small flash object is embedded into the document by manipulating the DOM, and the text to be copied is passed as a parameter to the embedded object. The Flash program then takes this text and copies it to the system clipboard via the Flash API. This was a security hole in Flash up-to and including versions 9, and was patched in version 10 so that unsolicited access to the system clipboard is denied. That is, Flash requires users to physically trigger the ActionScript clipboard code via a mouse click in order to grant access.

There still exists a workaround using that is supported by Flash 9 and 10. A small JavaScript library called ZeroClipboard exploits Flash, and fools the users, by placing invisible Flash movies over button elements. Whenever a user clicks on these invisible flash movies, ZeroClipboard successfully copies text to the system clipboard since the access is technically not “unsolicited.” This is a bit cheeky, some people are calling this process “click jacking.” It could be seen as a security flaw, and later Flash releases might put an end to this clipboard exploitation mayhem once and for all – who knows.

Using ZeroClipboard will only allow copying of text to the system clipboard on mouse-clicks. It does not allow access in any other contexts, such as timers, or CTRL+C keyboard events. It is a specific solution intended for Copy buttons.

One drawback is that this option does require the browsers to have the adobe flash plugin installed. So detection of Flash support is essential. Adobe has released a simple-to-use detection kit which would do the trick. Another simple one can be found here.

Flash version 9 has a bug in Linux systems where Web browsers are unable to support transparency for embedded Flash movies. Thus ZeroClipboard is not suitable on clients with this setup.

ZeroClipboard should be named ZeroSysCopy or something similar since it only provide unidirectional access to the system clipboard. I attempted to pursue a bidirectional implementation, but the ActionScript API does not provide any way of clipboard retrieval due to security risks. Adobe’s ActionScript API for the Flex environment does provide ways of getting to the system clipboard, but only on paste events from a paste button click on a context menu, or paste commands like CTRL+V.

# Using Java Applets

Jeffrey Larson’s Flash copy hack got me thinking: what about taking a similar approach using Java applets instead of Flash movies. The beauty of Java is that it can communicate directly with JavaScript, thus can support both copy and paste operations. This is possible via a technology called Liveconnect. This solution has some pricey trade-offs though.

## Liveconnect

Netscape developed an API called NP API (Netscape Plugin API) which is a cross browser plugin architecture supported by all major browsers except IE today (although some IE browsers do support it – IE’s equivalent is ActiveX). Liveconnect is one way to implement NP API-based plugins using JavaScript and Java. It was first supported in Netscape 4. A plugin could implement and return an instance to a Java class. The public methods exposed by this class was the scriptable interface for the plugin. The class could be called from JavaScript and even from other Java applets running within the page with the browser marshalling the calls between the various contexts. (see http://en.wikipedia.org/wiki/NPAPI#LiveConnect). The technology has matured since then and is still supported by Mozilla browsers, and Opera. Webkit does not seem to support it anymore.

Some browsers, such as Firefox, do not ship with a Java Virtual Machine plugin, since it “bloats” the browsers download size. So like the Flash hack, it depends on a plugin, which is a bit of a concern since the JVM plugins are relatively large to download.

Sun has respecified and reimplemented the Liveconnect technology as of version 6 update 10, which to my understandings just means that it is faster, more reliable and contains a bunch of extra features not needed for the purposes of some simple clipboard code.

## Implementation

There are many issues and quirks with this technology. Luckily the code will be very small and simple for the clipboard. Most browsers support the ability to directly use Java inside of JavaScript, but some browsers have issues with some things such as creating new class instances. A more reliable approach would be to store the Java clipboard code into an applet.

Try the demo here(missing). Click here(missing) for the applet source. Note that it only works on some browsers, and most probably not on IE.

Hopefully the demo code is self-explanatory. In order to break out of the JVM sandbox environment java.security.AccessController.doPrivileged is used. Unfortunately that is not enough; after running a small test – the clipboard was found to be sandboxed. In order to access the system clipboard, the script must be digitally signed. You can sign the applet privately for free to get it running on your machine, but this is probably not practical for you. To digitally sign your applet publicly, you have to go somewhere like Verisign and purchase a certificate for your applet. This currently costs $500 (US) for one year.

Another implication worth noting is that on the first time the JavaScript talks to the Java applet, it will take a little while to load the JVM (several seconds). Once the JVM is loaded it runs smoothly.

# Using Silverlight?

To the point: None of the Silverlight versions (currently up to version 3) does not provide system clipboard access. This is a shame because it interacts well with JavaScript and is supported by all the common browsers (even on Linux via Moonlight).

# Mozilla’s XUL Approach

Mozilla has this inbuilt plugin called “clipboard helper” which can be accessed with JavaScript using the XUL API. Dion Almaer explored this approach, click here(missing) for a demo (try downloading it and viewing it locally on your machine).

The XUL approach has some issues, as pointed out by Dion. If you run the script locally an ugly dialog pops up containing a vague (and scary) message warning the user about the possibility of malicious code being executed. The user’s decision can be remembered. However it fails to access the clipboard when not running script from a local file. This can be overcome: One option is to set some obscure user preferences for Mozilla to allow access. This might not be practical, especially if you are planning to use the script on public sites. Another option is to digitally sign the JavaScript containing the XUL clipboard code – which of coarse is a pricey option.

# Making use of execCommand

The execCommand JavaScript function is supported by all major browsers. The browsers all support the “Copy” and “Paste” commands. All browsers except for IE only expose the execCommand function for documents with design-mode turned on (for wizzywig editing).

Webkit does not protect the copy command, I wrote a post about this security hole. In both Chrome 2 and Safari 4 (on windows and mac) I managed to copy text to the system clipboard without any security warnings/promptings what-so-ever via execCommand. My assumption is that this will be the same for older versions of Webkit. This is very concerning. Mozilla throws security exceptions which can be only avoided via setting the user preferences or signing the JavaScript code. Opera and Konqueror just does not work. For IE it is possible to use this approach, as well as other approaches with MicrosoftTextRange objects, but it has no benefits over using the clipboardData object since it safeguards the copy and paste operations in the same way.

## Implementation

Try it out here(missing). The first time the copy operation is invoked, an inline document in design mode is dynamically created and appended to the main document – thus exposing the execCommand. The inline document contains an textarea and is always hidden from the user. So to copy text to the system clipboard, the textarea‘s value is set to the text to be copied, then the textarea is displayed, focused and selected, and finally the execCommand("copy") method is invoked. The textarea will never be rendered (i.e. the user will not see a random flash on the page) because it is hidden straight after the copy command has executed (the UI will not refresh until after the script finishes executing).

The demo does have a scrolling issue: since the textarea is selected and focused the scrollbars will change if the iframe is not in view. You can easily overcome this behavior this by placing the iframe in a float (see below regarding keyboard events).

This script will work in IE, the first time the copy operation is executed a dialog will pop up asking the user for the script for permission to access the clipboard. Unfortunately there is no way of telling whether the user allowed or denied access. The MSDN docs specifies that execCommand returns true of false depending if the command succeeds or fails, however it will always return true even if the user denies access. Furthermore, while the prompt is displayed the users will see the internal frame rendered which might be confusing for the user (although this could be better concealed by using floats). The window.clipboardData object would be a better option, even if the user denies access via window.clipboardData, you probably would not want to blast them with any more security-risk dialogs.

# Fabricating DOM Events

This is merely an idea, which is a similar approach to the execCommand approach. If it were possible to manually fire CTRL+C and CTRL+V events such that the browsers execute their “default” handlers, then by using similar trickery used with the execCommand implementation on demand access to the clipboard would be possible. However, the Web’s sandbox environment does not let JavaScript simulate user interactions (that would be very bad!). Just a thought.

# Clipboard Events

IE, Webkit and FF 3+ supports up to six different clipboard events which can be invoked from context menus or key-commands like CTRL+C:

* onbeforecut
    * FF does not support this.
    * IE raises this event before a context menu is displayed and something in the document is selected.
    * IE only raises these on editable elements.
* oncut
    * IE only raises these on editable elements.
* onbeforecopy
    * FF does not support this.
    * IE and Safari raises this event before a context menu is displayed and    something in the document is selected.
* oncopy
    * Only executed when about to copy something in the default handler.
Webkit exposes clipboardData on the event object.
* onbeforepaste
    * FF does not support this.
    * IE raises this event before a context menu is displayed and something in the document is selected.
* onpaste
    * IE only raises these on editable elements.

Webkit exposes the clipboardData object in clipboard events by attaching it to the event objects. Webkit’s clipboardData object is implemented in the same way as IE’s clipboardData object.

In order to get text from the clipboard, clipboardData.getData can only be accessed in the onpaste event. This is nice and simple:

```javascript
document.body.onpaste = function(e) {
    alert(e.clipboardData.getData("Text"));
    e.preventDefault();
}
```

Note: preventing the default behavior is necessary if you are planning to handle the event, but if your code is just sniffing, then exclude the e.preventDefault() call.

Ideally the code would be similar for setting the clipboard data upon copy events. Unfortunately Webkit has a bug where you cannot set clipboard data in any of the clipboard events! You can use a work-around by using the same approach in the following section.

# Using Keyboard Events

In most Web applications you do not have to worry about setting/getting the system clipboard data via key presses like CTRL+C, all browsers implement this for you. However, my API needs to get/set system clipboard data whenever the user presses clipboard key combinations like CTRL+C, on an non-editable document. Specifically: on CTRL/CMD+C/X keystrokes, the text to be copied is not the selected text in the document. And, on CTRL/CMD+V keystrokes, no matter where the focus is, the API must be able to retrieve the system clipboard text.

Webkit and FF3+ browsers’ default handlers for copying, cutting and pasting occur in the oncopy, oncut and onpaste events respectively. Browsers which do not use clipboard events execute their copy and paste code in their keydown/keypress default handlers.

Click here for the demo(missing). Whenever a clipboard command is raised from a keyboard stroke, a textarea appears and is selected/focused. The browser’s default handler then executes its clipboard command on the selected textarea. A timer event is scheduled with no delay so that once the browsers default handler has executed its clipboard command, the timer event is queued afterward – where it then hides the textarea from view.

This approach was inspired from Webkit’s lack of support for using clipboardData.setData, I started with a solution which used the oncopy event, which was then generalized to use keyboard events. You may want to use oncopy/onpaste in Webkit/FF3+ browsers instead of keyboard commands – however there is no real benefit from this except for Chrome: Chrome’s copy button in its window’s context menu is clickable, even if nothing in the document is selected (which raises the oncopy event).

The textarea element is very small and usually displayed outside of the view-port. If the vertical and horizontal scrollbars are not at the hard top or left of the document then the textarea is briefly flashed at the top right section of the window. If for example, the float is positioned at an absolute left position of -100 (out of viewport) but the horozontial scrollbars are scrolled to 40 pixels, the scrollbars would scroll to zero (hard left) whenever the textarea is selected/focused. (Note: restoring them to their original values will just create an ugly scrollbar jolting effect).

Originally I developed a bulky solution(missing) without floats, but I stumbled across a blog that had happened to use this same approach but instead using floats (many thanks to Dion).

It is important to avoid race conditions while showing and hiding the textarea before and after the browsers’ default handlers for clipboard operations. Clipboard events are guaranteed to work. Opera queues a settimeout with zero delay after all events in the current event batch – onkeydown, onkeypress, onkeyup event sequence is seen as an event batch (see timing-and-synchronization-in-javascript) – so it is safe to use onkeydown in Opera. From my own experiments, my observations are that Firefox’s clipboard operations are executed on keypress events. IE and Webkit can only use keydown since clipboard key combinations do not get keypress events. There was no luck with getting Konqureror to work with this approach – KHTML has problems with selecting and focusing on an input element (it works sometimes).

# Summary & Conclusion

Go here to see a summary(missing) of the explored approaches and their demos (sorry about the external link but my blog layout does not handle large tables!).

The “ideal interface” previously discussed is not possible: there are different contexts in which you may want to copy and retrieve data to and from the clipboard, so packaging up a universal clipboard solution is not realistic.

There is a lot of (hacky) code to get cut, copy and paste in a JavaScript application. Is it really worth the time and effort to support copy and paste? I think so. Copy and paste is extremely useful, especially for some type of web-page editor. Microsoft found that paste was the most commonly used operation in their Word application, and copy was the third most common.
