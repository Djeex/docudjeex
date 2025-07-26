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

Depending on the required performance, one can choose between a dedicated GPU with its own VRAM (a graphics card connected to a PCIe slot on the motherboard), or an iGPU—an integrated GPU built into the CPU (such as the N100/N150 or N305/N355), which uses the system’s shared RAM.

### HDD(s)
---

<p align="center">
  <img src="/img/global/hdd.svg" alt="Image" style="max-width: 50%; margin-right: 20px;">
</p>

An HDD (Hard Disk Drive), or hard drive, is a component used to store data. It was once the standard storage device in computers. HDDs consist of one or more stacked platters and read/write heads—somewhat like a vinyl record player.

Today, HDDs can store enormous amounts of data (up to 30TB, or 30,000 gigabytes, for consumer models), but their read and write speeds are limited due to their mechanical nature. They are also bulky and heavy.

Generally, HDDs are best suited for storing data that doesn’t require frequent access or fast write speeds, such as media files (videos, photos), cloud drives, or archived data. They perform well in these scenarios and, most importantly, are significantly cheaper than SSDs for the same amount of storage.

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

An SSD (Solid State Drive) is a small circuit board with memory chips soldered onto it, used to store information. Unlike RAM, these chips retain data even when not powered, meaning the information is preserved after a reboot. SSDs are generally used as the main storage medium for your server.

Unlike HDDs, SSDs have no moving parts, are highly compact, and most importantly, are extremely fast—offering speeds of several gigabytes per second for high-performance models.

SSDs come in various formats, but today the preferred choice is the M.2 NVMe version, as it is the smallest, fastest, and has become the standard on modern motherboards.

However, SSDs are significantly more expensive than hard drives for the same storage capacity. Typically, the operating system (OS) is installed on the SSD to ensure fast performance. In a server environment, it's also ideal to store [Docker containers](/serveex/core/docker) and databases on the SSD. More broadly, any data that needs to be accessed frequently and quickly—such as websites, applications, or processing workloads—should be stored on an SSD.

### Network Card
---

A network card allows your machine to communicate with your network (including the internet). It consists of a controller chip and one or more network ports. These ports—often Ethernet ports—can come in different physical formats and support various data transfer standards:

- RJ45 Gigabit Ethernet (10/100/1000): The standard RJ45 connector, supporting speeds from 10 Mbps (0.125 MB/s) up to 1000 Mbps (125 MB/s).
- RJ45 2.5G: Same connector type, supporting up to 2.5 Gbps (2,500 Mbps or 312.5 MB/s).
- RJ45 5G: Same connector, supporting up to 5 Gbps (625 MB/s).
- RJ45 10G Base-T: Same RJ45 format, supporting up to 10 Gbps (1.25 GB/s).
- SFP 1G: SFP port, commonly used for fiber optic connections, supporting speeds up to 1 Gbps.
- SFP+ 10G: An enhanced version of the SFP port, also used for fiber optics, supporting up to 10 Gbps.

::alert{type="warning"}
:::list{type="warning"}
- __Caution:__ Match network gear (router, switch, cables) to your desired speed. For most uses, CAT5E cables are enough; use CAT6A beyond 10 Gbps. Fiber requires additional care (simplex, duplex, transceivers...).
:::
::

The network card is usually built directly into the motherboard, but you can also use dedicated network cards, for example via USB or a PCIe expansion slot.

In general, for a server setup, it's recommended to have at least two Ethernet ports to ensure redundancy in case one connection fails.

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

The power supply unit (PSU) is the component that provides electrical power to your machine’s components. It connects to the wall via a power cord and has several output cables that plug into the motherboard and various peripherals, such as hard drives or dedicated graphics cards.

A power supply is defined by several key characteristics:

- Wattage (its total power output),
- Modularity (whether the cables are fixed or detachable),
- Efficiency (measured as a percentage). For example, a 500W PSU with 80% efficiency will actually draw 625W from the wall to deliver 500W to the system.

Another important factor is the form factor. There are several standard sizes, from ATX L (for larger cases) to SFX (for compact builds). There are also specialized models for rack-mounted servers, which are typically flat and space-efficient.

To choose the right PSU, a common rule of thumb is to estimate your system’s power needs based on usage, and then double that value. This is because most power supplies operate at optimal efficiency around 50% of their maximum load.

### Case
---

<div style="display: flex; align-items: center;">
  <img src="/img/global/case.svg" alt="Image" style="max-width: 25%; max-height:230px; margin-right: 20px;">
  <p>The case is also an essential component of your machine. It plays a key role in cooling, through its fans and airflow design, and it determines the form factor compatibility for your motherboard, power supply, and any dedicated GPU you may install.
</p>
</div>

Additionally, the case dictates how many HDDs you can install and what formats they support. Some cases are rack-mountable, meaning they can be installed in server racks (server cabinets).

Choose your case carefully based on your specific needs and the hardware you plan to use.
