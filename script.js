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
                title: "Stratégie ICT - Tendance Daily",
                question: "Quelle est la tendance sur le daily selon ICT ?",
                key: "trendDaily",
                education: `<strong>🏆 Stratégie ICT (Inner Circle Trader) :</strong><br>
                <strong>Où regarder :</strong> D1 - Analysez les 20-50 dernières bougies<br>
                <strong>Méthode ICT :</strong><br>
                • <strong>Haussière :</strong> Prix au-dessus de la EMA 20 + structure HH/HL<br>
                • <strong>Baissière :</strong> Prix sous la EMA 20 + structure LH/LL<br>
                • <strong>Manipulation :</strong> Faux breakout puis retour dans la tendance<br>
                <strong>📊 Confluence ICT :</strong> Daily + Weekly alignés = Signal ultra fort<br>
                <strong>Règle d'or :</strong> Ne jamais trader contre le daily, même sur des signaux H1 parfaits<br>
                <a href="#" onclick="dashboard.showStepChart('trendDaily')">📈 Graphique explicatif</a>`,
                options: ["Haussière confirmée", "Baissière confirmée", "Range/Accumulation"]
            },
            {
                title: "Stratégie Smart Money - 4H",
                question: "Quelle est la direction Smart Money sur 4H ?",
                key: "trend4h",
                education: `<strong>🏆 Concept Smart Money :</strong><br>
                <strong>Où regarder :</strong> H4 - Cherchez les zones d'intérêt institutionnel<br>
                <strong>Signaux Smart Money :</strong><br>
                • <strong>Accumulation :</strong> Prix consolide après un mouvement fort<br>
                • <strong>Manipulation :</strong> Stop hunt puis retournement rapide<br>
                • <strong>Distribution :</strong> Volumes élevés + prix stagnant<br>
                <strong>📊 Confluence parfaite :</strong> Daily + 4H + Niveaux institutionnels alignés<br>
                <strong>Astuce pro :</strong> Les institutions accumulent en H4, exécutent en H1<br>
                <a href="#" onclick="dashboard.showStepChart('trend4h')">📈 Graphique explicatif</a>`,
                options: ["Accumulation haussière", "Distribution baissière", "Manipulation en cours"]
            },
            {
                title: "Stratégie Pullback - 1H",
                question: "Y a-t-il un setup pullback valide sur 1H ?",
                key: "trend1h",
                education: `<strong>🏆 Stratégie Pullback (80% winrate) :</strong><br>
                <strong>Setup parfait :</strong><br>
                • <strong>Tendance claire :</strong> Daily + 4H alignés<br>
                • <strong>Fibonacci H1 :</strong> Du plus bas au plus haut de la dernière impulsion<br>
                • <strong>Zone 38.2-61.8% :</strong> Attendre le pullback dans cette zone<br>
                • <strong>Confluence H1 :</strong> Fibonacci + EMA 50 + Support/Résistance<br>
                • <strong>Signal d'entrée :</strong> Bougie de rejet (doji, hammer) + volume<br>
                <strong>Timeframe :</strong> Fibonacci sur H1, exécution sur M15<br>
                <strong>Stop :</strong> 10 pips sous la zone de confluence<br>
                <a href="#" onclick="dashboard.showExample('pullback')">📊 Voir exemple concret</a><br>
                <a href="#" onclick="dashboard.showStepChart('trend1h')">📈 Graphique explicatif</a>`,
                options: ["Pullback haussier valide", "Pullback baissier valide", "Pas de pullback"]
            },
            {
                title: "Stratégie London Breakout",
                question: "Setup London Breakout identifié ?",
                key: "asianSession",
                education: `<strong>🏆 London Breakout (70% winrate) :</strong><br>
                <strong>Principe :</strong> Session asiatique crée un range, Londres le casse<br>
                <strong>Setup parfait :</strong><br>
                • <strong>Range asiatique H1 :</strong> 00h-08h GMT, tracez haut/bas<br>
                • <strong>Taille minimum :</strong> 20 pips d'écart entre haut et bas<br>
                • <strong>Breakout Londres H1 :</strong> 08h-10h GMT, cassure avec volume<br>
                • <strong>Confirmation M15 :</strong> Clôture 15min au-delà du range<br>
                • <strong>Target :</strong> Taille du range projetée depuis la cassure<br>
                <strong>Stop :</strong> Milieu du range asiatique (50%)<br>
                <a href="#" onclick="dashboard.showExample('london')">📊 Voir exemple avec images</a><br>
                <a href="#" onclick="dashboard.showStepChart('asianSession')">📈 Graphique explicatif</a>`,
                options: ["Breakout haussier confirmé", "Breakout baissier confirmé", "Range non cassé"]
            },
            {
                title: "Stratégie Order Block ICT",
                question: "Order Block institutionnel identifié ?",
                key: "orderBlocks",
                education: `<strong>🏆 Order Block ICT (85% winrate) :</strong><br>
                <strong>Définition :</strong> Zone où les institutions ont placé des ordres massifs<br>
                <strong>Identification H4 :</strong><br>
                • <strong>Impulsion H4 :</strong> Mouvement de 30+ pips en 1-3 bougies<br>
                • <strong>OB = Dernière bougie :</strong> Avant l'impulsion (rectangle du haut au bas)<br>
                • <strong>Validation :</strong> Prix n'est jamais revenu tester la zone<br>
                • <strong>Confluence :</strong> OB + niveau psychologique (00, 50)<br>
                <strong>Trading H1 :</strong> Attendre retour + bougie de rejet (pin bar, doji)<br>
                <strong>Stop :</strong> 5-10 pips au-delà de l'OB selon la volatilité<br>
                <a href="#" onclick="dashboard.showExample('orderblock')">📊 Voir identification pas à pas</a><br>
                <a href="#" onclick="dashboard.showStepChart('orderBlocks')">📈 Graphique explicatif</a>`,
                options: ["OB Haussier H4+ valide", "OB Baissier H4+ valide", "Aucun OB institutionnel"]
            },
            {
                title: "Stratégie Market Structure Shift",
                question: "Changement de structure marché détecté ?",
                key: "choch",
                education: `<strong>🏆 Market Structure Shift (90% précision) :</strong><br>
                <strong>Signal de retournement majeur :</strong><br>
                • <strong>ChoCh Haussier :</strong> LH cassé + nouveau HH formé<br>
                • <strong>ChoCh Baissier :</strong> HL cassé + nouveau LL formé<br>
                <strong>Confirmation requise :</strong><br>
                • <strong>Volume :</strong> Augmentation sur la cassure<br>
                • <strong>Timeframe :</strong> Confirmé sur H4 minimum<br>
                • <strong>Retest :</strong> Ancien support devient résistance<br>
                <strong>Trading :</strong> Entrer sur le retest de la zone cassée<br>
                <a href="#" onclick="dashboard.showStepChart('choch')">📈 Graphique explicatif</a>`,
                options: ["ChoCh Haussier + Retest", "ChoCh Baissier + Retest", "Structure intacte"]
            },
            {
                title: "Stratégie Trend Continuation",
                question: "Signal de continuation de tendance ?",
                key: "bos",
                education: `<strong>🏆 Trend Continuation (75% winrate) :</strong><br>
                <strong>BOS = Signal de continuation ultra fiable</strong><br>
                <strong>Setup parfait :</strong><br>
                • <strong>Tendance établie :</strong> 3+ HH/HL ou LH/LL<br>
                • <strong>Pullback sain :</strong> 38-50% de correction<br>
                • <strong>BOS confirmé :</strong> Cassure du dernier high/low<br>
                • <strong>Volume :</strong> Augmentation sur la cassure<br>
                <strong>Entrée :</strong> Pullback vers la zone cassée<br>
                <strong>Target :</strong> Extension 127-161% Fibonacci<br>
                <a href="#" onclick="dashboard.showStepChart('bos')">📈 Graphique explicatif</a>`,
                options: ["BOS Haussier + Pullback", "BOS Baissier + Pullback", "Pas de BOS valide"]
            },
            {
                title: "Stratégie Fair Value Gap",
                question: "FVG institutionnel détecté ?",
                key: "fvg",
                education: `<strong>🏆 Fair Value Gap (80% fill rate) :</strong><br>
                <strong>Gap institutionnel = Zone de liquidité manquante</strong><br>
                <strong>Identification H1/H4 :</strong><br>
                • <strong>Pattern 3 bougies :</strong> Haut bougie 1 < Bas bougie 3 (gap)<br>
                • <strong>Impulsion :</strong> 20+ pips en 2-3 bougies H1<br>
                • <strong>Volume confirmé :</strong> Augmentation visible sur l'impulsion<br>
                • <strong>FVG valide :</strong> Jamais retracé depuis la formation<br>
                <strong>Trading M15/H1 :</strong> Ordre limite dans le gap + confirmation<br>
                <strong>Statistique :</strong> 80% comblés en 24h, 95% en 48h<br>
                <a href="#" onclick="dashboard.showExample('fvg')">📊 Voir pattern 3 bougies</a><br>
                <a href="#" onclick="dashboard.showStepChart('fvg')">📈 Graphique explicatif</a>`,
                options: ["FVG Haussier à combler", "FVG Baissier à combler", "Pas de FVG institutionnel"]
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
            trendDaily: "ICT - Tendance Daily - Vue Détaillée",
            trend4h: "Smart Money - 4H - Vue Détaillée",
            trend1h: "Pullback Strategy - 1H - Vue Détaillée",
            asianSession: "London Breakout - Vue Détaillée",
            orderBlocks: "Order Block ICT - Vue Détaillée",
            choch: "Change of Character - Vue Détaillée",
            bos: "Break of Structure - Vue Détaillée",
            fvg: "Fair Value Gap - Vue Détaillée"
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
            trendDaily: {
                title: "ICT - Analyse Tendance Daily",
                chart: `<svg width="100%" height="400" viewBox="0 0 1000 400" style="background: #1e1e1e; border-radius: 8px;">
                    <!-- Grille TradingView -->
                    <defs>
                        <pattern id="tvGrid" width="50" height="25" patternUnits="userSpaceOnUse">
                            <path d="M 50 0 L 0 0 0 25" fill="none" stroke="#2a2a2a" stroke-width="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#tvGrid)" />
                    
                    <!-- Axe des prix -->
                    <line x1="950" y1="50" x2="950" y2="350" stroke="#555" stroke-width="2"/>
                    <text x="960" y="100" fill="#fff" font-size="12">1.1000</text>
                    <text x="960" y="150" fill="#fff" font-size="12">1.0950</text>
                    <text x="960" y="200" fill="#fff" font-size="12">1.0900</text>
                    <text x="960" y="250" fill="#fff" font-size="12">1.0850</text>
                    <text x="960" y="300" fill="#fff" font-size="12">1.0800</text>
                    
                    <!-- EMA 20 -->
                    <path d="M 100 280 Q 200 270 300 250 T 500 220 T 700 200 T 900 180" stroke="#ff6b35" stroke-width="3" fill="none"/>
                    <text x="750" y="175" fill="#ff6b35" font-size="14">EMA 20</text>
                    
                    <!-- Structure HH/HL -->
                    <circle cx="200" cy="270" r="4" fill="#00ff88"/>
                    <text x="180" y="290" fill="#00ff88" font-size="12">HL</text>
                    <circle cx="350" cy="240" r="4" fill="#00ff88"/>
                    <text x="330" y="230" fill="#00ff88" font-size="12">HH</text>
                    <circle cx="500" cy="220" r="4" fill="#00ff88"/>
                    <text x="480" y="210" fill="#00ff88" font-size="12">HL</text>
                    <circle cx="650" cy="200" r="4" fill="#00ff88"/>
                    <text x="630" y="190" fill="#00ff88" font-size="12">HH</text>
                    
                    <!-- Bougies Daily -->
                    <rect x="150" y="260" width="15" height="30" fill="#00ff88" stroke="#00cc66"/>
                    <line x1="157" y1="250" x2="157" y2="300" stroke="#00cc66" stroke-width="2"/>
                    <rect x="200" y="250" width="15" height="40" fill="#00ff88" stroke="#00cc66"/>
                    <line x1="207" y1="240" x2="207" y2="300" stroke="#00cc66" stroke-width="2"/>
                    <rect x="250" y="240" width="15" height="35" fill="#00ff88" stroke="#00cc66"/>
                    <line x1="257" y1="230" x2="257" y2="280" stroke="#00cc66" stroke-width="2"/>
                    
                    <!-- Flèche de tendance -->
                    <defs>
                        <marker id="trendArrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#00ff88" />
                        </marker>
                    </defs>
                    <path d="M 150 320 L 650 160" stroke="#00ff88" stroke-width="3" stroke-dasharray="10,5" marker-end="url(#trendArrow)"/>
                    <text x="350" y="230" fill="#00ff88" font-size="16">TENDANCE HAUSSIÈRE</text>
                    
                    <!-- Légende -->
                    <rect x="50" y="50" width="200" height="80" fill="rgba(0,0,0,0.8)" stroke="#555" rx="5"/>
                    <text x="60" y="70" fill="#fff" font-size="14">Signaux ICT Daily :</text>
                    <text x="60" y="90" fill="#00ff88" font-size="12">• Prix > EMA 20</text>
                    <text x="60" y="105" fill="#00ff88" font-size="12">• Structure HH/HL</text>
                    <text x="60" y="120" fill="#ff6b35" font-size="12">• Tendance confirmée</text>
                </svg>`
            },
            trend4h: {
                title: "Smart Money - Analyse 4H",
                chart: `<svg width="100%" height="400" viewBox="0 0 1000 400" style="background: #1e1e1e; border-radius: 8px;">
                    <rect width="100%" height="100%" fill="url(#tvGrid)" />
                    
                    <!-- Zone d'accumulation -->
                    <rect x="200" y="180" width="300" height="80" fill="rgba(255,193,7,0.2)" stroke="#ffc107" stroke-width="2" stroke-dasharray="5,5"/>
                    <text x="220" y="175" fill="#ffc107" font-size="14">ZONE D'ACCUMULATION</text>
                    
                    <!-- Volume institutionnel -->
                    <rect x="150" y="320" width="20" height="30" fill="#17a2b8"/>
                    <rect x="180" y="310" width="20" height="40" fill="#17a2b8"/>
                    <rect x="210" y="300" width="20" height="50" fill="#17a2b8"/>
                    <rect x="240" y="290" width="20" height="60" fill="#17a2b8"/>
                    <text x="150" y="380" fill="#17a2b8" font-size="12">Volume Institutionnel</text>
                    
                    <!-- Manipulation (Stop Hunt) -->
                    <path d="M 400 200 L 450 160 L 470 220" stroke="#dc3545" stroke-width="3" fill="none"/>
                    <text x="420" y="150" fill="#dc3545" font-size="12">Stop Hunt</text>
                    
                    <!-- Distribution -->
                    <rect x="600" y="160" width="200" height="60" fill="rgba(220,53,69,0.2)" stroke="#dc3545" stroke-width="2" stroke-dasharray="5,5"/>
                    <text x="620" y="155" fill="#dc3545" font-size="14">ZONE DE DISTRIBUTION</text>
                    
                    <!-- Bougies 4H -->
                    <rect x="250" y="200" width="12" height="25" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="280" y="210" width="12" height="20" fill="#ff4757" stroke="#ff3742"/>
                    <rect x="310" y="205" width="12" height="22" fill="#00ff88" stroke="#00cc66"/>
                    <rect x="340" y="215" width="12" height="18" fill="#ff4757" stroke="#ff3742"/>
                    
                    <!-- Légende Smart Money -->
                    <rect x="50" y="50" width="250" height="100" fill="rgba(0,0,0,0.8)" stroke="#555" rx="5"/>
                    <text x="60" y="70" fill="#fff" font-size="14">Signaux Smart Money :</text>
                    <text x="60" y="90" fill="#ffc107" font-size="12">• Accumulation = Achat</text>
                    <text x="60" y="105" fill="#dc3545" font-size="12">• Distribution = Vente</text>
                    <text x="60" y="120" fill="#17a2b8" font-size="12">• Volume = Confirmation</text>
                    <text x="60" y="135" fill="#ff4757" font-size="12">• Manipulation = Piège</text>
                </svg>`
            },
            trend1h: {
                title: "Pullback Strategy - 1H",
                chart: `<svg width="100%" height="400" viewBox="0 0 1000 400" style="background: #1e1e1e; border-radius: 8px;">
                    <rect width="100%" height="100%" fill="url(#tvGrid)" />
                    
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
        
        let detailsHTML = `
            <h2>📅 Détails du ${new Date(dateStr).toLocaleDateString('fr-FR')}</h2>
            <div class="education-content">
                <h4>📊 Résumé de la journée :</h4>
                <p><strong>Nombre de trades :</strong> ${trades.length}</p>
                <p><strong>Résultat total :</strong> <span style="color: ${totalPnL >= 0 ? '#4ecdc4' : '#ff6b6b'}">${totalPnL >= 0 ? '+$' : '-$'}${Math.abs(totalPnL).toFixed(2)}</span></p>
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
}

// Initialiser le dashboard
const dashboard = new TradingDashboard();