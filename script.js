class TradingDashboard {
    constructor() {
        this.currentUser = sessionStorage.getItem('currentUser') || 'default';
        this.currentAccount = localStorage.getItem(`currentAccount_${this.currentUser}`) || 'compte1';
        this.trades = JSON.parse(localStorage.getItem(`trades_${this.currentUser}_${this.currentAccount}`)) || [];
        this.settings = JSON.parse(localStorage.getItem(`settings_${this.currentUser}_${this.currentAccount}`)) || { capital: 1000, riskPerTrade: 2 };
        this.accounts = JSON.parse(localStorage.getItem(`accounts_${this.currentUser}`)) || {
            'compte1': { name: 'Compte Principal', capital: 1000 },
            'compte2': { name: 'Compte Démo', capital: 500 },
            'compte3': { name: 'Compte Swing', capital: 2000 }
        };
        this.initFirebase();
        
        this.initFirebaseUsers();
        this.currentStep = 0;
        this.currentTrade = {};
        this.livePrices = {};
        this.previousModalContent = null;
        this.checklistSteps = [
            {
                title: "✅ 1. Contexte Global",
                question: "Quelle est la tendance Daily et la zone H4 ?",
                key: "contextGlobal",
                education: `<strong>🎯 Objectif :</strong> Comprendre la tendance générale<br><br><strong>📊 Daily :</strong> Haussière/Baissière/Range<br><strong>📊 H4 :</strong> Premium/Discount/Équilibre`,
                options: ["Hausse + Discount", "Baisse + Premium", "Range", "Hausse + Premium", "Baisse + Discount"]
            },
            {
                title: "✅ 2. Zone Institutionnelle",
                question: "Zone institutionnelle identifiée ?",
                key: "zoneInstitutionnelle",
                education: `<strong>🎯 Objectif :</strong> Trouver les zones d'entrée<br><br><strong>🏦 Order Blocks :</strong> Dernière bougie avant impulsion<br><strong>⚡ Fair Value Gaps :</strong> Gaps à combler`,
                options: ["Order Block Valide", "Fair Value Gap", "Liquidity Grab", "Aucune Zone"]
            },
            {
                title: "✅ 3. Structure de Marché",
                question: "Structure confirmée ?",
                key: "structureMarche",
                education: `<strong>🎯 Objectif :</strong> Confirmer la direction<br><br><strong>🔄 CHOCH :</strong> Changement de caractère<br><strong>📈 BOS :</strong> Cassure de structure`,
                options: ["CHOCH Confirmé", "BOS Confirmé", "Structure Unclear", "Faux Signal"]
            },
            {
                title: "✅ 4. Timing Killzones",
                question: "Timing optimal ?",
                key: "timingKillzones",
                education: `<strong>🎯 Objectif :</strong> Trader aux bonnes heures<br><br><strong>⏰ Londres :</strong> 8h-11h<br><strong>⏰ New York :</strong> 14h-17h`,
                options: ["Killzone Londres", "Killzone New York", "Overlap", "Hors Killzone"]
            },
            {
                title: "✅ 5. Signal d'Entrée",
                question: "Signal précis confirmé ?",
                key: "signalEntree",
                education: `<strong>🎯 Objectif :</strong> Signal d'exécution<br><br><strong>📍 Pin Bar :</strong> Rejet avec mèche<br><strong>📍 Doji :</strong> Indécision puis direction`,
                options: ["Pin Bar", "Doji", "Engulfing", "Signal Faible"]
            },
            {
                title: "✅ 6. Risk Management",
                question: "R:R optimal ?",
                key: "riskManagement",
                education: `<strong>🎯 Objectif :</strong> Protéger le capital<br><br><strong>🛡️ Stop Loss :</strong> Niveau d'invalidation<br><strong>🎯 Take Profit :</strong> Zone de liquidité`,
                options: ["R:R ≥ 1:3", "R:R = 1:2", "R:R < 1:2", "SL Trop Large"]
            },
            {
                title: "✅ 7. Discipline",
                question: "Plan respecté ?",
                key: "discipline",
                education: `<strong>🎯 Objectif :</strong> Cohérence<br><br><strong>🧠 Discipline :</strong> Suivre le plan<br><strong>📝 Journal :</strong> Documenter`,
                options: ["Plan Respecté", "Discipline OK", "Émotions Contrôlées", "Amélioration Nécessaire"]
            }
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initAccountSelector();
        this.autoLoadFromCloud();
        this.updateStats();
        this.renderTradesTable();
        this.initCharts();
        this.updateCharts();
        this.initCalendar();
        this.startAutoSync();
    }

    initAccountSelector() {
        const accountSelect = document.getElementById('accountSelect');
        if (accountSelect) {
            accountSelect.innerHTML = '';
            Object.entries(this.accounts).forEach(([key, account]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = account.name;
                if (key === this.currentAccount) {
                    option.selected = true;
                }
                accountSelect.appendChild(option);
            });
        }
    }

    switchAccount(accountKey) {
        if (accountKey === this.currentAccount) return;
        
        // Sauvegarder les données actuelles
        this.saveToStorage();
        
        // Changer de compte
        this.currentAccount = accountKey;
        localStorage.setItem(`currentAccount_${this.currentUser}`, accountKey);
        
        // Charger les données du nouveau compte
        this.trades = JSON.parse(localStorage.getItem(`trades_${this.currentUser}_${this.currentAccount}`)) || [];
        this.settings = JSON.parse(localStorage.getItem(`settings_${this.currentUser}_${this.currentAccount}`)) || { 
            capital: this.accounts[accountKey]?.capital || 1000, 
            riskPerTrade: 2 
        };
        
        // Mettre à jour l'interface
        this.updateStats();
        this.renderTradesTable();
        this.updateCharts();
        this.updateCalendar();
        
        // Notification
        const accountName = this.accounts[accountKey]?.name || accountKey;
        this.showNotification(`Compte changé vers: ${accountName}`);
    }

    addNewAccount() {
        const accountName = prompt('Nom du nouveau compte:', 'Mon Nouveau Compte');
        if (!accountName) return;
        
        const initialCapital = parseFloat(prompt('Capital initial ($):', '1000'));
        if (isNaN(initialCapital) || initialCapital <= 0) {
            alert('Capital invalide');
            return;
        }
        
        const accountKey = 'compte' + (Object.keys(this.accounts).length + 1);
        this.accounts[accountKey] = {
            name: accountName,
            capital: initialCapital
        };
        
        localStorage.setItem(`accounts_${this.currentUser}`, JSON.stringify(this.accounts));
        this.initAccountSelector();
        
        this.showNotification(`Compte "${accountName}" créé avec succès!`);
    }

    deleteAccount() {
        const accountKeys = Object.keys(this.accounts);
        if (accountKeys.length <= 1) {
            alert('Impossible de supprimer le dernier compte.');
            return;
        }
        
        const accountName = this.accounts[this.currentAccount]?.name || this.currentAccount;
        if (confirm(`Supprimer le compte "${accountName}" et toutes ses données ?`)) {
            // Supprimer les données du compte
            localStorage.removeItem(`trades_${this.currentUser}_${this.currentAccount}`);
            localStorage.removeItem(`settings_${this.currentUser}_${this.currentAccount}`);
            
            // Supprimer le compte de la liste
            delete this.accounts[this.currentAccount];
            
            // Passer au premier compte disponible
            const firstAccount = Object.keys(this.accounts)[0];
            this.currentAccount = firstAccount;
            localStorage.setItem(`currentAccount_${this.currentUser}`, firstAccount);
            
            // Charger les données du nouveau compte
            this.trades = JSON.parse(localStorage.getItem(`trades_${this.currentUser}_${this.currentAccount}`)) || [];
            this.settings = JSON.parse(localStorage.getItem(`settings_${this.currentUser}_${this.currentAccount}`)) || { 
                capital: this.accounts[this.currentAccount]?.capital || 1000, 
                riskPerTrade: 2 
            };
            
            // Sauvegarder et mettre à jour
            this.saveToStorage();
            this.initAccountSelector();
            this.updateStats();
            this.renderTradesTable();
            this.updateCharts();
            this.updateCalendar();
            
            this.showNotification(`Compte "${accountName}" supprimé`);
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #00d4ff, #5b86e5);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 2000;
            box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    initFirebase() {
        const firebaseConfig = {
            apiKey: "AIzaSyDDTsKpifjFMSSJrn20Xc3q8szf27F2ZP0",
            authDomain: "clch-3a8f4.firebaseapp.com",
            databaseURL: "https://clch-3a8f4-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "clch-3a8f4",
            storageBucket: "clch-3a8f4.firebasestorage.app",
            messagingSenderId: "258957198457",
            appId: "1:258957198457:web:2998d1c0f6ba295f3080a8"
        };
        
        try {
            firebase.initializeApp(firebaseConfig);
            this.database = firebase.database();
            this.cloudEnabled = true;
            console.log('Firebase initialisé avec succès');
        } catch (error) {
            console.log('Erreur Firebase:', error);
            this.cloudEnabled = false;
        }
    }

    async initFirebaseUsers() {
        if (!this.cloudEnabled) return;
        
        try {
            const snapshot = await this.database.ref('users').once('value');
            const users = snapshot.val();
            
            if (!users && this.currentUser === 'admin') {
                // Créer les utilisateurs par défaut dans Firebase
                const defaultUsers = {
                    "admin": "TradingPro2024!",
                    "trader1": "Trader123!",
                    "trader2": "Market456!",
                    "guest": "Guest789!"
                };
                await this.database.ref('users').set(defaultUsers);
                console.log('Utilisateurs par défaut créés dans Firebase');
            }
        } catch (error) {
            console.log('Erreur init utilisateurs:', error);
        }
    }



    showCloudSync() {
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;
        
        const cloudStatus = this.cloudEnabled ? '✅ Connecté' : '❌ Déconnecté';
        
        modalContent.innerHTML = `
            <h2>☁️ Synchronisation Cloud Firebase</h2>
            <div class="education-content">
                <h4>🔌 Statut : ${cloudStatus}</h4>
                <p><strong>Synchronisation automatique</strong> entre tous vos appareils</p>
                <p>Vos données sont sécurisées sur Firebase Google</p>
            </div>
            
            <div class="trade-form">
                <div class="form-group">
                    <label>Code de synchronisation personnel :</label>
                    <input type="text" id="syncCode" placeholder="MonCodeSecret123" value="${this.getSyncCode()}">
                    <small style="color: rgba(255,255,255,0.7); font-size: 0.8em;">Utilisez le même code sur tous vos appareils</small>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn-primary" onclick="dashboard.uploadToFirebase()" style="flex: 1;" ${!this.cloudEnabled ? 'disabled' : ''}>⬆️ Sauvegarder Cloud</button>
                    <button class="btn-info" onclick="dashboard.downloadFromFirebase()" style="flex: 1;" ${!this.cloudEnabled ? 'disabled' : ''}>⬇️ Télécharger Cloud</button>
                </div>
                
                <hr style="margin: 20px 0; border: 1px solid rgba(255,255,255,0.2);">
                <h4 style="color: #ffc107; margin-bottom: 10px;">💾 Sauvegarde Locale (Backup)</h4>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-secondary" onclick="dashboard.exportAllData()" style="flex: 1;">📤 Export Fichier</button>
                    <button class="btn-secondary" onclick="dashboard.importAllData()" style="flex: 1;">📥 Import Fichier</button>
                </div>
                
                <input type="file" id="importFile" accept=".json" style="display: none;" onchange="dashboard.handleFileImport(event)">
                
                <div style="margin-top: 15px; padding: 10px; background: rgba(0,212,255,0.1); border-radius: 5px; border-left: 3px solid #00d4ff;">
                    <strong>☁️ Cloud :</strong> Synchronisation automatique instantanée<br>
                    <strong>💾 Fichier :</strong> Sauvegarde manuelle de sécurité
                </div>
                
                <button class="btn-secondary" onclick="dashboard.closeModal()" style="width: 100%; margin-top: 15px;">Fermer</button>
            </div>
        `;
        this.showModal();
    }

    getSyncCode() {
        return localStorage.getItem(`syncCode_${this.currentUser}`) || '';
    }

    exportAllData() {
        try {
            const allData = {
                user: this.currentUser,
                accounts: this.accounts,
                currentAccount: this.currentAccount,
                timestamp: Date.now(),
                version: '1.0'
            };
            
            // Ajouter toutes les données de tous les comptes
            Object.keys(this.accounts).forEach(accountKey => {
                allData[`trades_${accountKey}`] = JSON.parse(localStorage.getItem(`trades_${this.currentUser}_${accountKey}`)) || [];
                allData[`settings_${accountKey}`] = JSON.parse(localStorage.getItem(`settings_${this.currentUser}_${accountKey}`)) || {};
            });
            
            const dataStr = JSON.stringify(allData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `trading_data_${this.currentUser}_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            this.showNotification('📤 Données exportées ! Transférez le fichier sur vos autres appareils.');
            this.closeModal();
        } catch (error) {
            alert('Erreur lors de l\'export : ' + error.message);
        }
    }

    importAllData() {
        document.getElementById('importFile').click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.accounts || !data.version) {
                    alert('Fichier invalide ou format non reconnu');
                    return;
                }
                
                if (confirm('Remplacer toutes vos données actuelles par celles du fichier ?')) {
                    // Restaurer les comptes
                    this.accounts = data.accounts;
                    this.currentAccount = data.currentAccount || Object.keys(this.accounts)[0];
                    
                    // Restaurer toutes les données de tous les comptes
                    Object.keys(this.accounts).forEach(accountKey => {
                        if (data[`trades_${accountKey}`]) {
                            localStorage.setItem(`trades_${this.currentUser}_${accountKey}`, JSON.stringify(data[`trades_${accountKey}`]));
                        }
                        if (data[`settings_${accountKey}`]) {
                            localStorage.setItem(`settings_${this.currentUser}_${accountKey}`, JSON.stringify(data[`settings_${accountKey}`]));
                        }
                    });
                    
                    // Recharger les données actuelles
                    this.trades = JSON.parse(localStorage.getItem(`trades_${this.currentUser}_${this.currentAccount}`)) || [];
                    this.settings = JSON.parse(localStorage.getItem(`settings_${this.currentUser}_${this.currentAccount}`)) || { capital: 1000, riskPerTrade: 2 };
                    
                    this.saveToStorage();
                    
                    // Mettre à jour l'interface
                    this.initAccountSelector();
                    this.updateStats();
                    this.renderTradesTable();
                    this.updateCharts();
                    this.updateCalendar();
                    
                    this.showNotification('📥 Données importées avec succès !');
                    this.closeModal();
                }
            } catch (error) {
                alert('Erreur lors de l\'import : Fichier corrompu ou invalide');
            }
        };
        reader.readAsText(file);
        
        // Reset input
        event.target.value = '';
    }

    async uploadToFirebase() {
        if (!this.cloudEnabled) {
            alert('Firebase non disponible');
            return;
        }
        
        const syncCode = document.getElementById('syncCode')?.value.trim();
        if (!syncCode) {
            alert('Veuillez entrer un code de synchronisation');
            return;
        }
        
        try {
            const allData = {
                user: this.currentUser,
                accounts: this.accounts,
                currentAccount: this.currentAccount,
                timestamp: Date.now(),
                lastUpdate: new Date().toISOString()
            };
            
            // Ajouter toutes les données de tous les comptes
            Object.keys(this.accounts).forEach(accountKey => {
                allData[`trades_${accountKey}`] = JSON.parse(localStorage.getItem(`trades_${this.currentUser}_${accountKey}`)) || [];
                allData[`settings_${accountKey}`] = JSON.parse(localStorage.getItem(`settings_${this.currentUser}_${accountKey}`)) || {};
            });
            
            // Sauvegarder dans Firebase
            await this.database.ref(`trading_data/${syncCode}`).set(allData);
            
            localStorage.setItem(`syncCode_${this.currentUser}`, syncCode);
            this.showNotification('☁️ Données sauvegardées sur Firebase !');
            this.closeModal();
        } catch (error) {
            console.error('Erreur Firebase:', error);
            alert('Erreur lors de la sauvegarde : ' + error.message);
        }
    }

    async downloadFromFirebase() {
        if (!this.cloudEnabled) {
            alert('Firebase non disponible');
            return;
        }
        
        const syncCode = document.getElementById('syncCode')?.value.trim();
        if (!syncCode) {
            alert('Veuillez entrer un code de synchronisation');
            return;
        }
        
        try {
            const snapshot = await this.database.ref(`trading_data/${syncCode}`).once('value');
            const data = snapshot.val();
            
            if (!data) {
                alert('Aucune donnée trouvée avec ce code');
                return;
            }
            
            if (confirm(`Remplacer vos données par celles du cloud ?\nDernière mise à jour : ${data.lastUpdate || 'Inconnue'}`)) {
                // Restaurer les comptes
                this.accounts = data.accounts || {};
                this.currentAccount = data.currentAccount || Object.keys(this.accounts)[0];
                
                // Restaurer toutes les données de tous les comptes
                Object.keys(this.accounts).forEach(accountKey => {
                    if (data[`trades_${accountKey}`]) {
                        localStorage.setItem(`trades_${this.currentUser}_${accountKey}`, JSON.stringify(data[`trades_${accountKey}`]));
                    }
                    if (data[`settings_${accountKey}`]) {
                        localStorage.setItem(`settings_${this.currentUser}_${accountKey}`, JSON.stringify(data[`settings_${accountKey}`]));
                    }
                });
                
                // Recharger les données actuelles
                this.trades = JSON.parse(localStorage.getItem(`trades_${this.currentUser}_${this.currentAccount}`)) || [];
                this.settings = JSON.parse(localStorage.getItem(`settings_${this.currentUser}_${this.currentAccount}`)) || { capital: 1000, riskPerTrade: 2 };
                
                localStorage.setItem(`syncCode_${this.currentUser}`, syncCode);
                this.saveToStorage();
                
                // Mettre à jour l'interface
                this.initAccountSelector();
                this.updateStats();
                this.renderTradesTable();
                this.updateCharts();
                this.updateCalendar();
                
                this.showNotification('☁️ Données restaurées de Firebase !');
                this.closeModal();
            }
        } catch (error) {
            console.error('Erreur Firebase:', error);
            alert('Erreur lors du téléchargement : ' + error.message);
        }
    }

    async autoLoadFromCloud() {
        const syncCode = this.getSyncCode();
        if (!syncCode || !this.cloudEnabled) return;
        
        try {
            const snapshot = await this.database.ref(`trading_data/${syncCode}`).once('value');
            const data = snapshot.val();
            
            if (data && data.timestamp) {
                const localTimestamp = localStorage.getItem(`lastSync_${this.currentUser}`) || 0;
                
                if (data.timestamp > localTimestamp) {
                    // Données cloud plus récentes
                    this.accounts = data.accounts || this.accounts;
                    this.currentAccount = data.currentAccount || this.currentAccount;
                    
                    Object.keys(this.accounts).forEach(accountKey => {
                        if (data[`trades_${accountKey}`]) {
                            localStorage.setItem(`trades_${this.currentUser}_${accountKey}`, JSON.stringify(data[`trades_${accountKey}`]));
                        }
                        if (data[`settings_${accountKey}`]) {
                            localStorage.setItem(`settings_${this.currentUser}_${accountKey}`, JSON.stringify(data[`settings_${accountKey}`]));
                        }
                    });
                    
                    this.trades = JSON.parse(localStorage.getItem(`trades_${this.currentUser}_${this.currentAccount}`)) || [];
                    this.settings = JSON.parse(localStorage.getItem(`settings_${this.currentUser}_${this.currentAccount}`)) || { capital: 1000, riskPerTrade: 2 };
                    
                    localStorage.setItem(`lastSync_${this.currentUser}`, data.timestamp);
                    this.showNotification('🔄 Données synchronisées automatiquement');
                }
            }
        } catch (error) {
            console.log('Sync auto échouée:', error);
        }
    }

    startAutoSync() {
        // Synchronisation automatique toutes les 30 secondes
        setInterval(() => {
            this.autoSaveToCloud();
        }, 30000);
        
        // Synchronisation avant fermeture de page
        window.addEventListener('beforeunload', () => {
            this.autoSaveToCloud();
        });
    }

    async autoSaveToCloud() {
        const syncCode = this.getSyncCode();
        if (!syncCode || !this.cloudEnabled) return;
        
        try {
            const allData = {
                user: this.currentUser,
                accounts: this.accounts,
                currentAccount: this.currentAccount,
                timestamp: Date.now(),
                lastUpdate: new Date().toISOString()
            };
            
            Object.keys(this.accounts).forEach(accountKey => {
                allData[`trades_${accountKey}`] = JSON.parse(localStorage.getItem(`trades_${this.currentUser}_${accountKey}`)) || [];
                allData[`settings_${accountKey}`] = JSON.parse(localStorage.getItem(`settings_${this.currentUser}_${accountKey}`)) || {};
            });
            
            await this.database.ref(`trading_data/${syncCode}`).set(allData);
            localStorage.setItem(`lastSync_${this.currentUser}`, allData.timestamp);
            this.updateSyncStatus('✅ Syncé', '#4ecdc4');
        } catch (error) {
            console.log('Auto-save échoué:', error);
            this.updateSyncStatus('❌ Erreur', '#ff6b6b');
        }
    }

    updateSyncStatus(text, color) {
        const statusElement = document.getElementById('syncStatus');
        if (statusElement) {
            statusElement.textContent = text;
            statusElement.style.color = color;
            statusElement.style.background = `${color}20`;
            
            // Retour au statut normal après 3 secondes
            setTimeout(() => {
                statusElement.textContent = '🔄 Auto';
                statusElement.style.color = '#4ecdc4';
                statusElement.style.background = 'rgba(78,205,196,0.2)';
            }, 3000);
        }
    }

    setupEventListeners() {
        const newTradeBtn = document.getElementById('newTradeBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const closeTradeBtn = document.getElementById('closeTradeBtn');
        const resetBtn = document.getElementById('resetBtn');
        const pricesBtn = document.getElementById('pricesBtn');
        const mt5SyncBtn = document.getElementById('mt5SyncBtn');
        const exportBtn = document.getElementById('exportBtn');
        const closeModal = document.querySelector('.close');
        
        if (newTradeBtn) newTradeBtn.addEventListener('click', () => this.startNewTrade());
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.showSettings());
        if (closeTradeBtn) closeTradeBtn.addEventListener('click', () => this.showCloseTradeModal());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetAllData());
        if (pricesBtn) pricesBtn.addEventListener('click', () => this.showLivePrices());
        if (mt5SyncBtn) mt5SyncBtn.addEventListener('click', () => this.showMT5Sync());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportToExcel());
        if (closeModal) closeModal.addEventListener('click', () => this.closeModal());
        
        const closeFullscreen = document.querySelector('.close-fullscreen');
        if (closeFullscreen) closeFullscreen.addEventListener('click', () => this.closeFullscreen());
        
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('tradeModal')) {
                this.closeModal();
            }
            if (e.target === document.getElementById('fullscreenModal')) {
                this.closeFullscreen();
            }
        });
        
        setInterval(() => this.updateLivePrices(), 30000);
        this.updateLivePrices();
    }

    startNewTrade() {
        this.currentStep = 0;
        this.currentTrade = {
            date: new Date().toISOString().split('T')[0],
            confluences: {},
            comments: {}
        };
        this.showModal();
        this.renderChecklistStep();
    }

    showModal() {
        const modal = document.getElementById('tradeModal');
        if (modal) modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('tradeModal');
        if (modal) modal.style.display = 'none';
    }

    renderChecklistStep() {
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;
        
        if (this.currentStep < this.checklistSteps.length) {
            const step = this.checklistSteps[this.currentStep];
            const optionsHtml = step.options.map((option, index) => 
                `<button class="btn-yes btn-small" onclick="dashboard.answerStep('${option}')">${option}</button>`
            ).join('');
            
            modalContent.innerHTML = `
                <h2>Étape ${this.currentStep + 1}/${this.checklistSteps.length}</h2>
                <div class="step">
                    <h3>${step.title}</h3>
                    <div class="education-content">
                        <h4>💡 Explication :</h4>
                        <p>${step.education}</p>
                    </div>
                    <p><strong>${step.question}</strong></p>
                    <div class="step-buttons">
                        ${optionsHtml}
                    </div>
                    <textarea class="comment-box" placeholder="Commentaire (optionnel)..." id="stepComment"></textarea>
                    <div style="text-align: center; margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
                        <button class="btn-skip" onclick="dashboard.skipToTrade()">⏩ Passer les étapes</button>
                    </div>
                </div>
            `;
        } else {
            this.renderTradeForm();
        }
    }

    answerStep(answer) {
        const step = this.checklistSteps[this.currentStep];
        const commentElement = document.getElementById('stepComment');
        const comment = commentElement ? commentElement.value : '';
        
        this.currentTrade.confluences[step.key] = answer;
        if (comment) {
            this.currentTrade.comments[step.key] = comment;
        }
        
        this.currentStep++;
        this.renderChecklistStep();
    }

    skipToTrade() {
        for (let i = this.currentStep; i < this.checklistSteps.length; i++) {
            const step = this.checklistSteps[i];
            this.currentTrade.confluences[step.key] = step.options[0];
        }
        this.renderTradeForm();
    }

    renderTradeForm() {
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;
        
        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const totalPnL = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const currentCapital = this.settings.capital + totalPnL;
        const riskAmount = (currentCapital * this.settings.riskPerTrade / 100).toFixed(2);
        
        modalContent.innerHTML = `
            <h2>Paramètres du Trade</h2>
            <div class="education-content">
                <h4>💰 Gestion du Risque :</h4>
                <p>Capital actuel: $${currentCapital.toFixed(2)} | Risque par trade: ${this.settings.riskPerTrade}% | Montant risqué: $${riskAmount}</p>
            </div>
            <div class="trade-form">
                <div class="form-group">
                    <label>Instrument:</label>
                    <select id="currency">
                        <option value="EUR/USD">EUR/USD</option>
                        <option value="GBP/USD">GBP/USD</option>
                        <option value="USD/JPY">USD/JPY</option>
                        <option value="AUD/USD">AUD/USD</option>
                        <option value="USD/CAD">USD/CAD</option>
                        <option value="EUR/GBP">EUR/GBP</option>
                        <option value="EUR/JPY">EUR/JPY</option>
                        <option value="GBP/JPY">GBP/JPY</option>
                        <option value="XAU/USD">XAU/USD (Or)</option>
                        <option value="NAS100">NASDAQ 100</option>
                        <option value="GER40">DAX 40</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Point d'entrée:</label>
                    <input type="number" id="entryPoint" step="0.00001" placeholder="1.12345" oninput="dashboard.calculateLotSize()">
                </div>
                <div class="form-group">
                    <label>Stop Loss:</label>
                    <input type="number" id="stopLoss" step="0.00001" placeholder="1.12000" oninput="dashboard.calculateLotSize()">
                </div>
                <div class="form-group">
                    <label>Take Profit:</label>
                    <input type="number" id="takeProfit" step="0.00001" placeholder="1.13000" oninput="dashboard.calculateLotSize()">
                </div>
                <div class="form-group">
                    <label>Lot (modifiable):</label>
                    <input type="number" id="lotSize" step="0.01" placeholder="0.10" oninput="dashboard.calculateFromLot()">
                </div>
                <div class="form-group">
                    <label>Ratio R:R:</label>
                    <input type="text" id="riskReward" readonly>
                </div>
                <div class="form-group">
                    <label>Montant risqué ($):</label>
                    <input type="text" id="riskAmount" readonly>
                </div>
                <div class="form-group">
                    <label>Gain potentiel ($):</label>
                    <input type="text" id="potentialGain" readonly>
                </div>
                <button class="btn-submit" onclick="dashboard.saveTrade()">Enregistrer Trade</button>
            </div>
        `;
    }

    calculateLotSize() {
        const entryPoint = parseFloat(document.getElementById('entryPoint')?.value) || 0;
        const stopLoss = parseFloat(document.getElementById('stopLoss')?.value) || 0;
        const currency = document.getElementById('currency')?.value || 'EUR/USD';
        
        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const totalPnL = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const currentCapital = this.settings.capital + totalPnL;
        const riskAmount = currentCapital * this.settings.riskPerTrade / 100;
        
        if (entryPoint > 0 && stopLoss > 0 && entryPoint !== stopLoss) {
            let lotSize = 0;
            const slDistance = Math.abs(entryPoint - stopLoss);
            
            if (currency === 'XAU/USD') {
                lotSize = riskAmount / (slDistance * 100);
            } else if (currency === 'NAS100' || currency === 'GER40') {
                lotSize = riskAmount / slDistance;
            } else {
                const pipDistance = slDistance * Math.pow(10, this.getDecimalPlaces(currency));
                lotSize = riskAmount / (pipDistance * 10);
            }
            
            const lotSizeElement = document.getElementById('lotSize');
            if (lotSizeElement) {
                lotSizeElement.value = Math.max(0.01, lotSize).toFixed(2);
            }
        }
        
        this.calculateFromLot();
    }

    calculateFromLot() {
        const entryPoint = parseFloat(document.getElementById('entryPoint')?.value) || 0;
        const stopLoss = parseFloat(document.getElementById('stopLoss')?.value) || 0;
        const takeProfit = parseFloat(document.getElementById('takeProfit')?.value) || 0;
        const lotSize = parseFloat(document.getElementById('lotSize')?.value) || 0;
        const currency = document.getElementById('currency')?.value || 'EUR/USD';
        
        if (entryPoint > 0 && stopLoss > 0 && lotSize > 0 && entryPoint !== stopLoss) {
            const slDistance = Math.abs(entryPoint - stopLoss);
            let riskAmount = 0;
            
            if (currency === 'XAU/USD') {
                riskAmount = slDistance * lotSize * 100;
            } else if (currency === 'NAS100' || currency === 'GER40') {
                riskAmount = slDistance * lotSize;
            } else {
                const pipDistance = slDistance * Math.pow(10, this.getDecimalPlaces(currency));
                riskAmount = pipDistance * lotSize * 10;
            }
            
            const riskAmountElement = document.getElementById('riskAmount');
            if (riskAmountElement) {
                riskAmountElement.value = '$' + riskAmount.toFixed(2);
            }
            
            if (takeProfit > 0 && takeProfit !== entryPoint) {
                const tpDistance = Math.abs(takeProfit - entryPoint);
                let potentialGain = 0;
                
                if (currency === 'XAU/USD') {
                    potentialGain = tpDistance * lotSize * 100;
                } else if (currency === 'NAS100' || currency === 'GER40') {
                    potentialGain = tpDistance * lotSize;
                } else {
                    const pipDistanceTP = tpDistance * Math.pow(10, this.getDecimalPlaces(currency));
                    potentialGain = pipDistanceTP * lotSize * 10;
                }
                
                const potentialGainElement = document.getElementById('potentialGain');
                const riskRewardElement = document.getElementById('riskReward');
                
                if (potentialGainElement) {
                    potentialGainElement.value = '$' + potentialGain.toFixed(2);
                }
                
                if (riskRewardElement) {
                    const riskReward = (potentialGain / riskAmount).toFixed(2);
                    riskRewardElement.value = `1:${riskReward}`;
                }
            }
        }
    }

    getDecimalPlaces(currency) {
        if (currency.includes('JPY')) return 2;
        if (currency === 'XAU/USD') return 2;
        if (currency === 'NAS100' || currency === 'GER40') return 2;
        return 4;
    }

    saveTrade() {
        const currency = document.getElementById('currency')?.value;
        const entryPoint = parseFloat(document.getElementById('entryPoint')?.value);
        const stopLoss = parseFloat(document.getElementById('stopLoss')?.value);
        const takeProfit = parseFloat(document.getElementById('takeProfit')?.value);
        const lotSize = parseFloat(document.getElementById('lotSize')?.value);
        const riskPercent = this.settings.riskPerTrade;

        this.currentTrade = {
            ...this.currentTrade,
            currency,
            entryPoint,
            stopLoss,
            takeProfit,
            lotSize,
            riskPercent,
            status: 'open'
        };

        this.trades.push(this.currentTrade);
        this.saveToStorage();
        this.closeModal();
        this.updateStats();
        this.renderTradesTable();
        this.updateCharts();
        this.updateCalendar();
    }

    showSettings() {
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;
        
        const isAdmin = this.currentUser === 'admin';
        
        modalContent.innerHTML = `
            <h2>Paramètres</h2>
            <div class="trade-form">
                <div class="form-group">
                    <label>Capital initial ($):</label>
                    <input type="number" id="capitalInput" value="${this.settings.capital}" step="100">
                </div>
                <div class="form-group">
                    <label>Risque par trade (%):</label>
                    <input type="number" id="riskInput" value="${this.settings.riskPerTrade}" step="0.5" min="0.5" max="10">
                </div>
                <button class="btn-submit" onclick="dashboard.saveSettings()">Sauvegarder</button>
                
                ${isAdmin ? `
                <hr style="margin: 30px 0; border: 1px solid rgba(255,255,255,0.2);">
                <h3 style="color: #00d4ff; margin-bottom: 20px;">🔧 Administration</h3>
                <button class="btn-warning" onclick="dashboard.showUserManagement()" style="width: 100%; margin-bottom: 10px;">👥 Gérer les Utilisateurs</button>
                ` : ''}
            </div>
        `;
        this.showModal();
    }

    saveSettings() {
        const capitalInput = document.getElementById('capitalInput');
        const riskInput = document.getElementById('riskInput');
        
        if (capitalInput && riskInput) {
            this.settings.capital = parseFloat(capitalInput.value);
            this.settings.riskPerTrade = parseFloat(riskInput.value);
            this.accounts[this.currentAccount].capital = this.settings.capital;
            this.saveToStorage();
        }
        
        this.closeModal();
        this.updateStats();
    }

    resetAllData() {
        const accountName = this.accounts[this.currentAccount]?.name || this.currentAccount;
        if (confirm(`Voulez-vous vraiment supprimer toutes les données du compte "${accountName}" ? Cette action est irréversible.`)) {
            localStorage.removeItem(`trades_${this.currentUser}_${this.currentAccount}`);
            localStorage.removeItem(`settings_${this.currentUser}_${this.currentAccount}`);
            this.trades = [];
            this.settings = { capital: this.accounts[this.currentAccount]?.capital || 1000, riskPerTrade: 2 };
            this.updateStats();
            this.renderTradesTable();
            this.updateCharts();
            this.updateCalendar();
            alert(`Toutes les données du compte "${accountName}" ont été supprimées.`);
        }
    }

    showLivePrices() {
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;
        
        const pricesHtml = Object.entries(this.livePrices).map(([symbol, price]) => 
            `<div class="price-item">
                <div class="symbol">${symbol}</div>
                <div class="price">${price}</div>
            </div>`
        ).join('');
        
        modalContent.innerHTML = `
            <h2>Prix en Temps Réel</h2>
            <div class="education-content">
                <h4>📊 Info API :</h4>
                <p>Pour des prix réels, vous pouvez connecter :</p>
                <ul>
                    <li><strong>MetaTrader 5 :</strong> Via l'API MT5 Python</li>
                    <li><strong>APIs gratuites :</strong> Alpha Vantage, Fixer.io (forex)</li>
                    <li><strong>APIs payantes :</strong> Bloomberg, Reuters, IEX Cloud</li>
                </ul>
                <p><strong>Note :</strong> Les prix ci-dessous sont simulés pour la démo.</p>
            </div>
            <div class="live-prices">
                ${pricesHtml}
            </div>
        `;
        this.showModal();
    }

    showMT5Sync() {
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;
        
        modalContent.innerHTML = `
            <h2>📊 Synchronisation MetaTrader 5</h2>
            <div class="education-content">
                <h4>🔒 Sécurité :</h4>
                <p>Vos identifiants sont stockés localement et chiffrés. Ils ne sont jamais envoyés à des serveurs externes.</p>
                <p><strong>Note :</strong> Cette fonctionnalité nécessite MetaTrader 5 ouvert avec l'API activée.</p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn-secondary" onclick="dashboard.closeModal()">Fermer</button>
            </div>
        `;
        this.showModal();
    }

    exportToExcel() {
        const closedTrades = this.trades.filter(t => t.status === 'closed');
        
        const headers = ['Date', 'Devise', 'Entrée', 'Stop Loss', 'Take Profit', 'Lot', 'Risque %', 'Résultat', 'P&L ($)'];
        const csvData = [headers];
        
        closedTrades.forEach(trade => {
            csvData.push([
                trade.date,
                trade.currency,
                trade.entryPoint,
                trade.stopLoss,
                trade.takeProfit,
                trade.lotSize,
                trade.riskPercent + '%',
                trade.result,
                trade.pnl
            ]);
        });
        
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `trading_data_${this.currentUser}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('Données exportées en CSV (compatible Excel)');
    }

    updateStats() {
        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const winTrades = closedTrades.filter(t => parseFloat(t.pnl || 0) > 0);
        const winrate = closedTrades.length > 0 ? (winTrades.length / closedTrades.length * 100).toFixed(1) : 0;
        const totalGain = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const currentCapital = this.settings.capital + totalGain;

        const capitalElement = document.getElementById('capital');
        const winrateElement = document.getElementById('winrate');
        const totalGainElement = document.getElementById('totalGain');
        const totalTradesElement = document.getElementById('totalTrades');

        if (capitalElement) capitalElement.textContent = '$' + currentCapital.toFixed(2);
        if (winrateElement) winrateElement.textContent = winrate + '%';
        if (totalGainElement) {
            totalGainElement.textContent = (totalGain >= 0 ? '+$' : '-$') + Math.abs(totalGain).toFixed(2);
            totalGainElement.className = totalGain >= 0 ? 'result-win' : 'result-loss';
        }
        if (totalTradesElement) totalTradesElement.textContent = this.trades.length;
    }

    renderTradesTable() {
        const tbody = document.querySelector('#tradesTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        this.trades.forEach((trade, index) => {
            const riskClass = trade.riskPercent <= 1 ? 'risk-low' : trade.riskPercent <= 3 ? 'risk-medium' : 'risk-high';
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${trade.date}</td>
                <td>${trade.currency}</td>
                <td>${trade.entryPoint}</td>
                <td>${trade.stopLoss}</td>
                <td>${trade.takeProfit}</td>
                <td>${trade.lotSize}</td>
                <td><span class="risk-indicator ${riskClass}">${trade.riskPercent}%</span></td>
                <td class="${trade.result === 'TP' ? 'result-win' : trade.result === 'SL' ? 'result-loss' : ''}">${trade.result || 'En cours'}</td>
                <td class="${parseFloat(trade.pnl || 0) >= 0 ? 'result-win' : 'result-loss'}">${trade.pnl ? (parseFloat(trade.pnl) >= 0 ? '+$' : '-$') + Math.abs(parseFloat(trade.pnl)).toFixed(2) : '-'}</td>
                <td>
                    ${trade.status === 'open' ? `<button class="btn-small btn-warning" onclick="dashboard.quickCloseTrade(${index})">Clôturer</button>` : '-'}
                </td>
            `;
        });
    }

    quickCloseTrade(index) {
        const trade = this.trades[index];
        const result = confirm(`Clôturer le trade ${trade.currency} ?\nOK = Take Profit\nAnnuler = Stop Loss`);
        
        trade.result = result ? 'TP' : 'SL';
        trade.closePrice = result ? trade.takeProfit : trade.stopLoss;
        trade.status = 'closed';
        trade.pnl = this.calculatePnL(trade);
        
        this.saveToStorage();
        this.updateStats();
        this.renderTradesTable();
        this.updateCharts();
        this.updateCalendar();
    }

    calculatePnL(trade) {
        let pnl = 0;
        const lotSize = parseFloat(trade.lotSize);
        
        if (trade.result === 'BE') {
            return '0.00';
        }
        
        let priceMove;
        if (trade.result === 'TP') {
            priceMove = trade.takeProfit - trade.entryPoint;
        } else if (trade.result === 'SL') {
            priceMove = trade.stopLoss - trade.entryPoint;
        } else {
            priceMove = trade.closePrice - trade.entryPoint;
        }
        
        if (trade.currency === 'XAU/USD') {
            pnl = priceMove * lotSize * 100;
        } else if (trade.currency === 'NAS100') {
            pnl = priceMove * lotSize;
        } else if (trade.currency === 'GER40') {
            pnl = priceMove * lotSize;
        } else {
            const pips = priceMove * Math.pow(10, this.getDecimalPlaces(trade.currency));
            const pipValue = this.getPipValue(trade.currency);
            pnl = pips * pipValue * lotSize;
        }
        
        return pnl.toFixed(2);
    }

    getPipValue(currency) {
        const pipValues = {
            'EUR/USD': 10, 'GBP/USD': 10, 'AUD/USD': 10, 'USD/CAD': 10,
            'USD/JPY': 10, 'EUR/JPY': 10, 'GBP/JPY': 10, 'EUR/GBP': 10,
            'XAU/USD': 100, 'NAS100': 1, 'GER40': 1
        };
        return pipValues[currency] || 10;
    }

    async updateLivePrices() {
        const basePrices = {
            'EUR/USD': 1.0850,
            'GBP/USD': 1.2650,
            'USD/JPY': 149.50,
            'XAU/USD': 2020.50,
            'NAS100': 15800.25,
            'GER40': 16200.75
        };
        
        Object.keys(basePrices).forEach(symbol => {
            const basePrice = basePrices[symbol];
            const variation = (Math.random() - 0.5) * 0.002;
            this.livePrices[symbol] = (basePrice * (1 + variation)).toFixed(
                symbol.includes('JPY') ? 2 : symbol.includes('USD') && !symbol.includes('/') ? 2 : 4
            );
        });
    }

    initCharts() {
        this.initGainsGauge();
        this.initConfluencesChart();
    }

    initGainsGauge() {
        this.updateGainsGauge();
    }

    initConfluencesChart() {
        const ctx = document.getElementById('confluencesChart')?.getContext('2d');
        if (!ctx) return;
        
        this.confluencesChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Winrate %',
                    data: [],
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.2)',
                    borderWidth: 3,
                    pointBackgroundColor: '#00d4ff',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)',
                            backdropColor: 'transparent'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        },
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        },
                        pointLabels: {
                            color: '#ffffff',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });
    }

    updateCharts() {
        this.updateGainsGauge();
        this.updateConfluencesChart();
    }

    updateGainsGauge() {
        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const totalGain = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const initialCapital = this.settings.capital;
        const gainPercent = ((totalGain / initialCapital) * 100).toFixed(1);
        
        const gainsValueElement = document.getElementById('gainsValue');
        const gainsPercentElement = document.getElementById('gainsPercent');
        const gaugeElement = document.getElementById('gainsGauge');
        
        if (gainsValueElement) {
            gainsValueElement.textContent = (totalGain >= 0 ? '+$' : '-$') + Math.abs(totalGain).toFixed(2);
        }
        if (gainsPercentElement) {
            gainsPercentElement.textContent = (totalGain >= 0 ? '+' : '') + gainPercent + '%';
        }
        
        if (gaugeElement) {
            let gaugeColor;
            if (gainPercent >= 20) {
                gaugeColor = 'conic-gradient(from 0deg, #4ecdc4 0deg 300deg, rgba(78, 205, 196, 0.3) 300deg 360deg)';
            } else if (gainPercent >= 10) {
                gaugeColor = 'conic-gradient(from 0deg, #00d4ff 0deg 240deg, rgba(0, 212, 255, 0.3) 240deg 360deg)';
            } else if (gainPercent >= 0) {
                gaugeColor = 'conic-gradient(from 0deg, #ffc107 0deg 180deg, rgba(255, 193, 7, 0.3) 180deg 360deg)';
            } else {
                gaugeColor = 'conic-gradient(from 0deg, #ff6b6b 0deg 120deg, rgba(255, 107, 107, 0.3) 120deg 360deg)';
            }
            gaugeElement.style.background = gaugeColor;
        }
    }

    updateConfluencesChart() {
        if (!this.confluencesChart) return;
        
        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const confluenceStats = {};

        this.checklistSteps.forEach(step => {
            const shortTitle = step.title.replace('✅ ', '').split('.')[1]?.trim() || step.title.replace('✅ ', '');
            confluenceStats[shortTitle] = { wins: 0, total: 0 };
        });

        closedTrades.forEach(trade => {
            this.checklistSteps.forEach(step => {
                const shortTitle = step.title.replace('✅ ', '').split('.')[1]?.trim() || step.title.replace('✅ ', '');
                if (trade.confluences && trade.confluences[step.key]) {
                    confluenceStats[shortTitle].total++;
                    if (trade.result === 'TP') {
                        confluenceStats[shortTitle].wins++;
                    }
                }
            });
        });

        const labels = [];
        const data = [];
        const analysisData = [];

        Object.entries(confluenceStats).forEach(([key, stats]) => {
            if (stats.total > 0) {
                const winrate = (stats.wins / stats.total * 100);
                labels.push(key);
                data.push(winrate.toFixed(1));
                analysisData.push({ name: key, winrate: winrate, total: stats.total, wins: stats.wins });
            }
        });

        this.confluencesChart.data.labels = labels;
        this.confluencesChart.data.datasets[0].data = data;
        this.confluencesChart.update();
        
        this.generateConfluenceAnalysis(analysisData);
    }

    generateConfluenceAnalysis(data) {
        const analysisContainer = document.getElementById('confluenceAnalysis');
        if (!analysisContainer) return;
        
        if (data.length === 0) {
            analysisContainer.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center;">Créez des trades pour voir l\'analyse des confluences.</p>';
            return;
        }
        
        data.sort((a, b) => b.winrate - a.winrate);
        
        let analysisHTML = '<h4>📊 Analyse des Performances</h4>';
        
        data.forEach(confluence => {
            let scoreClass, scoreText;
            if (confluence.winrate >= 80) {
                scoreClass = 'score-excellent';
                scoreText = 'Excellent';
            } else if (confluence.winrate >= 60) {
                scoreClass = 'score-good';
                scoreText = 'Bon';
            } else if (confluence.winrate >= 40) {
                scoreClass = 'score-average';
                scoreText = 'Moyen';
            } else {
                scoreClass = 'score-poor';
                scoreText = 'Faible';
            }
            
            analysisHTML += `
                <div class="analysis-item" style="display: flex; justify-content: space-between; padding: 8px; margin: 5px 0; background: rgba(40,40,40,0.6); border-radius: 5px;">
                    <div class="confluence-name">${confluence.name} (${confluence.wins}/${confluence.total})</div>
                    <div class="confluence-score ${scoreClass}" style="color: ${confluence.winrate >= 60 ? '#4ecdc4' : confluence.winrate >= 40 ? '#ffc107' : '#ff6b6b'}">${confluence.winrate.toFixed(1)}% - ${scoreText}</div>
                </div>
            `;
        });
        
        if (data.length >= 1) {
            const topStrategy = data[0];
            analysisHTML += `<div class="recommendation" style="margin-top: 15px; padding: 10px; background: rgba(0,212,255,0.1); border-radius: 5px; border-left: 3px solid #00d4ff;">🎯 <strong>Meilleure stratégie :</strong> ${topStrategy.name} (${topStrategy.winrate.toFixed(1)}% de réussite)</div>`;
        }
        
        analysisContainer.innerHTML = analysisHTML;
    }

    initCalendar() {
        this.calendarDate = new Date();
        this.setupCalendarListeners();
        this.renderCalendar();
    }

    setupCalendarListeners() {
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        
        if (prevMonth) {
            prevMonth.addEventListener('click', () => {
                this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
                this.renderCalendar();
            });
        }
        
        if (nextMonth) {
            nextMonth.addEventListener('click', () => {
                this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
                this.renderCalendar();
            });
        }
    }

    renderCalendar() {
        const monthLabel = document.getElementById('monthLabel');
        const grid = document.getElementById('calendarGrid');
        
        if (!monthLabel || !grid) return;
        
        const year = this.calendarDate.getFullYear();
        const month = this.calendarDate.getMonth();
        
        monthLabel.textContent = this.calendarDate.toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
        });
        
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        grid.innerHTML = '';
        
        for (let i = 0; i < 42; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);
            
            const cell = this.createCalendarCell(cellDate, month);
            grid.appendChild(cell);
        }
        
        this.updateCalendarSummary();
    }

    createCalendarCell(date, currentMonth) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        
        if (date.getMonth() !== currentMonth) {
            cell.classList.add('other-month');
        }
        
        const dateEl = document.createElement('div');
        dateEl.className = 'cell-date';
        dateEl.textContent = date.getDate();
        cell.appendChild(dateEl);
        
        const dateStr = date.toISOString().split('T')[0];
        const dayTrades = this.trades.filter(trade => 
            trade.status === 'closed' && trade.date === dateStr
        );
        
        if (dayTrades.length > 0) {
            const totalPnL = dayTrades.reduce((sum, trade) => sum + parseFloat(trade.pnl || 0), 0);
            
            const pnlEl = document.createElement('div');
            pnlEl.className = 'cell-pnl';
            pnlEl.textContent = (totalPnL >= 0 ? '+$' : '-$') + Math.abs(totalPnL).toFixed(0);
            pnlEl.style.color = totalPnL >= 0 ? '#4ecdc4' : '#ff6b6b';
            cell.appendChild(pnlEl);
            
            const countEl = document.createElement('div');
            countEl.className = 'cell-count';
            countEl.textContent = `${dayTrades.length} trade${dayTrades.length > 1 ? 's' : ''}`;
            cell.appendChild(countEl);
            
            if (totalPnL > 0) {
                cell.classList.add('profit');
            } else if (totalPnL < 0) {
                cell.classList.add('loss');
            }
        }
        
        cell.addEventListener('click', () => {
            this.showDayDetails(dateStr, dayTrades);
        });
        
        return cell;
    }

    showDayDetails(dateStr, trades) {
        if (trades.length === 0) {
            alert(`Aucun trade le ${dateStr}`);
            return;
        }
        
        const totalPnL = trades.reduce((sum, trade) => sum + parseFloat(trade.pnl || 0), 0);
        const winTrades = trades.filter(t => parseFloat(t.pnl || 0) > 0).length;
        const winrate = trades.length > 0 ? (winTrades / trades.length * 100).toFixed(1) : 0;
        
        let detailsHTML = `
            <h2>📅 Détails du ${new Date(dateStr).toLocaleDateString('fr-FR')}</h2>
            <div class="education-content">
                <h4>📊 Résumé de la journée :</h4>
                <p><strong>Nombre de trades :</strong> ${trades.length}</p>
                <p><strong>Winrate :</strong> ${winrate}%</p>
                <p><strong>Résultat total :</strong> <span style="color: ${totalPnL >= 0 ? '#4ecdc4' : '#ff6b6b'}">${totalPnL >= 0 ? '+$' : '-$'}${Math.abs(totalPnL).toFixed(2)}</span></p>
            </div>
            
            <div class="share-buttons" style="text-align: center; margin: 20px 0; padding: 15px; background: rgba(40,40,40,0.8); border-radius: 10px;">
                <h4 style="color: #00d4ff; margin-bottom: 15px;">🚀 Partager mes résultats</h4>
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button class="btn-small" style="background: #1da1f2; color: white;" onclick="dashboard.shareToX('${dateStr}', ${totalPnL}, ${winrate}, ${trades.length})">🐦 X (Twitter)</button>
                    <button class="btn-small" style="background: #1877f2; color: white;" onclick="dashboard.shareToFacebook('${dateStr}', ${totalPnL}, ${winrate}, ${trades.length})">🔵 Facebook</button>
                    <button class="btn-small" style="background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white;" onclick="dashboard.shareToInstagram('${dateStr}', ${totalPnL}, ${winrate}, ${trades.length})">📷 Instagram</button>
                    <button class="btn-small" style="background: #000; color: white;" onclick="dashboard.shareToTikTok('${dateStr}', ${totalPnL}, ${winrate}, ${trades.length})">🎥 TikTok</button>
                </div>
            </div>
            
            <div class="trade-form">
        `;
        
        trades.forEach((trade) => {
            const pnl = parseFloat(trade.pnl || 0);
            detailsHTML += `
                <div style="background: rgba(30,30,30,0.6); padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${trade.currency}</strong>
                            <div style="font-size: 0.9em; opacity: 0.8;">Entrée: ${trade.entryPoint} | SL: ${trade.stopLoss} | TP: ${trade.takeProfit}</div>
                            <div style="font-size: 0.8em; opacity: 0.6;">Lot: ${trade.lotSize} | Résultat: ${trade.result}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.2em; font-weight: bold; color: ${pnl >= 0 ? '#4ecdc4' : '#ff6b6b'};">
                                ${pnl >= 0 ? '+$' : '-$'}${Math.abs(pnl).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        detailsHTML += `
                <button class="btn-submit" onclick="dashboard.closeModal()">Fermer</button>
            </div>
        `;
        
        const modalContent = document.getElementById('modalContent');
        if (modalContent) {
            modalContent.innerHTML = detailsHTML;
            this.showModal();
        }
    }
    
    shareToX(date, pnl, winrate, trades) {
        const text = `📊 Résultats Trading du ${new Date(date).toLocaleDateString('fr-FR')}\n\n💰 P&L: ${pnl >= 0 ? '+$' : '-$'}${Math.abs(pnl).toFixed(2)}\n🎯 Winrate: ${winrate}%\n📈 Trades: ${trades}\n\n#Trading #Forex #TradingResults #ICT`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }
    
    shareToFacebook(date, pnl, winrate, trades) {
        const text = `Résultats Trading du ${new Date(date).toLocaleDateString('fr-FR')}\n\nP&L: ${pnl >= 0 ? '+$' : '-$'}${Math.abs(pnl).toFixed(2)}\nWinrate: ${winrate}%\nTrades: ${trades}`;
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }
    
    shareToInstagram(date, pnl, winrate, trades) {
        const text = `📊 Résultats Trading du ${new Date(date).toLocaleDateString('fr-FR')}\n\n💰 P&L: ${pnl >= 0 ? '+$' : '-$'}${Math.abs(pnl).toFixed(2)}\n🎯 Winrate: ${winrate}%\n📈 Trades: ${trades}\n\n#Trading #Forex #TradingResults`;
        
        navigator.clipboard.writeText(text).then(() => {
            alert('Texte copié ! Collez-le dans votre story Instagram.');
        }).catch(() => {
            prompt('Copiez ce texte pour Instagram:', text);
        });
    }
    
    shareToTikTok(date, pnl, winrate, trades) {
        const text = `📊 Résultats Trading du ${new Date(date).toLocaleDateString('fr-FR')}\n\n💰 P&L: ${pnl >= 0 ? '+$' : '-$'}${Math.abs(pnl).toFixed(2)}\n🎯 Winrate: ${winrate}%\n📈 Trades: ${trades}\n\n#Trading #Forex #TradingResults #TikTokTrader`;
        
        navigator.clipboard.writeText(text).then(() => {
            alert('Texte copié ! Créez votre vidéo TikTok avec ces résultats.');
        }).catch(() => {
            prompt('Copiez ce texte pour TikTok:', text);
        });
    }

    updateCalendar() {
        this.renderCalendar();
    }

    updateCalendarSummary() {
        const summaryElement = document.getElementById('calendarSummary');
        if (!summaryElement) return;
        
        const year = this.calendarDate.getFullYear();
        const month = this.calendarDate.getMonth();
        
        const monthTrades = this.trades.filter(trade => {
            if (trade.status !== 'closed') return false;
            const tradeDate = new Date(trade.date);
            return tradeDate.getFullYear() === year && tradeDate.getMonth() === month;
        });
        
        const totalTrades = monthTrades.length;
        const winTrades = monthTrades.filter(t => parseFloat(t.pnl || 0) > 0).length;
        const totalPnL = monthTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const winrate = totalTrades > 0 ? ((winTrades / totalTrades) * 100).toFixed(1) : 0;
        
        const summaryHTML = `
            <div class="summary-card">
                <h4>Trades du Mois</h4>
                <div class="value">${totalTrades}</div>
            </div>
            <div class="summary-card ${totalPnL >= 0 ? 'profit' : 'loss'}">
                <h4>P&L Total</h4>
                <div class="value">${totalPnL >= 0 ? '+$' : '-$'}${Math.abs(totalPnL).toFixed(0)}</div>
            </div>
            <div class="summary-card">
                <h4>Winrate</h4>
                <div class="value">${winrate}%</div>
            </div>
        `;
        
        summaryElement.innerHTML = summaryHTML;
    }

    saveToStorage() {
        localStorage.setItem(`trades_${this.currentUser}_${this.currentAccount}`, JSON.stringify(this.trades));
        localStorage.setItem(`settings_${this.currentUser}_${this.currentAccount}`, JSON.stringify(this.settings));
        localStorage.setItem(`accounts_${this.currentUser}`, JSON.stringify(this.accounts));
        
        // Synchronisation automatique après chaque sauvegarde
        setTimeout(() => this.autoSaveToCloud(), 1000);
    }

    showStepChart(stepKey) {
        alert('Graphique détaillé disponible dans la version complète');
    }

    async showUserManagement() {
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;
        
        try {
            const snapshot = await this.database.ref('users').once('value');
            const users = snapshot.val() || {};
            
            const usersList = Object.entries(users).map(([user, pass]) => 
                `<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: rgba(40,40,40,0.6); border-radius: 5px; margin: 5px 0;">
                    <span><strong>${user}</strong></span>
                    <div>
                        <button class="btn-small" style="background: #ffc107; margin-right: 5px;" onclick="dashboard.changeUserPassword('${user}')">Changer MDP</button>
                        <button class="btn-small" style="background: #ff6b6b;" onclick="dashboard.deleteUser('${user}')">Supprimer</button>
                    </div>
                </div>`
            ).join('');
            
            modalContent.innerHTML = `
                <h2>👥 Gestion des Utilisateurs (Firebase)</h2>
                
                <div class="education-content">
                    <h4>👥 Utilisateurs actuels :</h4>
                    ${usersList}
                </div>
                
                <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px;">
                    <h3 style="color: #4ecdc4; margin-bottom: 15px;">➕ Ajouter un utilisateur</h3>
                    <div class="form-group">
                        <label>Nom d'utilisateur:</label>
                        <input type="text" id="newUsername" placeholder="nouveau_trader">
                    </div>
                    <div class="form-group">
                        <label>Mot de passe:</label>
                        <input type="password" id="newPassword" placeholder="MotDePasseSécurisé123!">
                    </div>
                    <button class="btn-submit" onclick="dashboard.addUser()">Ajouter Utilisateur</button>
                </div>
                
                <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px;">
                    <h3 style="color: #ff6b6b; margin-bottom: 15px;">🔑 Changer mon mot de passe</h3>
                    <div class="form-group">
                        <label>Nouveau mot de passe:</label>
                        <input type="password" id="myNewPassword" placeholder="MonNouveauMotDePasse123!">
                    </div>
                    <button class="btn-warning" onclick="dashboard.changeMyPassword()">Changer Mon Mot de Passe</button>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn-secondary" onclick="dashboard.showSettings()">← Retour aux Paramètres</button>
                </div>
            `;
        } catch (error) {
            modalContent.innerHTML = `
                <h2>❌ Erreur</h2>
                <p>Impossible de charger les utilisateurs depuis Firebase.</p>
                <button class="btn-secondary" onclick="dashboard.closeModal()">Fermer</button>
            `;
        }
        
        this.showModal();
    }

    async addUser() {
        const username = document.getElementById('newUsername')?.value.trim();
        const password = document.getElementById('newPassword')?.value;
        
        if (!username || !password) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        
        try {
            const snapshot = await this.database.ref(`users/${username}`).once('value');
            if (snapshot.exists()) {
                alert('Cet utilisateur existe déjà');
                return;
            }
            
            await this.database.ref(`users/${username}`).set(password);
            alert(`Utilisateur "${username}" ajouté avec succès !`);
            this.showUserManagement();
        } catch (error) {
            alert('Erreur lors de l\'ajout : ' + error.message);
        }
    }
    
    async deleteUser(username) {
        if (username === 'admin') {
            alert('Impossible de supprimer le compte admin principal');
            return;
        }
        
        if (confirm(`Supprimer l'utilisateur "${username}" ?`)) {
            try {
                await this.database.ref(`users/${username}`).remove();
                alert(`Utilisateur "${username}" supprimé`);
                this.showUserManagement();
            } catch (error) {
                alert('Erreur lors de la suppression : ' + error.message);
            }
        }
    }

    async changeUserPassword(username) {
        const newPassword = prompt(`Nouveau mot de passe pour "${username}" :`);
        if (!newPassword) return;
        
        try {
            await this.database.ref(`users/${username}`).set(newPassword);
            alert(`Mot de passe de "${username}" changé avec succès !`);
            this.showUserManagement();
        } catch (error) {
            alert('Erreur lors du changement : ' + error.message);
        }
    }

    async changeMyPassword() {
        const newPassword = document.getElementById('myNewPassword')?.value;
        if (!newPassword) {
            alert('Veuillez entrer un nouveau mot de passe');
            return;
        }
        
        try {
            await this.database.ref(`users/${this.currentUser}`).set(newPassword);
            alert('Votre mot de passe a été changé avec succès !');
            this.showUserManagement();
        } catch (error) {
            alert('Erreur lors du changement : ' + error.message);
        }
    }

    closeFullscreen() {
        const modal = document.getElementById('fullscreenModal');
        if (modal) modal.style.display = 'none';
    }
}

// Initialiser le dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', function() {
    try {
        dashboard = new TradingDashboard();
        console.log('Dashboard initialisé avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du dashboard:', error);
        alert('Erreur lors du chargement du dashboard. Veuillez rafraîchir la page.');
    }
});