---
layout: blog
title: 《计算机网络》笔记：物理层
tags: ADSL DMA 网络 补码 多路复用 电话网络 电路交换 香农定理
---

## 数据通信的理论基础

* 傅里叶分析
* 带宽：传输过程中振幅不会明显减弱的一段频率范围
* 尼奎斯特定理：无噪声、有限带宽信道的最大传输率=2Hlog2(V) b/s
* 香农定理：带宽为H，信噪比为S/N的信道最大传输率=Hlog2(1+S/N)

<!--more-->

## 有导向的传输介质

* 磁介质：物理磁带
* 无屏蔽双绞线（UTP，unshielded twisted pair）：3类双绞线（4对在一个塑料套内）；5类双绞线（拧得更紧，串音更少）
* IBM屏蔽双绞线
* 同轴电缆：屏蔽性好，可以传输很长距离
* 光纤：多模光纤、单模光纤；有源中继器、无源星型结构

## 无线传输

* 电磁波：调频扩频、直接序列扩频
* 无线电传输：VLF、LF、MF（沿地表）；HF、VHF（电离层）
* 微波传输：多径衰减、ISM频段
* 红外线与毫米波
* 光波传输

## 通信卫星

* 异频发射应答器、弯曲管道

### 同步卫星 GEO

* Geostationary Earth Orbit
* 保持站位、足迹（覆盖范围）、小孔终端（VSAT）、中心站（hub，连接VSAT）

### 中间轨道卫星 MEO

* Medium Earth Orbit
* GPS：24颗

### 低轨道卫星 LEO

* Low Earth Orbit
* 铱计划：77颗，改名为镝（66颗卫星）；针对偏远地区的电话用户；太空转发
* Globalstar：48颗；传回地面转发
* Teledesic：288颗；针对internet用户

## 公共交换电话网络

### 电话系统结构

* 电话->本地回路->端局->长途干线->长途局->中心交换局->长途局...

### 电话业中的政治学

* ATT分解为ATT长话公司和23个Bell 运行公司（BOC，bell operating company）
* 每个LATA（local access and transport areas）内有一个LEC（local exchange carrier）；IXC（IntereXchange carrier）在LATA区域建立POP（point of presence）实现LATA间通信。

### 本地回路

* 调制解调器：正弦载波、调频、调幅、波特、码元、QPSK、QAM-16、TCM、V.32 bis(14400bps)、V.34 bis（33.6kbps）、V.90（33.6kbps上行，56kbps下行）、V.92（48kbps上行）
* 全双工（同时两个方向的传输）、半双工（同时只有一个方向）、单工（只有一个方向）
* 数字用户线路（DSL，digital subscriber lines）、非对称数字用户线路（ADSL，asymmetric DSL）：ATT将整个带宽划分为多个频段，包括语音、上行数据、下行数据
* 无线本地回路：ILEC、CLEC、WLL、MMDS、LMDS

### 干线和多路复用

* 频分多路复用 FDM
* 波分多路复用 WDM
* 时分多路复用 TDM
* SONET/SDH

### 交换

* 电路交换：建立物理连接
* 报文交换：存储转发网络
* 分组交换：数据块大小上限

## 移动电话系统

* 按钮启动式通话系统：只有一个信道
* IMTS（improved mobile telephone system）：上行和下行信道

### 第一代：模拟语音

* AMPS（advanced mobile phone system）：蜂窝单元、微蜂窝单元、MTSO（mobile telephone switching office，移动电话交换局）、MSC（mobile switching center，移动交换中心）、移交（软移交、硬移交）
* 信道：832个全双工信道，包括控制、呼叫、访问、数据

### 第二代：数字语音

* D-AMPS（数字的高级移动电话系统）：美国，MAHO（移动电话辅助移交），使用FDM、TDM
* GSM（global system for mobile communication，全球移动通信系统）：美国和日本（修订形式），使用FDM、TDM
* CDMA（code division multiple access，码分多路访问）：美国和欧洲、时间片、正交的时间片序列（1为时间片序列、0为其补码）

### 第三代：数字语音与数据

* IMT-2000（international mobile telecommunications）：ITU提出，筛选后的提案主要有两个：
+ WCDMA（wideband CDMA）：爱立信提出，欧盟称其为UMTS（universal mobile telecomunications system） 
+ CDMA2000：qualcomm提出
* 爱立信购买qualcomm基本方案，提出3G
* 2.5G提案：EDGE（enhanced data rates for GSM evolution，基于GSM）、GPRS（general packet radio service，基于D-AMPS或者GSM上的层叠分组网络）

## 有线电视

* 共天线电视：天线（头端）->同轴电缆->分接头->电视落线
* 基于有线电视网络的internet
+ HFC（hybrid fiber coax）：交换机->头端->光纤干线->光纤节点->同轴电缆->分接头->住宅（用户间冲突）
+ 固定电话系统：长途局（由光纤干线相连）->光纤->端局->本地回路->铜的双绞线->住宅
* 频谱分配：上行数据、下行数据（TV、FM、下行数据流）
* 电缆调制解调器（DOCSIS，data over cable service interface specification）：通过电视电缆访问internet
* ASDL与有线电视网
+ 均使用光纤的骨干网
+ 有线电视网拥有几百倍与双绞线的承载容量
+ 有线电视网难以说明有效带宽容量：取决于用户数量和电视节目带宽
+ ASDL更可靠：备份电源
