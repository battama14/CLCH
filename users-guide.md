# 👥 Guide Multi-Utilisateurs

## 🔐 Comptes disponibles

### Comptes par défaut :
- **admin** : `TradingPro2024!` (Administrateur principal)
- **trader1** : `Trader123!` (Trader 1)
- **trader2** : `Market456!` (Trader 2)  
- **guest** : `Guest789!` (Invité)

## ✨ Fonctionnalités

### 🔒 Données séparées
- Chaque utilisateur a ses **propres trades**
- Chaque utilisateur a ses **propres paramètres**
- **Aucun mélange** entre les comptes
- **Isolation complète** des données

### 📊 Personnalisation individuelle
- Capital initial personnalisé
- Pourcentage de risque individuel
- Historique de trades séparé
- Statistiques personnelles

## 🛠️ Ajouter de nouveaux utilisateurs

### Dans le fichier `auth.html`, modifiez :
```javascript
const USERS = {
    "admin": "TradingPro2024!",
    "trader1": "Trader123!",
    "trader2": "Market456!",
    "guest": "Guest789!",
    "nouveautrader": "MotDePasseSecurise123!",  // ← Ajoutez ici
    "client1": "ClientPass456!",                // ← Ou ici
    "equipe": "EquipeTrading789!"               // ← Etc.
};
```

## 🚀 Déploiement

1. **Modifiez les mots de passe** avant le déploiement
2. **Ajoutez vos utilisateurs** dans la liste
3. **Déployez sur Netlify** normalement
4. **Partagez les identifiants** avec vos utilisateurs

## 🔄 Changement de mot de passe

Pour changer un mot de passe :
1. Ouvrez `auth.html`
2. Trouvez la ligne de l'utilisateur
3. Changez le mot de passe
4. Redéployez sur Netlify

## 📱 Utilisation

1. **Connexion** : Chaque utilisateur se connecte avec ses identifiants
2. **Données isolées** : Impossible de voir les données des autres
3. **Déconnexion** : Bouton en haut à droite
4. **Sécurité** : Session automatiquement fermée

---
*Système multi-utilisateurs sécurisé pour traders professionnels*