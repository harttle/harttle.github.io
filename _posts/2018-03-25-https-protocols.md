---
title: HTTPS 那些协议：TLS, SSL, SNI, ALPN, NPN
tags: HTTPS TCP TLS ALPN SNI
---

如今 [HTTPS][https] 已经普遍应用了，在带来安全性的同时也确实给 Web 引入了更多复杂的概念。
这其中就包括一系列从没见过的网络协议。现在 [Harttle](/) 从 HTTPS 的原理出发，
尝试以最通俗的方式来解读 HTTPS 涉及的这些协议。

<!--more-->

# HTTPS 概要

HTTPS 是建立在安全通信之上的 [HTTP][http]，
使用传输层加密（TLS 或 SSL）的手段。
其目的是保护用户隐私（比如防止经过的网络节点截获 HTTP 内容）
和数据完整性（比如运营商强插广告），就是端到端加密来防止中间人攻击。

TLS/SSL 是在传输层之上应用层之下的协议，因此 HTTP 协议的内容不受影响。
这些加密采用非对称加密算法因此需要一个官方来发布公钥，
这就是 [密钥基础设施][network-security]（CA）。
因此各浏览器会内置一些 CA 的根证书，这些 CA 可以进一步授权其他的域名，
这样你的浏览器就可以对正在访问的域名进行身份认证。

