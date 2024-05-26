# <div align="center">Project Shipex</div>

<div align="center">
  <img src="https://github.com/asmachkirida/Shipex-Frontend/assets/118173002/2d07ac80-6d76-4b0f-8061-f3a230d9ac47" alt="Capture_d_écran_2024-05-16_142433-removebg-preview">
</div>

Ce document présente notre plateforme innovante, une application web et mobile dédiée à l'optimisation logistique par la géolocalisation. Ce projet vise à simplifier et améliorer les processus de transport et de gestion des stocks dans l'industrie logistique. Notre objectif est de faciliter la gestion des itinéraires de transport de manière efficace, en offrant des fonctionnalités telles que le suivi en temps réel des livraisons, l'optimisation des itinéraires et la planification des horaires de livraison. Conçue pour aider les entreprises à réduire les coûts logistiques tout en améliorant l'efficacité des opérations, cette plateforme permet une gestion logistique optimisée grâce à des fonctionnalités avancées et une interface intuitive. Un élément clé de notre plateforme est l'intégration de Google Maps, qui aide à optimiser les trajets et à s'adapter aux besoins spécifiques de chaque entreprise, redéfinissant ainsi la logistique traditionnelle. En utilisant la technologie pour optimiser la logistique, nous visons non seulement à rendre les processus plus efficaces, mais aussi à répondre aux besoins uniques de chaque entreprise.
## Table des matières
  1. [Aperçu](#aperçu)
  2. [Architecture logicielle](#architecture-logicielle)
  3. [Frontend](#frontend)
      - [Technologies Utilisées](#technologies-utilisées)
      - [Structure du Projet Frontend](#structure-du-projet-frontend)
  4. [Backend](#backend)
      - [Technologies Utilisées](#technologies-utilisées-1)
      - [Structure du Projet Backend](#structure-du-projet-backend)
  5. [Prérequis](#prérequis)
  6. [Video Demonstration](#video-demonstration)
  7. [Contributing](#contributing)

  ## Aperçu
 Le projet vise à créer une application de géolocalisation révolutionnaire pour simplifier la gestion logistique. Avec une interface conviviale et sécurisée, elle rend l'optimisation des itinéraires et la gestion des stocks accessibles à tous. En offrant des fonctionnalités comme le suivi en temps réel des livraisons et la sélection d'itinéraires basée sur les conditions de trafic, elle améliore l'efficacité opérationnelle et la satisfaction client. L'objectif principal est d'optimiser les processus logistiques et de réduire les coûts, tout en favorisant l'adoption continue de cette solution innovante.
- ## Architecture logicielle
![Capture d'écran 2024-05-26 095007](https://github.com/asmachkirida/Shipex-Frontend/assets/118173002/89738b7f-2525-41b7-8626-3f8b51f6ce13)

## Frontend
### Technologies Utilisées
- React js
- React native 
- Chakra UI
- CSS
## Structure du Projet Frontend

La structure du projet frontend React repose sur quatre composants principaux, chacun ayant un objectif précis et contribuant à l'architecture globale et à la stabilité de l'application.

### 1. Composant Auth
- **Objectif:** Faciliter l'authentification des utilisateurs avec une interface de connexion commune, tout en offrant des formulaires d'inscription distincts adaptés à chaque rôle.
- **Fonctionnalités:**
  - **Interface de Connexion Partagée:** Une interface commune pour la connexion de tous les utilisateurs (administrateurs, livreurs et clients).
  - **Formulaires d'Inscription Adaptés:** Des formulaires d'inscription spécifiques pour les administrateurs, les livreurs et les clients, recueillant les informations nécessaires pour chaque type d'utilisateur.
  - **JWT (JSON Web Tokens):** Utilisation de tokens JWT pour sécuriser les endpoints de l'API et gérer l'accès basé sur les rôles. Les tokens sont stockés de manière sécurisée et utilisés pour authentifier les requêtes des utilisateurs.
  - **Gestion des Sessions:** Utilisation des cookies ou du stockage local pour gérer les sessions utilisateurs de manière sécurisée.
  - **Validation des Formulaires:** Système de validation des données pour assurer que les informations fournies sont correctes et complètes.

### 2. Composant Client
- **Objectif:** Permettre aux clients de soumettre facilement un colis en fournissant des détails précis via un formulaire détaillé et de suivre leurs colis en temps réel.
- **Fonctionnalités:**
  - **Soumission de Colis:** Formulaire détaillé permettant aux clients de soumettre des informations sur le colis, telles que le nom, la date d'expédition, le poids, et les instructions spéciales.
  - **Ajout d'Articles:** Possibilité pour les clients d'ajouter des articles spécifiques à leur colis, décrivant chaque produit.
  - **Suivi des Colis en Temps Réel:** Affichage des informations cruciales sur le statut du colis, y compris la durée et le coût estimés de la livraison, l'acceptation par le chauffeur, et l'état actuel du colis avec des mises à jour régulières de l'emplacement.
  - **Historique des Colis:** Consultation de l'historique des colis envoyés avec détails sur chaque envoi.
  - **Notifications:** Alertes pour les mises à jour importantes du statut du colis.

### 3. Composant Chauffeur
- **Objectif:** Offrir aux livreurs la flexibilité de sélectionner les villes à visiter dans l'ordre de leur choix tout en optimisant les itinéraires pour une efficacité maximale et en gérant les livraisons.
- **Fonctionnalités:**
  - **Optimisation des Itinéraires:** Possibilité de sélectionner les villes à visiter, avec optimisation automatique du trajet pour une efficacité maximale.
  - **Ajout de Colis au Voyage:** Les livreurs peuvent ajouter des colis à leur itinéraire en fonction de leur route planifiée.
  - **Gestion des Colis:** Affichage des colis disponibles sur une carte interactive, avec options pour accepter ou refuser des colis. Une fois un colis accepté, le livreur ne peut pas en accepter d'autres pendant 48 heures pour éviter les surcharges de travail.
  - **Démarrage du Voyage:** Les livreurs peuvent commencer leur voyage, gérer la livraison des colis et mettre à jour le statut de chaque colis.
  - **Suivi en Temps Réel:** Suivi en temps réel des colis livrés avec mises à jour régulières de l'emplacement actuel du livreur.
  - **Gestion des Bons de Livraison:** Les livreurs peuvent gérer les bons de livraison pour chaque colis livré.

### 4. Composant Admin
- **Objectif:** Fournir une vue d'ensemble des statistiques des colis et faciliter la gestion des colis, des livreurs et des clients, tout en supervisant le système.
- **Fonctionnalités:**
  - **Statistiques et Supervision:** Affichage des statistiques des colis, distinguant les colis en attente et les colis livrés, ainsi que le nombre total de colis ajoutés chaque mois.
  - **Visualisation des Utilisateurs et Colis:** Possibilité de visualiser les informations des clients, des colis et des livreurs.
  - **Gestion des Colis:** Permet de visualiser, ajouter, modifier et supprimer des colis.
  - **Gestion des Utilisateurs:** Fonctionnalités d'ajout, modification et suppression rapides des livreurs et des clients existants.
  - **Tableaux et Graphiques:** Utilisation de graphiques pour représenter les données de manière visuelle et compréhensible.


## Dépendances Principales

Le projet utilise plusieurs bibliothèques et frameworks pour offrir une interface utilisateur moderne et fonctionnelle. Voici les principales dépendances :

### 1. Chakra UI
- **Description:** Chakra UI est une bibliothèque de composants React simple, modulaire et accessible qui vous donne tous les éléments de construction dont vous avez besoin pour créer des interfaces utilisateur.
- **Utilisation:** Utilisé pour la création de composants d'interface utilisateur réactifs et accessibles.
- **Paquets:**
  - `@chakra-ui/react`: Composants principaux de Chakra UI.
  - `@chakra-ui/icons`: Icônes pour Chakra UI.
  - `@chakra-ui/system`: Système de base pour Chakra UI.
  - `@chakra-ui/theme-tools`: Outils de thème pour Chakra UI.
  - `@emotion/react`: Librairie d'émotion pour le CSS-in-JS.
  - `@emotion/styled`: Composants stylisés pour Emotion.

### 2. Google Maps
- **Description:** Fournit une intégration facile avec l'API Google Maps pour afficher des cartes et des directions.
- **Utilisation:** Utilisé pour afficher les itinéraires des chauffeurs et les localisations des colis.
- **Paquets:**
  - `@react-google-maps/api`: API Google Maps pour React.

### 3. Axios
- **Description:** Axios est une bibliothèque HTTP basée sur des promesses qui permet de faire des requêtes vers une API de manière simple et efficace.
- **Utilisation:** Utilisé pour effectuer des requêtes HTTP vers l'API backend pour des opérations CRUD.
- **Paquet:**
  - `axios`: Utilisé pour les requêtes HTTP.

### 4. JWT (JSON Web Tokens)
- **Description:** JWT est une méthode compacte et sécurisée pour représenter les informations entre deux parties.
- **Utilisation:** Utilisé pour l'authentification sécurisée des utilisateurs et la gestion des sessions.
- **Paquet:**
  - `jwt-decode`: Utilisé pour décoder les tokens JWT.

### 5. Cookies
- **Description:** Bibliothèque simple pour gérer les cookies.
- **Utilisation:** Utilisé pour stocker et gérer les tokens JWT dans les cookies pour la gestion des sessions utilisateur.
- **Paquet:**
  - `js-cookie`: Utilisé pour la gestion des cookies.

### Autres Dépendances
Le projet utilise également d'autres dépendances pour diverses fonctionnalités, telles que la manipulation des dates, la gestion des fichiers, les animations, et plus encore. Voici quelques-unes d'entre elles :

- `react-calendar`: Composant de calendrier pour React.
- `react-dropzone`: Composant de téléchargement de fichiers pour React.
- `react-icons`: Bibliothèque d'icônes pour React.
- `react-router-dom`: Gestion des routes pour React.
- `react-scripts`: Scripts et configuration pour les applications React.
- `react-table`: Bibliothèque pour la création de tableaux dans React.

Pour une liste complète des dépendances, veuillez consulter le fichier `package.json` du projet.


## Backend

### Technologies Utilisées
- Django
- MySQL (ou PostgreSQL)
- Django REST framework
- JWT (JSON Web Tokens) pour l'authentification

### Structure du Projet Backend

Le code backend suit une structure modulaire et organisée, tirant parti de la puissance de Django pour construire une application robuste et scalable.

#### 1. `project_pfa`
- **Fichier Principal de l'Application :** `settings.py` sert de point d'entrée pour la configuration de l'application Django. Il inclut les paramètres globaux tels que les configurations de la base de données, les applications installées, les middlewares, etc.

#### 2. `project_pfa/backend`
- **Classes de Vue (Views) :** Le fichier `views.py` contient les classes et fonctions responsables de la gestion des requêtes HTTP entrantes. Chaque vue est dédiée à une fonctionnalité ou une entité spécifique, exposant des points de terminaison RESTful. Ces classes interagissent avec les services pour traiter les requêtes et retourner les réponses appropriées.

#### 3. `project_pfa/backend/services`
- **Classes de Service :** Le répertoire `services` contient des classes qui encapsulent la logique métier. Ces classes sont utilisées par les vues pour effectuer des opérations sur les données et communiquer avec les répertoires (repositories). Elles fournissent une couche d'abstraction entre les vues et les répertoires.

#### 4. `project_pfa/backend/models.py`
- **Classes de Modèle (Models) :** Le fichier `models.py` inclut des classes représentant les entités de données dans l'application. Ces classes sont annotées avec des annotations Django ORM, définissant la structure des tables de la base de données. Chaque entité correspond généralement à une table dans la base de données MySQL ou PostgreSQL.

#### 5. `project_pfa/backend/serializers.py`
- **Classes de Serializer :** Le fichier `serializers.py` contient des classes utilisées pour convertir les instances de modèle en formats de données tels que JSON. Les serializers facilitent la validation et la transformation des données entrantes et sortantes.

#### 6. `project_pfa/backend/urls.py`
- **Routes et Points de Terminaison :** Le fichier `urls.py` définit les routes de l'application. Il mappe les URL aux vues correspondantes, permettant ainsi de gérer les requêtes HTTP vers les points de terminaison appropriés.

#### 7. `project_pfa/backend/tests.py`
- **Tests Unitaires :** Le fichier `tests.py` contient des classes et des fonctions pour tester les différentes parties de l'application. Les tests unitaires garantissent que les fonctionnalités de l'application fonctionnent comme prévu.

### Dépendances

#### Django et DRF
- **Django :** Le framework principal pour le développement web rapide et sécurisé.
- **Django REST framework (DRF) :** Une bibliothèque puissante et flexible pour créer des API Web.

#### Django JWT
- **Django Simple JWT :** Utilisé pour l'authentification sécurisée basée sur les tokens JWT.

#### MySQL 
- **mysqlclient  :** Connecteur JDBC pour se connecter à une base de données MySQL .


## Prérequis :
- Git :

  Assurez-vous d'avoir Git installé. Si ce n'est pas le cas, téléchargez et installez-le depuis [git-scm.com](https://git-scm.com/).

- Node.js et npm :

  Installez Node.js et npm depuis [nodejs.org](https://nodejs.org/).
  
- MySQL :

  Assurez-vous d'avoir MySQL installé et fonctionnel. Vous pouvez le télécharger depuis [mysql.com](https://www.mysql.com/).

- Django :

  Installez Django en utilisant pip : `pip install django`.
  
### Configuration du Projet Backend :
- Clonez le projet en utilisant Git : `git clone https://github.com/hamzalach02/PFA.git`.
- Lancez le serveur Django en exécutant : `python manage.py runserver`.

### Configuration du Projet Frontend :
- Clonez le projet en utilisant Git : `git clone https://github.com/asmachkirida/Shipex-Frontend.git`.
- Pour le projet React, installez les dépendances en exécutant : `npm install`.
- Pour démarrer le serveur de développement React, exécutez : `npm start`.


## Vidéo de Démo
Cliquez sur le lien ci-dessous pour regarder une vidéo de démonstration :


https://github.com/asmachkirida/Shipex-Frontend/assets/118173002/bca96337-59e5-4f98-9ada-6fcd359f5435




## Contribution
Nous accueillons les contributions de tous et nous apprécions votre aide pour rendre ce projet encore meilleur !

### Contributeurs
- [Asma CHKIRIDA](https://github.com/asmachkirida)
- [Hamza LACHGAR](https://github.com/hamzalach02)
- [Ayoub MARHRANI](https://github.com/Ayoub-Marhr)
- [Asmaa ELBOUAZZAOUI](https://github.com/AsmaaElb)
- [Aya ELFEDDANI](https://github.com/Aya-elfe)



