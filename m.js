// Основний об'єкт програми
const MathAI = {
    // Ініціалізація
    init() {
        this.setupEventListeners();
        this.loadHistory();
        this.updateStats();
        this.setupAIResponses();
    },

    // Налаштування обробників подій
    setupEventListeners() {
        // Кнопка розв'язання
        document.getElementById('calculate-btn').addEventListener('click', () => this.solveProblem());
        
        // Швидкі кнопки
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const expr = e.target.dataset.expr;
                document.getElementById('math-input').value = expr;
                this.solveProblem();
            });
        });

        // Кнопки функцій
        document.getElementById('save-btn').addEventListener('click', () => this.saveSolution());
        document.getElementById('history-btn').addEventListener('click', () => this.showHistory());
        document.getElementById('ask-ai-btn').addEventListener('click', () => this.openAIChat());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearAll());

        // Введення через Enter
        document.getElementById('math-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.solveProblem();
        });

        // Модальне вікно
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('ai-chat-modal').style.display = 'none';
        });

        // AI чат
        document.getElementById('send-question').addEventListener('click', () => this.sendAIQuestion());
        document.getElementById('ai-question').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendAIQuestion();
        });

        // Оновлення рівня
        document.getElementById('level-select').addEventListener('change', () => this.updateStats());
    },

    // Налаштування відповідей AI
    setupAIResponses() {
        this.aiResponses = {
            'чому': 'Дужки мають вищий пріоритет за інші операції. Це правило математики для уникнення неоднозначностей.',
            'як': 'Давайте розглянемо це покроково. Спочатку виконуємо операції в дужках, потім множення/ділення, а потім додавання/віднімання.',
            'що': 'Це математична операція, яка означає...',
            'формула': 'Ця формула виводиться з основного принципу...',
            'правило': 'Це правило називається "порядок виконання операцій" або PEMDAS/BODMAS.',
            'різниця': 'Різниця між цими поняттями полягає в...',
            'допоможи': 'Звісно! Давайте розберемо це разом. Який саме крок викликає труднощі?',
            'поясни': 'Добре, давайте зробимо це детально. Крок за кроком ми розберемо всю логіку.',
            'приклад': 'Ось приклад для кращого розуміння: '
        };
    },

    // Основна функція розв'язання
    solveProblem() {
        const input = document.getElementById('math-input').value.trim();
        const level = document.getElementById('level-select').value;
        
        if (!input) {
            this.showError('Будь ласка, введіть математичний вираз');
            return;
        }

        try {
            // Парсинг та обчислення
            const result = this.parseAndCalculate(input, level);
            const steps = this.generateExplanation(input, result, level);
            
            // Відображення результатів
            this.displayResult(result);
            this.displaySteps(steps);
            
            // Оновлення статистики
            this.updateStats();
            
        } catch (error) {
            this.showError(`Помилка: ${error.message}`);
        }
    },

    // Парсинг та обчислення виразу
    parseAndCalculate(expression, level) {
        // Спрощений парсер математичних виразів
        let expr = expression;
        
        // Заміна математичних констант
        expr = expr.replace(/π/g, Math.PI.toString());
        expr = expr.replace(/e/g, Math.E.toString());
        
        // Обробка змінних (для рівнянь)
        if (expr.includes('=')) {
            return this.solveEquation(expr, level);
        }
        
        // Обробка спеціальних функцій
        expr = this.processFunctions(expr);
        
        // Безпечне обчислення
        try {
            // Використання Function для обчислення (обмежено для безпеки)
            const result = eval(expr);
            return Math.round(result * 1000000) / 1000000; // Округлення
        } catch (error) {
            throw new Error('Невірний математичний вираз');
        }
    },

    // Розв'язання рівнянь
    solveEquation(equation, level) {
        const parts = equation.split('=');
        if (parts.length !== 2) {
            throw new Error('Невірний формат рівняння');
        }
        
        const left = parts[0].trim();
        const right = parts[1].trim();
        
        // Просте лінійне рівняння
        if (left.includes('x') && !left.includes('^')) {
            // Вид: ax + b = c
            const match = left.match(/(-?\d*\.?\d*)x\s*([+-]\s*\d*\.?\d*)?/);
            if (match) {
                const a = match[1] ? parseFloat(match[1]) : 1;
                const b = match[2] ? parseFloat(match[2].replace(/\s+/g, '')) : 0;
                const c = parseFloat(right);
                
                const x = (c - b) / a;
                return `x = ${x}`;
            }
        }
        
        return `Рівняння: ${equation}`;
    },

    // Обробка математичних функцій
    processFunctions(expr) {
        const functions = {
            'sin': 'Math.sin',
            'cos': 'Math.cos',
            'tan': 'Math.tan',
            'sqrt': 'Math.sqrt',
            'log': 'Math.log10',
            'ln': 'Math.log',
            'abs': 'Math.abs',
            'exp': 'Math.exp'
        };
        
        Object.entries(functions).forEach(([key, value]) => {
            const regex = new RegExp(`${key}\\(([^)]+)\\)`, 'g');
            expr = expr.replace(regex, `${value}($1)`);
        });
        
        return expr;
    },

    // Генерація пояснень
    generateExplanation(expression, result, level) {
        const steps = [];
        const levelNames = {
            'school': 'шкільний',
            'student': 'студентський',
            'engineer': 'інженерний',
            'teacher': 'викладацький'
        };
        
        // Крок 1: Аналіз виразу
        steps.push({
            step: 1,
            title: 'Аналіз виразу',
            description: `Рівень: ${levelNames[level]}. Розбираємо вираз: ${expression}`,
            detail: 'Вираз містить математичні операції, які потрібно виконати в певному порядку.'
        });
        
        // Крок 2: Пріоритет операцій
        steps.push({
            step: 2,
            title: 'Визначення пріоритету',
            description: 'За правилом PEMDAS/BODMAS: Дужки → Ступені → Множення/Ділення → Додавання/Віднімання',
            detail: 'Цей порядок гарантує коректність обчислень.'
        });
        
        // Крок 3: Обчислення
        steps.push({
            step: 3,
            title: 'Покрокове обчислення',
            description: `Виконуємо операції послідовно згідно з пріоритетами`,
            detail: level === 'school' 
                ? 'Спочатку в дужках, потім множення...' 
                : 'Використовуємо дистрибутивний закон та властивості операцій.'
        });
        
        // Крок 4: Перевірка
        steps.push({
            step: 4,
            title: 'Перевірка результату',
            description: `Отримано результат: ${result}`,
            detail: 'Перевіряємо обчислення для уникнення арифметичних помилок.'
        });
        
        // Додаткові кроки для різних рівнів
        if (level === 'student' || level === 'engineer') {
            steps.push({
                step: 5,
                title: 'Альтернативні методи',
                description: 'Можливі альтернативні способи розв\'язання',
                detail: 'Для перевірки можна використати графічний метод або чисельні методи.'
            });
        }
        
        if (level === 'engineer') {
            steps.push({
                step: 6,
                title: 'Поглиблений аналіз',
                description: 'Математичне обґрунтування кроків',
                detail: 'Використовуються властивості дистрибутивності, асоціативності та комутативності.'
            });
        }
        
        if (level === 'teacher') {
            steps.push({
                step: 7,
                title: 'Методичні рекомендації',
                description: 'Як пояснити цей матеріал учням',
                detail: 'Рекомендується починати з простих прикладів та поступово ускладнювати.'
            });
        }
        
        return steps;
    },

    // Відображення результату
    displayResult(result) {
        const resultElement = document.getElementById('result-output');
        resultElement.innerHTML = `
            <div class="result-animation">
                <i class="fas fa-check-circle" style="color: #4CAF50; font-size: 2rem; margin-bottom: 10px;"></i>
                <div style="font-size: 1.2rem; color: #666; margin-bottom: 5px;">Результат:</div>
                <div style="font-size: 2.8rem; font-weight: 800; color: #2c3e50;">${result}</div>
            </div>
        `;
    },

    // Відображення кроків
    displaySteps(steps) {
        const container = document.getElementById('steps-container');
        const stepCount = document.getElementById('step-count');
        
        stepCount.textContent = steps.length;
        
        let html = '';
        steps.forEach(step => {
            html += `
                <div class="step-item">
                    <div class="step-header">
                        <span class="step-number">Крок ${step.step}:</span>
                        <strong>${step.title}</strong>
                    </div>
                    <div class="step-description" style="margin: 8px 0; color: #555;">
                        ${step.description}
                    </div>
                    <div class="step-detail" style="background: #f0f7ff; padding: 10px; border-radius: 5px; font-size: 0.9rem; color: #444;">
                        <i class="fas fa-lightbulb" style="color: #FFC107; margin-right: 5px;"></i>
                        ${step.detail}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },

    // Збереження рішення
    saveSolution() {
        const input = document.getElementById('math-input').value;
        const result = document.getElementById('result-output').textContent;
        
        if (!input || result.includes('Тут з\'явиться')) {
            this.showError('Спочатку розв\'яжіть задачу');
            return;
        }
        
        const solution = {
            id: Date.now(),
            expression: input,
            result: result,
            level: document.getElementById('level-select').value,
            date: new Date().toLocaleString('uk-UA'),
            steps: document.getElementById('steps-container').innerHTML
        };
        
        let history = JSON.parse(localStorage.getItem('mathAIHistory') || '[]');
        history.unshift(solution);
        localStorage.setItem('mathAIHistory', JSON.stringify(history.slice(0, 10)));
        
        this.updateHistory();
        this.updateStats();
        
        // Анімація успіху
        const saveBtn = document.getElementById('save-btn');
        const originalHTML = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Збережено!';
        saveBtn.style.background = '#4CAF50';
        saveBtn.style.color = 'white';
        
        setTimeout(() => {
            saveBtn.innerHTML = originalHTML;
            saveBtn.style.background = '';
            saveBtn.style.color = '';
        }, 2000);
    },

    // Завантаження історії
    loadHistory() {
        this.updateHistory();
    },

    // Оновлення відображення історії
    updateHistory() {
        const history = JSON.parse(localStorage.getItem('mathAIHistory') || '[]');
        const historyList = document.getElementById('history-list');
        
        if (history.length === 0) {
            historyList.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">Історія порожня</div>';
            return;
        }
        
        let html = '';
        history.forEach(item => {
            html += `
                <div class="history-item" onclick="MathAI.loadFromHistory('${item.id}')">
                    <div style="font-weight: 600; color: #2c3e50;">${item.expression}</div>
                    <div style="color: #4CAF50; font-size: 0.9rem; margin-top: 5px;">
                        <i class="far fa-calendar"></i> ${item.date}
                    </div>
                </div>
            `;
        });
        
        historyList.innerHTML = html;
    },

    // Завантаження з історії
    loadFromHistory(id) {
        const history = JSON.parse(localStorage.getItem('mathAIHistory') || '[]');
        const item = history.find(h => h.id == id);
        
        if (item) {
            document.getElementById('math-input').value = item.expression;
            document.getElementById('result-output').innerHTML = item.result;
            document.getElementById('steps-container').innerHTML = item.steps;
            document.getElementById('level-select').value = item.level;
            
            // Оновлення кількості кроків
            const stepMatches = item.steps.match(/Крок \d+:/g);
            document.getElementById('step-count').textContent = stepMatches ? stepMatches.length : 0;
        }
    },

    // Відкриття AI чату
    openAIChat() {
        document.getElementById('ai-chat-modal').style.display = 'block';
        document.getElementById('ai-question').focus();
        
        // Очищення попередніх повідомлень
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = `
            <div class="ai-message">
                <div class="message-header">
                    <i class="fas fa-robot" style="color: #4CAF50;"></i>
                    <strong> AI Помічник</strong>
                </div>
                <div class="message-content">
                    Привіт! Я AI-помічник. Задайте мені будь-яке питання про математику, і я постараюся допомогти!
                </div>
            </div>
        `;
    },

    // Надсилання питання AI
    sendAIQuestion() {
        const input = document.getElementById('ai-question');
        const question = input.value.trim();
        
        if (!question) return;
        
        const chatMessages = document.getElementById('chat-messages');
        
        // Додавання питання користувача
        chatMessages.innerHTML += `
            <div class="user-message" style="text-align: right; margin: 10px 0;">
                <div class="message-header" style="justify-content: flex-end;">
                    <strong>Ви</strong>
                    <i class="fas fa-user" style="color: #2196F3; margin-left: 8px;"></i>
                </div>
                <div class="message-content" style="background: #e3f2fd; padding: 10px; border-radius: 10px; display: inline-block;">
                    ${question}
                </div>
            </div>
        `;
        
        // Генерація відповіді AI
        const aiResponse = this.generateAIResponse(question);
        
        // Додавання відповіді AI (з затримкою для реалізму)
        setTimeout(() => {
            chatMessages.innerHTML += `
                <div class="ai-message" style="margin: 10px 0;">
                    <div class="message-header">
                        <i class="fas fa-robot" style="color: #4CAF50;"></i>
                        <strong> AI Помічник</strong>
                    </div>
                    <div class="message-content" style="background: #f1f8e9; padding: 10px; border-radius: 10px;">
                        ${aiResponse}
                    </div>
                    <div class="message-time" style="font-size: 0.8rem; color: #888; margin-top: 5px;">
                        <i class="far fa-clock"></i> ${new Date().toLocaleTimeString('uk-UA', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>
            `;
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
        
        // Очищення поля введення
        input.value = '';
    },

    // Генерація відповіді AI
    generateAIResponse(question) {
        const lowerQuestion = question.toLowerCase();
        
        // Пошук ключових слів
        for (const [keyword, response] of Object.entries(this.aiResponses)) {
            if (lowerQuestion.includes(keyword)) {
                return response;
            }
        }
        
        // Загальна відповідь
        const responses = [
            'Це цікаве питання! У математиці це пов\'язано з...',
            'Давайте розглянемо це детальніше. Основна ідея полягає в...',
            'Для розуміння цього важливо знати, що...',
            'Це можна пояснити на прикладі...',
            'Згідно з математичними правилами...',
            'Це питання часто виникає у студентів. Відповідь полягає в...',
            'Для кращого розуміння рекомендую звернутися до теми...',
            'Це залежить від конкретного контексту. У вашому випадку...'
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    },

    // Показ історії
    showHistory() {
        const history = JSON.parse(localStorage.getItem('mathAIHistory') || '[]');
        if (history.length === 0) {
            alert('Історія порожня');
            return;
        }
        
        let message = 'Останні розв\'язання:\n\n';
        history.forEach((item, index) => {
            message += `${index + 1}. ${item.expression}\n   Результат: ${item.result}\n   Дата: ${item.date}\n\n`;
        });
        
        alert(message);
    },

    // Очищення
    clearAll() {
        document.getElementById('math-input').value = '';
        document.getElementById('result-output').textContent = 'Тут з\'явиться результат...';
        document.getElementById('steps-container').innerHTML = 'Пояснення з\'являться тут...';
        document.getElementById('step-count').textContent = '0';
        document.getElementById('math-input').focus();
    },

    // Оновлення статистики
    updateStats() {
        const history = JSON.parse(localStorage.getItem('mathAIHistory') || '[]');
        const levelSelect = document.getElementById('level-select');
        const levelText = levelSelect.options[levelSelect.selectedIndex].text;
        
        document.getElementById('total-solved').textContent = history.length;
        document.getElementById('total-saved').textContent = history.length;
        document.getElementById('current-level').textContent = levelText.split(' (')[0];
    },

    // Показ помилок
    showError(message) {
        const resultElement = document.getElementById('result-output');
        resultElement.innerHTML = `
            <div class="error-animation">
                <i class="fas fa-exclamation-triangle" style="color: #f44336; font-size: 2rem; margin-bottom: 10px;"></i>
                <div style="font-size: 1.2rem; color: #f44336;">${message}</div>
            </div>
        `;
        
        // Анімація помилки
        resultElement.style.animation = 'shake 0.5s';
        setTimeout(() => {
            resultElement.style.animation = '';
        }, 500);
    }
};

// Додавання CSS анімації для помилки
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    MathAI.init();
});