如果你要自己的服务也支持 HTTPS 去 CA 注册自己的域名就可以了。
有一些免费的 CA 比如 [GoDaddy](https://en.wikipedia.org/wiki/GoDaddy),
[Let's Encrypt](https://en.wikipedia.org/wiki/Let%27s_Encrypt),
[CloudFlare](https://cloudflare.com) 等可以选择。

# HTTPS 交互示例

以下 Wireshark 日志记录了一个发往 <https://github.com/harttle> 的 GET 请求，
可以看到主要的几个协议的交互过程：

* TCP。前三行完成一对 SYN/ACK（即俗称的三次握手），至此 TCP 连接已经成功建立。
* TLS。4-5 行开始了 TLS 握手，建立这个加密层。
* TLS 有众多扩展协议比如 SNI，NPN，ALPN 等（见下文），就发生在 TLS 的 ClientHello 和 ServerHello 阶段。

![tcp dump](/assets/img/blog/http/wireshark@2x.png)

> TCP 协议不在本文的讨论范围内，不清楚的可以翻阅《计算机网络》或查看 [这篇传输层笔记](/2014/04/21/computer-network-transport-layer.html)

# TLS/SSL

TLS 的前身是 SSL，TCP/IP 协议栈中运行在 [TCP][rfc793] 之上，
用来交换密钥并形成一个加密层（Record Layer）。
TLS 是 HTTPS 的核心协议，HTTPS 交互与 HTTP 交互的主要区别就在这一层：

![tls](/assets/img/blog/http/https@2x.png)

开始传输密文前需要进行互换密钥、验证服务器证书等准备工作，
因此 TLS 也存在握手阶段，主要步骤为：客户端发送 ClientHello，
服务器发送 ServerHello，服务器继续发送 Certificate，
然后互相发送 KeyExchange 消息，最后发送 ChangeCipherSpec 来通知对方后续都是密文。
具体交互和协议字段请参考 [RFC  5246][rfc5246]（TLSv1.2）和
[RFC 6176](https://tools.ietf.org/html/rfc6176)（TLSv2.0）。

TLS 作为 TCP/IP 协议栈中的加密协议有广泛的用途，为支持通用机制的协议扩展，
定义了 [RFC 4366 - TLS Extensions][rfc4366]。
TLS 先后被邮件服务、Web 服务、FTP 等采用，这里有一个
[扩展协议列表](https://en.wikipedia.org/wiki/Transport_Layer_Security#Extensions)。

本文关注其中 Web 服务（HTTPS）相关的扩展，如 SNI, NPN, ALPN。
这些协议通过扩展 TLS 的 ClientHello/ServerHello 消息为 TLS 增加新的功能。
为此我们先看一下 ClientHello 消息的结构（ServerHello 类似）：

```cpp
struct {
    ProtocolVersion client_version;
    Random random;
    SessionID session_id;
    CipherSuite cipher_suites<2..2^16-2>;
    CompressionMethod compression_methods<1..2^8-1>;
    select (extensions_present) {
        case false:
            struct {};
        case true:
            Extension extensions<0..2^16-1>;
    };
} ClientHello;
```

注意最后一个字段，最多可以有 65536 个 `Extension`，
其中 `Extension` 定义为一个两字节的 `ExtensionType` 以及对应的不透明数据。
下文的 SNI，NPN，ALPN 都是其中之一。

# SNI

[SNI][sni]（Server Name Indication）
指定了 TLS 握手时要连接的 [主机名](https://en.wikipedia.org/wiki/Hostname)。
SNI 协议是为了支持同一个 IP（和端口）支持多个域名。

因为在 TLS 握手期间服务器需要发送证书（Certificate）给客户端，
为此需要知道客户请求的域名（因为不同域名的证书可能是不一样的）。
这时有同学要问了，要连接的主机名不就是发起 HTTP 时的 Host 么！
这是对 HTTPS 机制的误解，TLS Handshake 发生时 HTTP 交互还没开始，
自然 HTTP 头部还没到达服务器。SNI 协议就定义在 [RFC 6066][rfc6066] 中：

```cpp
struct {
    NameType name_type;
    select (name_type) {
        case host_name: HostName;
    } name;
} ServerName;

enum {
    host_name(0), (255)
} NameType;

opaque HostName<1..2^16-1>;
struct {
    ServerName server_name_list<1..2^16-1>
} ServerNameList;
```

我们看本文刚开始的例子，第4行发往 github.com 的 [ClientHello][client-hello] 中的 SNI Extension 字段：

```
Extension Header     ||            Extension Payload (SNI)
---------------------------------------------------------------------------------------------------
ExtensionType Length || PayloadLength Type      ServerLength ServerName
---------------------------------------------------------------------------------------------------
00 00         00 0f  00 0d            00        00 0a        67 69 74 68 75 62 2e 63 6f 6d
sni(0)        15     || 13            host_name 10           github.com
```

# ALPN/NPN

[ALPN][alpn]（Application-Layer Protocol Negotiation）也是 TLS 层的扩展，
用于协商应用层使用的协议。它的前身是 [NPN][npn]，最初用于支持 Google SPDY 协议（现已标准化为 HTTP/2）。
TLS 客户端和服务器版本的问题，导致 SPDY->HTTP/2 和 NPN -> ALPN 的切换过程引发了不少阵痛：

* [The day Google Chrome disables HTTP/2](https://ma.ttias.be/day-google-chrome-disables-http2-nearly-everyone-may-31st-2016/)
* [从启用 HTTP/2 导致网站无法访问说起](https://imququ.com/post/why-tls-handshake-failed-with-http2-enabled.html)

> 因此 **以标准先行的方式来推进 Web 基础设施** 已成为今日 Web 平台的共识。
> 这里我们不提那些仍然在进行作坊式生产的（类）浏览器厂商，
> 任何阻挡 Web 平台发展的实现（甚至标准，试看 XHTML, OSI...）迟早会被淘汰。

言归正传，ALPN 定义在
[RFC 7301 - Transport Layer Security (TLS) Application-Layer Protocol Negotiation Extension][rfc7301]，

```
enum {
    application_layer_protocol_negotiation(16), (65535)
} ExtensionType;

opaque ProtocolName<1..2^8-1>;

struct {
    ProtocolName protocol_name_list<2..2^16-1>
} ProtocolNameList;
```

我们看本文刚开始的例子，第4行发往 github.com 的 [ClientHello][client-hello] 中的 ALPN Extension 字段：

```
Extension Header     ||            Extention Payload (ALPN)
---------------------------------------------------------------------------------------------------
ExtensionType Length || PayloadLength StringLength Protocol StringLength Protocol
---------------------------------------------------------------------------------------------------
00 10         00 0e  00 0c            02           68 32    08           68 74 74 70 2f 31 2e 31
alpn(16)      14     || 12            2            h2       8            http/1.1
```

Extention 的消息体包含多个字符串（`protocol_name_list`），表示客户端支持的所有应用层协议。
上面的例子中有 `h2` 和 `http/1.1` 两个，支持 SPDY 的客户端这里会多一个 `spdy/2`。
服务器给出的 ServerHello 中需要选择其中之一，本文的例子中 ServerHello 的 ALPN 字段为：

```
00 10 00 0b 00 09 08 68 74 74 70 2f 31 2e 31
                     h  t  t  p  /  1  .  1
```

这样 Server 和 Client 就利用 ALPN 协议达成了共识，将会在握手结束后使用 HTTP/1.1 协议进行通信。

# 参考和致谢

从 HTTPS 的关键一层 TLS 开始，介绍了一个典型的 HTTPS 交互过程。
结合抓包给出的字节序列，依次介绍了 TLS、SNI、ALPN 等协议原理和主要内容。
感谢 Web 上的众多资料，感谢 Jerry Qu，oott123，感谢以下文档和博客：

* [HTTPS Wiki][https]
* [TLS Wiki][tls]
* [Zlbruce's Blog: NPN 与 ALPN](http://zlb.me/2013/07/19/npn-and-alpn/)
* [为什么我们应该尽快支持 ALPN？](https://imququ.com/post/enable-alpn-asap.html)
* [RFC 793 - TRANSMISSION CONTROL PROTOCOL][rfc793]
* [RFC 5246 - The Transport Layer Security (TLS) Protocol Version 1.2][rfc5246]
* [RFC 6176 - Prohibiting Secure Sockets Layer (SSL) Version 2.0][rfc6176]
* [RFC 4366 - Transport Layer Security (TLS) Extensions][rfc4366]
* [RFC 6066 - Transport Layer Security (TLS) Extensions: Extension Definitions][rfc6066]
* [IETF - Transport Layer Security (TLS) Next Protocol Negotiation Extension][npn]
* [RFC 7301 - Transport Layer Security (TLS) Application-Layer Protocol Negotiation Extension][rfc7301]

[http]: /2014/10/01/http.html
[https]: https://en.wikipedia.org/wiki/HTTPS
[tls]: https://en.wikipedia.org/wiki/Transport_Layer_Security
[sni]: https://en.wikipedia.org/wiki/Server_Name_Indication
[npn]: https://tools.ietf.org/html/draft-agl-tls-nextprotoneg-04
[alpn]: https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation
[transport-layer]: /2014/04/21/computer-network-transport-layer.html
[network-security]: /2014/05/03/computer-network-security.html
[rfc793]: https://tools.ietf.org/html/rfc793
[rfc6176]: https://tools.ietf.org/html/rfc6176
[rfc6066]: https://tools.ietf.org/html/rfc6066
[rfc4366]: https://tools.ietf.org/html/rfc4366
[rfc5246]: https://tools.ietf.org/html/rfc5246
[rfc7301]: https://tools.ietf.org/html/rfc7301
[client-hello]: https://tools.ietf.org/html/rfc5246#section-7.4.1.2
