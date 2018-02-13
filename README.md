# CONCATIFIEUR

**Concaténation et minification**


Le but de ce package est d'optimiser une page web en minifiant et concaténant le Javascript et le CSS qu'elle contient afin de limiter la bande passante utilisée lors de son chargement.

**Installation:**
```cli
> npm install concatifieur --save-dev
```

**Initialisation**

La commande suivante permet d'inititaliser le répertoire en cours en créant un fichier *index.html* avec les balises nécessaire au fonctionnnement de l'outil:
```cli
>concatifieur init
```

**Configuration**

Il est possible par la suite de configurer les répertoires à ne pas prendre en compte:
```cli
> concatifieur config --src=./src --dest=../../dist //configure le répertoire contenant les sources et le répertoire de destination

> concatifieur config ignore ./src/style //ignore le répertoire lors de la copie du dossier source vers celui de destination

> concatifieur config disignore ./src/controllers/domaine //retire le répertoire de la liste à ignorer

> concatifieur config --verbose //affiche la configuration actuelle
```

**Concatification**

Si les répertoires source et de destination sont configurés, il est possible d'utiliser la commande suivante:
```cli
> concatifieur min
```
Sinon il faut les préciser de la manière suivante, mais ils ne seront pas enregistrés dans la configuration:
```cli
> concatifieur ./src ../../dist
```
(Cette commande peut être utilisée même si il y a déjà une configuration en place.)

**Aide**

Affichage de l'aide:
```cli
> concatifieur -h
> concatifieur --help
```