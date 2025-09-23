class TradingDashboard {
    constructor() {
        this.currentUser = sessionStorage.getItem('currentUser') || 'default';
        this.trades = JSON.parse(localStorage.getItem(`trades_${this.currentUser}`)) || [];
        this.settings = JSON.parse(localStorage.getItem(`settings_${this.currentUser}`)) || { capital: 1000, riskPerTrade: 2 };
        
        // Initialiser les utilisateurs si admin
        if (this.currentUser === 'admin' && !localStorage.getItem('users')) {
            const defaultUsers = {
                "admin": "TradingPro2024!",
                "trader1": "Trader123!",
                "trader2": "Market456!",
                "guest": "Guest789!"
            };
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }
        this.currentStep = 0;
        this.currentTrade = {};
        this.livePrices = {};
        this.previousModalContent = null;
        this.checklistSteps = [
            {
                title: "✅ 1. Contexte Global (Top-Down Analysis)",
                question: "Quelle est la tendance Daily et la zone H4 ?",
                key: "contextGlobal",
                education: `<strong>🎯 Objectif :</strong> Comprendre la tendance générale et où se situe le prix<br><br>
                <strong>📊 Daily (D1) - Tendance principale :</strong><br>
                • <strong>Haussière :</strong> Structure HH/HL + prix au-dessus EMA 20<br>
                • <strong>Baissière :</strong> Structure LH/LL + prix sous EMA 20<br>
                • <strong>Range :</strong> Prix entre support/résistance majeurs<br><br>
                <strong>📊 H4 - Zones Premium/Discount :</strong><br>
                • <strong>Premium (>50%) :</strong> Zone de vente potentielle<br>
                • <strong>Discount (<50%) :</strong> Zone d'achat potentielle<br>
                • <strong>Fibonacci global :</strong> Du plus bas au plus haut significatif<br><br>
                <strong>⚠️ RÈGLE ABSOLUE :</strong><br>
                • ❌ Ne JAMAIS acheter en Premium<br>
                • ❌ Ne JAMAIS vendre en Discount<br>
                <a href="#" onclick="dashboard.showStepChart('contextGlobal')">📈 Voir analyse complète</a>`,
                options: ["Hausse + Discount (✅ Achat)", "Baisse + Premium (✅ Vente)", "Range/Attendre", "Hausse + Premium (❌)", "Baisse + Discount (❌)"]
            },
            {
                title: "✅ 2. Zone Institutionnelle (OB/FVG/Liquidité)",
                question: "Zone institutionnelle identifiée ?",
                key: "zoneInstitutionnelle",
                education: `<strong>🎯 Objectif :</strong> Trouver où les "gros joueurs" entrent<br><br>
                <strong>🏦 Order Blocks (H4/H1) :</strong><br>
                • <strong>Définition :</strong> Dernière bougie avant impulsion forte<br>
                • <strong>Validation :</strong> Mouvement 30+ pips en 1-3 bougies<br>
                • <strong>Confluence :</strong> OB + niveau 00/50 psychologique<br><br>
                <strong>⚡ Fair Value Gaps (H1) :</strong><br>
                • <strong>Pattern :</strong> Haut bougie 1 < Bas bougie 3<br>
                • <strong>Impulsion :</strong> 20+ pips avec volume élevé<br>
                • <strong>Statistique :</strong> 80% comblés en 24h<br><br>
                <strong>💧 Liquidity Grab :</strong><br>
                • <strong>Mèche :</strong> Chasse des stops au-dessus/sous niveaux<br>
                • <strong>Retournement :</strong> Prix revient rapidement dans la zone<br><br>
                <strong>⚠️ RÈGLE :</strong> Entrer UNIQUEMENT si prix réagit dans ces zones<br>
                <a href="#" onclick="dashboard.showStepChart('zoneInstitutionnelle')">📈 Voir zones détaillées</a>`,
                options: ["OB Valide + Réaction", "FVG + Liquidity Grab", "Zone Confluence Multiple", "Aucune Zone Claire"]
            },
            {
                title: "✅ 3. Structure de Marché (BOS/CHOCH)",
                question: "Confirmation de structure obtenue ?",
                key: "structureMarche",
                education: `<strong>🎯 Objectif :</strong> Attendre confirmation claire avant d'entrer<br><br>
                <strong>🔄 Change of Character (CHOCH) :</strong><br>
                • <strong>Haussier :</strong> LH cassé + nouveau HH formé<br>
                • <strong>Baissier :</strong> HL cassé + nouveau LL formé<br>
                • <strong>Timeframe :</strong> M15/M5 pour confirmation<br>
                • <strong>Signal :</strong> Potentiel renversement confirmé<br><br>
                <strong>📈 Break of Structure (BOS) :</strong><br>
                • <strong>Haussier :</strong> Cassure du dernier HH<br>
                • <strong>Baissier :</strong> Cassure du dernier LL<br>
                • <strong>Confirmation :</strong> Continuation de tendance<br>
                • <strong>Volume :</strong> Augmentation sur la cassure<br><br>
                <strong>⚠️ RÈGLE ABSOLUE :</strong><br>
                • ❌ JAMAIS entrer sans BOS/CHOCH clair<br>
                • ✅ Attendre retest de la zone cassée<br>
                <a href="#" onclick="dashboard.showStepChart('structureMarche')">📈 Voir structures détaillées</a>`,
                options: ["CHOCH + Retest (Renversement)", "BOS + Pullback (Continuation)", "Structure Unclear", "Faux Signal"]
            },
            {
                title: "✅ 4. Confluence et Timing (Killzones + PD Array)",
                question: "Timing et confluence optimaux ?",
                key: "confluenceTiming",
                education: `<strong>🎯 Objectif :</strong> Combiner plusieurs confirmations pour renforcer le trade<br><br>
                <strong>⏰ Killzones (Heures Paris) :</strong><br>
                • <strong>Londres :</strong> 8h-11h (Volatilité maximale)<br>
                • <strong>New York :</strong> 14h-17h (Overlap + News US)<br>
                • <strong>Éviter :</strong> 12h-14h (Pause déjeuner)<br>
                • <strong>News :</strong> Exceptions pour événements majeurs<br><br>
                <strong>📊 PD Array (Premium/Discount) :</strong><br>
                • <strong>Achat SEULEMENT :</strong> Prix en Discount (<50%)<br>
                • <strong>Vente SEULEMENT :</strong> Prix en Premium (>50%)<br>
                • <strong>Fibonacci :</strong> Calculé sur swing significatif<br><br>
                <strong>🔗 Confluence Requise :</strong><br>
                • ✅ Killzone + PD Array + Zone institutionnelle<br>
                • ✅ Structure confirmée + Timing optimal<br><br>
                <strong>⚠️ RÈGLE :</strong> Pas d'entrée hors killzones (sauf news majeures)<br>
                <a href="#" onclick="dashboard.showStepChart('confluenceTiming')">📈 Voir timing optimal</a>`,
                options: ["Killzone + Discount + OB", "Killzone + Premium + FVG", "Hors Killzone (Attendre)", "Confluence Partielle"]
            },
            {
                title: "✅ 5. Entrée et Exécution",
                question: "Signal d'entrée précis confirmé ?",
                key: "entreeExecution",
                education: `<strong>🎯 Objectif :</strong> Placer une entrée propre et optimisée<br><br>
                <strong>🎯 Timeframes d'Exécution :</strong><br>
                • <strong>M5/M1 :</strong> Attendre retracement dans OB/FVG<br>
                • <strong>Confirmation :</strong> Mèche de rejet + CHOCH petit TF<br>
                • <strong>Patience :</strong> Ne pas anticiper, attendre réaction<br><br>
                <strong>📍 Types d'Entrée :</strong><br>
                • <strong>Limite :</strong> Dans la zone OB/FVG identifiée<br>
                • <strong>Market :</strong> Sur confirmation de rejet claire<br>
                • <strong>Stop Entry :</strong> Sur cassure confirmée<br><br>
                <strong>✅ Signaux de Confirmation :</strong><br>
                • <strong>Pin Bar :</strong> Longue mèche + petit corps<br>
                • <strong>Doji :</strong> Indécision puis direction claire<br>
                • <strong>Engulfing :</strong> Bougie englobe la précédente<br>
                • <strong>Volume :</strong> Augmentation sur le signal<br><br>
                <strong>⚠️ RÈGLE ABSOLUE :</strong><br>
                • ❌ Ne PAS anticiper le mouvement<br>
                • ✅ Attendre réaction RÉELLE du prix<br>
                <a href="#" onclick="dashboard.showStepChart('entreeExecution')">📈 Voir signaux d'entrée</a>`,
                options: ["Pin Bar + Rejet OB", "Doji + CHOCH M5", "Engulfing + Volume", "Signal Faible/Attendre"]
            },
            {
                title: "✅ 6. Gestion du Risque (Risk Management)",
                question: "Risk Management optimal configuré ?",
                key: "riskManagement",
                education: `<strong>🎯 Objectif :</strong> Protéger le capital et viser un trade rentable<br><br>
                <strong>🛡️ Stop Loss (Niveau d'Invalidation) :</strong><br>
                • <strong>OB/FVG :</strong> Juste après la zone (5-10 pips)<br>
                • <strong>Structure :</strong> Sous/sur le niveau cassé<br>
                • <strong>Psychologique :</strong> Sous niveau 00/50<br>
                • <strong>ATR :</strong> Basé sur volatilité moyenne<br><br>
                <strong>🎯 Take Profit (Zones de Liquidité) :</strong><br>
                • <strong>Niveau 1 :</strong> Prochain OB opposé<br>
                • <strong>Niveau 2 :</strong> Sommet/Creux précédent<br>
                • <strong>Niveau 3 :</strong> Extension Fibonacci 127-161%<br>
                • <strong>Partiel :</strong> Sécuriser 50% au niveau 1<br><br>
                <strong>💰 Calcul du Risque :</strong><br>
                • <strong>Capital :</strong> Maximum 1% par trade<br>
                • <strong>Ratio R:R :</strong> Minimum 1:2 (idéal 1:3+)<br>
                • <strong>Lot Size :</strong> Calculé automatiquement<br><br>
                <strong>⚠️ RÈGLES ABSOLUES :</strong><br>
                • ❌ Si R:R < 1:2 → Ne PAS prendre le trade<br>
                • ❌ Jamais déplacer SL contre soi<br>
                • ✅ Respecter le plan initial<br>
                <a href="#" onclick="dashboard.showStepChart('riskManagement')">📈 Voir calculs détaillés</a>`,
                options: ["R:R ≥ 1:3 (Excellent)", "R:R = 1:2 (Acceptable)", "R:R < 1:2 (Refuser)", "SL Trop Large"]
            },
            {
                title: "✅ 7. Discipline et Journal",
                question: "Discipline et documentation respectées ?",
                key: "disciplineJournal",
                education: `<strong>🎯 Objectif :</strong> Rester cohérent et progresser continuellement<br><br>
                <strong>🧠 Discipline Mentale :</strong><br>
                • <strong>FOMO :</strong> Ne pas trader par peur de rater<br>
                • <strong>Vengeance :</strong> Ne pas rattraper les pertes<br>
                • <strong>Overtrading :</strong> Respecter 1-3 trades/jour max<br>
                • <strong>Patience :</strong> Attendre les setups parfaits<br><br>
                <strong>📝 Journal de Trading :</strong><br>
                • <strong>Screenshot :</strong> Avant/après chaque trade<br>
                • <strong>Setup :</strong> Noter toutes les confluences<br>
                • <strong>Émotions :</strong> État mental pendant le trade<br>
                • <strong>Leçons :</strong> Ce qui a fonctionné/échoué<br><br>
                <strong>📊 Analyse Performance :</strong><br>
                • <strong>Hebdomadaire :</strong> Revoir tous les trades<br>
                • <strong>Patterns :</strong> Identifier forces/faiblesses<br>
                • <strong>Amélioration :</strong> Ajuster la stratégie<br><br>
                <strong>⚠️ RÈGLE SUPRÊME :</strong><br>
                • 🏆 Suivre le PLAN = Plus important que gagner le trade<br>
                • ✅ Accepter les pertes sans modifier le plan<br>
                • 📈 Cohérence > Performance à court terme<br>
                <a href="#" onclick="dashboard.showStepChart('disciplineJournal')">📈 Voir méthodes de suivi</a>`,
                options: ["Plan Respecté + Journal", "Discipline OK + Documentation", "Émotions Contrôlées", "Besoin d'Amélioration"]
            }
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStats();
        this.renderTradesTable();
        this.initCharts();
        this.updateCharts();
        this.initCalendar();
    }

    setupEventListeners() {
        document.getElementById('newTradeBtn').addEventListener('click', () => this.startNewTrade());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('closeTradeBtn').addEventListener('click', () => this.showCloseTradeModal());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetAllData());
        document.getElementById('pricesBtn').addEventListener('click', () => this.showLivePrices());
        document.getElementById('mt5SyncBtn').addEventListener('click', () => this.showMT5Sync());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportToExcel());
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        
        // Event listeners pour le modal plein écran
        document.querySelector('.close-fullscreen').addEventListener('click', () => this.closeFullscreen());
        
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('tradeModal')) {
                this.closeModal();
            }
            if (e.target === document.getElementById('fullscreenModal')) {
                this.closeFullscreen();
            }
        });
        
        // Mise à jour des prix toutes les 30 secondes
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
        document.getElementById('tradeModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('tradeModal').style.display = 'none';
    }

    renderChecklistStep() {
        const modalContent = document.getElementById('modalContent');
        
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
        const comment = document.getElementById('stepComment').value;
        
        this.currentTrade.confluences[step.key] = answer;
        if (comment) {
            this.currentTrade.comments[step.key] = comment;
        }
        
        this.currentStep++;
        this.renderChecklistStep();
    }

    renderTradeForm() {
        const modalContent = document.getElementById('modalContent');
        
        // Calcul du capital actuel
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
        const entryPoint = parseFloat(document.getElementById('entryPoint').value) || 0;
        const stopLoss = parseFloat(document.getElementById('stopLoss').value) || 0;
        const takeProfit = parseFloat(document.getElementById('takeProfit').value) || 0;
        const currency = document.getElementById('currency').value;
        
        // Calcul du capital actuel
        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const totalPnL = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const currentCapital = this.settings.capital + totalPnL;
        const riskAmount = currentCapital * this.settings.riskPerTrade / 100;
        
        // Calcul du lot si entrée et SL sont renseignés
        if (entryPoint > 0 && stopLoss > 0 && entryPoint !== stopLoss) {
            let lotSize = 0;
            const slDistance = Math.abs(entryPoint - stopLoss);
            
            if (currency === 'XAU/USD') {
                // Or: 1 lot = $100 par point
                lotSize = riskAmount / (slDistance * 100);
            } else if (currency === 'NAS100' || currency === 'GER40') {
                // Indices: 1 lot = $1 par point
                lotSize = riskAmount / slDistance;
            } else {
                // Forex: calcul en pips
                const pipDistance = slDistance * Math.pow(10, this.getDecimalPlaces(currency));
                lotSize = riskAmount / (pipDistance * 10); // $10 par pip pour 1 lot standard
            }
            
            document.getElementById('lotSize').value = Math.max(0.01, lotSize).toFixed(2);
        }
        
        this.calculateFromLot();
    }

    calculateFromLot() {
        const entryPoint = parseFloat(document.getElementById('entryPoint').value) || 0;
        const stopLoss = parseFloat(document.getElementById('stopLoss').value) || 0;
        const takeProfit = parseFloat(document.getElementById('takeProfit').value) || 0;
        const lotSize = parseFloat(document.getElementById('lotSize').value) || 0;
        const currency = document.getElementById('currency').value;
        
        if (entryPoint > 0 && stopLoss > 0 && lotSize > 0 && entryPoint !== stopLoss) {
            const slDistance = Math.abs(entryPoint - stopLoss);
            let riskAmount = 0;
            
            // Calcul du montant risqué selon l'instrument
            if (currency === 'XAU/USD') {
                // Or: 1 lot = $100 par point
                riskAmount = slDistance * lotSize * 100;
            } else if (currency === 'NAS100' || currency === 'GER40') {
                // Indices: 1 lot = $1 par point
                riskAmount = slDistance * lotSize;
            } else {
                // Forex: calcul en pips
                const pipDistance = slDistance * Math.pow(10, this.getDecimalPlaces(currency));
                riskAmount = pipDistance * lotSize * 10; // $10 par pip pour 1 lot standard
            }
            
            document.getElementById('riskAmount').value = '$' + riskAmount.toFixed(2);
            
            // Calcul du gain potentiel si TP est renseigné
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
                
                document.getElementById('potentialGain').value = '$' + potentialGain.toFixed(2);
                
                // Calcul du R:R
                const riskReward = (potentialGain / riskAmount).toFixed(2);
                document.getElementById('riskReward').value = `1:${riskReward}`;
            } else {
                document.getElementById('potentialGain').value = '';
                document.getElementById('riskReward').value = '';
            }
        } else {
            // Réinitialiser les champs si les données sont incomplètes
            document.getElementById('riskAmount').value = '';
            document.getElementById('potentialGain').value = '';
            document.getElementById('riskReward').value = '';
        }
    }

    saveTrade() {
        const currency = document.getElementById('currency').value;
        const entryPoint = parseFloat(document.getElementById('entryPoint').value);
        const stopLoss = parseFloat(document.getElementById('stopLoss').value);
        const takeProfit = parseFloat(document.getElementById('takeProfit').value);
        const lotSize = parseFloat(document.getElementById('lotSize').value);
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

    simulateTradeClose(tradeIndex) {
        const trade = this.trades[tradeIndex];
        if (trade.status !== 'open') return;

        // Simulation aléatoire du résultat
        const random = Math.random();
        const isWin = random > 0.4; // 60% de chance de gagner
        
        if (isWin) {
            trade.result = 'TP';
            trade.closePrice = trade.takeProfit;
        } else {
            trade.result = 'SL';
            trade.closePrice = trade.stopLoss;
        }
        
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
            // Clôture manuelle
            priceMove = trade.closePrice - trade.entryPoint;
        }
        
        // Calcul selon le type d'instrument
        if (trade.currency === 'XAU/USD') {
            // Or : 1 lot = 100 onces, chaque point = 100$
            pnl = priceMove * lotSize * 100;
        } else if (trade.currency === 'NAS100') {
            // NASDAQ : 1 lot = 1$ par point
            pnl = priceMove * lotSize;
        } else if (trade.currency === 'GER40') {
            // DAX : 1 lot = 1€ par point (converti en €)
            pnl = priceMove * lotSize;
        } else {
            // Forex standard
            const pips = priceMove * Math.pow(10, this.getDecimalPlaces(trade.currency));
            const pipValue = this.getPipValue(trade.currency);
            pnl = pips * pipValue * lotSize;
        }
        
        return pnl.toFixed(2);
    }

    resetAllData() {
        if (confirm('Voulez-vous vraiment supprimer toutes VOS données ? Cette action est irréversible.')) {
            localStorage.removeItem(`trades_${this.currentUser}`);
            localStorage.removeItem(`settings_${this.currentUser}`);
            this.trades = [];
            this.settings = { capital: 1000, riskPerTrade: 2 };
            this.updateStats();
            this.renderTradesTable();
            this.updateCharts();
            alert('Toutes vos données ont été supprimées.');
        }
    }

    async updateLivePrices() {
        try {
            // API gratuite Fixer.io pour EUR/USD (limitée mais gratuite)
            const response = await fetch('https://api.fixer.io/latest?access_key=YOUR_FREE_KEY&base=EUR&symbols=USD,GBP,JPY');
            if (response.ok) {
                const data = await response.json();
                if (data.rates) {
                    this.livePrices['EUR/USD'] = (1 / data.rates.USD).toFixed(4);
                    this.livePrices['GBP/USD'] = (data.rates.GBP / data.rates.USD).toFixed(4);
                    this.livePrices['USD/JPY'] = data.rates.JPY.toFixed(2);
                }
            }
        } catch (error) {
            console.log('API non disponible, utilisation de prix simulés');
        }
        
        // Prix simulés pour les autres instruments
        const basePrices = {
            'EUR/USD': this.livePrices['EUR/USD'] || 1.0850,
            'GBP/USD': this.livePrices['GBP/USD'] || 1.2650,
            'USD/JPY': this.livePrices['USD/JPY'] || 149.50,
            'XAU/USD': 2020.50, 'NAS100': 15800.25, 'GER40': 16200.75
        };
        
        Object.keys(basePrices).forEach(symbol => {
            if (!this.livePrices[symbol]) {
                const basePrice = basePrices[symbol];
                const variation = (Math.random() - 0.5) * 0.002;
                this.livePrices[symbol] = (basePrice * (1 + variation)).toFixed(
                    symbol.includes('JPY') ? 2 : symbol.includes('USD') && !symbol.includes('/') ? 2 : 4
                );
            }
        });
    }

    showLivePrices() {
        const modalContent = document.getElementById('modalContent');
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
            <div class="timeframe-guide">
                <h4>🕰️ Guide des Sessions :</h4>
                <p><strong>Session Asiatique :</strong> 00h00-09h00 GMT (Tokyo, Sydney)</p>
                <p><strong>Session Européenne :</strong> 08h00-17h00 GMT (Londres)</p>
                <p><strong>Session Américaine :</strong> 13h00-22h00 GMT (New York)</p>
                <p><strong>Heure actuelle :</strong> ${new Date().toLocaleString('fr-FR', {timeZone: 'GMT'})}</p>
            </div>
        `;
        this.showModal();
    }

    getPipValue(currency) {
        // Valeur d'un pip pour 1 lot standard
        const pipValues = {
            'EUR/USD': 10, 'GBP/USD': 10, 'AUD/USD': 10, 'USD/CAD': 10,
            'USD/JPY': 10, 'EUR/JPY': 10, 'GBP/JPY': 10, 'EUR/GBP': 10,
            'XAU/USD': 100, 'NAS100': 1, 'GER40': 1
        };
        return pipValues[currency] || 10;
    }

    showExample(type) {
        const examples = {
            pullback: {
                title: "Exemple Pullback Strategy",
                content: `
                    <div class="example-content">
                        <h3>📊 Exemple EUR/USD Pullback</h3>
                        <div class="chart-example">
                            <svg width="100%" height="300" viewBox="0 0 800 300" onclick="dashboard.showFullscreenChart('pullback')" style="cursor: pointer;">
                                <!-- Grille -->
                                <defs>
                                    <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" stroke-width="1"/>
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                                
                                <!-- Tendance haussière -->
                                <line x1="50" y1="250" x2="400" y2="100" stroke="#2196f3" stroke-width="2" stroke-dasharray="5,5"/>
                                <text x="200" y="90" fill="#2196f3" font-size="12">Tendance Daily</text>
                                
                                <!-- Bougies impulsion -->
                                <g id="impulsion">
                                    <rect x="100" y="200" width="8" height="40" fill="#4caf50" stroke="#2e7d32"/>
                                    <line x1="104" y1="190" x2="104" y2="250" stroke="#2e7d32" stroke-width="2"/>
                                    <rect x="120" y="180" width="8" height="50" fill="#4caf50" stroke="#2e7d32"/>
                                    <line x1="124" y1="170" x2="124" y2="240" stroke="#2e7d32" stroke-width="2"/>
                                    <rect x="140" y="160" width="8" height="45" fill="#4caf50" stroke="#2e7d32"/>
                                    <line x1="144" y1="150" x2="144" y2="210" stroke="#2e7d32" stroke-width="2"/>
                                </g>
                                <text x="100" y="270" fill="#4caf50" font-size="10">Impulsion H4</text>
                                
                                <!-- Fibonacci -->
                                <line x1="100" y1="240" x2="400" y2="240" stroke="#ff9800" stroke-width="1" opacity="0.7"/>
                                <text x="410" y="245" fill="#ff9800" font-size="10">0%</text>
                                <line x1="100" y1="210" x2="400" y2="210" stroke="#ff9800" stroke-width="1" opacity="0.7"/>
                                <text x="410" y="215" fill="#ff9800" font-size="10">38.2%</text>
                                <line x1="100" y1="195" x2="400" y2="195" stroke="#ff9800" stroke-width="2"/>
                                <text x="410" y="200" fill="#ff9800" font-size="10">50%</text>
                                <line x1="100" y1="180" x2="400" y2="180" stroke="#ff9800" stroke-width="1" opacity="0.7"/>
                                <text x="410" y="185" fill="#ff9800" font-size="10">61.8%</text>
                                <line x1="100" y1="150" x2="400" y2="150" stroke="#ff9800" stroke-width="1" opacity="0.7"/>
                                <text x="410" y="155" fill="#ff9800" font-size="10">100%</text>
                                
                                <!-- Pullback -->
                                <g id="pullback">
                                    <rect x="200" y="170" width="8" height="30" fill="#f44336" stroke="#c62828"/>
                                    <line x1="204" y1="165" x2="204" y2="205" stroke="#c62828" stroke-width="2"/>
                                    <rect x="220" y="185" width="8" height="25" fill="#f44336" stroke="#c62828"/>
                                    <line x1="224" y1="180" x2="224" y2="215" stroke="#c62828" stroke-width="2"/>
                                </g>
                                <text x="200" y="230" fill="#f44336" font-size="10">Pullback 50%</text>
                                
                                <!-- Pin Bar -->
                                <rect x="280" y="190" width="8" height="10" fill="#4caf50" stroke="#2e7d32"/>
                                <line x1="284" y1="185" x2="284" y2="220" stroke="#2e7d32" stroke-width="3"/>
                                <text x="260" y="240" fill="#4caf50" font-size="10">Pin Bar</text>
                                
                                <!-- Flèches -->
                                <defs>
                                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#2196f3" />
                                    </marker>
                                </defs>
                                <path d="M 290 200 L 310 180" stroke="#2196f3" stroke-width="2" marker-end="url(#arrowhead)"/>
                                <text x="315" y="175" fill="#2196f3" font-size="10">Entrée</text>
                            </svg>
                        </div>
                        <div class="step-by-step">
                            <h4>1. Tendance Daily (ligne bleue)</h4>
                            <p>• Prix au-dessus EMA 20 Daily = Tendance haussière</p>
                            <p>• Structure HH/HL confirmée</p>
                            
                            <h4>2. Impulsion H4 (bougies vertes)</h4>
                            <p>• Mouvement haussier de 1.0800 à 1.0950 (150 pips)</p>
                            
                            <h4>3. Fibonacci H1 (lignes orange)</h4>
                            <p>• Tracez du plus bas (1.0800) au plus haut (1.0950)</p>
                            <p>• 38.2% = 1.0893 | 50% = 1.0875 | 61.8% = 1.0857</p>
                            
                            <h4>4. Pullback (bougies rouges)</h4>
                            <p>• Correction jusqu'à la zone 50% Fibonacci</p>
                            
                            <h4>5. Signal Pin Bar (bougie verte avec mèche)</h4>
                            <p>• Rejet de la zone 50% = Signal d'achat</p>
                            <p>• Entrée : 1.0880 | SL : 1.0860 | TP : 1.0950</p>
                            <p>• R:R = 1:3.5 (20 pips risque, 70 pips gain)</p>
                        </div>
                    </div>
                `
            },
            london: {
                title: "Exemple London Breakout",
                content: `
                    <div class="example-content">
                        <h3>🌆 Exemple GBP/USD London Breakout</h3>
                        <div class="step-by-step">
                            <h4>1. Range Asiatique (00h-08h GMT)</h4>
                            <p>• Haut : 1.2650 | Bas : 1.2620 (30 pips de range)</p>
                            <p>• Consolidation pendant 8 heures</p>
                            
                            <h4>2. Ouverture Londres (08h GMT)</h4>
                            <p>• Volume augmente significativement</p>
                            <p>• Première bougie H1 casse 1.2650</p>
                            
                            <h4>3. Confirmation M15</h4>
                            <p>• Clôture 15min au-dessus de 1.2650</p>
                            <p>• Retest de 1.2650 (ancien résistance = support)</p>
                            
                            <h4>4. Entrée</h4>
                            <p>• Entrée : 1.2655 (après retest)</p>
                            <p>• Stop : 1.2635 (milieu du range)</p>
                            <p>• Target : 1.2680 (taille du range projetée)</p>
                            <p>• R:R = 1:1.25 (20 pips risque, 25 pips gain)</p>
                        </div>
                    </div>
                `
            },
            orderblock: {
                title: "Exemple Order Block ICT",
                content: `
                    <div class="example-content">
                        <h3>🏦 Exemple EUR/USD Order Block</h3>
                        <div class="chart-example">
                            <svg width="100%" height="300" viewBox="0 0 800 300" onclick="dashboard.showFullscreenChart('orderblock')" style="cursor: pointer;">
                                <rect width="100%" height="100%" fill="url(#grid)" />
                                
                                <!-- Order Block (rectangle) -->
                                <rect x="150" y="120" width="60" height="20" fill="rgba(255,193,7,0.3)" stroke="#ff9800" stroke-width="2"/>
                                <text x="155" y="115" fill="#ff9800" font-size="12">Order Block</text>
                                
                                <!-- Bougie Order Block -->
                                <rect x="170" y="125" width="8" height="10" fill="#4caf50" stroke="#2e7d32"/>
                                <line x1="174" y1="120" x2="174" y2="140" stroke="#2e7d32" stroke-width="2"/>
                                <text x="150" y="155" fill="#4caf50" font-size="10">Dernière bougie haussière</text>
                                
                                <!-- Impulsion baissière -->
                                <g id="bearish-impulse">
                                    <rect x="220" y="140" width="8" height="40" fill="#f44336" stroke="#c62828"/>
                                    <line x1="224" y1="135" x2="224" y2="185" stroke="#c62828" stroke-width="2"/>
                                    <rect x="240" y="160" width="8" height="50" fill="#f44336" stroke="#c62828"/>
                                    <line x1="244" y1="155" x2="244" y2="215" stroke="#c62828" stroke-width="2"/>
                                    <rect x="260" y="180" width="8" height="45" fill="#f44336" stroke="#c62828"/>
                                    <line x1="264" y1="175" x2="264" y2="230" stroke="#c62828" stroke-width="2"/>
                                </g>
                                <text x="220" y="250" fill="#f44336" font-size="10">Impulsion baissière</text>
                                
                                <!-- Retour vers OB -->
                                <g id="return-to-ob">
                                    <rect x="350" y="200" width="8" height="30" fill="#4caf50" stroke="#2e7d32"/>
                                    <line x1="354" y1="195" x2="354" y2="235" stroke="#2e7d32" stroke-width="2"/>
                                    <rect x="370" y="180" width="8" height="35" fill="#4caf50" stroke="#2e7d32"/>
                                    <line x1="374" y1="175" x2="374" y2="220" stroke="#2e7d32" stroke-width="2"/>
                                    <rect x="390" y="160" width="8" height="25" fill="#4caf50" stroke="#2e7d32"/>
                                    <line x1="394" y1="155" x2="394" y2="190" stroke="#2e7d32" stroke-width="2"/>
                                    <rect x="410" y="140" width="8" height="20" fill="#4caf50" stroke="#2e7d32"/>
                                    <line x1="414" y1="135" x2="414" y2="165" stroke="#2e7d32" stroke-width="2"/>
                                </g>
                                <text x="350" y="260" fill="#4caf50" font-size="10">Retour vers OB</text>
                                
                                <!-- Signal de rejet (Doji) -->
                                <rect x="450" y="128" width="8" height="4" fill="#9c27b0" stroke="#7b1fa2"/>
                                <line x1="454" y1="120" x2="454" y2="145" stroke="#7b1fa2" stroke-width="3"/>
                                <text x="430" y="110" fill="#9c27b0" font-size="10">Doji de rejet</text>
                                
                                <!-- Flèche d'entrée -->
                                <defs>
                                    <marker id="arrowhead2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#f44336" />
                                    </marker>
                                </defs>
                                <path d="M 460 130 L 480 150" stroke="#f44336" stroke-width="2" marker-end="url(#arrowhead2)"/>
                                <text x="485" y="155" fill="#f44336" font-size="10">SELL</text>
                                
                                <!-- Mouvement vers le bas -->
                                <g id="move-down">
                                    <rect x="500" y="150" width="8" height="35" fill="#f44336" stroke="#c62828"/>
                                    <line x1="504" y1="145" x2="504" y2="190" stroke="#c62828" stroke-width="2"/>
                                    <rect x="520" y="170" width="8" height="40" fill="#f44336" stroke="#c62828"/>
                                    <line x1="524" y1="165" x2="524" y2="215" stroke="#c62828" stroke-width="2"/>
                                </g>
                            </svg>
                        </div>
                        <div class="step-by-step">
                            <h4>1. Identification H4 (rectangle jaune)</h4>
                            <p>• Impulsion baissière : 1.0950 à 1.0880 (70 pips en 2 bougies)</p>
                            <p>• Dernière bougie haussière avant chute : 1.0945-1.0955</p>
                            
                            <h4>2. Marquage de l'OB</h4>
                            <p>• Rectangle : Haut 1.0955 | Bas 1.0945</p>
                            <p>• Zone jamais retestée depuis 3 jours</p>
                            
                            <h4>3. Retour du prix H1 (bougies vertes)</h4>
                            <p>• Prix remonte et atteint la zone OB</p>
                            <p>• Confluence avec niveau psychologique 1.0950</p>
                            
                            <h4>4. Signal Doji (bougie violette)</h4>
                            <p>• Doji de rejet à 1.0952 avec longue mèche</p>
                            <p>• Volume de confirmation</p>
                            
                            <h4>5. Trade (flèche rouge)</h4>
                            <p>• Entrée : 1.0950 (vente)</p>
                            <p>• Stop : 1.0960 (10 pips au-dessus OB)</p>
                            <p>• TP : 1.0900 (50 pips, niveau de support)</p>
                            <p>• R:R = 1:5 (10 pips risque, 50 pips gain)</p>
                        </div>
                    </div>
                `
            },
            fvg: {
                title: "Exemple Fair Value Gap",
                content: `
                    <div class="example-content">
                        <h3>⚡ Exemple USD/JPY Fair Value Gap</h3>
                        <div class="chart-example">
                            <svg width="100%" height="300" viewBox="0 0 800 300" onclick="dashboard.showFullscreenChart('fvg')" style="cursor: pointer;">
                                <rect width="100%" height="100%" fill="url(#grid)" />
                                
                                <!-- Bougie 1 -->
                                <rect x="150" y="180" width="8" height="30" fill="#4caf50" stroke="#2e7d32"/>
                                <line x1="154" y1="170" x2="154" y2="220" stroke="#2e7d32" stroke-width="2"/>
                                <text x="130" y="240" fill="#4caf50" font-size="10">Bougie 1</text>
                                <text x="130" y="255" fill="#4caf50" font-size="9">Haut: 149.20</text>
                                
                                <!-- Bougie 2 (Impulsion) -->
                                <rect x="200" y="120" width="8" height="60" fill="#4caf50" stroke="#2e7d32"/>
                                <line x1="204" y1="110" x2="204" y2="190" stroke="#2e7d32" stroke-width="3"/>
                                <text x="180" y="240" fill="#4caf50" font-size="10">Bougie 2</text>
                                <text x="180" y="255" fill="#4caf50" font-size="9">Impulsion</text>
                                
                                <!-- Bougie 3 -->
                                <rect x="250" y="140" width="8" height="25" fill="#4caf50" stroke="#2e7d32"/>
                                <line x1="254" y1="135" x2="254" y2="170" stroke="#2e7d32" stroke-width="2"/>
                                <text x="230" y="240" fill="#4caf50" font-size="10">Bougie 3</text>
                                <text x="230" y="255" fill="#4caf50" font-size="9">Bas: 149.45</text>
                                
                                <!-- Fair Value Gap (zone colorée) -->
                                <rect x="150" y="170" width="108" height="25" fill="rgba(255,87,34,0.3)" stroke="#ff5722" stroke-width="2" stroke-dasharray="3,3"/>
                                <text x="160" y="160" fill="#ff5722" font-size="12">Fair Value Gap</text>
                                <text x="160" y="185" fill="#ff5722" font-size="10">149.20 - 149.45</text>
                                
                                <!-- Retour du prix -->
                                <g id="price-return">
                                    <rect x="350" y="160" width="8" height="20" fill="#f44336" stroke="#c62828"/>
                                    <line x1="354" y1="155" x2="354" y2="185" stroke="#c62828" stroke-width="2"/>
                                    <rect x="370" y="170" width="8" height="15" fill="#f44336" stroke="#c62828"/>
                                    <line x1="374" y1="165" x2="374" y2="190" stroke="#c62828" stroke-width="2"/>
                                    <rect x="390" y="175" width="8" height="10" fill="#f44336" stroke="#c62828"/>
                                    <line x1="394" y1="170" x2="394" y2="190" stroke="#c62828" stroke-width="2"/>
                                </g>
                                <text x="350" y="210" fill="#f44336" font-size="10">Retour dans le FVG</text>
                                
                                <!-- Signal de rejet -->
                                <rect x="430" y="178" width="8" height="4" fill="#9c27b0" stroke="#7b1fa2"/>
                                <line x1="434" y1="170" x2="434" y2="195" stroke="#7b1fa2" stroke-width="3"/>
                                <text x="410" y="160" fill="#9c27b0" font-size="10">Rejet</text>
                                
                                <!-- Mouvement de continuation -->
                                <g id="continuation">
                                    <rect x="480" y="190" width="8" height="30" fill="#f44336" stroke="#c62828"/>
                                    <line x1="484" y1="185" x2="484" y2="225" stroke="#c62828" stroke-width="2"/>
                                    <rect x="500" y="210" width="8" height="35" fill="#f44336" stroke="#c62828"/>
                                    <line x1="504" y1="205" x2="504" y2="250" stroke="#c62828" stroke-width="2"/>
                                </g>
                                <text x="480" y="270" fill="#f44336" font-size="10">Continuation</text>
                                
                                <!-- Flèche d'entrée -->
                                <defs>
                                    <marker id="arrowhead3" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#9c27b0" />
                                    </marker>
                                </defs>
                                <path d="M 440 180 L 460 200" stroke="#9c27b0" stroke-width="2" marker-end="url(#arrowhead3)"/>
                                <text x="465" y="205" fill="#9c27b0" font-size="10">SELL</text>
                            </svg>
                        </div>
                        <div class="step-by-step">
                            <h4>1. Formation du FVG H1 (zone orange)</h4>
                            <p>• Bougie 1 : Haut 149.20</p>
                            <p>• Bougie 2 : Impulsion 149.25-149.60</p>
                            <p>• Bougie 3 : Bas 149.45</p>
                            <p>• GAP : 149.20 à 149.45 (25 pips)</p>
                            
                            <h4>2. Validation</h4>
                            <p>• Mouvement rapide : 40 pips en 3 bougies</p>
                            <p>• Volume élevé sur l'impulsion</p>
                            <p>• Gap jamais comblé depuis 6 heures</p>
                            
                            <h4>3. Retour du prix (bougies rouges)</h4>
                            <p>• Prix revient combler le FVG</p>
                            
                            <h4>4. Signal de rejet (bougie violette)</h4>
                            <p>• Doji avec longue mèche dans le FVG</p>
                            
                            <h4>5. Exécution</h4>
                            <p>• Entrée : 149.35 (milieu du FVG)</p>
                            <p>• Stop : 149.50 (15 pips) | TP : 149.00 (35 pips)</p>
                            <p>• R:R = 1:2.3 (15 pips risque, 35 pips gain)</p>
                        </div>
                    </div>
                `
            }
        };
        
        const example = examples[type];
        if (example) {
            // Sauvegarder le contenu actuel du modal
            this.previousModalContent = document.getElementById('modalContent').innerHTML;
            
            const modalContent = document.getElementById('modalContent');
            modalContent.innerHTML = `
                <h2>${example.title}</h2>
                ${example.content}
                <div style="text-align: center; margin-top: 20px;">
                    <button class="back-to-steps" onclick="dashboard.backToSteps()">← Retour aux étapes</button>
                    <button class="btn-submit" onclick="dashboard.closeModal()">Fermer</button>
                </div>
            `;
            this.showModal();
        }
    }

    backToSteps() {
        if (this.previousModalContent) {
            document.getElementById('modalContent').innerHTML = this.previousModalContent;
            this.previousModalContent = null;
        }
    }

    showFullscreenChart(type) {
        // Chercher d'abord dans les graphiques d'étapes
        const stepCharts = {
            contextGlobal: "Contexte Global - Top-Down Analysis",
            zoneInstitutionnelle: "Zones Institutionnelles - OB/FVG/Liquidité",
            structureMarche: "Structure de Marché - BOS/CHOCH",
            confluenceTiming: "Confluence et Timing - Killzones",
            entreeExecution: "Entrée et Exécution - Signaux Précis",
            riskManagement: "Risk Management - Calculs Optimaux",
            disciplineJournal: "Discipline et Journal - Méthodes de Suivi"
        };
        
        const exampleCharts = {
            pullback: "Pullback Strategy - Vue Détaillée",
            orderblock: "Order Block ICT - Vue Détaillée",
            london: "London Breakout - Vue Détaillée"
        };

        let title = stepCharts[type] || exampleCharts[type] || "Graphique - Vue Détaillée";
        
        // Chercher le graphique SVG dans le modal actuel
        const currentModal = document.getElementById('modalContent');
        const svgElement = currentModal.querySelector('svg');
        
        if (svgElement) {
            const clonedChart = svgElement.cloneNode(true);
            clonedChart.removeAttribute('onclick');
            clonedChart.style.cursor = 'default';
            
            document.getElementById('fullscreenContent').innerHTML = `
                <h2>${title}</h2>
                <div class="fullscreen-chart">
                    ${clonedChart.outerHTML}
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn-submit" onclick="dashboard.closeFullscreen()">Fermer Vue Détaillée</button>
                </div>
            `;
            document.getElementById('fullscreenModal').style.display = 'block';
        } else {
            alert('Aucun graphique trouvé pour l\'affichage plein écran');
        }
    }

    closeFullscreen() {
        document.getElementById('fullscreenModal').style.display = 'none';
    }

    showStepChart(stepKey) {
        const charts = {
            contextGlobal: {
                title: "✅ 1. Contexte Global - Top-Down Analysis",
                chart: `<svg width="100%" height="500" viewBox="0 0 1200 500" style="background: #1e1e1e; border-radius: 8px;">
                    <defs>
                        <pattern id="grid" width="40" height="25" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#2a2a2a" stroke-width="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    <!-- Titre -->
                    <text x="600" y="30" fill="#00d4ff" font-size="20" text-anchor="middle" font-weight="bold">CONTEXTE GLOBAL - TOP DOWN ANALYSIS</text>
                    
                    <!-- Section Daily -->
                    <rect x="50" y="60" width="500" height="180" fill="rgba(0,212,255,0.1)" stroke="#00d4ff" stroke-width="2" rx="10"/>
                    <text x="70" y="85" fill="#00d4ff" font-size="16" font-weight="bold">📊 DAILY (D1) - Tendance Principale</text>
                    
                    <!-- Tendance haussière Daily -->
                    <path d="M 80 200 L 120 180 L 160 160 L 200 140 L 240 120 L 280 100" stroke="#4ecdc4" stroke-width="4" fill="none"/>
                    <text x="300" y="105" fill="#4ecdc4" font-size="12">Tendance Haussière</text>
                    
                    <!-- Structure HH/HL -->
                    <circle cx="120" cy="180" r="3" fill="#4ecdc4"/>
                    <text x="100" y="200" fill="#4ecdc4" font-size="10">HL</text>
                    <circle cx="200" cy="140" r="3" fill="#4ecdc4"/>
                    <text x="180" y="130" fill="#4ecdc4" font-size="10">HH</text>
                    <circle cx="280" cy="100" r="3" fill="#4ecdc4"/>
                    <text x="260" y="90" fill="#4ecdc4" font-size="10">HH</text>
                    
                    <!-- EMA 20 -->
                    <path d="M 80 210 Q 150 190 220 170 T 350 150" stroke="#ff6b35" stroke-width="2" fill="none" stroke-dasharray="5,5"/>
                    <text x="360" y="155" fill="#ff6b35" font-size="10">EMA 20</text>
                    
                    <!-- Section H4 Premium/Discount -->
                    <rect x="650" y="60" width="500" height="180" fill="rgba(255,193,7,0.1)" stroke="#ffc107" stroke-width="2" rx="10"/>
                    <text x="670" y="85" fill="#ffc107" font-size="16" font-weight="bold">📈 H4 - Zones Premium/Discount</text>
                    
                    <!-- Fibonacci H4 -->
                    <line x1="700" y1="100" x2="1100" y2="100" stroke="#ff6b6b" stroke-width="2"/>
                    <text x="1110" y="105" fill="#ff6b6b" font-size="12">100% (Premium)</text>
                    
                    <line x1="700" y1="130" x2="1100" y2="130" stroke="#ffc107" stroke-width="2"/>
                    <text x="1110" y="135" fill="#ffc107" font-size="12">78.6%</text>
                    
                    <line x1="700" y1="160" x2="1100" y2="160" stroke="#ff9800" stroke-width="3"/>
                    <text x="1110" y="165" fill="#ff9800" font-size="12" font-weight="bold">50% (Équilibre)</text>
                    
                    <line x1="700" y1="190" x2="1100" y2="190" stroke="#4ecdc4" stroke-width="2"/>
                    <text x="1110" y="195" fill="#4ecdc4" font-size="12">38.2%</text>
                    
                    <line x1="700" y1="220" x2="1100" y2="220" stroke="#4ecdc4" stroke-width="2"/>
                    <text x="1110" y="225" fill="#4ecdc4" font-size="12">0% (Discount)</text>
                    
                    <!-- Zone Premium -->
                    <rect x="700" y="100" width="400" height="60" fill="rgba(255,107,107,0.2)" stroke="#ff6b6b" stroke-width="1" stroke-dasharray="3,3"/>
                    <text x="750" y="120" fill="#ff6b6b" font-size="14" font-weight="bold">ZONE PREMIUM</text>
                    <text x="750" y="140" fill="#ff6b6b" font-size="12">❌ NE PAS ACHETER</text>
                    <text x="750" y="155" fill="#ff6b6b" font-size="12">✅ VENDRE SEULEMENT</text>
                    
                    <!-- Zone Discount -->
                    <rect x="700" y="160" width="400" height="60" fill="rgba(78,205,196,0.2)" stroke="#4ecdc4" stroke-width="1" stroke-dasharray="3,3"/>
                    <text x="750" y="180" fill="#4ecdc4" font-size="14" font-weight="bold">ZONE DISCOUNT</text>
                    <text x="750" y="200" fill="#4ecdc4" font-size="12">✅ ACHETER SEULEMENT</text>
                    <text x="750" y="215" fill="#4ecdc4" font-size="12">❌ NE PAS VENDRE</text>
                    
                    <!-- Règles absolues -->
                    <rect x="50" y="280" width="1100" height="180" fill="rgba(255,0,0,0.1)" stroke="#ff0000" stroke-width="3" rx="15"/>
                    <text x="600" y="310" fill="#ff0000" font-size="18" text-anchor="middle" font-weight="bold">⚠️ RÈGLES ABSOLUES - TOP DOWN ANALYSIS</text>
                    
                    <!-- Règle 1 -->
                    <rect x="80" y="330" width="300" height="100" fill="rgba(0,0,0,0.8)" stroke="#ff6b6b" stroke-width="2" rx="8"/>
                    <text x="90" y="350" fill="#ff6b6b" font-size="14" font-weight="bold">❌ INTERDICTIONS</text>
                    <text x="90" y="370" fill="#fff" font-size="12">• JAMAIS acheter en Premium</text>
                    <text x="90" y="385" fill="#fff" font-size="12">• JAMAIS vendre en Discount</text>
                    <text x="90" y="400" fill="#fff" font-size="12">• JAMAIS trader contre Daily</text>
                    <text x="90" y="415" fill="#ff6b6b" font-size="12">= Recette pour perdre</text>
                    
                    <!-- Règle 2 -->
                    <rect x="450" y="330" width="300" height="100" fill="rgba(0,0,0,0.8)" stroke="#4ecdc4" stroke-width="2" rx="8"/>
                    <text x="460" y="350" fill="#4ecdc4" font-size="14" font-weight="bold">✅ AUTORISATIONS</text>
                    <text x="460" y="370" fill="#fff" font-size="12">• Acheter en Discount + Hausse</text>
                    <text x="460" y="385" fill="#fff" font-size="12">• Vendre en Premium + Baisse</text>
                    <text x="460" y="400" fill="#fff" font-size="12">• Suivre la tendance Daily</text>
                    <text x="460" y="415" fill="#4ecdc4" font-size="12">= Probabilités élevées</text>
                    
                    <!-- Règle 3 -->
                    <rect x="820" y="330" width="300" height="100" fill="rgba(0,0,0,0.8)" stroke="#ffc107" stroke-width="2" rx="8"/>
                    <text x="830" y="350" fill="#ffc107" font-size="14" font-weight="bold">⏳ PATIENCE</text>
                    <text x="830" y="370" fill="#fff" font-size="12">• Attendre zone Discount/Premium</text>
                    <text x="830" y="385" fill="#fff" font-size="12">• Confirmer tendance Daily</text>
                    <text x="830" y="400" fill="#fff" font-size="12">• Ne pas forcer les trades</text>
                    <text x="830" y="415" fill="#ffc107" font-size="12">= Discipline = Profits</text>
                </svg>`
            },
            zoneInstitutionnelle: {
                title: "✅ 2. Zones Institutionnelles - OB/FVG/Liquidité",
                chart: `<svg width="100%" height="600" viewBox="0 0 1400 600" style="background: #1e1e1e; border-radius: 8px;">
                    <defs>
                        <pattern id="grid2" width="40" height="25" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#2a2a2a" stroke-width="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid2)" />
                    
                    <!-- Titre -->
                    <text x="700" y="30" fill="#ffc107" font-size="20" text-anchor="middle" font-weight="bold">ZONES INSTITUTIONNELLES - OÙ LES GROS JOUEURS ENTRENT</text>
                    
                    <!-- Section Order Blocks -->
                    <rect x="50" y="60" width="400" height="220" fill="rgba(255,193,7,0.1)" stroke="#ffc107" stroke-width="2" rx="10"/>
                    <text x="70" y="85" fill="#ffc107" font-size="16" font-weight="bold">🏦 ORDER BLOCKS (H4/H1)</text>
                    
                    <!-- Order Block exemple -->
                    <rect x="100" y="120" width="60" height="25" fill="rgba(255,193,7,0.4)" stroke="#ffc107" stroke-width="2"/>
                    <text x="105" y="110" fill="#ffc107" font-size="12">Order Block</text>
                    
                    <!-- Bougie OB -->
                    <rect x="120" y="125" width="8" height="15" fill="#4ecdc4" stroke="#4ecdc4"/>
                    <line x1="124" y1="120" x2="124" y2="145" stroke="#4ecdc4" stroke-width="2"/>
                    <text x="90" y="160" fill="#4ecdc4" font-size="10">Dernière bougie haussiere</text>
                    
                    <!-- Impulsion après OB -->
                    <rect x="180" y="140" width="8" height="40" fill="#ff6b6b" stroke="#ff6b6b"/>
                    <rect x="200" y="160" width="8" height="50" fill="#ff6b6b" stroke="#ff6b6b"/>
                    <rect x="220" y="180" width="8" height="60" fill="#ff6b6b" stroke="#ff6b6b"/>
                    <text x="180" y="260" fill="#ff6b6b" font-size="12">Impulsion 30+ pips</text>
                    
                    <!-- Retour vers OB -->
                    <path d="M 280 200 Q 320 180 360 140" stroke="#4ecdc4" stroke-width="3" fill="none" stroke-dasharray="5,5"/>
                    <text x="300" y="170" fill="#4ecdc4" font-size="12">Retour vers OB</text>
                    
                    <!-- Section Fair Value Gaps -->
                    <rect x="500" y="60" width="400" height="220" fill="rgba(255,87,34,0.1)" stroke="#ff5722" stroke-width="2" rx="10"/>
                    <text x="520" y="85" fill="#ff5722" font-size="16" font-weight="bold">⚡ FAIR VALUE GAPS (H1)</text>
                    
                    <!-- Pattern 3 bougies FVG -->
                    <rect x="550" y="150" width="8" height="20" fill="#4ecdc4" stroke="#4ecdc4"/>
                    <line x1="554" y1="145" x2="554" y2="175" stroke="#4ecdc4" stroke-width="2"/>
                    <text x="530" y="190" fill="#4ecdc4" font-size="10">Bougie 1</text>
                    
                    <rect x="580" y="120" width="8" height="50" fill="#4ecdc4" stroke="#4ecdc4"/>
                    <line x1="584" y1="115" x2="584" y2="175" stroke="#4ecdc4" stroke-width="3"/>
                    <text x="560" y="190" fill="#4ecdc4" font-size="10">Impulsion</text>
                    
                    <rect x="610" y="140" width="8" height="15" fill="#4ecdc4" stroke="#4ecdc4"/>
                    <line x1="614" y1="135" x2="614" y2="160" stroke="#4ecdc4" stroke-width="2"/>
                    <text x="590" y="190" fill="#4ecdc4" font-size="10">Bougie 3</text>
                    
                    <!-- Fair Value Gap -->
                    <rect x="550" y="145" width="68" height="10" fill="rgba(255,87,34,0.4)" stroke="#ff5722" stroke-width="2" stroke-dasharray="3,3"/>
                    <text x="555" y="135" fill="#ff5722" font-size="12">FVG</text>
                    
                    <!-- Section Liquidity Grab -->
                    <rect x="950" y="60" width="400" height="220" fill="rgba(220,53,69,0.1)" stroke="#dc3545" stroke-width="2" rx="10"/>
                    <text x="970" y="85" fill="#dc3545" font-size="16" font-weight="bold">💧 LIQUIDITY GRAB</text>
                    
                    <!-- Niveau de liquidité -->
                    <line x1="1000" y1="150" x2="1300" y2="150" stroke="#ffc107" stroke-width="2" stroke-dasharray="10,5"/>
                    <text x="1310" y="155" fill="#ffc107" font-size="12">Niveau de liquidité</text>
                    
                    <!-- Mèche de chasse -->
                    <rect x="1150" y="140" width="8" height="15" fill="#ff6b6b" stroke="#ff6b6b"/>
                    <line x1="1154" y1="130" x2="1154" y2="160" stroke="#ff6b6b" stroke-width="4"/>
                    <text x="1120" y="120" fill="#ff6b6b" font-size="12">Mèche chasse stops</text>
                    
                    <!-- Retournement rapide -->
                    <rect x="1180" y="160" width="8" height="30" fill="#4ecdc4" stroke="#4ecdc4"/>
                    <rect x="1200" y="170" width="8" height="40" fill="#4ecdc4" stroke="#4ecdc4"/>
                    <text x="1180" y="230" fill="#4ecdc4" font-size="12">Retournement rapide</text>
                    
                    <!-- Règles d'utilisation -->
                    <rect x="50" y="320" width="1300" height="240" fill="rgba(0,0,0,0.8)" stroke="#00d4ff" stroke-width="3" rx="15"/>
                    <text x="700" y="350" fill="#00d4ff" font-size="18" text-anchor="middle" font-weight="bold">⚠️ RÈGLES D'UTILISATION DES ZONES INSTITUTIONNELLES</text>
                    
                    <!-- Règle Order Blocks -->
                    <rect x="80" y="370" width="350" height="160" fill="rgba(255,193,7,0.1)" stroke="#ffc107" stroke-width="2" rx="8"/>
                    <text x="90" y="390" fill="#ffc107" font-size="14" font-weight="bold">🏦 ORDER BLOCKS</text>
                    <text x="90" y="410" fill="#fff" font-size="12">• Identifier sur H4 minimum</text>
                    <text x="90" y="425" fill="#fff" font-size="12">• Impulsion 30+ pips requise</text>
                    <text x="90" y="440" fill="#fff" font-size="12">• Zone jamais retestée</text>
                    <text x="90" y="455" fill="#fff" font-size="12">• Confluence avec niveaux 00/50</text>
                    <text x="90" y="470" fill="#fff" font-size="12">• Attendre réaction (pin bar, doji)</text>
                    <text x="90" y="485" fill="#fff" font-size="12">• Stop 5-10 pips au-delà</text>
                    <text x="90" y="500" fill="#ffc107" font-size="12" font-weight="bold">✅ Fiabilité: 85%</text>
                    
                    <!-- Règle FVG -->
                    <rect x="470" y="370" width="350" height="160" fill="rgba(255,87,34,0.1)" stroke="#ff5722" stroke-width="2" rx="8"/>
                    <text x="480" y="390" fill="#ff5722" font-size="14" font-weight="bold">⚡ FAIR VALUE GAPS</text>
                    <text x="480" y="410" fill="#fff" font-size="12">• Pattern 3 bougies avec gap</text>
                    <text x="480" y="425" fill="#fff" font-size="12">• Haut B1 < Bas B3</text>
                    <text x="480" y="440" fill="#fff" font-size="12">• Impulsion 20+ pips + volume</text>
                    <text x="480" y="455" fill="#fff" font-size="12">• Gap jamais retracé</text>
                    <text x="480" y="470" fill="#fff" font-size="12">• Ordre limite dans le gap</text>
                    <text x="480" y="485" fill="#fff" font-size="12">• 80% comblés en 24h</text>
                    <text x="480" y="500" fill="#ff5722" font-size="12" font-weight="bold">✅ Fiabilité: 80%</text>
                    
                    <!-- Règle Liquidity -->
                    <rect x="860" y="370" width="350" height="160" fill="rgba(220,53,69,0.1)" stroke="#dc3545" stroke-width="2" rx="8"/>
                    <text x="870" y="390" fill="#dc3545" font-size="14" font-weight="bold">💧 LIQUIDITY GRAB</text>
                    <text x="870" y="410" fill="#fff" font-size="12">• Mèche chasse stops</text>
                    <text x="870" y="425" fill="#fff" font-size="12">• Dépasse niveau puis revient</text>
                    <text x="870" y="440" fill="#fff" font-size="12">• Retournement rapide</text>
                    <text x="870" y="455" fill="#fff" font-size="12">• Volume élevé sur la mèche</text>
                    <text x="870" y="470" fill="#fff" font-size="12">• Entrer sur le retournement</text>
                    <text x="870" y="485" fill="#fff" font-size="12">• Stop au-delà de la mèche</text>
                    <text x="870" y="500" fill="#dc3545" font-size="12" font-weight="bold">✅ Signal de retournement</text>
                </svg>`
            },
            structureMarche: {
                title: "✅ 3. Structure de Marché - BOS/CHOCH",
                chart: `<svg width="100%" height="600" viewBox="0 0 1400 600" style="background: #1e1e1e; border-radius: 8px;">
                    <defs>
                        <pattern id="grid3" width="40" height="25" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#2a2a2a" stroke-width="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid3)" />
                    
                    <text x="700" y="30" fill="#9c27b0" font-size="20" text-anchor="middle" font-weight="bold">STRUCTURE DE MARCHÉ - BOS/CHOCH CONFIRMATION</text>
                    
                    <!-- Section CHOCH -->
                    <rect x="50" y="60" width="650" height="240" fill="rgba(156,39,176,0.1)" stroke="#9c27b0" stroke-width="2" rx="10"/>
                    <text x="70" y="85" fill="#9c27b0" font-size="16" font-weight="bold">🔄 CHANGE OF CHARACTER (CHOCH) - Renversement</text>
                    
                    <!-- Structure baissière -->
                    <circle cx="120" cy="120" r="4" fill="#ff6b6b"/>
                    <text x="100" y="110" fill="#ff6b6b" font-size="12">LH</text>
                    <circle cx="200" cy="160" r="4" fill="#ff6b6b"/>
                    <text x="180" y="180" fill="#ff6b6b" font-size="12">LL</text>
                    <circle cx="280" cy="140" r="4" fill="#ff6b6b"/>
                    <text x="260" y="130" fill="#ff6b6b" font-size="12">LH</text>
                    
                    <!-- Ligne tendance baissière -->
                    <line x1="120" y1="120" x2="280" y2="140" stroke="#ff6b6b" stroke-width="2" stroke-dasharray="5,5"/>
                    <text x="150" y="100" fill="#ff6b6b" font-size="12">Tendance Baissière</text>
                    
                    <!-- CHOCH -->
                    <rect x="350" y="110" width="12" height="50" fill="#4ecdc4" stroke="#4ecdc4"/>
                    <line x1="356" y1="100" x2="356" y2="170" stroke="#4ecdc4" stroke-width="4"/>
                    <text x="320" y="90" fill="#4ecdc4" font-size="16" font-weight="bold">CHOCH</text>
                    <text x="300" y="200" fill="#4ecdc4" font-size="12">Cassure LH précédent</text>
                    
                    <!-- Nouvelle structure haussière -->
                    <circle cx="420" cy="150" r="4" fill="#4ecdc4"/>
                    <text x="400" y="140" fill="#4ecdc4" font-size="12">HL</text>
                    <circle cx="500" cy="100" r="4" fill="#4ecdc4"/>
                    <text x="480" y="90" fill="#4ecdc4" font-size="12">HH</text>
                    
                    <!-- Retest -->
                    <rect x="450" y="120" width="8" height="20" fill="#ff6b6b" stroke="#ff6b6b"/>
                    <text x="430" y="150" fill="#ff6b6b" font-size="12">Retest</text>
                    
                    <!-- Section BOS -->
                    <rect x="750" y="60" width="600" height="240" fill="rgba(78,205,196,0.1)" stroke="#4ecdc4" stroke-width="2" rx="10"/>
                    <text x="770" y="85" fill="#4ecdc4" font-size="16" font-weight="bold">📈 BREAK OF STRUCTURE (BOS) - Continuation</text>
                    
                    <!-- Tendance haussière établie -->
                    <circle cx="800" cy="200" r="4" fill="#4ecdc4"/>
                    <text x="780" y="220" fill="#4ecdc4" font-size="12">HL</text>
                    <circle cx="880" cy="160" r="4" fill="#4ecdc4"/>
                    <text x="860" y="150" fill="#4ecdc4" font-size="12">HH</text>
                    <circle cx="960" cy="180" r="4" fill="#4ecdc4"/>
                    <text x="940" y="200" fill="#4ecdc4" font-size="12">HL</text>
                    
                    <!-- Pullback -->
                    <rect x="1020" y="170" width="8" height="25" fill="#ff6b6b" stroke="#ff6b6b"/>
                    <rect x="1040" y="180" width="8" height="20" fill="#ff6b6b" stroke="#ff6b6b"/>
                    <text x="1020" y="220" fill="#ff6b6b" font-size="12">Pullback 38-50%</text>
                    
                    <!-- BOS -->
                    <rect x="1100" y="140" width="12" height="40" fill="#4ecdc4" stroke="#4ecdc4"/>
                    <line x1="1106" y1="130" x2="1106" y2="190" stroke="#4ecdc4" stroke-width="4"/>
                    <text x="1070" y="120" fill="#4ecdc4" font-size="16" font-weight="bold">BOS</text>
                    <text x="1050" y="240" fill="#4ecdc4" font-size="12">Cassure dernier HH</text>
                    
                    <!-- Nouveau HH -->
                    <circle cx="1200" cy="110" r="4" fill="#4ecdc4"/>
                    <text x="1180" y="100" fill="#4ecdc4" font-size="12">Nouveau HH</text>
                    
                    <!-- Règles de confirmation -->
                    <rect x="50" y="330" width="1300" height="240" fill="rgba(0,0,0,0.8)" stroke="#9c27b0" stroke-width="3" rx="15"/>
                    <text x="700" y="360" fill="#9c27b0" font-size="18" text-anchor="middle" font-weight="bold">⚠️ RÈGLES DE CONFIRMATION STRUCTURE</text>
                    
                    <!-- Timeframes -->
                    <rect x="80" y="380" width="300" height="160" fill="rgba(156,39,176,0.1)" stroke="#9c27b0" stroke-width="2" rx="8"/>
                    <text x="90" y="400" fill="#9c27b0" font-size="14" font-weight="bold">⏰ TIMEFRAMES</text>
                    <text x="90" y="420" fill="#fff" font-size="12">• M15/M5 pour confirmation</text>
                    <text x="90" y="435" fill="#fff" font-size="12">• H1 pour validation</text>
                    <text x="90" y="450" fill="#fff" font-size="12">• H4 pour contexte</text>
                    <text x="90" y="465" fill="#fff" font-size="12">• Volume sur cassure</text>
                    <text x="90" y="480" fill="#fff" font-size="12">• Attendre retest</text>
                    <text x="90" y="495" fill="#fff" font-size="12">• Pas d'anticipation</text>
                    <text x="90" y="510" fill="#9c27b0" font-size="12" font-weight="bold">✅ Patience = Clé</text>
                    
                    <!-- CHOCH Rules -->
                    <rect x="420" y="380" width="300" height="160" fill="rgba(156,39,176,0.1)" stroke="#9c27b0" stroke-width="2" rx="8"/>
                    <text x="430" y="400" fill="#9c27b0" font-size="14" font-weight="bold">🔄 CHOCH VALIDE</text>
                    <text x="430" y="420" fill="#fff" font-size="12">• Haussier: LH cassé + HH formé</text>
                    <text x="430" y="435" fill="#fff" font-size="12">• Baissier: HL cassé + LL formé</text>
                    <text x="430" y="450" fill="#fff" font-size="12">• Volume de confirmation</text>
                    <text x="430" y="465" fill="#fff" font-size="12">• Retest de zone cassée</text>
                    <text x="430" y="480" fill="#fff" font-size="12">• Signal de renversement</text>
                    <text x="430" y="495" fill="#fff" font-size="12">• Entrée sur retest</text>
                    <text x="430" y="510" fill="#9c27b0" font-size="12" font-weight="bold">✅ Précision: 90%</text>
                    
                    <!-- BOS Rules -->
                    <rect x="760" y="380" width="300" height="160" fill="rgba(78,205,196,0.1)" stroke="#4ecdc4" stroke-width="2" rx="8"/>
                    <text x="770" y="400" fill="#4ecdc4" font-size="14" font-weight="bold">📈 BOS VALIDE</text>
                    <text x="770" y="420" fill="#fff" font-size="12">• Tendance établie (3+ swings)</text>
                    <text x="770" y="435" fill="#fff" font-size="12">• Pullback sain 38-50%</text>
                    <text x="770" y="450" fill="#fff" font-size="12">• Cassure dernier high/low</text>
                    <text x="770" y="465" fill="#fff" font-size="12">• Volume sur cassure</text>
                    <text x="770" y="480" fill="#fff" font-size="12">• Signal de continuation</text>
                    <text x="770" y="495" fill="#fff" font-size="12">• Entrée sur pullback</text>
                    <text x="770" y="510" fill="#4ecdc4" font-size="12" font-weight="bold">✅ Fiabilité: 75%</text>
                    
                    <!-- Règle absolue -->
                    <rect x="1100" y="380" width="220" height="160" fill="rgba(255,0,0,0.2)" stroke="#ff0000" stroke-width="3" rx="8"/>
                    <text x="1110" y="400" fill="#ff0000" font-size="14" font-weight="bold">❌ INTERDICTION</text>
                    <text x="1110" y="420" fill="#fff" font-size="12">JAMAIS entrer</text>
                    <text x="1110" y="435" fill="#fff" font-size="12">sans BOS/CHOCH</text>
                    <text x="1110" y="450" fill="#fff" font-size="12">clair et confirmé</text>
                    <text x="1110" y="480" fill="#fff" font-size="12">Attendre réaction</text>
                    <text x="1110" y="495" fill="#fff" font-size="12">RÉELLE du prix</text>
                    <text x="1110" y="510" fill="#ff0000" font-size="12" font-weight="bold">= Règle absolue</text>
                </svg>`
            },
            confluenceTiming: {
                title: "✅ 4. Confluence et Timing - Killzones",
                chart: `<svg width="100%" height="600" viewBox="0 0 1400 600" style="background: #1e1e1e; border-radius: 8px;">
                    <defs>
                        <pattern id="grid4" width="40" height="25" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#2a2a2a" stroke-width="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid4)" />
                    
                    <text x="700" y="30" fill="#17a2b8" font-size="20" text-anchor="middle" font-weight="bold">CONFLUENCE ET TIMING - KILLZONES + PD ARRAY</text>
                    
                    <!-- Killzones Timeline -->
                    <rect x="50" y="60" width="1300" height="120" fill="rgba(23,162,184,0.1)" stroke="#17a2b8" stroke-width="2" rx="10"/>
                    <text x="70" y="85" fill="#17a2b8" font-size="16" font-weight="bold">⏰ KILLZONES - Heures Optimales (Paris)</text>
                    
                    <!-- Timeline 24h -->
                    <line x1="100" y1="120" x2="1300" y2="120" stroke="#fff" stroke-width="2"/>
                    
                    <!-- Killzone Londres -->
                    <rect x="300" y="100" width="150" height="20" fill="rgba(76,175,80,0.8)" stroke="#4caf50" stroke-width="2"/>
                    <text x="310" y="95" fill="#4caf50" font-size="12" font-weight="bold">LONDRES 8h-11h</text>
                    
                    <!-- Killzone New York -->
                    <rect x="500" y="100" width="150" height="20" fill="rgba(255,193,7,0.8)" stroke="#ffc107" stroke-width="2"/>
                    <text x="510" y="95" fill="#ffc107" font-size="12" font-weight="bold">NEW YORK 14h-17h</text>
                    
                    <!-- Zone à éviter -->
                    <rect x="400" y="100" width="100" height="20" fill="rgba(255,107,107,0.3)" stroke="#ff6b6b" stroke-width="2" stroke-dasharray="3,3"/>
                    <text x="410" y="95" fill="#ff6b6b" font-size="12">❌ 12h-14h</text>
                    
                    <!-- PD Array Section -->
                    <rect x="50" y="200" width="650" height="180" fill="rgba(255,152,0,0.1)" stroke="#ff9800" stroke-width="2" rx="10"/>
                    <text x="70" y="225" fill="#ff9800" font-size="16" font-weight="bold">📊 PD ARRAY - Premium/Discount</text>
                    
                    <!-- Fibonacci PD -->
                    <line x1="100" y1="250" x2="600" y2="250" stroke="#ff6b6b" stroke-width="3"/>
                    <text x="610" y="255" fill="#ff6b6b" font-size="12" font-weight="bold">100% Premium</text>
                    
                    <line x1="100" y1="310" x2="600" y2="310" stroke="#ff9800" stroke-width="4"/>
                    <text x="610" y="315" fill="#ff9800" font-size="12" font-weight="bold">50% Équilibre</text>
                    
                    <line x1="100" y1="370" x2="600" y2="370" stroke="#4ecdc4" stroke-width="3"/>
                    <text x="610" y="375" fill="#4ecdc4" font-size="12" font-weight="bold">0% Discount</text>
                    
                    <!-- Zone Premium -->
                    <rect x="100" y="250" width="500" height="60" fill="rgba(255,107,107,0.2)" stroke="#ff6b6b" stroke-width="1" stroke-dasharray="3,3"/>
                    <text x="120" y="270" fill="#ff6b6b" font-size="14" font-weight="bold">PREMIUM (>50%)</text>
                    <text x="120" y="290" fill="#ff6b6b" font-size="12">✅ VENDRE seulement</text>
                    
                    <!-- Zone Discount -->
                    <rect x="100" y="310" width="500" height="60" fill="rgba(78,205,196,0.2)" stroke="#4ecdc4" stroke-width="1" stroke-dasharray="3,3"/>
                    <text x="120" y="330" fill="#4ecdc4" font-size="14" font-weight="bold">DISCOUNT (<50%)</text>
                    <text x="120" y="350" fill="#4ecdc4" font-size="12">✅ ACHETER seulement</text>
                    
                    <!-- Confluence Section -->
                    <rect x="750" y="200" width="600" height="180" fill="rgba(156,39,176,0.1)" stroke="#9c27b0" stroke-width="2" rx="10"/>
                    <text x="770" y="225" fill="#9c27b0" font-size="16" font-weight="bold">🔗 CONFLUENCE REQUISE</text>
                    
                    <!-- Checklist confluence -->
                    <rect x="780" y="240" width="250" height="120" fill="rgba(0,0,0,0.8)" stroke="#9c27b0" stroke-width="1" rx="5"/>
                    <text x="790" y="260" fill="#9c27b0" font-size="14" font-weight="bold">✅ CHECKLIST</text>
                    <text x="790" y="280" fill="#fff" font-size="12">• Killzone active</text>
                    <text x="790" y="295" fill="#fff" font-size="12">• PD Array respecté</text>
                    <text x="790" y="310" fill="#fff" font-size="12">• Zone institutionnelle</text>
                    <text x="790" y="325" fill="#fff" font-size="12">• Structure confirmée</text>
                    <text x="790" y="340" fill="#fff" font-size="12">• Signal d'entrée</text>
                    <text x="790" y="355" fill="#9c27b0" font-size="12" font-weight="bold">= TRADE VALIDE</text>
                    
                    <!-- Règles timing -->
                    <rect x="50" y="400" width="1300" height="170" fill="rgba(0,0,0,0.8)" stroke="#17a2b8" stroke-width="3" rx="15"/>
                    <text x="700" y="430" fill="#17a2b8" font-size="18" text-anchor="middle" font-weight="bold">⚠️ RÈGLES DE TIMING ET CONFLUENCE</text>
                    
                    <!-- Timing rules -->
                    <rect x="80" y="450" width="350" height="100" fill="rgba(23,162,184,0.1)" stroke="#17a2b8" stroke-width="2" rx="8"/>
                    <text x="90" y="470" fill="#17a2b8" font-size="14" font-weight="bold">⏰ TIMING OPTIMAL</text>
                    <text x="90" y="490" fill="#fff" font-size="12">• Londres: 8h-11h (Max volatilité)</text>
                    <text x="90" y="505" fill="#fff" font-size="12">• NY: 14h-17h (Overlap + News)</text>
                    <text x="90" y="520" fill="#fff" font-size="12">• Éviter: 12h-14h (Pause)</text>
                    <text x="90" y="535" fill="#17a2b8" font-size="12" font-weight="bold">✅ Exception: News majeures</text>
                    
                    <!-- PD Array rules -->
                    <rect x="470" y="450" width="350" height="100" fill="rgba(255,152,0,0.1)" stroke="#ff9800" stroke-width="2" rx="8"/>
                    <text x="480" y="470" fill="#ff9800" font-size="14" font-weight="bold">📊 PD ARRAY STRICT</text>
                    <text x="480" y="490" fill="#fff" font-size="12">• Achat: SEULEMENT Discount</text>
                    <text x="480" y="505" fill="#fff" font-size="12">• Vente: SEULEMENT Premium</text>
                    <text x="480" y="520" fill="#fff" font-size="12">• Fibonacci sur swing significatif</text>
                    <text x="480" y="535" fill="#ff9800" font-size="12" font-weight="bold">❌ Pas d'exception à cette règle</text>
                    
                    <!-- Confluence finale -->
                    <rect x="860" y="450" width="350" height="100" fill="rgba(156,39,176,0.1)" stroke="#9c27b0" stroke-width="2" rx="8"/>
                    <text x="870" y="470" fill="#9c27b0" font-size="14" font-weight="bold">🔗 CONFLUENCE FINALE</text>
                    <text x="870" y="490" fill="#fff" font-size="12">• Minimum 3 confirmations</text>
                    <text x="870" y="505" fill="#fff" font-size="12">• Killzone + PD + Zone + Structure</text>
                    <text x="870" y="520" fill="#fff" font-size="12">• Plus de confluences = Plus sûr</text>
                    <text x="870" y="535" fill="#9c27b0" font-size="12" font-weight="bold">✅ Qualité > Quantité</text>
                </svg>`
            },
            entreeExecution: {
                title: "✅ 5. Entrée et Exécution - Signaux Précis",
                chart: `<svg width="100%" height="600" viewBox="0 0 1400 600" style="background: #1e1e1e; border-radius: 8px;">
                    <defs>
                        <pattern id="grid5" width="40" height="25" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#2a2a2a" stroke-width="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid5)" />
                    
                    <text x="700" y="30" fill="#e91e63" font-size="20" text-anchor="middle" font-weight="bold">ENTRÉE ET EXÉCUTION - SIGNAUX PRÉCIS</text>
                    
                    <!-- Timeframes d'exécution -->
                    <rect x="50" y="60" width="400" height="120" fill="rgba(233,30,99,0.1)" stroke="#e91e63" stroke-width="2" rx="10"/>
                    <text x="70" y="85" fill="#e91e63" font-size="16" font-weight="bold">🎯 TIMEFRAMES EXÉCUTION</text>
                    <text x="70" y="110" fill="#fff" font-size="12">• M5/M1: Attendre retracement OB/FVG</text>
                    <text x="70" y="125" fill="#fff" font-size="12">• Confirmation: Mèche rejet + CHOCH petit TF</text>
                    <text x="70" y="140" fill="#fff" font-size="12">• Patience: Ne pas anticiper</text>
                    <text x="70" y="155" fill="#e91e63" font-size="12" font-weight="bold">✅ Attendre réaction RÉELLE</text>
                    
                    <!-- Types d'entrée -->
                    <rect x="500" y="60" width="400" height="120" fill="rgba(233,30,99,0.1)" stroke="#e91e63" stroke-width="2" rx="10"/>
                    <text x="520" y="85" fill="#e91e63" font-size="16" font-weight="bold">📍 TYPES D'ENTRÉE</text>
                    <text x="520" y="110" fill="#fff" font-size="12">• Limite: Dans zone OB/FVG identifiée</text>
                    <text x="520" y="125" fill="#fff" font-size="12">• Market: Sur confirmation rejet claire</text>
                    <text x="520" y="140" fill="#fff" font-size="12">• Stop Entry: Sur cassure confirmée</text>
                    <text x="520" y="155" fill="#e91e63" font-size="12" font-weight="bold">✅ Choisir selon setup</text>
                    
                    <!-- Signaux de confirmation -->
                    <rect x="950" y="60" width="400" height="120" fill="rgba(233,30,99,0.1)" stroke="#e91e63" stroke-width="2" rx="10"/>
                    <text x="970" y="85" fill="#e91e63" font-size="16" font-weight="bold">✅ SIGNAUX CONFIRMATION</text>
                    <text x="970" y="110" fill="#fff" font-size="12">• Pin Bar: Longue mèche + petit corps</text>
                    <text x="970" y="125" fill="#fff" font-size="12">• Doji: Indécision puis direction claire</text>
                    <text x="970" y="140" fill="#fff" font-size="12">• Engulfing: Englobe bougie précédente</text>
                    <text x="970" y="155" fill="#e91e63" font-size="12" font-weight="bold">• Volume: Augmentation requise</text>
                    
                    <!-- Exemples visuels -->
                    <rect x="50" y="200" width="1300" height="180" fill="rgba(0,0,0,0.8)" stroke="#e91e63" stroke-width="2" rx="10"/>
                    <text x="700" y="225" fill="#e91e63" font-size="16" text-anchor="middle" font-weight="bold">EXEMPLES VISUELS - SIGNAUX D'ENTRÉE</text>
                    
                    <!-- Pin Bar -->
                    <rect x="100" y="250" width="300" height="100" fill="rgba(233,30,99,0.1)" stroke="#e91e63" stroke-width="1" rx="5"/>
                    <text x="110" y="270" fill="#e91e63" font-size="14" font-weight="bold">PIN BAR</text>
                    <rect x="200" y="290" width="8" height="8" fill="#4ecdc4" stroke="#4ecdc4"/>
                    <line x1="204" y1="285" x2="204" y2="320" stroke="#4ecdc4" stroke-width="4"/>
                    <text x="110" y="290" fill="#fff" font-size="10">• Longue mèche</text>
                    <text x="110" y="305" fill="#fff" font-size="10">• Petit corps</text>
                    <text x="110" y="320" fill="#fff" font-size="10">• Rejet de zone</text>
                    <text x="110" y="335" fill="#4ecdc4" font-size="10" font-weight="bold">✅ Signal fort</text>
                    
                    <!-- Doji -->
                    <rect x="450" y="250" width="300" height="100" fill="rgba(233,30,99,0.1)" stroke="#e91e63" stroke-width="1" rx="5"/>
                    <text x="460" y="270" fill="#e91e63" font-size="14" font-weight="bold">DOJI</text>
                    <rect x="550" y="296" width="8" height="2" fill="#ffc107" stroke="#ffc107"/>
                    <line x1="554" y1="285" x2="554" y2="310" stroke="#ffc107" stroke-width="3"/>
                    <text x="460" y="290" fill="#fff" font-size="10">• Corps très petit</text>
                    <text x="460" y="305" fill="#fff" font-size="10">• Mèches égales</text>
                    <text x="460" y="320" fill="#fff" font-size="10">• Indécision</text>
                    <text x="460" y="335" fill="#ffc107" font-size="10" font-weight="bold">✅ Attendre direction</text>
                    
                    <!-- Engulfing -->
                    <rect x="800" y="250" width="300" height="100" fill="rgba(233,30,99,0.1)" stroke="#e91e63" stroke-width="1" rx="5"/>
                    <text x="810" y="270" fill="#e91e63" font-size="14" font-weight="bold">ENGULFING</text>
                    <rect x="900" y="295" width="6" height="15" fill="#ff6b6b" stroke="#ff6b6b"/>
                    <rect x="910" y="290" width="8" height="25" fill="#4ecdc4" stroke="#4ecdc4"/>
                    <text x="810" y="290" fill="#fff" font-size="10">• Englobe précédente</text>
                    <text x="810" y="305" fill="#fff" font-size="10">• Changement sentiment</text>
                    <text x="810" y="320" fill="#fff" font-size="10">• Volume élevé</text>
                    <text x="810" y="335" fill="#4ecdc4" font-size="10" font-weight="bold">✅ Signal puissant</text>
                    
                    <!-- Règles absolues -->
                    <rect x="50" y="400" width="1300" height="170" fill="rgba(255,0,0,0.1)" stroke="#ff0000" stroke-width="3" rx="15"/>
                    <text x="700" y="430" fill="#ff0000" font-size="18" text-anchor="middle" font-weight="bold">⚠️ RÈGLES ABSOLUES EXÉCUTION</text>
                    
                    <!-- Interdictions -->
                    <rect x="80" y="450" width="350" height="100" fill="rgba(255,0,0,0.2)" stroke="#ff0000" stroke-width="2" rx="8"/>
                    <text x="90" y="470" fill="#ff0000" font-size="14" font-weight="bold">❌ INTERDICTIONS</text>
                    <text x="90" y="490" fill="#fff" font-size="12">• NE PAS anticiper le mouvement</text>
                    <text x="90" y="505" fill="#fff" font-size="12">• NE PAS entrer sans signal</text>
                    <text x="90" y="520" fill="#fff" font-size="12">• NE PAS forcer l'entrée</text>
                    <text x="90" y="535" fill="#ff0000" font-size="12" font-weight="bold">❌ Patience = Clé du succès</text>
                    
                    <!-- Confirmations requises -->
                    <rect x="470" y="450" width="350" height="100" fill="rgba(76,175,80,0.2)" stroke="#4caf50" stroke-width="2" rx="8"/>
                    <text x="480" y="470" fill="#4caf50" font-size="14" font-weight="bold">✅ CONFIRMATIONS</text>
                    <text x="480" y="490" fill="#fff" font-size="12">• Signal de rejet dans zone</text>
                    <text x="480" y="505" fill="#fff" font-size="12">• CHOCH sur petit timeframe</text>
                    <text x="480" y="520" fill="#fff" font-size="12">• Volume de confirmation</text>
                    <text x="480" y="535" fill="#4caf50" font-size="12" font-weight="bold">✅ Toutes confirmations = GO</text>
                    
                    <!-- Timing exécution -->
                    <rect x="860" y="450" width="350" height="100" fill="rgba(156,39,176,0.2)" stroke="#9c27b0" stroke-width="2" rx="8"/>
                    <text x="870" y="470" fill="#9c27b0" font-size="14" font-weight="bold">⏱️ TIMING EXÉCUTION</text>
                    <text x="870" y="490" fill="#fff" font-size="12">• M5: Identification signal</text>
                    <text x="870" y="505" fill="#fff" font-size="12">• M1: Confirmation finale</text>
                    <text x="870" y="520" fill="#fff" font-size="12">• Exécution immédiate</text>
                    <text x="870" y="535" fill="#9c27b0" font-size="12" font-weight="bold">✅ Rapidité + Précision</text>
                </svg>`
            },
            riskManagement: {
                title: "✅ 6. Risk Management - Calculs Optimaux",
                chart: `<svg width="100%" height="600" viewBox="0 0 1400 600" style="background: #1e1e1e; border-radius: 8px;">
                    <defs>
                        <pattern id="grid6" width="40" height="25" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#2a2a2a" stroke-width="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid6)" />
                    
                    <text x="700" y="30" fill="#ff5722" font-size="20" text-anchor="middle" font-weight="bold">RISK MANAGEMENT - PROTECTION DU CAPITAL</text>
                    
                    <!-- Stop Loss Section -->
                    <rect x="50" y="60" width="400" height="160" fill="rgba(255,87,34,0.1)" stroke="#ff5722" stroke-width="2" rx="10"/>
                    <text x="70" y="85" fill="#ff5722" font-size="16" font-weight="bold">🛡️ STOP LOSS (Invalidation)</text>
                    <text x="70" y="110" fill="#fff" font-size="12">• OB/FVG: Juste après zone (5-10 pips)</text>
                    <text x="70" y="125" fill="#fff" font-size="12">• Structure: Sous/sur niveau cassé</text>
                    <text x="70" y="140" fill="#fff" font-size="12">• Psychologique: Sous niveau 00/50</text>
                    <text x="70" y="155" fill="#fff" font-size="12">• ATR: Basé sur volatilité moyenne</text>
                    <text x="70" y="170" fill="#ff5722" font-size="12" font-weight="bold">❌ JAMAIS déplacer SL contre soi</text>
                    <text x="70" y="185" fill="#ff5722" font-size="12" font-weight="bold">✅ SL = Niveau d'invalidation</text>
                    <text x="70" y="200" fill="#fff" font-size="12">Exemple: OB à 1.0850, SL à 1.0840</text>
                    
                    <!-- Take Profit Section -->
                    <rect x="500" y="60" width="400" height="160" fill="rgba(76,175,80,0.1)" stroke="#4caf50" stroke-width="2" rx="10"/>
                    <text x="520" y="85" fill="#4caf50" font-size="16" font-weight="bold">🎯 TAKE PROFIT (Liquidité)</text>
                    <text x="520" y="110" fill="#fff" font-size="12">• Niveau 1: Prochain OB opposé</text>
                    <text x="520" y="125" fill="#fff" font-size="12">• Niveau 2: Sommet/Creux précédent</text>
                    <text x="520" y="140" fill="#fff" font-size="12">• Niveau 3: Extension Fib 127-161%</text>
                    <text x="520" y="155" fill="#fff" font-size="12">• Partiel: Sécuriser 50% au niveau 1</text>
                    <text x="520" y="170" fill="#4caf50" font-size="12" font-weight="bold">✅ Zones de liquidité = Targets</text>
                    <text x="520" y="185" fill="#4caf50" font-size="12" font-weight="bold">✅ Gestion partielle recommandée</text>
                    <text x="520" y="200" fill="#fff" font-size="12">Exemple: TP1 à 1.0900, TP2 à 1.0950</text>
                    
                    <!-- Calcul Risque Section -->
                    <rect x="950" y="60" width="400" height="160" fill="rgba(255,193,7,0.1)" stroke="#ffc107" stroke-width="2" rx="10"/>
                    <text x="970" y="85" fill="#ffc107" font-size="16" font-weight="bold">💰 CALCUL DU RISQUE</text>
                    <text x="970" y="110" fill="#fff" font-size="12">• Capital: Maximum 1% par trade</text>
                    <text x="970" y="125" fill="#fff" font-size="12">• Ratio R:R: Minimum 1:2 (idéal 1:3+)</text>
                    <text x="970" y="140" fill="#fff" font-size="12">• Lot Size: Calculé automatiquement</text>
                    <text x="970" y="155" fill="#fff" font-size="12">• Risque = Distance SL x Lot x Pip Value</text>
                    <text x="970" y="170" fill="#ffc107" font-size="12" font-weight="bold">✅ Formule: Risque% x Capital / SL pips</text>
                    <text x="970" y="185" fill="#ffc107" font-size="12" font-weight="bold">❌ Si R:R < 1:2 → PAS de trade</text>
                    <text x="970" y="200" fill="#fff" font-size="12">Exemple: 1% de $10000 = $100 max</text>
                    
                    <!-- Exemple calcul visuel -->
                    <rect x="50" y="240" width="1300" height="140" fill="rgba(0,0,0,0.8)" stroke="#ffc107" stroke-width="2" rx="10"/>
                    <text x="700" y="265" fill="#ffc107" font-size="16" text-anchor="middle" font-weight="bold">EXEMPLE CALCUL COMPLET - EUR/USD</text>
                    
                    <!-- Données trade -->
                    <rect x="80" y="280" width="250" height="80" fill="rgba(255,193,7,0.1)" stroke="#ffc107" stroke-width="1" rx="5"/>
                    <text x="90" y="300" fill="#ffc107" font-size="12" font-weight="bold">DONNÉES TRADE</text>
                    <text x="90" y="315" fill="#fff" font-size="11">• Capital: $10,000</text>
                    <text x="90" y="330" fill="#fff" font-size="11">• Risque: 1% = $100</text>
                    <text x="90" y="345" fill="#fff" font-size="11">• Entrée: 1.0850</text>
                    <text x="90" y="360" fill="#fff" font-size="11">• Stop Loss: 1.0840 (10 pips)</text>
                    
                    <!-- Calcul lot -->
                    <rect x="370" y="280" width="250" height="80" fill="rgba(255,87,34,0.1)" stroke="#ff5722" stroke-width="1" rx="5"/>
                    <text x="380" y="300" fill="#ff5722" font-size="12" font-weight="bold">CALCUL LOT SIZE</text>
                    <text x="380" y="315" fill="#fff" font-size="11">• Distance SL: 10 pips</text>
                    <text x="380" y="330" fill="#fff" font-size="11">• Pip Value: $10/pip (1 lot)</text>
                    <text x="380" y="345" fill="#fff" font-size="11">• Formule: $100 / (10 x $10)</text>
                    <text x="380" y="360" fill="#ff5722" font-size="11" font-weight="bold">✅ Lot Size: 1.0 lot</text>
                    
                    <!-- Take Profit calcul -->
                    <rect x="660" y="280" width="250" height="80" fill="rgba(76,175,80,0.1)" stroke="#4caf50" stroke-width="1" rx="5"/>
                    <text x="670" y="300" fill="#4caf50" font-size="12" font-weight="bold">TAKE PROFIT</text>
                    <text x="670" y="315" fill="#fff" font-size="11">• TP1: 1.0870 (20 pips)</text>
                    <text x="670" y="330" fill="#fff" font-size="11">• Gain: 20 x $10 x 1 = $200</text>
                    <text x="670" y="345" fill="#fff" font-size="11">• R:R = $200/$100 = 1:2</text>
                    <text x="670" y="360" fill="#4caf50" font-size="11" font-weight="bold">✅ Trade VALIDE</text>
                    
                    <!-- Résultat final -->
                    <rect x="950" y="280" width="250" height="80" fill="rgba(156,39,176,0.1)" stroke="#9c27b0" stroke-width="1" rx="5"/>
                    <text x="960" y="300" fill="#9c27b0" font-size="12" font-weight="bold">RÉSULTAT</text>
                    <text x="960" y="315" fill="#fff" font-size="11">• Risque: $100 (1%)</text>
                    <text x="960" y="330" fill="#fff" font-size="11">• Gain potentiel: $200</text>
                    <text x="960" y="345" fill="#fff" font-size="11">• Ratio: 1:2 (✅ Acceptable)</text>
                    <text x="960" y="360" fill="#9c27b0" font-size="11" font-weight="bold">✅ EXÉCUTER LE TRADE</text>
                    
                    <!-- Règles absolues -->
                    <rect x="50" y="400" width="1300" height="170" fill="rgba(255,0,0,0.1)" stroke="#ff0000" stroke-width="3" rx="15"/>
                    <text x="700" y="430" fill="#ff0000" font-size="18" text-anchor="middle" font-weight="bold">⚠️ RÈGLES ABSOLUES RISK MANAGEMENT</text>
                    
                    <!-- Règle 1% -->
                    <rect x="80" y="450" width="300" height="100" fill="rgba(255,0,0,0.2)" stroke="#ff0000" stroke-width="2" rx="8"/>
                    <text x="90" y="470" fill="#ff0000" font-size="14" font-weight="bold">💰 RÈGLE 1%</text>
                    <text x="90" y="490" fill="#fff" font-size="12">• JAMAIS risquer plus de 1%</text>
                    <text x="90" y="505" fill="#fff" font-size="12">• Capital $10k = Max $100/trade</text>
                    <text x="90" y="520" fill="#fff" font-size="12">• Permet 100 trades perdants</text>
                    <text x="90" y="535" fill="#ff0000" font-size="12" font-weight="bold">❌ Pas d'exception à cette règle</text>
                    
                    <!-- Règle R:R -->
                    <rect x="420" y="450" width="300" height="100" fill="rgba(255,152,0,0.2)" stroke="#ff9800" stroke-width="2" rx="8"/>
                    <text x="430" y="470" fill="#ff9800" font-size="14" font-weight="bold">🎯 RÈGLE R:R</text>
                    <text x="430" y="490" fill="#fff" font-size="12">• Minimum 1:2 (idéal 1:3+)</text>
                    <text x="430" y="505" fill="#fff" font-size="12">• Si R:R < 1:2 → PAS de trade</text>
                    <text x="430" y="520" fill="#fff" font-size="12">• Permet d'être rentable à 40%</text>
                    <text x="430" y="535" fill="#ff9800" font-size="12" font-weight="bold">✅ Qualité > Quantité</text>
                    
                    <!-- Règle discipline -->
                    <rect x="760" y="450" width="300" height="100" fill="rgba(76,175,80,0.2)" stroke="#4caf50" stroke-width="2" rx="8"/>
                    <text x="770" y="470" fill="#4caf50" font-size="14" font-weight="bold">🧠 DISCIPLINE</text>
                    <text x="770" y="490" fill="#fff" font-size="12">• Respecter le plan initial</text>
                    <text x="770" y="505" fill="#fff" font-size="12">• Ne pas modifier SL/TP</text>
                    <text x="770" y="520" fill="#fff" font-size="12">• Accepter les pertes</text>
                    <text x="770" y="535" fill="#4caf50" font-size="12" font-weight="bold">✅ Plan > Émotions</text>
                    
                    <!-- Gestion partielle -->
                    <rect x="1100" y="450" width="220" height="100" fill="rgba(156,39,176,0.2)" stroke="#9c27b0" stroke-width="2" rx="8"/>
                    <text x="1110" y="470" fill="#9c27b0" font-size="14" font-weight="bold">🎯 PARTIEL</text>
                    <text x="1110" y="490" fill="#fff" font-size="12">• 50% au TP1</text>
                    <text x="1110" y="505" fill="#fff" font-size="12">• SL au BE</text>
                    <text x="1110" y="520" fill="#fff" font-size="12">• 50% au TP2</text>
                    <text x="1110" y="535" fill="#9c27b0" font-size="12" font-weight="bold">✅ Sécurise gains</text>
                </svg>`
            },
            disciplineJournal: {
                title: "✅ 7. Discipline et Journal - Méthodes de Suivi",
                chart: `<svg width="100%" height="600" viewBox="0 0 1400 600" style="background: #1e1e1e; border-radius: 8px;">
                    <defs>
                        <pattern id="grid7" width="40" height="25" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#2a2a2a" stroke-width="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid7)" />
                    
                    <text x="700" y="30" fill="#673ab7" font-size="20" text-anchor="middle" font-weight="bold">DISCIPLINE ET JOURNAL - CLÉ DU SUCCÈS</text>
                    
                    <!-- Discipline mentale -->
                    <rect x="50" y="60" width="650" height="160" fill="rgba(103,58,183,0.1)" stroke="#673ab7" stroke-width="2" rx="10"/>
                    <text x="70" y="85" fill="#673ab7" font-size="16" font-weight="bold">🧠 DISCIPLINE MENTALE</text>
                    
                    <!-- FOMO -->
                    <rect x="80" y="100" width="140" height="100" fill="rgba(255,87,34,0.2)" stroke="#ff5722" stroke-width="1" rx="5"/>
                    <text x="90" y="120" fill="#ff5722" font-size="12" font-weight="bold">❌ FOMO</text>
                    <text x="90" y="135" fill="#fff" font-size="10">Peur de rater</text>
                    <text x="90" y="150" fill="#fff" font-size="10">Entrées précipitées</text>
                    <text x="90" y="165" fill="#fff" font-size="10">Trades forcés</text>
                    <text x="90" y="180" fill="#ff5722" font-size="10" font-weight="bold">= Pertes assurées</text>
                    
                    <!-- Vengeance -->
                    <rect x="240" y="100" width="140" height="100" fill="rgba(255,87,34,0.2)" stroke="#ff5722" stroke-width="1" rx="5"/>
                    <text x="250" y="120" fill="#ff5722" font-size="12" font-weight="bold">❌ VENGEANCE</text>
                    <text x="250" y="135" fill="#fff" font-size="10">Rattraper pertes</text>
                    <text x="250" y="150" fill="#fff" font-size="10">Lots surdimensionnés</text>
                    <text x="250" y="165" fill="#fff" font-size="10">Risques excessifs</text>
                    <text x="250" y="180" fill="#ff5722" font-size="10" font-weight="bold">= Compte explosé</text>
                    
                    <!-- Overtrading -->
                    <rect x="400" y="100" width="140" height="100" fill="rgba(255,87,34,0.2)" stroke="#ff5722" stroke-width="1" rx="5"/>
                    <text x="410" y="120" fill="#ff5722" font-size="12" font-weight="bold">❌ OVERTRADING</text>
                    <text x="410" y="135" fill="#fff" font-size="10">Trop de trades</text>
                    <text x="410" y="150" fill="#fff" font-size="10">Qualité dégradée</text>
                    <text x="410" y="165" fill="#fff" font-size="10">Fatigue mentale</text>
                    <text x="410" y="180" fill="#ff5722" font-size="10" font-weight="bold">= Erreurs multiples</text>
                    
                    <!-- Patience -->
                    <rect x="560" y="100" width="120" height="100" fill="rgba(76,175,80,0.2)" stroke="#4caf50" stroke-width="2" rx="5"/>
                    <text x="570" y="120" fill="#4caf50" font-size="12" font-weight="bold">✅ PATIENCE</text>
                    <text x="570" y="135" fill="#fff" font-size="10">Attendre setups</text>
                    <text x="570" y="150" fill="#fff" font-size="10">1-3 trades/jour max</text>
                    <text x="570" y="165" fill="#fff" font-size="10">Qualité > Quantité</text>
                    <text x="570" y="180" fill="#4caf50" font-size="10" font-weight="bold">= Profits réguliers</text>
                    
                    <!-- Journal de trading -->
                    <rect x="750" y="60" width="600" height="160" fill="rgba(103,58,183,0.1)" stroke="#673ab7" stroke-width="2" rx="10"/>
                    <text x="770" y="85" fill="#673ab7" font-size="16" font-weight="bold">📝 JOURNAL DE TRADING</text>
                    
                    <!-- Screenshot -->
                    <rect x="780" y="100" width="130" height="100" fill="rgba(33,150,243,0.2)" stroke="#2196f3" stroke-width="1" rx="5"/>
                    <text x="790" y="120" fill="#2196f3" font-size="12" font-weight="bold">📷 SCREENSHOT</text>
                    <text x="790" y="135" fill="#fff" font-size="10">Avant trade</text>
                    <text x="790" y="150" fill="#fff" font-size="10">Après clôture</text>
                    <text x="790" y="165" fill="#fff" font-size="10">Toutes confluences</text>
                    <text x="790" y="180" fill="#2196f3" font-size="10" font-weight="bold">= Preuve visuelle</text>
                    
                    <!-- Setup -->
                    <rect x="930" y="100" width="130" height="100" fill="rgba(255,193,7,0.2)" stroke="#ffc107" stroke-width="1" rx="5"/>
                    <text x="940" y="120" fill="#ffc107" font-size="12" font-weight="bold">📊 SETUP</text>
                    <text x="940" y="135" fill="#fff" font-size="10">Toutes confluences</text>
                    <text x="940" y="150" fill="#fff" font-size="10">Timeframes utilisés</text>
                    <text x="940" y="165" fill="#fff" font-size="10">Signaux d'entrée</text>
                    <text x="940" y="180" fill="#ffc107" font-size="10" font-weight="bold">= Analyse complète</text>
                    
                    <!-- Émotions -->
                    <rect x="1080" y="100" width="130" height="100" fill="rgba(156,39,176,0.2)" stroke="#9c27b0" stroke-width="1" rx="5"/>
                    <text x="1090" y="120" fill="#9c27b0" font-size="12" font-weight="bold">😊 ÉMOTIONS</text>
                    <text x="1090" y="135" fill="#fff" font-size="10">État mental</text>
                    <text x="1090" y="150" fill="#fff" font-size="10">Stress/Confiance</text>
                    <text x="1090" y="165" fill="#fff" font-size="10">Facteurs externes</text>
                    <text x="1090" y="180" fill="#9c27b0" font-size="10" font-weight="bold">= Patterns émotionnels</text>
                    
                    <!-- Analyse performance -->
                    <rect x="50" y="240" width="1300" height="140" fill="rgba(0,0,0,0.8)" stroke="#673ab7" stroke-width="2" rx="10"/>
                    <text x="700" y="265" fill="#673ab7" font-size="16" text-anchor="middle" font-weight="bold">ANALYSE PERFORMANCE - MÉTHODE STRUCTURÉE</text>
                    
                    <!-- Hebdomadaire -->
                    <rect x="80" y="280" width="250" height="80" fill="rgba(103,58,183,0.1)" stroke="#673ab7" stroke-width="1" rx="5"/>
                    <text x="90" y="300" fill="#673ab7" font-size="12" font-weight="bold">📅 HEBDOMADAIRE</text>
                    <text x="90" y="315" fill="#fff" font-size="11">• Revoir tous les trades</text>
                    <text x="90" y="330" fill="#fff" font-size="11">• Calculer winrate/R:R moyen</text>
                    <text x="90" y="345" fill="#fff" font-size="11">• Identifier erreurs récurrentes</text>
                    <text x="90" y="360" fill="#673ab7" font-size="11" font-weight="bold">✅ Bilan objectif</text>
                    
                    <!-- Patterns -->
                    <rect x="370" y="280" width="250" height="80" fill="rgba(33,150,243,0.1)" stroke="#2196f3" stroke-width="1" rx="5"/>
                    <text x="380" y="300" fill="#2196f3" font-size="12" font-weight="bold">🔍 PATTERNS</text>
                    <text x="380" y="315" fill="#fff" font-size="11">• Setups les plus rentables</text>
                    <text x="380" y="330" fill="#fff" font-size="11">• Erreurs à éviter</text>
                    <text x="380" y="345" fill="#fff" font-size="11">• Heures optimales</text>
                    <text x="380" y="360" fill="#2196f3" font-size="11" font-weight="bold">✅ Forces/Faiblesses</text>
                    
                    <!-- Amélioration -->
                    <rect x="660" y="280" width="250" height="80" fill="rgba(76,175,80,0.1)" stroke="#4caf50" stroke-width="1" rx="5"/>
                    <text x="670" y="300" fill="#4caf50" font-size="12" font-weight="bold">📈 AMÉLIORATION</text>
                    <text x="670" y="315" fill="#fff" font-size="11">• Ajuster la stratégie</text>
                    <text x="670" y="330" fill="#fff" font-size="11">• Corriger les faiblesses</text>
                    <text x="670" y="345" fill="#fff" font-size="11">• Renforcer les forces</text>
                    <text x="670" y="360" fill="#4caf50" font-size="11" font-weight="bold">✅ Évolution continue</text>
                    
                    <!-- Objectifs -->
                    <rect x="950" y="280" width="250" height="80" fill="rgba(255,193,7,0.1)" stroke="#ffc107" stroke-width="1" rx="5"/>
                    <text x="960" y="300" fill="#ffc107" font-size="12" font-weight="bold">🎯 OBJECTIFS</text>
                    <text x="960" y="315" fill="#fff" font-size="11">• Winrate cible: 60%+</text>
                    <text x="960" y="330" fill="#fff" font-size="11">• R:R moyen: 1:2.5+</text>
                    <text x="960" y="345" fill="#fff" font-size="11">• Drawdown max: 5%</text>
                    <text x="960" y="360" fill="#ffc107" font-size="11" font-weight="bold">✅ Mesurables/Réalistes</text>
                    
                    <!-- Règle suprême -->
                    <rect x="50" y="400" width="1300" height="170" fill="rgba(255,215,0,0.1)" stroke="#ffd700" stroke-width="4" rx="15"/>
                    <text x="700" y="430" fill="#ffd700" font-size="20" text-anchor="middle" font-weight="bold">🏆 RÈGLE SUPRÊME</text>
                    
                    <!-- Plan > Gains -->
                    <rect x="100" y="450" width="350" height="100" fill="rgba(255,215,0,0.2)" stroke="#ffd700" stroke-width="3" rx="10"/>
                    <text x="120" y="475" fill="#ffd700" font-size="16" text-anchor="middle" font-weight="bold">SUIVRE LE PLAN</text>
                    <text x="120" y="495" fill="#fff" font-size="14">Plus important que</text>
                    <text x="120" y="515" fill="#fff" font-size="14">GAGNER le trade</text>
                    <text x="120" y="535" fill="#ffd700" font-size="12" font-weight="bold">✅ Cohérence = Profits long terme</text>
                    
                    <!-- Accepter pertes -->
                    <rect x="500" y="450" width="350" height="100" fill="rgba(255,215,0,0.2)" stroke="#ffd700" stroke-width="3" rx="10"/>
                    <text x="520" y="475" fill="#ffd700" font-size="16" text-anchor="middle" font-weight="bold">ACCEPTER LES PERTES</text>
                    <text x="520" y="495" fill="#fff" font-size="14">Sans modifier le plan</text>
                    <text x="520" y="515" fill="#fff" font-size="14">Partie du jeu</text>
                    <text x="520" y="535" fill="#ffd700" font-size="12" font-weight="bold">✅ Discipline = Succès garanti</text>
                    
                    <!-- Cohérence -->
                    <rect x="900" y="450" width="350" height="100" fill="rgba(255,215,0,0.2)" stroke="#ffd700" stroke-width="3" rx="10"/>
                    <text x="920" y="475" fill="#ffd700" font-size="16" text-anchor="middle" font-weight="bold">COHÉRENCE</text>
                    <text x="920" y="495" fill="#fff" font-size="14">Plus importante que</text>
                    <text x="920" y="515" fill="#fff" font-size="14">Performance court terme</text>
                    <text x="920" y="535" fill="#ffd700" font-size="12" font-weight="bold">✅ Régularité = Richesse</text>
                </svg>`
                    
                    <!-- Fibonacci -->
                    <line x1="200" y1="300" x2="800" y2="300" stroke="#ff9800" stroke-width="1" opacity="0.7"/>
                    <text x="810" y="305" fill="#ff9800" font-size="12">0%</text>
                    <line x1="200" y1="260" x2="800" y2="260" stroke="#ff9800" stroke-width="1" opacity="0.7"/>
                    <text x="810" y="265" fill="#ff9800" font-size="12">38.2%</text>
                    <line x1="200" y1="230" x2="800" y2="230" stroke="#ff9800" stroke-width="3"/>
                    <text x="810" y="235" fill="#ff9800" font-size="12">50%</text>
                    <line x1="200" y1="200" x2="800" y2="200" stroke="#ff9800" stroke-width="1" opacity="0.7"/>
                    <text x="810" y="205" fill="#ff9800" font-size="12">61.8%</text>
                    <line x1="200" y1="150" x2="800" y2="150" stroke="#ff9800" stroke-width="1" opacity="0.7"/>
                    <text x="810" y="155" fill="#ff9800" font-size="12">100%</text>
                    
                    <!-- Impulsion -->
                    <rect x="200" y="250" width="12" height="50" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="230" y="230" width="12" height="60" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="260" y="200" width="12" height="70" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="290" y="170" width="12" height="80" fill="#00ff88" stroke="#00cc66"/>
                    <text x="200" y="330" fill="#00ff88" font-size="14">IMPULSION</text>
                    
                    <!-- Pullback -->
                    <rect x="400" y="180" width="12" height="40" fill="#ff4757" stroke="#ff3742"/>
                    <rect x="430" y="200" width="12" height="35" fill="#ff4757" stroke="#ff3742"/>
                    <rect x="460" y="215" width="12" height="30" fill="#ff4757" stroke="#ff3742"/>
                    <text x="400" y="270" fill="#ff4757" font-size="14">PULLBACK 50%</text>
                    
                    <!-- Pin Bar -->
                    <rect x="550" y="225" width="12" height="10" fill="#00ff88" stroke="#00cc66"/>
                    <line x1="556" y1="220" x2="556" y2="260" stroke="#00cc66" stroke-width="4"/>
                    <text x="530" y="280" fill="#00ff88" font-size="14">PIN BAR</text>
                    
                    <!-- EMA 50 -->
                    <path d="M 100 240 Q 300 235 500 230 T 900 225" stroke="#9c27b0" stroke-width="2" fill="none"/>
                    <text x="750" y="220" fill="#9c27b0" font-size="12">EMA 50</text>
                    
                    <!-- Zone de confluence -->
                    <ellipse cx="556" cy="230" rx="80" ry="20" fill="rgba(0,255,136,0.2)" stroke="#00ff88" stroke-width="2" stroke-dasharray="3,3"/>
                    <text x="500" y="210" fill="#00ff88" font-size="12">CONFLUENCE</text>
                    
                    <!-- Entrée -->
                    <defs>
                        <marker id="entryArrow" markerWidth="15" markerHeight="10" refX="14" refY="5" orient="auto">
                            <polygon points="0 0, 15 5, 0 10" fill="#00ff88" />
                        </marker>
                    </defs>
                    <path d="M 580 230 L 620 200" stroke="#00ff88" stroke-width="3" marker-end="url(#entryArrow)"/>
                    <text x="625" y="195" fill="#00ff88" font-size="14">ENTRÉE</text>
                    
                    <!-- Légende -->
                    <rect x="50" y="50" width="280" height="120" fill="rgba(0,0,0,0.8)" stroke="#555" rx="5"/>
                    <text x="60" y="70" fill="#fff" font-size="14">Pullback Strategy (80% WR) :</text>
                    <text x="60" y="90" fill="#00ff88" font-size="12">• Impulsion dans la tendance</text>
                    <text x="60" y="105" fill="#ff9800" font-size="12">• Fibonacci 38.2-61.8%</text>
                    <text x="60" y="120" fill="#9c27b0" font-size="12">• Confluence avec EMA 50</text>
                    <text x="60" y="135" fill="#00ff88" font-size="12">• Signal de rejet (Pin Bar)</text>
                    <text x="60" y="150" fill="#fff" font-size="12">• R:R minimum 1:2</text>
                </svg>`
            },
            asianSession: {
                title: "London Breakout Strategy",
                chart: `<svg width="100%" height="400" viewBox="0 0 1000 400" style="background: #1e1e1e; border-radius: 8px;">
                    <rect width="100%" height="100%" fill="url(#tvGrid)" />
                    
                    <!-- Sessions -->
                    <rect x="100" y="50" width="200" height="20" fill="rgba(255,193,7,0.3)" stroke="#ffc107"/>
                    <text x="110" y="45" fill="#ffc107" font-size="12">SESSION ASIATIQUE (00h-08h GMT)</text>
                    <rect x="300" y="50" width="150" height="20" fill="rgba(0,255,136,0.3)" stroke="#00ff88"/>
                    <text x="310" y="45" fill="#00ff88" font-size="12">LONDRES (08h-10h GMT)</text>
                    
                    <!-- Range Asiatique -->
                    <line x1="150" y1="180" x2="250" y2="180" stroke="#ffc107" stroke-width="3"/>
                    <text x="260" y="185" fill="#ffc107" font-size="12">Résistance 1.2650</text>
                    <line x1="150" y1="250" x2="250" y2="250" stroke="#ffc107" stroke-width="3"/>
                    <text x="260" y="255" fill="#ffc107" font-size="12">Support 1.2620</text>
                    
                    <!-- Bougies Range -->
                    <rect x="160" y="200" width="8" height="30" fill="#555" stroke="#777"/>
                    <rect x="180" y="210" width="8" height="25" fill="#555" stroke="#777"/>
                    <rect x="200" y="205" width="8" height="28" fill="#555" stroke="#777"/>
                    <rect x="220" y="215" width="8" height="20" fill="#555" stroke="#777"/>
                    <text x="160" y="280" fill="#ffc107" font-size="12">CONSOLIDATION</text>
                    
                    <!-- Breakout -->
                    <rect x="320" y="160" width="12" height="40" fill="#00ff88" stroke="#00cc66"/>
                    <line x1="326" y1="150" x2="326" y2="210" stroke="#00cc66" stroke-width="3"/>
                    <text x="300" y="140" fill="#00ff88" font-size="14">BREAKOUT</text>
                    
                    <!-- Volume -->
                    <rect x="300" y="320" width="15" height="30" fill="#17a2b8"/>
                    <rect x="320" y="300" width="15" height="50" fill="#17a2b8"/>
                    <rect x="340" y="290" width="15" height="60" fill="#17a2b8"/>
                    <text x="300" y="380" fill="#17a2b8" font-size="12">Volume Londres</text>
                    
                    <!-- Retest -->
                    <rect x="380" y="170" width="10" height="20" fill="#ff4757" stroke="#ff3742"/>
                    <line x1="385" y1="165" x2="385" y2="195" stroke="#ff3742" stroke-width="2"/>
                    <text x="360" y="210" fill="#ff4757" font-size="12">Retest</text>
                    
                    <!-- Continuation -->
                    <rect x="420" y="140" width="12" height="50" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="450" y="120" width="12" height="60" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="480" y="110" width="12" height="70" fill="#00ff88" stroke="#00cc66"/>
                    <text x="420" y="220" fill="#00ff88" font-size="14">CONTINUATION</text>
                    
                    <!-- Target -->
                    <line x1="500" y1="110" x2="600" y2="110" stroke="#00ff88" stroke-width="2" stroke-dasharray="5,5"/>
                    <text x="520" y="105" fill="#00ff88" font-size="12">TARGET (Taille du range)</text>
                    
                    <!-- Légende -->
                    <rect x="650" y="100" width="300" height="140" fill="rgba(0,0,0,0.8)" stroke="#555" rx="5"/>
                    <text x="660" y="120" fill="#fff" font-size="14">London Breakout (70% WR) :</text>
                    <text x="660" y="140" fill="#ffc107" font-size="12">• Range asiatique min 20 pips</text>
                    <text x="660" y="155" fill="#00ff88" font-size="12">• Breakout avec volume</text>
                    <text x="660" y="170" fill="#17a2b8" font-size="12">• Confirmation 15min</text>
                    <text x="660" y="185" fill="#ff4757" font-size="12">• Retest de la zone</text>
                    <text x="660" y="200" fill="#00ff88" font-size="12">• Target = taille du range</text>
                    <text x="660" y="215" fill="#fff" font-size="12">• Stop = milieu du range</text>
                    <text x="660" y="230" fill="#dc3545" font-size="12">• Éviter les jours de news</text>
                </svg>`
            },
            orderBlocks: {
                title: "Order Block ICT Strategy",
                chart: `<svg width="100%" height="400" viewBox="0 0 1000 400" style="background: #1e1e1e; border-radius: 8px;">
                    <rect width="100%" height="100%" fill="url(#tvGrid)" />
                    
                    <!-- Order Block -->
                    <rect x="200" y="150" width="80" height="30" fill="rgba(255,193,7,0.4)" stroke="#ffc107" stroke-width="3"/>
                    <text x="210" y="140" fill="#ffc107" font-size="14">ORDER BLOCK H4</text>
                    <text x="210" y="200" fill="#ffc107" font-size="12">1.0945 - 1.0955</text>
                    
                    <!-- Bougie OB -->
                    <rect x="230" y="155" width="12" height="20" fill="#00ff88" stroke="#00cc66"/>
                    <line x1="236" y1="150" x2="236" y2="180" stroke="#00cc66" stroke-width="2"/>
                    <text x="200" y="220" fill="#00ff88" font-size="10">Dernière bougie haussière</text>
                    
                    <!-- Impulsion -->
                    <rect x="320" y="180" width="12" height="60" fill="#ff4757" stroke="#ff3742"/>
                    <line x1="326" y1="170" x2="326" y2="250" stroke="#ff3742" stroke-width="3"/>
                    <rect x="350" y="210" width="12" height="70" fill="#ff4757" stroke="#ff3742"/>
                    <line x1="356" y1="200" x2="356" y2="290" stroke="#ff3742" stroke-width="3"/>
                    <rect x="380" y="240" width="12" height="60" fill="#ff4757" stroke="#ff3742"/>
                    <line x1="386" y1="230" x2="386" y2="310" stroke="#ff3742" stroke-width="3"/>
                    <text x="320" y="330" fill="#ff4757" font-size="14">IMPULSION BAISSIÈRE</text>
                    
                    <!-- Retour -->
                    <rect x="500" y="280" width="10" height="40" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="520" y="260" width="10" height="50" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="540" y="240" width="10" height="60" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="560" y="220" width="10" height="70" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="580" y="200" width="10" height="80" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="600" y="180" width="10" height="90" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="620" y="165" width="10" height="95" fill="#00ff88" stroke="#00cc66"/>
                    <text x="500" y="350" fill="#00ff88" font-size="14">RETOUR VERS OB</text>
                    
                    <!-- Signal de rejet -->
                    <rect x="680" y="162" width="12" height="6" fill="#9c27b0" stroke="#7b1fa2"/>
                    <line x1="686" y1="155" x2="686" y2="185" stroke="#7b1fa2" stroke-width="4"/>
                    <text x="650" y="145" fill="#9c27b0" font-size="14">DOJI REJET</text>
                    
                    <!-- Niveau psychologique -->
                    <line x1="150" y1="165" x2="750" y2="165" stroke="#17a2b8" stroke-width="2" stroke-dasharray="10,5"/>
                    <text x="760" y="170" fill="#17a2b8" font-size="12">1.0950 (Niveau 00)</text>
                    
                    <!-- Entrée -->
                    <defs>
                        <marker id="sellArrow" markerWidth="15" markerHeight="10" refX="14" refY="5" orient="auto">
                            <polygon points="0 0, 15 5, 0 10" fill="#ff4757" />
                        </marker>
                    </defs>
                    <path d="M 700 165 L 730 200" stroke="#ff4757" stroke-width="3" marker-end="url(#sellArrow)"/>
                    <text x="735" y="205" fill="#ff4757" font-size="14">SELL</text>
                    
                    <!-- Stop Loss -->
                    <line x1="680" y1="145" x2="750" y2="145" stroke="#ff4757" stroke-width="2"/>
                    <text x="755" y="150" fill="#ff4757" font-size="12">SL: 1.0960</text>
                    
                    <!-- Take Profit -->
                    <line x1="680" y1="280" x2="750" y2="280" stroke="#00ff88" stroke-width="2"/>
                    <text x="755" y="285" fill="#00ff88" font-size="12">TP: 1.0900</text>
                    
                    <!-- Légende -->
                    <rect x="50" y="50" width="300" height="160" fill="rgba(0,0,0,0.8)" stroke="#555" rx="5"/>
                    <text x="60" y="70" fill="#fff" font-size="14">Order Block ICT (85% WR) :</text>
                    <text x="60" y="90" fill="#ffc107" font-size="12">• Impulsion 30+ pips en H4</text>
                    <text x="60" y="105" fill="#00ff88" font-size="12">• Dernière bougie avant impulsion</text>
                    <text x="60" y="120" fill="#17a2b8" font-size="12">• Confluence niveau 00/50</text>
                    <text x="60" y="135" fill="#9c27b0" font-size="12">• Signal de rejet (Doji/Pin Bar)</text>
                    <text x="60" y="150" fill="#ff4757" font-size="12">• Stop 5-10 pips au-delà</text>
                    <text x="60" y="165" fill="#00ff88" font-size="12">• R:R minimum 1:3</text>
                    <text x="60" y="180" fill="#fff" font-size="12">• Timeframe H4 minimum</text>
                    <text x="60" y="195" fill="#dc3545" font-size="12">• Zone jamais retestée</text>
                </svg>`
            },
            choch: {
                title: "Change of Character (ChoCh)",
                chart: `<svg width="100%" height="400" viewBox="0 0 1000 400" style="background: #1e1e1e; border-radius: 8px;">
                    <rect width="100%" height="100%" fill="url(#tvGrid)" />
                    
                    <!-- Structure baissière -->
                    <circle cx="150" cy="120" r="5" fill="#ff4757"/>
                    <text x="130" y="110" fill="#ff4757" font-size="12">LH</text>
                    <circle cx="250" cy="180" r="5" fill="#ff4757"/>
                    <text x="230" y="200" fill="#ff4757" font-size="12">LL</text>
                    <circle cx="350" cy="140" r="5" fill="#ff4757"/>
                    <text x="330" y="130" fill="#ff4757" font-size="12">LH</text>
                    <circle cx="450" cy="200" r="5" fill="#ff4757"/>
                    <text x="430" y="220" fill="#ff4757" font-size="12">LL</text>
                    
                    <!-- Ligne de tendance baissière -->
                    <line x1="150" y1="120" x2="450" y2="200" stroke="#ff4757" stroke-width="2" stroke-dasharray="5,5"/>
                    <text x="250" y="110" fill="#ff4757" font-size="14">TENDANCE BAISSIÈRE</text>
                    
                    <!-- ChoCh -->
                    <rect x="550" y="120" width="15" height="60" fill="#00ff88" stroke="#00cc66"/>
                    <line x1="557" y1="110" x2="557" y2="190" stroke="#00cc66" stroke-width="4"/>
                    <text x="520" y="100" fill="#00ff88" font-size="16">ChoCh</text>
                    <text x="500" y="250" fill="#00ff88" font-size="12">Cassure du LH précédent</text>
                    
                    <!-- Nouvelle structure haussière -->
                    <circle cx="650" cy="160" r="5" fill="#00ff88"/>
                    <text x="630" y="150" fill="#00ff88" font-size="12">HL</text>
                    <circle cx="750" cy="100" r="5" fill="#00ff88"/>
                    <text x="730" y="90" fill="#00ff88" font-size="12">HH</text>
                    
                    <!-- Ligne de tendance haussière -->
                    <line x1="550" y1="180" x2="750" y2="100" stroke="#00ff88" stroke-width="2" stroke-dasharray="5,5"/>
                    <text x="650" y="80" fill="#00ff88" font-size="14">NOUVELLE TENDANCE HAUSSIÈRE</text>
                    
                    <!-- Retest -->
                    <rect x="600" y="130" width="10" height="25" fill="#ff4757" stroke="#ff3742"/>
                    <line x1="605" y1="125" x2="605" y2="160" stroke="#ff3742" stroke-width="2"/>
                    <text x="580" y="175" fill="#ff4757" font-size="12">Retest</text>
                    
                    <!-- Zone de retest -->
                    <ellipse cx="557" cy="140" rx="60" ry="25" fill="rgba(255,193,7,0.2)" stroke="#ffc107" stroke-width="2" stroke-dasharray="3,3"/>
                    <text x="520" y="180" fill="#ffc107" font-size="12">Zone de retest</text>
                    
                    <!-- Volume -->
                    <rect x="530" y="320" width="15" height="40" fill="#17a2b8"/>
                    <rect x="550" y="300" width="15" height="60" fill="#17a2b8"/>
                    <rect x="570" y="310" width="15" height="50" fill="#17a2b8"/>
                    <text x="530" y="380" fill="#17a2b8" font-size="12">Volume sur ChoCh</text>
                    
                    <!-- Entrée -->
                    <defs>
                        <marker id="buyArrow" markerWidth="15" markerHeight="10" refX="14" refY="5" orient="auto">
                            <polygon points="0 0, 15 5, 0 10" fill="#00ff88" />
                        </marker>
                    </defs>
                    <path d="M 620 140 L 650 120" stroke="#00ff88" stroke-width="3" marker-end="url(#buyArrow)"/>
                    <text x="655" y="115" fill="#00ff88" font-size="14">BUY</text>
                    
                    <!-- Légende -->
                    <rect x="50" y="250" width="350" height="140" fill="rgba(0,0,0,0.8)" stroke="#555" rx="5"/>
                    <text x="60" y="270" fill="#fff" font-size="14">Change of Character (90% précision) :</text>
                    <text x="60" y="290" fill="#ff4757" font-size="12">• Structure LH/LL (tendance baissière)</text>
                    <text x="60" y="305" fill="#00ff88" font-size="12">• Cassure du dernier LH = ChoCh haussier</text>
                    <text x="60" y="320" fill="#17a2b8" font-size="12">• Volume de confirmation requis</text>
                    <text x="60" y="335" fill="#ffc107" font-size="12">• Retest de la zone cassée</text>
                    <text x="60" y="350" fill="#00ff88" font-size="12">• Entrée sur le retest</text>
                    <text x="60" y="365" fill="#fff" font-size="12">• Confirmation H4 minimum</text>
                    <text x="60" y="380" fill="#dc3545" font-size="12">• Stop sous la zone de retest</text>
                </svg>`
            },
            bos: {
                title: "Break of Structure (BOS)",
                chart: `<svg width="100%" height="400" viewBox="0 0 1000 400" style="background: #1e1e1e; border-radius: 8px;">
                    <rect width="100%" height="100%" fill="url(#tvGrid)" />
                    
                    <!-- Structure haussière établie -->
                    <circle cx="150" cy="250" r="5" fill="#00ff88"/>
                    <text x="130" y="270" fill="#00ff88" font-size="12">HL</text>
                    <circle cx="250" cy="180" r="5" fill="#00ff88"/>
                    <text x="230" y="170" fill="#00ff88" font-size="12">HH</text>
                    <circle cx="350" cy="220" r="5" fill="#00ff88"/>
                    <text x="330" y="240" fill="#00ff88" font-size="12">HL</text>
                    <circle cx="450" cy="160" r="5" fill="#00ff88"/>
                    <text x="430" y="150" fill="#00ff88" font-size="12">HH</text>
                    
                    <!-- Ligne de tendance -->
                    <line x1="150" y1="250" x2="450" y2="160" stroke="#00ff88" stroke-width="2" stroke-dasharray="5,5"/>
                    <text x="250" y="140" fill="#00ff88" font-size="14">TENDANCE HAUSSIÈRE ÉTABLIE</text>
                    
                    <!-- Pullback -->
                    <rect x="500" y="180" width="10" height="40" fill="#ff4757" stroke="#ff3742"/>
                    <rect x="520" y="200" width="10" height="35" fill="#ff4757" stroke="#ff3742"/>
                    <rect x="540" y="210" width="10" height="30" fill="#ff4757" stroke="#ff3742"/>
                    <text x="500" y="260" fill="#ff4757" font-size="12">Pullback 38-50%</text>
                    
                    <!-- Fibonacci -->
                    <line x1="450" y1="160" x2="600" y2="160" stroke="#ff9800" stroke-width="1" opacity="0.7"/>
                    <text x="610" y="165" fill="#ff9800" font-size="10">0%</text>
                    <line x1="450" y1="190" x2="600" y2="190" stroke="#ff9800" stroke-width="1" opacity="0.7"/>
                    <text x="610" y="195" fill="#ff9800" font-size="10">38.2%</text>
                    <line x1="450" y1="210" x2="600" y2="210" stroke="#ff9800" stroke-width="2"/>
                    <text x="610" y="215" fill="#ff9800" font-size="10">50%</text>
                    
                    <!-- BOS -->
                    <rect x="650" y="140" width="15" height="50" fill="#00ff88" stroke="#00cc66"/>
                    <line x1="657" y1="130" x2="657" y2="200" stroke="#00cc66" stroke-width="4"/>
                    <text x="620" y="120" fill="#00ff88" font-size="16">BOS</text>
                    <text x="600" y="280" fill="#00ff88" font-size="12">Cassure du HH précédent</text>
                    
                    <!-- Nouveau HH -->
                    <circle cx="750" cy="120" r="5" fill="#00ff88"/>
                    <text x="730" y="110" fill="#00ff88" font-size="12">Nouveau HH</text>
                    
                    <!-- Extension Fibonacci -->
                    <line x1="650" y1="100" x2="800" y2="100" stroke="#9c27b0" stroke-width="2" stroke-dasharray="5,5"/>
                    <text x="720" y="95" fill="#9c27b0" font-size="12">Extension 127%</text>
                    <line x1="650" y1="80" x2="800" y2="80" stroke="#9c27b0" stroke-width="2" stroke-dasharray="5,5"/>
                    <text x="720" y="75" fill="#9c27b0" font-size="12">Extension 161%</text>
                    
                    <!-- Volume -->
                    <rect x="630" y="320" width="15" height="50" fill="#17a2b8"/>
                    <rect x="650" y="300" width="15" height="70" fill="#17a2b8"/>
                    <rect x="670" y="310" width="15" height="60" fill="#17a2b8"/>
                    <text x="630" y="380" fill="#17a2b8" font-size="12">Volume sur BOS</text>
                    
                    <!-- Pullback vers zone cassée -->
                    <rect x="700" y="150" width="10" height="20" fill="#ff4757" stroke="#ff3742"/>
                    <line x1="705" y1="145" x2="705" y2="175" stroke="#ff3742" stroke-width="2"/>
                    <text x="680" y="190" fill="#ff4757" font-size="12">Pullback</text>
                    
                    <!-- Zone d'entrée -->
                    <ellipse cx="657" cy="160" rx="50" ry="20" fill="rgba(0,255,136,0.2)" stroke="#00ff88" stroke-width="2" stroke-dasharray="3,3"/>
                    <text x="620" y="200" fill="#00ff88" font-size="12">Zone d'entrée</text>
                    
                    <!-- Entrée -->
                    <path d="M 720 160 L 750 140" stroke="#00ff88" stroke-width="3" marker-end="url(#buyArrow)"/>
                    <text x="755" y="135" fill="#00ff88" font-size="14">BUY</text>
                    
                    <!-- Légende -->
                    <rect x="50" y="50" width="320" height="160" fill="rgba(0,0,0,0.8)" stroke="#555" rx="5"/>
                    <text x="60" y="70" fill="#fff" font-size="14">Break of Structure (75% WR) :</text>
                    <text x="60" y="90" fill="#00ff88" font-size="12">• Tendance établie (3+ HH/HL)</text>
                    <text x="60" y="105" fill="#ff4757" font-size="12">• Pullback sain 38-50%</text>
                    <text x="60" y="120" fill="#00ff88" font-size="12">• BOS = cassure du dernier HH</text>
                    <text x="60" y="135" fill="#17a2b8" font-size="12">• Volume de confirmation</text>
                    <text x="60" y="150" fill="#ff4757" font-size="12">• Entrée sur pullback</text>
                    <text x="60" y="165" fill="#9c27b0" font-size="12">• Target 127-161% extension</text>
                    <text x="60" y="180" fill="#fff" font-size="12">• Stop sous zone cassée</text>
                    <text x="60" y="195" fill="#dc3545" font-size="12">• R:R minimum 1:2</text>
                </svg>`
            },
            fvg: {
                title: "Fair Value Gap (FVG)",
                chart: `<svg width="100%" height="400" viewBox="0 0 1000 400" style="background: #1e1e1e; border-radius: 8px;">
                    <rect width="100%" height="100%" fill="url(#tvGrid)" />
                    
                    <!-- Pattern 3 bougies -->
                    <rect x="200" y="220" width="15" height="40" fill="#00ff88" stroke="#00cc66"/>
                    <line x1="207" y1="210" x2="207" y2="270" stroke="#00cc66" stroke-width="2"/>
                    <text x="180" y="290" fill="#00ff88" font-size="12">Bougie 1</text>
                    <text x="170" y="305" fill="#00ff88" font-size="10">Haut: 149.20</text>
                    
                    <!-- Bougie d'impulsion -->
                    <rect x="250" y="150" width="15" height="80" fill="#00ff88" stroke="#00cc66"/>
                    <line x1="257" y1="140" x2="257" y2="240" stroke="#00cc66" stroke-width="4"/>
                    <text x="230" y="290" fill="#00ff88" font-size="12">Bougie 2</text>
                    <text x="220" y="305" fill="#00ff88" font-size="10">Impulsion</text>
                    
                    <!-- Bougie 3 -->
                    <rect x="300" y="180" width="15" height="35" fill="#00ff88" stroke="#00cc66"/>
                    <line x1="307" y1="175" x2="307" y2="220" stroke="#00cc66" stroke-width="2"/>
                    <text x="280" y="290" fill="#00ff88" font-size="12">Bougie 3</text>
                    <text x="270" y="305" fill="#00ff88" font-size="10">Bas: 149.45</text>
                    
                    <!-- Fair Value Gap -->
                    <rect x="200" y="210" width="115" height="35" fill="rgba(255,87,34,0.4)" stroke="#ff5722" stroke-width="3" stroke-dasharray="4,4"/>
                    <text x="210" y="200" fill="#ff5722" font-size="16">FAIR VALUE GAP</text>
                    <text x="210" y="230" fill="#ff5722" font-size="14">149.20 - 149.45 (25 pips)</text>
                    
                    <!-- Volume sur impulsion -->
                    <rect x="230" y="320" width="15" height="30" fill="#17a2b8"/>
                    <rect x="250" y="300" width="15" height="50" fill="#17a2b8"/>
                    <rect x="270" y="310" width="15" height="40" fill="#17a2b8"/>
                    <text x="230" y="370" fill="#17a2b8" font-size="12">Volume élevé</text>
                    
                    <!-- Continuation -->
                    <rect x="350" y="120" width="12" height="50" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="370" y="100" width="12" height="60" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="390" y="90" width="12" height="70" fill="#00ff88" stroke="#00cc66"/>
                    <text x="350" y="200" fill="#00ff88" font-size="12">Continuation</text>
                    
                    <!-- Retour pour combler -->
                    <rect x="500" y="160" width="10" height="30" fill="#ff4757" stroke="#ff3742"/>
                    <rect x="520" y="180" width="10" height="25" fill="#ff4757" stroke="#ff3742"/>
                    <rect x="540" y="190" width="10" height="20" fill="#ff4757" stroke="#ff3742"/>
                    <rect x="560" y="200" width="10" height="15" fill="#ff4757" stroke="#ff3742"/>
                    <text x="500" y="250" fill="#ff4757" font-size="14">RETOUR VERS FVG</text>
                    
                    <!-- Signal de rejet -->
                    <rect x="620" y="218" width="12" height="6" fill="#9c27b0" stroke="#7b1fa2"/>
                    <line x1="626" y1="210" x2="626" y2="235" stroke="#7b1fa2" stroke-width="4"/>
                    <text x="590" y="200" fill="#9c27b0" font-size="14">REJET</text>
                    
                    <!-- Ordre limite -->
                    <line x1="580" y1="227" x2="650" y2="227" stroke="#ffc107" stroke-width="2" stroke-dasharray="3,3"/>
                    <text x="580" y="245" fill="#ffc107" font-size="12">Ordre limite (milieu FVG)</text>
                    
                    <!-- Continuation après rejet -->
                    <rect x="680" y="240" width="12" height="40" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="700" y="220" width="12" height="50" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="720" y="200" width="12" height="60" fill="#00ff88" stroke="#00cc66"/>
                    <text x="680" y="300" fill="#00ff88" font-size="14">CONTINUATION</text>
                    
                    <!-- Statistiques -->
                    <rect x="400" y="50" width="200" height="60" fill="rgba(255,87,34,0.2)" stroke="#ff5722" stroke-width="2"/>
                    <text x="410" y="70" fill="#ff5722" font-size="14">STATISTIQUES FVG :</text>
                    <text x="410" y="85" fill="#fff" font-size="12">80% comblés en 24h</text>
                    <text x="410" y="100" fill="#fff" font-size="12">95% comblés en 48h</text>
                    
                    <!-- Entrée -->
                    <defs>
                        <marker id="limitArrow" markerWidth="15" markerHeight="10" refX="14" refY="5" orient="auto">
                            <polygon points="0 0, 15 5, 0 10" fill="#ffc107" />
                        </marker>
                    </defs>
                    <path d="M 640 227 L 670 240" stroke="#ffc107" stroke-width="3" marker-end="url(#limitArrow)"/>
                    <text x="675" y="245" fill="#ffc107" font-size="14">LIMIT ORDER</text>
                    
                    <!-- Légende -->
                    <rect x="50" y="50" width="320" height="180" fill="rgba(0,0,0,0.8)" stroke="#555" rx="5"/>
                    <text x="60" y="70" fill="#fff" font-size="14">Fair Value Gap (80% fill rate) :</text>
                    <text x="60" y="90" fill="#00ff88" font-size="12">• Pattern 3 bougies avec gap</text>
                    <text x="60" y="105" fill="#ff5722" font-size="12">• Haut bougie 1 < Bas bougie 3</text>
                    <text x="60" y="120" fill="#17a2b8" font-size="12">• Impulsion 20+ pips avec volume</text>
                    <text x="60" y="135" fill="#fff" font-size="12">• Gap jamais retracé</text>
                    <text x="60" y="150" fill="#ff4757" font-size="12">• Prix revient combler le gap</text>
                    <text x="60" y="165" fill="#ffc107" font-size="12">• Ordre limite dans le gap</text>
                    <text x="60" y="180" fill="#9c27b0" font-size="12">• Signal de rejet requis</text>
                    <text x="60" y="195" fill="#00ff88" font-size="12">• Continuation après rejet</text>
                    <text x="60" y="210" fill="#dc3545" font-size="12">• Stop au-delà du gap</text>
                    <text x="60" y="225" fill="#fff" font-size="12">• R:R minimum 1:2</text>
                </svg>`
            }
        };

        const chart = charts[stepKey];
        if (chart) {
            // Sauvegarder le contenu actuel
            this.previousModalContent = document.getElementById('modalContent').innerHTML;
            
            const modalContent = document.getElementById('modalContent');
            modalContent.innerHTML = `
                <h2>${chart.title}</h2>
                <div class="chart-example" style="margin: 20px 0;">
                    ${chart.chart}
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button class="back-to-steps" onclick="dashboard.backToSteps()">← Retour aux étapes</button>
                    <button class="btn-submit" onclick="dashboard.showFullscreenChart('${stepKey}')">Voir en plein écran</button>
                    <button class="btn-submit" onclick="dashboard.closeModal()">Fermer</button>
                </div>
            `;
            this.showModal();
        }
    }

    skipToTrade() {
        // Remplir automatiquement les étapes restantes avec des valeurs par défaut
        for (let i = this.currentStep; i < this.checklistSteps.length; i++) {
            const step = this.checklistSteps[i];
            this.currentTrade.confluences[step.key] = step.options[0]; // Prendre la première option
        }
        
        // Aller directement au formulaire de trade
        this.renderTradeForm();
    }

    getDecimalPlaces(currency) {
        if (currency.includes('JPY')) return 2;
        if (currency === 'XAU/USD') return 2;
        if (currency === 'NAS100' || currency === 'GER40') return 2;
        return 4;
    }

    showSettings() {
        const modalContent = document.getElementById('modalContent');
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
        this.settings.capital = parseFloat(document.getElementById('capitalInput').value);
        this.settings.riskPerTrade = parseFloat(document.getElementById('riskInput').value);
        localStorage.setItem(`settings_${this.currentUser}`, JSON.stringify(this.settings));
        this.closeModal();
        this.updateStats();
    }

    showCloseTradeModal() {
        const openTrades = this.trades.filter(t => t.status === 'open');
        if (openTrades.length === 0) {
            alert('Aucun trade ouvert à clôturer');
            return;
        }

        const modalContent = document.getElementById('modalContent');
        const tradesOptions = openTrades.map((trade, index) => 
            `<option value="${this.trades.indexOf(trade)}">${trade.currency} - ${trade.date}</option>`
        ).join('');

        modalContent.innerHTML = `
            <h2>Clôturer un Trade</h2>
            <div class="trade-form">
                <div class="form-group">
                    <label>Sélectionner le trade:</label>
                    <select id="tradeToClose">
                        ${tradesOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Résultat:</label>
                    <select id="tradeResult">
                        <option value="TP">Take Profit atteint</option>
                        <option value="SL">Stop Loss touché</option>
                        <option value="BE">Break Even</option>
                        <option value="PARTIAL">Clôture partielle</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Prix de clôture:</label>
                    <input type="number" id="closePrice" step="0.00001">
                </div>
                <button class="btn-submit" onclick="dashboard.closeTrade()">Clôturer Trade</button>
            </div>
        `;
        this.showModal();
    }

    closeTrade() {
        const tradeIndex = parseInt(document.getElementById('tradeToClose').value);
        const result = document.getElementById('tradeResult').value;
        const closePrice = parseFloat(document.getElementById('closePrice').value);
        
        const trade = this.trades[tradeIndex];
        trade.result = result;
        trade.closePrice = closePrice || (result === 'TP' ? trade.takeProfit : trade.stopLoss);
        trade.status = 'closed';
        trade.pnl = this.calculatePnL(trade);
        
        this.saveToStorage();
        this.closeModal();
        this.updateStats();
        this.renderTradesTable();
        this.updateCharts();
        this.updateCalendar();
    }

    updateStats() {
        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const winTrades = closedTrades.filter(t => parseFloat(t.pnl || 0) > 0);
        const winrate = closedTrades.length > 0 ? (winTrades.length / closedTrades.length * 100).toFixed(1) : 0;
        const totalGain = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const currentCapital = this.settings.capital + totalGain;

        document.getElementById('capital').textContent = '$' + currentCapital.toFixed(2);
        document.getElementById('winrate').textContent = winrate + '%';
        document.getElementById('totalGain').textContent = (totalGain >= 0 ? '+$' : '-$') + Math.abs(totalGain).toFixed(2);
        document.getElementById('totalTrades').textContent = this.trades.length;
        
        // Mise à jour de la couleur selon le gain/perte
        const gainElement = document.getElementById('totalGain');
        gainElement.className = totalGain >= 0 ? 'result-win' : 'result-loss';
    }

    renderTradesTable() {
        const tbody = document.querySelector('#tradesTable tbody');
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

    initCharts() {
        this.initGainsGauge();
        this.initConfluencesChart();
    }

    initGainsGauge() {
        this.updateGainsGauge();
    }

    initConfluencesChart() {
        const ctx = document.getElementById('confluencesChart').getContext('2d');
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
        const currentCapital = initialCapital + totalGain;
        const gainPercent = ((totalGain / initialCapital) * 100).toFixed(1);
        
        // Mise à jour des valeurs
        document.getElementById('gainsValue').textContent = (totalGain >= 0 ? '+$' : '-$') + Math.abs(totalGain).toFixed(2);
        document.getElementById('gainsPercent').textContent = (totalGain >= 0 ? '+' : '') + gainPercent + '%';
        
        // Couleur du gauge selon la performance
        const gauge = document.getElementById('gainsGauge');
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
        
        gauge.style.background = gaugeColor;
        
        // Animation du compteur
        const valueElement = document.getElementById('gainsValue');
        valueElement.style.animation = 'none';
        setTimeout(() => {
            valueElement.style.animation = 'countUp 1s ease-out';
        }, 10);
    }

    updateConfluencesChart() {
        const closedTrades = this.trades.filter(t => t.status === 'closed');
        const confluenceStats = {};

        // Analyser les confluences
        this.checklistSteps.forEach(step => {
            confluenceStats[step.title.split(' - ')[0]] = { wins: 0, total: 0 };
        });

        closedTrades.forEach(trade => {
            this.checklistSteps.forEach(step => {
                const shortTitle = step.title.split(' - ')[0];
                if (trade.confluences[step.key]) {
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
        
        // Générer l'analyse
        this.generateConfluenceAnalysis(analysisData);
    }

    generateConfluenceAnalysis(data) {
        const analysisContainer = document.getElementById('confluenceAnalysis');
        
        if (data.length === 0) {
            analysisContainer.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center;">Aucune donnée de confluence disponible</p>';
            return;
        }
        
        // Trier par winrate
        data.sort((a, b) => b.winrate - a.winrate);
        
        const bestConfluences = data.filter(d => d.winrate >= 70);
        const goodConfluences = data.filter(d => d.winrate >= 50 && d.winrate < 70);
        const poorConfluences = data.filter(d => d.winrate < 50);
        
        let analysisHTML = '<h4>📊 Analyse des Performances</h4>';
        
        // Liste des confluences avec scores
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
                <div class="analysis-item">
                    <div class="confluence-name">${confluence.name} (${confluence.wins}/${confluence.total})</div>
                    <div class="confluence-score ${scoreClass}">${confluence.winrate.toFixed(1)}% - ${scoreText}</div>
                </div>
            `;
        });
        
        // Recommandations
        let recommendations = [];
        
        if (bestConfluences.length > 0) {
            recommendations.push(`✅ <strong>Excellentes confluences :</strong> ${bestConfluences.map(c => c.name).join(', ')} - Continuez à les utiliser !`);
        }
        
        if (poorConfluences.length > 0) {
            recommendations.push(`⚠️ <strong>Confluences à améliorer :</strong> ${poorConfluences.map(c => c.name).join(', ')} - Analysez vos erreurs sur ces setups.`);
        }
        
        if (data.length >= 3) {
            const topStrategy = data[0];
            recommendations.push(`🎯 <strong>Stratégie principale :</strong> Concentrez-vous sur "${topStrategy.name}" (${topStrategy.winrate.toFixed(1)}% de réussite).`);
        }
        
        if (recommendations.length > 0) {
            analysisHTML += '<div class="recommendation">' + recommendations.join('<br><br>') + '</div>';
        }
        
        analysisContainer.innerHTML = analysisHTML;
    }

    // Calendrier de Trading
    initCalendar() {
        this.calendarDate = new Date();
        this.setupCalendarListeners();
        this.renderCalendar();
    }

    setupCalendarListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
            this.renderCalendar();
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
            this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
            this.renderCalendar();
        });
    }

    renderCalendar() {
        const year = this.calendarDate.getFullYear();
        const month = this.calendarDate.getMonth();
        
        document.getElementById('monthLabel').textContent = this.calendarDate.toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
        });
        
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const grid = document.getElementById('calendarGrid');
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
            
            <!-- Boutons de partage -->
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
        
        document.getElementById('modalContent').innerHTML = detailsHTML;
        this.showModal();
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
        
        // Copier le texte dans le presse-papiers
        navigator.clipboard.writeText(text).then(() => {
            alert('Texte copié ! Collez-le dans votre story Instagram.');
        }).catch(() => {
            prompt('Copiez ce texte pour Instagram:', text);
        });
    }
    
    shareToTikTok(date, pnl, winrate, trades) {
        const text = `📊 Résultats Trading du ${new Date(date).toLocaleDateString('fr-FR')}\n\n💰 P&L: ${pnl >= 0 ? '+$' : '-$'}${Math.abs(pnl).toFixed(2)}\n🎯 Winrate: ${winrate}%\n📈 Trades: ${trades}\n\n#Trading #Forex #TradingResults #TikTokTrader`;
        
        // Copier le texte dans le presse-papiers
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
        
        const dailyPnL = {};
        monthTrades.forEach(trade => {
            const date = trade.date;
            dailyPnL[date] = (dailyPnL[date] || 0) + parseFloat(trade.pnl || 0);
        });
        
        const dailyValues = Object.values(dailyPnL);
        const bestDay = dailyValues.length > 0 ? Math.max(...dailyValues) : 0;
        // Ne considérer que les pertes réelles pour le pire jour
        const lossValues = dailyValues.filter(value => value < 0);
        const worstDay = lossValues.length > 0 ? Math.min(...lossValues) : 0;
        
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
            <div class="summary-card profit">
                <h4>Meilleur Jour</h4>
                <div class="value">+$${Math.abs(bestDay).toFixed(0)}</div>
            </div>
            <div class="summary-card ${worstDay < 0 ? 'loss' : ''}">
                <h4>Pire Jour</h4>
                <div class="value">${worstDay < 0 ? '-$' + Math.abs(worstDay).toFixed(0) : 'Aucune perte'}</div>
            </div>
        `;
        
        document.getElementById('calendarSummary').innerHTML = summaryHTML;
    }

    saveToStorage() {
        localStorage.setItem(`trades_${this.currentUser}`, JSON.stringify(this.trades));
    }

    showUserManagement() {
        const users = JSON.parse(localStorage.getItem('users')) || {
            "admin": "TradingPro2024!",
            "trader1": "Trader123!",
            "trader2": "Market456!",
            "guest": "Guest789!"
        };
        
        const usersList = Object.entries(users).map(([username, password]) => `
            <div class="user-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; margin-bottom: 10px;">
                <div>
                    <strong>${username}</strong>
                    <span style="opacity: 0.7; margin-left: 10px;">${password}</span>
                </div>
                <div>
                    <button class="btn-small btn-warning" onclick="dashboard.editUser('${username}')">✏️</button>
                    ${username !== 'admin' ? `<button class="btn-small btn-danger" onclick="dashboard.deleteUser('${username}')">🗑️</button>` : ''}
                </div>
            </div>
        `).join('');
        
        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = `
            <h2>👥 Gestion des Utilisateurs</h2>
            
            <div style="margin-bottom: 30px;">
                <h3 style="color: #00d4ff; margin-bottom: 15px;">Utilisateurs existants</h3>
                ${usersList}
            </div>
            
            <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px;">
                <h3 style="color: #4ecdc4; margin-bottom: 15px;">➕ Ajouter un utilisateur</h3>
                <div class="form-group">
                    <label>Nom d'utilisateur:</label>
                    <input type="text" id="newUsername" placeholder="nouveautrader">
                </div>
                <div class="form-group">
                    <label>Mot de passe:</label>
                    <input type="text" id="newPassword" placeholder="MotDePasse123!">
                </div>
                <button class="btn-submit" onclick="dashboard.addUser()">Ajouter Utilisateur</button>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn-secondary" onclick="dashboard.showSettings()">← Retour aux Paramètres</button>
            </div>
        `;
    }

    addUser() {
        const username = document.getElementById('newUsername').value.trim();
        const password = document.getElementById('newPassword').value.trim();
        
        if (!username || !password) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || {};
        
        if (users[username]) {
            alert('Cet utilisateur existe déjà');
            return;
        }
        
        users[username] = password;
        localStorage.setItem('users', JSON.stringify(users));
        this.updateAuthFile(users);
        
        alert(`Utilisateur "${username}" ajouté avec succès`);
        this.showUserManagement();
    }

    editUser(username) {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        const currentPassword = users[username];
        
        const newPassword = prompt(`Nouveau mot de passe pour "${username}":`, currentPassword);
        
        if (newPassword && newPassword !== currentPassword) {
            users[username] = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            this.updateAuthFile(users);
            
            alert(`Mot de passe de "${username}" modifié`);
            this.showUserManagement();
        }
    }

    deleteUser(username) {
        if (username === 'admin') {
            alert('Impossible de supprimer le compte admin');
            return;
        }
        
        if (confirm(`Supprimer l'utilisateur "${username}" et toutes ses données ?`)) {
            const users = JSON.parse(localStorage.getItem('users')) || {};
            delete users[username];
            localStorage.setItem('users', JSON.stringify(users));
            
            // Supprimer les données de l'utilisateur
            localStorage.removeItem(`trades_${username}`);
            localStorage.removeItem(`settings_${username}`);
            
            this.updateAuthFile(users);
            
            alert(`Utilisateur "${username}" supprimé`);
            this.showUserManagement();
        }
    }

    updateAuthFile(users) {
        // Afficher les nouvelles données pour mise à jour manuelle
        const userCode = Object.entries(users).map(([user, pass]) => `            "${user}": "${pass}"`).join(',\n');
        
        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = `
            <h2>🔄 Mise à jour requise</h2>
            <div class="education-content">
                <h4>⚠️ Action requise :</h4>
                <p>Copiez ce code dans le fichier <strong>auth.html</strong> à la ligne des USERS :</p>
            </div>
            <textarea readonly style="width: 100%; height: 200px; background: rgba(20,20,20,0.8); color: #00d4ff; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 15px; font-family: monospace;">
const USERS = {
${userCode}
};</textarea>
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn-submit" onclick="dashboard.showUserManagement()">← Retour à la Gestion</button>
            </div>
        `;
    }

    showMT5Sync() {
        const modalContent = document.getElementById('modalContent');
        const mt5Accounts = JSON.parse(localStorage.getItem(`mt5_accounts_${this.currentUser}`)) || [];
        
        const accountsList = mt5Accounts.map((account, index) => `
            <div class="mt5-account" style="background: rgba(40,40,40,0.8); padding: 15px; border-radius: 8px; margin: 10px 0; border: 1px solid rgba(255,255,255,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>Compte: ${account.login}</strong>
                        <div style="opacity: 0.7; font-size: 0.9em;">Serveur: ${account.server}</div>
                        <div style="opacity: 0.7; font-size: 0.9em;">Statut: <span style="color: ${account.connected ? '#4ecdc4' : '#ff6b6b'}">${account.connected ? 'Connecté' : 'Déconnecté'}</span></div>
                    </div>
                    <div>
                        <button class="btn-small btn-info" onclick="dashboard.syncMT5Account(${index})">🔄 Sync</button>
                        <button class="btn-small btn-danger" onclick="dashboard.removeMT5Account(${index})">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
        
        modalContent.innerHTML = `
            <h2>📊 Synchronisation MetaTrader 5</h2>
            
            <div class="education-content">
                <h4>🔒 Sécurité :</h4>
                <p>Vos identifiants sont stockés localement et chiffrés. Ils ne sont jamais envoyés à des serveurs externes.</p>
                <p><strong>Note :</strong> Cette fonctionnalité nécessite MetaTrader 5 ouvert avec l'API activée.</p>
            </div>
            
            ${accountsList.length > 0 ? `
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #00d4ff; margin-bottom: 15px;">Comptes configurés</h3>
                    ${accountsList}
                </div>
            ` : ''}
            
            <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px;">
                <h3 style="color: #4ecdc4; margin-bottom: 15px;">➕ Ajouter un compte MT5</h3>
                <div class="form-group">
                    <label>Numéro de compte:</label>
                    <input type="text" id="mt5Login" placeholder="60007071">
                </div>
                <div class="form-group">
                    <label>Mot de passe:</label>
                    <input type="password" id="mt5Password" placeholder="Votre mot de passe">
                </div>
                <div class="form-group">
                    <label>Serveur:</label>
                    <select id="mt5Server">
                        <option value="MetaQuotes-Demo">MetaQuotes-Demo</option>
                        <option value="ICMarkets-Live">ICMarkets-Live</option>
                        <option value="XM-Real">XM-Real</option>
                        <option value="FTMO-Server">FTMO-Server</option>
                        <option value="Autre">Autre (spécifier)</option>
                    </select>
                </div>
                <div class="form-group" id="customServerGroup" style="display: none;">
                    <label>Serveur personnalisé:</label>
                    <input type="text" id="customServer" placeholder="Nom du serveur">
                </div>
                <button class="btn-submit" onclick="dashboard.addMT5Account()">Ajouter Compte</button>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn-secondary" onclick="dashboard.closeModal()">Fermer</button>
            </div>
        `;
        
        // Gérer l'affichage du serveur personnalisé
        document.getElementById('mt5Server').addEventListener('change', function() {
            const customGroup = document.getElementById('customServerGroup');
            customGroup.style.display = this.value === 'Autre' ? 'block' : 'none';
        });
        
        this.showModal();
    }

    addMT5Account() {
        const login = document.getElementById('mt5Login').value.trim();
        const password = document.getElementById('mt5Password').value.trim();
        const server = document.getElementById('mt5Server').value;
        const customServer = document.getElementById('customServer').value.trim();
        
        if (!login || !password) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        
        const finalServer = server === 'Autre' ? customServer : server;
        if (!finalServer) {
            alert('Veuillez spécifier le serveur');
            return;
        }
        
        const mt5Accounts = JSON.parse(localStorage.getItem(`mt5_accounts_${this.currentUser}`)) || [];
        
        // Vérifier si le compte existe déjà
        if (mt5Accounts.find(acc => acc.login === login)) {
            alert('Ce compte est déjà configuré');
            return;
        }
        
        // Chiffrer le mot de passe (simple encodage base64 pour la démo)
        const encodedPassword = btoa(password);
        
        mt5Accounts.push({
            login: login,
            password: encodedPassword,
            server: finalServer,
            connected: false,
            lastSync: null
        });
        
        localStorage.setItem(`mt5_accounts_${this.currentUser}`, JSON.stringify(mt5Accounts));
        
        alert(`Compte MT5 ${login} ajouté avec succès`);
        this.showMT5Sync();
    }

    removeMT5Account(index) {
        if (confirm('Supprimer ce compte MT5 ?')) {
            const mt5Accounts = JSON.parse(localStorage.getItem(`mt5_accounts_${this.currentUser}`)) || [];
            mt5Accounts.splice(index, 1);
            localStorage.setItem(`mt5_accounts_${this.currentUser}`, JSON.stringify(mt5Accounts));
            this.showMT5Sync();
        }
    }

    async syncMT5Account(index) {
        const mt5Accounts = JSON.parse(localStorage.getItem(`mt5_accounts_${this.currentUser}`)) || [];
        const account = mt5Accounts[index];
        
        if (!account) return;
        
        try {
            // Simulation de la synchronisation (en réalité, cela nécessiterait une API MT5)
            const modalContent = document.getElementById('modalContent');
            modalContent.innerHTML = `
                <h2>🔄 Synchronisation en cours...</h2>
                <div class="education-content">
                    <h4>📡 Connexion à MetaTrader 5</h4>
                    <p>Compte: ${account.login}</p>
                    <p>Serveur: ${account.server}</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <div class="loading-spinner" style="border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid #00d4ff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                    </div>
                </div>
            `;
            
            // Simulation d'un délai de connexion
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulation de données MT5
            const simulatedTrades = this.generateSimulatedMT5Trades();
            
            // Ajouter les trades simulés
            simulatedTrades.forEach(trade => {
                this.trades.push({
                    ...trade,
                    source: 'MT5',
                    mt5Account: account.login
                });
            });
            
            // Mettre à jour le statut de connexion
            account.connected = true;
            account.lastSync = new Date().toISOString();
            mt5Accounts[index] = account;
            localStorage.setItem(`mt5_accounts_${this.currentUser}`, JSON.stringify(mt5Accounts));
            
            this.saveToStorage();
            this.updateStats();
            this.renderTradesTable();
            this.updateCharts();
            this.updateCalendar();
            
            modalContent.innerHTML = `
                <h2>✅ Synchronisation réussie</h2>
                <div class="education-content">
                    <h4>📊 Données importées :</h4>
                    <p><strong>${simulatedTrades.length} trades</strong> ont été synchronisés depuis MT5</p>
                    <p>Compte: ${account.login}</p>
                    <p>Dernière sync: ${new Date().toLocaleString('fr-FR')}</p>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn-submit" onclick="dashboard.closeModal()">Fermer</button>
                </div>
            `;
            
        } catch (error) {
            alert('Erreur de synchronisation: ' + error.message);
        }
    }

    generateSimulatedMT5Trades() {
        // Génération de trades simulés pour la démo
        const trades = [];
        const currencies = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD'];
        const today = new Date();
        
        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const currency = currencies[Math.floor(Math.random() * currencies.length)];
            const isWin = Math.random() > 0.4;
            const entryPoint = currency === 'USD/JPY' ? 149.50 : currency === 'XAU/USD' ? 2020.50 : 1.0850;
            const variation = (Math.random() - 0.5) * 0.01;
            
            trades.push({
                date: date.toISOString().split('T')[0],
                currency: currency,
                entryPoint: (entryPoint + variation).toFixed(currency === 'USD/JPY' || currency === 'XAU/USD' ? 2 : 4),
                stopLoss: (entryPoint + variation - 0.002).toFixed(currency === 'USD/JPY' || currency === 'XAU/USD' ? 2 : 4),
                takeProfit: (entryPoint + variation + 0.003).toFixed(currency === 'USD/JPY' || currency === 'XAU/USD' ? 2 : 4),
                lotSize: (0.1 + Math.random() * 0.4).toFixed(2),
                riskPercent: 2,
                status: 'closed',
                result: isWin ? 'TP' : 'SL',
                closePrice: isWin ? (entryPoint + variation + 0.003).toFixed(4) : (entryPoint + variation - 0.002).toFixed(4),
                pnl: (isWin ? (50 + Math.random() * 100) : -(30 + Math.random() * 80)).toFixed(2),
                confluences: {
                    trendDaily: 'Haussière confirmée',
                    trend4h: 'Accumulation haussière'
                },
                comments: {}
            });
        }
        
        return trades;
    }

    exportToExcel() {
        const closedTrades = this.trades.filter(t => t.status === 'closed');
        
        // Créer les données CSV
        const headers = ['Date', 'Devise', 'Entrée', 'Stop Loss', 'Take Profit', 'Lot', 'Risque %', 'Résultat', 'P&L ($)', 'R:R', 'Confluences'];
        const csvData = [headers];
        
        closedTrades.forEach(trade => {
            const confluences = Object.values(trade.confluences || {}).join('; ');
            const rr = this.calculateRR(trade);
            csvData.push([
                trade.date,
                trade.currency,
                trade.entryPoint,
                trade.stopLoss,
                trade.takeProfit,
                trade.lotSize,
                trade.riskPercent + '%',
                trade.result,
                trade.pnl,
                rr,
                confluences
            ]);
        });
        
        // Ajouter statistiques
        csvData.push([]);
        csvData.push(['STATISTIQUES']);
        const totalPnL = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        const winTrades = closedTrades.filter(t => parseFloat(t.pnl || 0) > 0);
        const winrate = closedTrades.length > 0 ? (winTrades.length / closedTrades.length * 100).toFixed(1) : 0;
        
        csvData.push(['Total Trades', closedTrades.length]);
        csvData.push(['Winrate', winrate + '%']);
        csvData.push(['P&L Total', '$' + totalPnL.toFixed(2)]);
        csvData.push(['Capital Initial', '$' + this.settings.capital]);
        csvData.push(['Capital Actuel', '$' + (this.settings.capital + totalPnL).toFixed(2)]);
        
        // Convertir en CSV
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        
        // Télécharger
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
    
    calculateRR(trade) {
        if (!trade.entryPoint || !trade.stopLoss || !trade.takeProfit) return 'N/A';
        const risk = Math.abs(trade.entryPoint - trade.stopLoss);
        const reward = Math.abs(trade.takeProfit - trade.entryPoint);
        return risk > 0 ? `1:${(reward / risk).toFixed(2)}` : 'N/A';
    }
}

// Ajouter les styles pour le spinner de chargement
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .mt5-account:hover {
        border-color: rgba(0, 212, 255, 0.5) !important;
        transform: translateY(-2px);
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

// Initialiser le dashboard
const dashboard = new TradingDashboard();