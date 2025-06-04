<p align="center">
<img src="https://git.djeex.fr/Djeex/DjeexLab/raw/branch/main/docs/files/img/global/lab.svg" align="center" width="700">


[![docu.djeex.fr](https://img.shields.io/badge/Docu·djeex-00b0f0?style=for-the-badge&logoColor=white&logo=materialformkdocs)](https://docu.djeex.fr/) [![](https://dcbadge.limes.pink/api/server/jvhardware)](https://discord.gg/jvhardware) [![Uptime-Kuma](https://stats.djeex.fr/api/badge/23/status?style=for-the-badge)](https://docu.djeex.fr/) 

</p>

# 🔧 De la doc, encore de la doc

**Docu·djeex** c'est avant tout un projet personnel visant à héberger chez soi le plus de services possibles du quotidien sans passer par des plateformes propriétaires (Google, Apple, Netflix...). Cette doc utilise [Nuxt.js](https://nuxt.com/)

Ce repo contient de quoi modifier les pages, ajouter vos changements, et redéployer le site.

## Setup

Installer les dépendances

```bash
npm install
```

## Environnement de dévelopment (port 3000)

```bash
npm run dev
```

## Génération des pages statiques

```bash
npm run generate
```

Les fichiers HTML seront générés dans le dossier .output/public et prêts à être déployés sur n'importe quel hébergement compatible avec un site statique.

## Preview build

Si vous voulez voir immédiatement le résultat de la génération du site vous pouvez lancer un serveur de preview :

```bash
npm run preview
```