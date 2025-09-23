# 🚀 Déploiement Sécurisé sur Netlify

## 📋 Étapes de déploiement

### 1. Préparer les fichiers
- Tous les fichiers sont prêts dans le dossier DASHBOARDTRADING
- Utilisez `auth-netlify.html` comme page d'authentification

### 2. Déployer sur Netlify
1. Allez sur [netlify.com](https://netlify.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "Add new site" > "Deploy manually"
4. Glissez-déposez le dossier DASHBOARDTRADING

### 3. Configurer les variables d'environnement
Dans Netlify Dashboard > Site settings > Environment variables, ajoutez :

```
ADMIN_HASH = a8f5f167f44f4964e6c998dee827110c
DEMO_ADMIN_HASH = 5d41402abc4b2a76b9719d911017c592
DEMO_TRADER_HASH = 098f6bcd4621d373cade4e832627b4f6
DEMO_USER_HASH = 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
GUEST_HASH = f25a2fc72690b780b2a14e140ef6a9e0
```

### 4. Activer les fonctions Netlify
- Les fonctions sont automatiquement détectées grâce au fichier `netlify.toml`
- L'API d'authentification sera disponible sur `/api/auth`

## 🔐 Sécurité

### ✅ Avantages de cette solution :
- **Mots de passe invisibles** : Stockés dans les variables d'environnement Netlify
- **Authentification côté serveur** : Vérification sécurisée via Netlify Functions
- **Tokens JWT** : Sessions sécurisées avec expiration
- **HTTPS obligatoire** : Chiffrement des communications
- **Variables d'environnement** : Inaccessibles depuis le navigateur

### 🔒 Comptes de démonstration :
- **demo_admin** / hello
- **demo_trader** / test  
- **demo_user** / password
- **guest** / Guest789!

⚠️ **Note :** Le compte admin principal n'est pas affiché publiquement pour des raisons de sécurité.

## 🛠️ Pour ajouter un nouvel utilisateur :

1. Générez le hash MD5 :
   ```javascript
   const crypto = require('crypto');
   const hash = crypto.createHash('md5').update('NOUVEAU_MOT_DE_PASSE' + 'TradingSalt2024').digest('hex');
   ```

2. Ajoutez la variable d'environnement dans Netlify :
   ```
   NOUVEAU_USER_HASH = hash_généré
   ```

3. Modifiez `/netlify/functions/auth.js` pour inclure le nouvel utilisateur

## 📝 Notes importantes :
- Supprimez `generate-hash.html` après déploiement
- Les variables d'environnement ne sont visibles que par les administrateurs Netlify
- L'authentification fonctionne uniquement en HTTPS (automatique sur Netlify)
- Les fonctions Netlify sont gratuites jusqu'à 125k requêtes/mois