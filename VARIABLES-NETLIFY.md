# 🔐 VARIABLES NETLIFY À CONFIGURER

## ⚠️ OBLIGATOIRE - Configurez ces 5 variables dans Netlify

### 📋 Dans Netlify Dashboard → Site settings → Environment variables :

**Créez ces 5 variables :**

1. **ADMIN_HASH**
   - Valeur : `eceae721355dca75a71787edd414d91d`

2. **DEMO_ADMIN_HASH**
   - Valeur : `5d41402abc4b2a76b9719d911017c592`

3. **DEMO_TRADER_HASH**
   - Valeur : `098f6bcd4621d373cade4e832627b4f6`

4. **DEMO_USER_HASH**
   - Valeur : `5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8`

5. **GUEST_HASH**
   - Valeur : `f25a2fc72690b780b2a14e140ef6a9e0`

### 🔧 Configuration pour chaque variable :
- **Secret :** ✅ Coché
- **Scopes :** All scopes
- **Values :** Same value for all deploy contexts

### 🚀 Après configuration :
1. Trigger deploy
2. Testez avec `admin / TradingPro2024!`

---
**🗑️ Supprimez ce fichier après configuration**