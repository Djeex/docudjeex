---
navigation: true
title: The Basics
main:
  fluid: false
---
:ellipsis{left=0px width=40rem top=10rem blur=140px}
# Server Basics

::alert{type="info"}
🎯 __Objectives:__
- Understand the fundamentals of server hardware
::

![hardware](/img/global/hardware.svg)


A server is essentially a computer dedicated to specific tasks, designed to remain accessible at all times. Structurally, it's not much different from a regular computer. Depending on its intended use, some components may vary. This article serves as a reference to help you understand the essential components of a server and how their roles adapt based on your needs.

## Motherboard
---
The motherboard is the foundation of your machine. It's the component that connects all others together. It enables communication between components and interaction with peripherals (keyboard, mouse, etc.). Choose it based on your I/O (Input/Output) needs like USB ports, network ports, speed, etc., and ensure compatibility with the components you plan to install.

Key components connected to the motherboard:
- CPU
- RAM
- Storage (HDD and/or SSD)
- Optional dedicated GPU

Common consumer motherboard formats:
- E-ATX: largest
- ATX: standard
- Micro-ATX: smaller
- Mini-ITX: smallest

Larger boards generally offer more ports and features. Pre-built systems might use proprietary formats.

## CPU
---
<div style="display: flex; align-items: center;">
  <img src="/img/global/cpu.svg" alt="Image" style="max-width: 25%; max-height:230px; margin-right: 20px;">
  <p>The CPU (Central Processing Unit) is the computer's calculator. It processes most software tasks. Modern CPUs have multiple cores, often with virtual threads, to better handle workloads. They need to be cooled using either an active cooler (with a fan) or a passive one (fanless), depending on power consumption (watts). Choose your CPU based on how you plan to use the server.</p>
</div>

::alert{type="warning"}
:::list{type="warning"}
- __Caution:__ Ensure third-party coolers are compatible with the CPU socket and always apply thermal paste before installing the cooler.
:::
::

Consider:
- Number of cores (more cores = better multitasking)
- Clock speed in GHz
- Power consumption in Watts

For low-power home servers or NAS (non-intensive computing), consider Intel N100/150 (4 cores) or N305/N355 (8 cores)—efficient and low power (ideal for 24/7 uptime).

## RAM
---

<p align="center">
  <img src="/img/global/ram.svg" alt="Image" style="max-width: 65%;">
</p>

RAM (Random Access Memory) is fast, temporary memory used by the CPU (and iGPU if applicable) for quick access during execution. It clears periodically and when the machine powers down. Better RAM = better CPU performance.

Comes as sticks installed on the motherboard. Varies by format and generation (currently DDR5).

## GPU
---

The GPU (Graphics Processing Unit) handles graphical, video, and sometimes AI-related processing. In servers, it's useful for media centers (e.g. [Plex](/serveex/media/plex)) and for accelerating AI tasks like facial recognition or photo indexing (e.g. [Immich](/serveex/cloud/immich)).

Choose between:
- Dedicated GPU with VRAM (via PCIe)
- iGPU (integrated GPU within the CPU like the N100/N305 series)

### HDD(s)
---

<p align="center">
  <img src="/img/global/hdd.svg" alt="Image" style="max-width: 50%; margin-right: 20px;">
</p>

An HDD (Hard Disk Drive) is a traditional data storage device using spinning platters and read/write heads. Though slower due to its mechanical nature, it offers huge capacity (up to 30TB). It's ideal for media files, cloud storage, and archives—where high speed isn't critical.

::alert{type="success"}
:::list{type="success"}
- __Tip:__ Use multiple HDDs in [RAID](/general/storage/raid) to enhance performance and redundancy.
:::
::

Comes in 3.5" and 2.5" formats; servers usually favor the more reliable 3.5".

### SSD(s)
---

<p align="center">
  <img src="/img/global/nvme.svg" alt="Image" style="max-width: 50%; margin-right: 20px;">
</p>

An SSD (Solid State Drive) stores data on memory chips. Unlike RAM, SSDs retain data without power. They’re small, fast (several GB/s), and reliable with no moving parts.

Preferred format: M.2 NVMe—smallest and fastest, now standard.

More expensive than HDDs, but essential for:
- Operating system
- Containers like [Docker](/serveex/core/docker)
- Databases
- Any fast-access data (apps, websites, etc.)

### Network Card
---

Connects your server to a network (and internet). Has a controller chip and one or more ports, such as:
- RJ45 Gigabit Ethernet (10/100/1000 Mbps = 125 MB/s)
- RJ45 2.5G (312.5 MB/s)
- RJ45 5G (625 MB/s)
- RJ45 10G Base-T (1.25 GB/s)
- SFP 1G (fiber, 1 Gbps)
- SFP+ 10G (fiber, 10 Gbps)

::alert{type="warning"}
:::list{type="warning"}
- __Caution:__ Match network gear (router, switch, cables) to your desired speed. For most uses, CAT5E cables are enough; use CAT6A beyond 10 Gbps. Fiber requires additional care (simplex, duplex, transceivers...).
:::
::

Most motherboards include a built-in NIC. However, add-on network cards (USB or PCIe) can offer redundancy or better performance.

### Input/Output Ports
---

I/O ports allow communication with external devices (displays, keyboard, mouse, network...). Motherboards typically offer:
- Ethernet ports
- USB ports (varied types/speeds)
- Video ports
- Audio jacks

Choose a motherboard and expansions based on your I/O needs.

### Power Supply
---

The power supply delivers electricity to your components. It connects to wall power and uses various connectors for motherboard, drives, GPU, etc.

Key specs:
- Wattage (e.g., 500W)
- Modularity (fixed vs detachable cables)
- Efficiency (e.g., 80% = 625W drawn for 500W output)

Formats vary (ATX L to SFX). Rack server PSUs are flatter and specialized.

Rule of thumb: estimate your system's wattage needs and double it, since optimal PSU efficiency is around 50% load.

### Case
---

<div style="display: flex; align-items: center;">
  <img src="/img/global/case.svg" alt="Image" style="max-width: 25%; max-height:230px; margin-right: 20px;">
  <p>The case affects cooling, airflow, and compatibility (motherboard, PSU, GPU). It also determines HDD/SSD support and layout. Rackmount cases fit into server cabinets. Choose your case based on hardware needs and space constraints.</p>
</div>

