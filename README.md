# web-atrio-app

## Auto-evaluation
Lors de cet exercice je ne me suis pas concentré sur le design et l'ergonomie mais sur le fait que les fonctionnalités demandées fonctionnent. Ce qui explique que l'utilisation et la navigation ne soit pas très intuitive. J'ai utilisé symfony pour faire l'API et React pour faire l'interface utilisateur.

## Utilisation
```http://localhost:5173/``` renvoie vers la page d'accueil qui comporte la liste des utilisateurs, le formulaire d'ajout d'utilisateur.
Lorsqu'un utilisateur est ajouté, ses données apparaissent sous le titre "List of Persons" avec le nom et prénom cliquable qui renvoie vers la page de l'utilisateur.
Un lien de recherche de personnes par entreprise est aussi présent en bas de la page.

```http://localhost:5173/person/{id}``` renvoie vers la page d'une personne sur laquelle on peut voir ses informations, tous ses emplois mais aussi faire une recherche d'emploi entre 2 dates et ajouter un emploi à cette personne.

```http://localhost:5173/person/{id}/add-job``` renvoie vers la page d'ajout d'emploi.


Vous trouverz la documentation de l'API à cette URL : ```http://127.0.0.1:8000/api/doc```
