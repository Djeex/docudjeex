# Functional changelog: site redesign (September 2026)

This document lists every change a visitor would actually notice between the old version of docu.djeex.fr and the new one. It does not cover technical implementation details, only what changed in the content and in using the site.

## New articles

- **"Linux tips for dummies" section** (under General): three new beginner-friendly articles on the Linux terminal.
  - *CLI basics*: how a Linux command is built, with worked examples, plus a cheat-sheet table explaining where each common command's name comes from (`cd` for *change directory*, `ls` for *list*, and so on).
  - *Filesystem*: Debian's folder and partition layout, and good practices around it.
  - *Handy tools*: installing and using `btop`, `duf`, `ncdu`, `tldr`, `lazydocker`, and `ufw` (firewall).
- **Jellyfin**: new media server article, now the default recommendation in place of Plex (Plex is still documented, see below).
- **TinyAuth**: new article on this lightweight forward-auth proxy, for putting a login page in front of an app.
- **Pocket ID**: new article on this self-hosted OIDC provider, letting you log in with a passkey instead of a password.
- **File Browser Quantum**: new article on this modernized fork of File Browser, replacing the original as the recommended choice (see below).
- **Forgejo**: new article on this self-hosted Git platform, now the default recommendation in place of Gitea (Gitea is still documented, see below).
- **Arcane**: new article on this more advanced Docker management UI than Dockge, with support for multiple remote hosts and OIDC login.
- **"Confirm before deleting" tip**: new article documenting a Bash function that asks for confirmation before any `sudo`-run `rm`, to help avoid accidental deletions.
- **Section summary pages**: the General, Nonsense, and Recycled sections each now have a landing page listing their contents.

## Replaced or archived articles

Some apps are no longer the top recommendation, but their article stays available for anyone already using them or who prefers that alternative:

- **Plex** has been replaced by **Jellyfin** as the recommended choice. The Plex article is kept under a new "Alternatives" section, along with its related qBittorrent and Servarr variants.
- **Gitea** has been replaced by **Forgejo** as the recommended choice, following Gitea's governance change to a for-profit company. The Gitea article remains available under "Alternatives."
- **File Browser** has been replaced by **File Browser Quantum**. Unlike the two cases above, this one comes with an active warning rather than just being an alternative: the original project accumulated several serious security vulnerabilities (including one allowing full admin account takeover) and was officially abandoned by its maintainers in September 2026. The article is now marked deprecated with an explicit warning not to install it.
- **Overseerr** has been replaced by its successor **Seerr** in the automation (Servarr) article, following the merger of the Overseerr and Jellyseerr projects.

## Navigation reorganization

- **WireGuard** moved from the "Security" section to "Core": it's now treated as a basic infrastructure building block rather than an optional security tool.
- **Authentik** moved to a new **"Advanced"** section, alongside Arcane, for more complex setups aimed at users already comfortable with self-hosting.
- The "Security" section now only contains Cloudflare, TinyAuth, and Pocket ID.
- Deprecated or replaced articles (Plex, the old File Browser, Gitea, the old WireGuard setup) are now grouped under a new **"Recycled"** section, itself split into "Deprecated" (to avoid) and "Alternatives" (valid choices, just not the default recommendation).

## Content rewritten or substantially expanded

- **Debian installation**: heavily expanded article.
  - Explains how to enable Wake-on-LAN and automatic restart after a power outage, directly in the BIOS.
  - SSH connection instructions now split by operating system (macOS, Windows, Linux), with the exact commands for each.
  - A note on temporarily re-enabling SSH password login when connecting a new machine to the server.
  - A brand new section on waking the server up remotely (Wake-on-LAN from outside the local network), with a concrete port-forwarding example.
  - A new section on keeping the system up to date, laid out step by step, plus a one-line command tip for fully automatic updates.
  - A clear prerequisite added at the top: being comfortable with basic terminal commands, linking to the new "CLI basics" article.
- **Docker**: the introduction has been fully rewritten to explain what a container actually is and why this approach helps, instead of jumping straight into installation. The list of compatible apps is now presented as a set of examples (not exhaustive), each one linked.
- **Single sign-on**: several existing articles (Immich, Nextcloud, Forgejo, Pingvin, Vaultwarden) gained a new section explaining how to log in directly with Pocket ID, alongside the already-documented TinyAuth method.
- **TinyAuth protection**: added as a new section to many articles that didn't have it yet (monitoring, media, files, development), for putting these apps behind a login page.

## User experience (UX) changes

- **New look and feel**: the site was rebuilt from the ground up on a new component library, while keeping the old site's visual identity (colors, dark by default).
- **Navigation menu** repositioned to properly line up with the article content column (previously misaligned at some screen widths).
- **Collapsible sidebar**: the article tree on the left can now be collapsed, and starts collapsed by default instead of showing everything at once, easier to scan given how many sections there are.
- **Search button** added above the sidebar, visible on every page.
- **Step-by-step instructions**: nearly every install and configuration procedure is now visually numbered, instead of running paragraphs of text, much easier to follow.
- **Interactive folder trees**: folder structures shown in install guides are now real visual trees with folder/file icons, instead of ASCII-art text. Clicking a row copies that path to the clipboard.
- **Named, illustrated code blocks**: every code block now shows the real file name it belongs to, with a matching icon (for example, a YAML icon for a `compose.yaml`).
- **Callout boxes (notes, tips, warnings)**: colors matched to the old site's palette; some callouts can now be clicked entirely when they only contain a link to another article, instead of a plain inline text link.
- **Contributors shown at the bottom of every article**: lists everyone who has worked on a page (not just the last editor), linking to the full edit history.
- **"Other projects" links** (Gitea, Lumeex, Instameex) now also shown at the bottom of every article's table of contents, not just on the homepage.
- **Improved mobile layout**: homepage buttons, image, and spacing reorganized for small screens; "edit"/"report an issue" links now stack properly instead of overflowing on mobile.

## URL changes

- Every page now lives under an explicit language prefix, `/en/...` or `/fr/...`. Previously only French had a prefix (`/fr/...`), while English sat at the site root with no prefix at all.
- French URLs now use the same wording as their English counterparts (for example `/fr/general/networking/nat/` instead of the old `/fr/generalites/reseau/nat/`), so both languages share the exact same structure.
- **Every old link still works**: a bookmark, a link shared elsewhere, or a search-engine result pointing at an old address automatically redirects the visitor to its new equivalent.

## English/French parity

The French version is now a complete, faithful mirror of the English one: same articles, same organization, same formatting (same callouts, same numbered steps), with only the text translated. That wasn't the case before, where the two versions had drifted apart over time (articles present in one language but missing from the other, different organization).
