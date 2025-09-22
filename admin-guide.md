# 🔧 Guide Administrateur

## 🚀 Accès Admin

**Compte :** `admin`  
**Mot de passe :** `TradingPro2024!`

## 🛠️ Fonctionnalités Admin

### 📍 Boutons d'accès
- **Bouton "🔧 Admin"** (coin supérieur gauche)
- **Paramètres** > **🔧 Administration**

### 👥 Gestion des utilisateurs

#### ➕ Ajouter un utilisateur
1. Cliquez sur **"Gérer les Utilisateurs"**
2. Remplissez **nom d'utilisateur** et **mot de passe**
3. Cliquez **"Ajouter Utilisateur"**
4. **Copiez le code généré** dans `auth.html`

#### ✏️ Modifier un mot de passe
1. Cliquez sur **✏️** à côté de l'utilisateur
2. Entrez le **nouveau mot de passe**
3. **Copiez le code généré** dans `auth.html`

#### 🗑️ Supprimer un utilisateur
1. Cliquez sur **🗑️** à côté de l'utilisateur
2. Confirmez la suppression
3. **Toutes ses données** seront supprimées
4. **Copiez le code généré** dans `auth.html`

## ⚠️ Important

### 🔄 Mise à jour manuelle
Après chaque modification, vous devez :
1. **Copier le code généré**
2. **Ouvrir le fichier `auth.html`**
3. **Remplacer la section USERS**
4. **Redéployer sur Netlify**

### 🛡️ Sécurité
- **Seul l'admin** peut gérer les utilisateurs
- **Impossible de supprimer** le compte admin
- **Données isolées** par utilisateur
- **Mots de passe visibles** (pour récupération)

### 📱 Exemple de modification

**Dans `auth.html`, remplacez :**
```javascript
const USERS = {
    "admin": "TradingPro2024!",
    "trader1": "Trader123!",
    "nouveautrader": "MotDePasseSecurise123!"
};
```

## 🚀 Workflow Admin

1. **Connectez-vous** avec le compte admin
2. **Gérez les utilisateurs** via l'interface
3. **Copiez le code** généré automatiquement
4. **Mettez à jour** `auth.html`
5. **Redéployez** sur Netlify
6. **Partagez les identifiants** avec les nouveaux utilisateurs

---
*Interface d'administration sécurisée pour Trading Dashboard Pro*