// app.js

const tituloGraficos = document.getElementById('titulo-graficos');
const inputIdade = document.getElementById('idade');

// Preenche tabela de referência para um sexo específico em um tbody dado
function preencherTabelaParaSexo(tbodyId, sexoReferencia) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = '';
    const distancias = [
        { label: '2.4', km: 2.4 },
        { label: '5', km: 5 },
        { label: '10', km: 10 },
        { label: '15', km: 15 },
        { label: 'Meia', km: 21.0975 }
    ];

    for (let idade = 25; idade <= 60; idade += 5) {
        const tr = document.createElement('tr');
        let rowHtml = `<td>${idade} anos</td>`;

        for (const d of distancias) {
            try {
                const { tempo, pace } = tempoEPaceParaNota(100, idade, sexoReferencia, d.km);
                rowHtml += `<td class="ref-cell"><div class="ref-tempo">${tempo}</div><div class="ref-pace">${pace}</div></td>`;
            } catch (err) {
                rowHtml += `<td class="ref-cell"><div class="ref-tempo">--</div><div class="ref-pace">--</div></td>`;
            }
        }

        tr.innerHTML = rowHtml;
        tbody.appendChild(tr);
    }
}

// Preenche ambas as tabelas (homens e mulheres)
function preencherTabelaReferencia() {
    try {
        preencherTabelaParaSexo('tabelaTemposM', 'M');
        preencherTabelaParaSexo('tabelaTemposF', 'F');
    } catch (e) {
        console.error('Erro ao preencher tabelas de referência:', e);
    }
}

// Função helper para obter distância formatada para 1 casa decimal (usada nos cálculos)
function getDistanciaFormatada() {
    const valor = parseFloat(document.getElementById('distancia').value);
    return !isNaN(valor) ? parseFloat(valor.toFixed(1)) : valor;
}

document.addEventListener('DOMContentLoaded', function () {
    // Controle de exibição dos campos de entrada
    const radioButtons = document.querySelectorAll('input[name="tipoEntrada"]');
    const tempoInput = document.getElementById('tempoInput');
    const paceInput = document.getElementById('paceInput');

    radioButtons.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.value === 'tempo') {
                tempoInput.style.display = 'block';
                paceInput.style.display = 'none';
                document.getElementById('tempo').required = true;
                document.getElementById('pace').required = false;
            } else {
                tempoInput.style.display = 'none';
                paceInput.style.display = 'block';
                document.getElementById('tempo').required = false;
                document.getElementById('pace').required = true;
            }
        });
    });

    // Manipulação do formulário
    document.getElementById('calcForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const tipoEntrada = document.querySelector('input[name="tipoEntrada"]:checked').value;
        const idade = parseInt(document.getElementById('idade').value);
        const sexo = document.getElementById('sexo').value;
        const distancia = getDistanciaFormatada();

        try {
            let nota;
            if (tipoEntrada === 'tempo') {
                const tempo = document.getElementById('tempo').value;
                nota = calcularNota(tempo, idade, sexo, distancia);
            } else {
                const pace = document.getElementById('pace').value;
                nota = calcularNotaPorPace(pace, idade, sexo, distancia);
            }
            // Renderiza a "share card" estilo app de corrida
            const inteiro = Math.max(0, Math.min(100, Math.floor(Number(nota) || 0)));

            // zona de exemplo: décadas, 90+ é "90-100"
            function zonaLabel(n) {
                if (n === 100) return '100';
                if (n >= 90) return '90-99';
                const low = Math.floor(n / 10) * 10;
                const high = low + 9;
                return `${low}-${high}`;
            }

            const frasesHomem = {
                '50-59': '😁 VIBRANDO!!! 😁',
                '60-69': '🎯😁 ZONA 2, TÁ PAGO!! 😁🎯',
                '70-79': '🏃‍♂️👏 QUE TREINO TOP!! 👏🏃‍♂️',
                '80-89': '🔥🏃‍♂️👉 SÉRIO ISSO?!! 👈🏃‍♂️🔥',
                '90-99': '😱🏅⚡ DANGER ZONE ⚡🏅😱',
                '100': '🏆🥇⚓ É P I C O ⚓🥇🏆'
            };
            const frasesMulher = {
                ...frasesHomem,
                '70-79': '🏃‍♀️👏 QUE TREINO TOP!! 👏🏃‍♀️',
                '80-89': '🔥🏃‍♀️👉 SÉRIO ISSO?!! 👈🏃‍♀️🔥',
            };
            const frasesCardPrint = {
                '60-69': '🎯 ZONA 2, PAGO!! 🎯',
                '80-89': '🔥 SÉRIO ISSO?!! 🔥',
                '90-99': '⚡ DANGER ZONE ⚡',
            }
            const frasesHomemCardPrint = {
                ...frasesHomem,
                ...frasesCardPrint,
                '70-79': '🏃‍♂️ Q TREINO TOP!! 🏃‍♂️',
            }
            const frasesMulherCardPrint = {
                ...frasesMulher,
                ...frasesCardPrint,
                '70-79': '🏃‍♀️ Q TREINO TOP!! 🏃‍♀️',
            }
            const frases = sexo === 'F' ? frasesMulher : frasesHomem;
            const frasesPrint = sexo === 'F' ? frasesMulherCardPrint : frasesHomemCardPrint;

            // utilitários de cor (RGB)
            function rgbStringToArray(rgb) {
                // Aceita tanto "rgb(r,g,b)" quanto array [r,g,b]
                if (Array.isArray(rgb)) return rgb;
                const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
            }
            function rgbArrayToString([r, g, b]) {
                return `rgb(${r}, ${g}, ${b})`;
            }
            function interpRgb(a, b, t) {
                const ra = rgbStringToArray(a), rb = rgbStringToArray(b);
                const r = Math.round(ra[0] + (rb[0] - ra[0]) * t);
                const g = Math.round(ra[1] + (rb[1] - ra[1]) * t);
                const bl = Math.round(ra[2] + (rb[2] - ra[2]) * t);
                return rgbArrayToString([r, g, bl]);
            }

            // paletas
            // usar cores do commit para repetir entre 40–89
            const pale = sexo === 'F' ? 'rgb(255, 232, 243)' : 'rgb(236, 247, 255)'; // commit: #ffe8f3 / #bce0fa
            const strong = sexo === 'F' ? 'rgb(255, 79, 134)' : 'rgb(82, 206, 255)'; // commit: #ff4f86 / #096cd5
            const strongM80 = 'rgb(133, 230, 254)';
            // const strongM80 = 'rgb(82, 206, 255)';
            const black90Start = 'rgb(40, 40, 40)'; // nota 90 bgStart (invertido)
            const black90End = 'rgb(65, 65, 65)'; // nota 90 bgEnd (invertido)
            const black = 'rgb(0, 0, 0)'; // nota 99 (preto total)
            const gold = 'rgb(255, 209, 102)'; // nota 100
            const goldM80 = 'rgb(255, 194, 51)'; // nota 100


            let bgStart, bgEnd;
            if (inteiro === 100) {
                bgStart = gold;
                bgEnd = gold;
            }
            else if (inteiro < 90) {
                // Ajuste: o visual da nota 83 passa a ocorrer em 80, mantendo a variação final de 89
                if (inteiro < 80) {
                    // 40–79: pale -> strong (commit mapeado), t = (n-40)/40
                    const t = Math.max(0, Math.min(1, (inteiro - 40) / 40)); // 0..1 (40->80)
                    bgStart = interpRgb(pale, strong, t);
                    bgEnd = interpRgb(pale, strong, Math.max(0, t * 0.2));
                } else {
                    // 80–89: deslocar a cor de 85 para ocorrer em 80 e manter 89 igual
                    // t2(80) = (85-80)/9 = 5/9, t2(89) = 1  => t2 = 5/9 + (n-80)*(4/81)
                    const t2 = Math.max(0, Math.min(1, (5 / 9) + (inteiro - 80) * (4 / 81)));
                    bgStart = interpRgb(sexo === 'F' ? strong : strongM80, sexo === 'F' ? gold : goldM80, Math.min(1, t2 * 0.2));
                    bgEnd = interpRgb(sexo === 'F' ? strong : strongM80, sexo === 'F' ? gold : goldM80, t2);
                }
            }
            else {
                // >= 90: manter lógica atual de pretos e ouro
                if (inteiro < 95) {
                    const t = (inteiro - 90) / 5; // 0..1 (90->95)
                    bgStart = interpRgb(black90Start, black, t);
                    bgEnd = interpRgb(black90End, black, t);
                } else if (inteiro < 100) {
                    bgStart = black;
                    bgEnd = black;
                }
            }

            // cor do texto — fixa por sexo para < 90 (sem variação por luminância)
            let textColor;
            if (inteiro === 100) {
                textColor = sexo === 'F' ? '#2c0045ff' : '#002157ff';
            }
            else if (inteiro < 90) {
                textColor = sexo === 'F' ? 'rgb(54, 0, 96)' : 'rgb(0, 37, 96)';
            } else {
                // 90–99: manter cores claras atuais por sexo
                textColor = sexo === 'F' ? 'rgb(230, 180, 204)' : 'rgb(156, 202, 221)';
            }

            const zone = zonaLabel(inteiro);
            const phrase = frases[zone] || (inteiro >= 90 ? frases['90-100'] : '💪 BORA VIBRAR! 💪');
            const printPhrase = (frasesPrint && frasesPrint[zone]) ? frasesPrint[zone] : phrase;

            // calcular tempo / pace para exibir no card
            let displayTempo = '--:--', displayPace = '--:--';
            try {
                if (tipoEntrada === 'tempo') {
                    const tempoVal = document.getElementById('tempo').value;
                    const seg = tempoStringParaSegundos(tempoVal);
                    displayTempo = segundosParaMMSS(seg);
                    displayPace = segundosParaMMSS(seg / distancia);
                } else {
                    const paceVal = document.getElementById('pace').value;
                    const paceSeg = tempoStringParaSegundos(paceVal);
                    displayPace = segundosParaMMSS(paceSeg);
                    const seg = paceSeg * distancia;
                    displayTempo = segundosParaMMSS(seg);
                }
            } catch (e) { /* segura se inputs faltarem */ }

            const distLabel = Number.isFinite(distancia)
                ? (distancia % 1 === 0 ? `${distancia} k` : `${distancia.toFixed(1)} k`)
                : '-- k';


            const hoje = (() => {
                const d = new Date();
                const dia = String(d.getDate()).padStart(2, '0');
                const mes = String(d.getMonth() + 1).padStart(2, '0');
                const ano = String(d.getFullYear()).slice(-2);
                return `${dia}/${mes}/${ano}`;
            })();

            // Preenche a estrutura HTML estática do card
            const shareCardEl = document.getElementById('shareCard');
            shareCardEl.style.background = `linear-gradient(180deg, ${bgStart}, ${bgEnd})`;
            shareCardEl.style.color = textColor;
            shareCardEl.style.display = 'block';
            // Persistir dados para o clone usar a mesma frase de print que você definiu
            try {
                shareCardEl.dataset.zoneKey = zone;
                shareCardEl.dataset.sexo = sexo;
                shareCardEl.dataset.phrasePrint = printPhrase;
            } catch (_) { }

            document.getElementById('cardDate').textContent = hoje;
            document.getElementById('scoreBig').textContent = inteiro;
            document.getElementById('scoreDistancia').textContent = distLabel;
            document.getElementById('zoneSmall').textContent = zone;
            document.getElementById('cardTempo').textContent = displayTempo;
            document.getElementById('cardPace').textContent = `${displayPace} /km`;
            const zonePhraseEl = document.getElementById('zonePhrase');
            zonePhraseEl.textContent = phrase;

            // Aplicar cor rgb(254, 240, 165) quando a nota estiver entre 90 e 99
            if (inteiro >= 90 && inteiro < 100) {
                zonePhraseEl.style.color = 'rgba(242, 244, 164, 1)';
            } else {
                zonePhraseEl.style.color = ''; // resetar para cor padrão
            }
            // Exibe o botão copiar se o card existir
            const copyBtn = document.getElementById('copyCardBtn');
            const shareCard = document.getElementById('shareCard');
            if (shareCard && shareCard.style.display !== 'none') {
                copyBtn.style.display = 'inline-block';
            } else {
                copyBtn.style.display = 'none';
            }
            // Exibe a seção do compositor apenas após calcular a nota
            try {
                const compositor = document.getElementById('compositor');
                if (compositor) compositor.style.display = 'block';
            } catch (_) { }
            // Sincroniza o card no compositor com o novo conteúdo e largura
            try {
                if (typeof updateOverlayCardFromShareCard === 'function') updateOverlayCardFromShareCard();
                if (typeof recalibrateOverlayWidthFromSource === 'function') recalibrateOverlayWidthFromSource();
            } catch (_) { }
        } catch (error) {
            const shareCard = document.getElementById('shareCard');
            if (shareCard) {
                shareCard.style.display = 'none';
            }
            document.getElementById('nota').innerHTML = `<div style="color: red;">Erro: ${error.message}</div>`;
        }
    });

    preencherTabelaReferencia();
});

// Helpers
function tempoStringParaSegundos(t) {
    if (t == null) return NaN;
    if (typeof t === 'number') return t; // já em segundos
    const p = String(t).split(':').map(Number);
    if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
    if (p.length === 2) return p[0] * 60 + p[1];
    return NaN;
}

// formata segundos para mm:ss ou hh:mm:ss quando >= 3600s
function segundosParaMMSS(sec) {
    if (!isFinite(sec) || isNaN(sec)) return '--:--';
    const total = Math.round(sec);
    if (total >= 3600) {
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    } else {
        const m = Math.floor(total / 60);
        const s = total % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
}

// Gera dados (array de {x: tempoSegundos, y: nota}) para uma distância e sexo
function gerarDadosParaDistancia(notas, idade, sexo, km) {
    const dados = [];
    for (const nota of notas) {
        try {
            const res = tempoEPaceParaNota(nota, idade, sexo, km);
            let tempo;
            if (res && typeof res === 'object') tempo = res.tempo || res.time || res.t || res;
            else tempo = res;
            const seg = tempoStringParaSegundos(tempo);
            if (isFinite(seg)) dados.push({ x: seg, y: nota });
            else dados.push({ x: null, y: nota });
        } catch (e) {
            dados.push({ x: null, y: nota });
        }
    }
    return dados;
}

// Cria/atualiza todos os gráficos — agora com Nota no eixo Y (iniciando em 50)
function gerarGraficos() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js não carregado');
        return;
    }

    // Intervalo de notas: 50 → 100 (a cada 5)
    const notas = [];
    for (let n = 50; n <= 100; n += n >= 90 ? 1 : 5) notas.push(n);

    const idade = parseInt(document.getElementById('idade')?.value) || 30;
    const distancias = [
        { id: 'chart-2-4', km: 2.4, label: '2.4 km' },
        { id: 'chart-5', km: 5, label: '5 km' },
        { id: 'chart-10', km: 10, label: '10 km' },
        { id: 'chart-15', km: 15, label: '15 km' },
        { id: 'chart-meia', km: 21.0975, label: 'Meia' }
    ];

    window._charts = window._charts || {};

    for (const d of distancias) {
        const ctx = document.getElementById(d.id);
        if (!ctx) continue;

        if (window._charts[d.id]) {
            try { window._charts[d.id].destroy(); } catch (e) { }
        }

        const dadosM = gerarDadosParaDistancia(notas, idade, 'M', d.km);
        const dadosF = gerarDadosParaDistancia(notas, idade, 'F', d.km);

        const cfg = {
            type: 'line',
            data: {
                // labels não são mais usados para a série; cada ponto tem x (tempo) e y (nota)
                datasets: [
                    {
                        label: 'Homens',
                        data: dadosM,
                        borderColor: 'rgb(25, 118, 210)',
                        backgroundColor: 'rgba(25,118,210,0.08)',
                        spanGaps: true,
                        tension: 0.25,
                        pointRadius: 3,
                        parsing: false // usar objetos {x,y} diretamente
                    },
                    {
                        label: 'Mulheres',
                        data: dadosF,
                        borderColor: 'rgb(216, 27, 96)',
                        backgroundColor: 'rgba(216,27,96,0.08)',
                        spanGaps: true,
                        tension: 0.25,
                        pointRadius: 3,
                        parsing: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'nearest', intersect: false },
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            title: function (items) {
                                // mostrar tempo no título do tooltip
                                const item = items[0];
                                return item && item.raw && item.raw.x != null ? segundosParaMMSS(item.raw.x) : '';
                            },
                            label: function (ctx) {
                                const v = ctx.raw;
                                const nota = (v && v.y != null) ? v.y : '--';
                                return (ctx.dataset.label || '') + ': Nota ' + nota;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Tempo (mm:ss ou hh:mm:ss)' },
                        ticks: {
                            callback: function (value) { return segundosParaMMSS(value); }
                        },
                        type: 'linear',
                        position: 'bottom'
                    },
                    y: {
                        title: { display: true, text: 'Nota' },
                        min: 50,
                        max: 100,
                        ticks: {
                            stepSize: 5
                        }
                    }
                }
            }
        };

        const wrap = ctx.parentElement;
        if (wrap) wrap.style.minHeight = '220px';

        try {
            window._charts[d.id] = new Chart(ctx.getContext('2d'), cfg);
        } catch (e) {
            console.error('Erro ao criar gráfico', d.id, e);
        }
    }
}

// Adicione esta função para atualizar o título
function atualizarTituloGraficos() {
    const idade = inputIdade.value;
    tituloGraficos.textContent = `Gráficos: Nota vs Tempo (${idade} anos)`;
}

// Chamar gerarGraficos() após carregar página e quando idade mudar
document.addEventListener('DOMContentLoaded', function () {
    try { gerarGraficos(); } catch (e) { }
    const idadeInput = document.getElementById('idade');
    if (idadeInput) idadeInput.addEventListener('change', () => { try { gerarGraficos(); } catch (e) { } });
    // Inicializa compositor após DOM pronto
    try { setupCompositor(); } catch (e) { console.warn('Compositor não inicializado:', e); }
});

// Adicione estes event listeners
inputIdade.addEventListener('change', atualizarTituloGraficos);
inputIdade.addEventListener('input', atualizarTituloGraficos);

// Chamar a função uma vez para definir o título inicial
atualizarTituloGraficos();

function atualizarTabelaNotas() {
    const idade = parseInt(document.getElementById('idade').value);
    const sexo = document.getElementById('sexo').value;
    const distancia = getDistanciaFormatada();
    const tabelaNotas = document.getElementById('tabelaNotas');
    const idadeRef = document.getElementById('idade-ref');

    // Atualiza a idade no título
    idadeRef.textContent = idade;

    // Limpa a tabela
    tabelaNotas.innerHTML = '';

    // Gera linhas para notas de 100 a 50
    for (let nota = 50; nota <= 100; nota += 1) {
        const resultado = tempoEPaceParaNota(nota, idade, sexo, distancia);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${nota}</td>
            <td>${resultado.tempo}</td>
            <td>${resultado.pace}</td>
        `;
        tabelaNotas.appendChild(tr);
    }
}

// Adicionar event listeners para atualizar a tabela
document.getElementById('idade').addEventListener('change', atualizarTabelaNotas);
document.getElementById('sexo').addEventListener('change', atualizarTabelaNotas);
document.getElementById('distancia').addEventListener('change', atualizarTabelaNotas);

// Inicializar a tabela
document.addEventListener('DOMContentLoaded', atualizarTabelaNotas);

function atualizarTituloReferencia() {
    const idade = document.getElementById('idade').value;
    const sexo = document.getElementById('sexo').value;
    const distancia = document.getElementById('distancia').value;

    document.getElementById('idade-ref').textContent = idade;
    document.getElementById('distancia-ref').textContent = distancia;
    document.getElementById('sexo-ref').textContent = sexo === 'M' ? 'Masc.' : 'Fem.';
}

// Adicionar event listeners
document.getElementById('idade').addEventListener('change', atualizarTituloReferencia);
document.getElementById('sexo').addEventListener('change', atualizarTituloReferencia);
document.getElementById('distancia').addEventListener('change', atualizarTituloReferencia);

// Inicializar o título
document.addEventListener('DOMContentLoaded', atualizarTituloReferencia);

// ============================
// Compositor: upload + overlay
// ============================
let _compose = null;

function setupCompositor() {
    const input = document.getElementById('composeInput');
    const img = document.getElementById('composeImg');
    const overlay = document.getElementById('composeOverlay');
    const exportBtn = document.getElementById('composeExport');
    const shareBtn = document.getElementById('composeShare');
    const wrap = document.getElementById('composeWrap');
    const scaleInput = document.getElementById('composeScale');
    const scaleLabel = document.getElementById('composeScaleLabel');

    // parâmetros reutilizáveis para exportar/compartilhar o PRINT (compositor)
    const EXPORT_SCALE = 3;
    const EXPORT_MIME = 'image/png';
    const EXPORT_QUALITY = 1;

    if (!input || !img || !overlay || !exportBtn || !wrap) return;
    // manter overlay invisível até que a imagem esteja carregada
    try { overlay.style.visibility = 'hidden'; } catch (_) { }
    if (shareBtn) shareBtn.disabled = true;

    // cria contêiner interno sem padding/bordas para exportação
    let exportRoot = wrap.querySelector('.compose-export-root');
    if (!exportRoot) {
        exportRoot = document.createElement('div');
        exportRoot.className = 'compose-export-root';
        exportRoot.style.position = 'relative';
        exportRoot.style.display = 'inline-block';
        exportRoot.style.padding = '0';
        exportRoot.style.margin = '0';
        exportRoot.style.border = 'none';
        // mover img e overlay para dentro do exportRoot
        if (img && img.parentElement === wrap) exportRoot.appendChild(img);
        if (overlay && overlay.parentElement === wrap) exportRoot.appendChild(overlay);
        wrap.appendChild(exportRoot);
    }

    _compose = { input, img, overlay, exportBtn, wrap, exportRoot, scaleInput, scaleLabel, cardEl: null, dragging: false, dragOff: { x: 0, y: 0 }, baseWidth: null, frozenBaseWidth: null, scale: 100, metrics: null, isPinching: false, pinchStartDist: 0, pinchBaseScale: 100 };

    input.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            // aguardar renderização da imagem antes de criar/atualizar o card clonado
            img.onload = () => {
                img.style.display = 'block';
                exportBtn.disabled = false;
                if (shareBtn) shareBtn.disabled = false;
                // só agora o overlay pode ficar visível
                try { overlay.style.visibility = 'visible'; } catch (_) { }
                // exibe controles (escala e botões) somente após a imagem carregar
                try {
                    const scaleRow = document.getElementById('composeScaleRow');
                    const actions = document.getElementById('composeActions');
                    if (scaleRow) scaleRow.style.display = 'flex';
                    if (actions) actions.style.display = 'flex';
                } catch (_) { }
                if (!_compose.cardEl) {
                    ensureOverlayCard();
                } else {
                    applyOverlayWidthFromBase();
                }
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });

    // Slider para tamanho do card (preserva proporção)
    if (scaleInput) {
        const applyScale = (val) => {
            _compose.scale = Number(val) || 100;
            if (_compose.cardEl) {
                const s = (_compose.scale / 100);
                _compose.cardEl.style.transformOrigin = 'top left';
                _compose.cardEl.style.transform = `scale(${s})`;
            }
            if (scaleLabel) scaleLabel.textContent = `${_compose.scale}%`;
        };
        scaleInput.addEventListener('input', (ev) => applyScale(ev.target.value));
        // Label inicial + aplicar transform inicial
        if (scaleLabel) scaleLabel.textContent = `${scaleInput.value}%`;
        // aplica no estado atual, se já houver card
        if (_compose.cardEl) {
            const s = (Number(scaleInput.value || 100) / 100);
            _compose.cardEl.style.transformOrigin = 'top left';
            _compose.cardEl.style.transform = `scale(${s})`;
        }
    }

    // Drag handlers (mouse + touch)
    const startDrag = (cx, cy) => {
        if (!_compose || !_compose.cardEl) return;
        _compose.dragging = true;
        const rect = _compose.cardEl.getBoundingClientRect();
        _compose.dragOff.x = cx - rect.left;
        _compose.dragOff.y = cy - rect.top;
        document.body.style.userSelect = 'none';
    };
    const moveDrag = (cx, cy) => {
        if (!_compose || !_compose.dragging || !_compose.cardEl) return;
        // Converte client coords para coords relativas ao overlay
        const oRect = _compose.overlay.getBoundingClientRect();
        let x = cx - oRect.left - _compose.dragOff.x;
        let y = cy - oRect.top - _compose.dragOff.y;
        // limitar dentro do overlay
        const cRect = _compose.cardEl.getBoundingClientRect(); // já considera transform(scale)
        const maxX = oRect.width - cRect.width;
        const maxY = oRect.height - cRect.height;
        x = Math.max(0, Math.min(maxX, x));
        y = Math.max(0, Math.min(maxY, y));
        _compose.cardEl.style.left = x + 'px';
        _compose.cardEl.style.top = y + 'px';
    };
    const endDrag = () => {
        if (_compose) _compose.dragging = false;
        document.body.style.userSelect = '';
    };

    // mouse
    overlay.addEventListener('mousedown', (ev) => {
        if (!_compose.cardEl) return;
        const rect = _compose.cardEl.getBoundingClientRect();
        const inside = ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom;
        if (inside) {
            startDrag(ev.clientX, ev.clientY);
            ev.preventDefault();
        }
        // se clicar fora do card, não inicia drag e não previne default: permite rolagem/seleção
    });
    window.addEventListener('mousemove', (ev) => moveDrag(ev.clientX, ev.clientY));
    window.addEventListener('mouseup', endDrag);
    // touch
    overlay.addEventListener('touchstart', (ev) => {
        if (!ev.touches || !ev.touches[0]) return;
        // Pinch: 2+ dedos iniciam zoom
        if (ev.touches.length >= 2) {
            const a = ev.touches[0];
            const b = ev.touches[1];
            const dx = a.clientX - b.clientX;
            const dy = a.clientY - b.clientY;
            _compose.isPinching = true;
            _compose.pinchStartDist = Math.hypot(dx, dy) || 1;
            _compose.pinchBaseScale = _compose.scale || 100;
            ev.preventDefault();
            return;
        }
        // Drag com 1 dedo somente se iniciar dentro do card
        const t = ev.touches[0];
        if (_compose.cardEl) {
            const rect = _compose.cardEl.getBoundingClientRect();
            const inside = t.clientX >= rect.left && t.clientX <= rect.right && t.clientY >= rect.top && t.clientY <= rect.bottom;
            if (inside) {
                startDrag(t.clientX, t.clientY);
                ev.preventDefault(); // só previne se for iniciar drag
            }
        }
        // se tocar fora do card, não inicia drag e não previne default: permite rolagem
    }, { passive: false });
    window.addEventListener('touchmove', (ev) => {
        if (!ev.touches || !ev.touches[0]) return;
        // Se pinch ativo e dois dedos, ajustar escala
        if (_compose && _compose.isPinching && ev.touches.length >= 2) {
            const a = ev.touches[0];
            const b = ev.touches[1];
            const dx = a.clientX - b.clientX;
            const dy = a.clientY - b.clientY;
            const dist = Math.hypot(dx, dy) || 1;
            const newScale = Math.max(35, Math.min(160, (_compose.pinchBaseScale || 100) * (dist / (_compose.pinchStartDist || 1))));
            _compose.scale = newScale;
            if (_compose.cardEl) {
                const s = (newScale / 100);
                _compose.cardEl.style.transformOrigin = 'top left';
                _compose.cardEl.style.transform = `scale(${s})`;
            }
            if (_compose.scaleInput) {
                _compose.scaleInput.value = String(Math.round(newScale));
                if (_compose.scaleLabel) _compose.scaleLabel.textContent = `${Math.round(newScale)}%`;
            }
            ev.preventDefault();
            return;
        }
        // Caso contrário, processa drag com 1 dedo
        const t = ev.touches[0];
        moveDrag(t.clientX, t.clientY);
    }, { passive: false });
    window.addEventListener('touchend', (ev) => {
        if (_compose && ev.touches && ev.touches.length < 2) {
            _compose.isPinching = false;
        }
        endDrag();
    });

    exportBtn.addEventListener('click', async () => {
        if (!_compose || !_compose.img.src) return;
        try {
            const target = _compose.exportRoot || wrap;
            const canvas = await html2canvas(target, { backgroundColor: null, useCORS: true, scale: EXPORT_SCALE });
            const dataUrl = canvas.toDataURL(EXPORT_MIME, EXPORT_QUALITY);
            const link = document.createElement('a');
            link.href = dataUrl;
            // Monta nome do arquivo usando o texto de scoreDistancia (sem espaços)
            const distEl = document.getElementById('scoreDistancia');
            let distStr = (distEl && distEl.textContent) ? distEl.textContent.trim() : '';
            distStr = distStr.replace(/\s+/g, '');
            const notaEl = document.getElementById('scoreBig');
            let notaStr = (notaEl && notaEl.textContent) ? notaEl.textContent.trim() : '';
            notaStr = notaStr.replace(/\s+/g, '');
            const now = new Date();
            const dd = String(now.getDate()).padStart(2, '0');
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const yy = String(now.getFullYear()).slice(-2);
            link.download = `igdcc-${notaStr}-${distStr}_${dd}-${mm}-${yy}.png`;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            console.error('Falha ao exportar imagem composta:', e);
            alert('Não foi possível gerar a imagem.');
        }
    });

    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            if (!_compose || !_compose.img.src) return;
            try {
                const target = _compose.exportRoot || wrap;
                const canvas = await html2canvas(target, { backgroundColor: null, useCORS: true, scale: 3 });
                const distEl = document.getElementById('scoreDistancia');
                let distStr = (distEl && distEl.textContent) ? distEl.textContent.trim() : '';
                distStr = distStr.replace(/\s+/g, '');
                const notaEl = document.getElementById('scoreBig');
                let notaStr = (notaEl && notaEl.textContent) ? notaEl.textContent.trim() : '';
                notaStr = notaStr.replace(/\s+/g, '');
                const now = new Date();
                const dd = String(now.getDate()).padStart(2, '0');
                const mm = String(now.getMonth() + 1).padStart(2, '0');
                const yy = String(now.getFullYear()).slice(-2);
                const filename = `igdcc-${notaStr}-${distStr}_${dd}-${mm}-${yy}.png`;

                const blob = await new Promise(resolve => canvas.toBlob(resolve, EXPORT_MIME, EXPORT_QUALITY));
                if (!blob) throw new Error('Falha ao gerar imagem');
                const file = new File([blob], filename, { type: EXPORT_MIME });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'IGDCC',
                        text: 'Meu print do IGDCC'
                    });
                    return;
                }
                if (navigator.share) {
                    // Fallback: compartilhar um data URL (alguns ambientes aceitam)
                    const dataUrl = canvas.toDataURL(EXPORT_MIME, EXPORT_QUALITY);
                    await navigator.share({
                        title: 'IGDCC',
                        text: 'Meu print do IGDCC',
                        url: dataUrl
                    });
                    return;
                }
                // Fallback final: abrir em nova aba para o usuário salvar/compartilhar manualmente
                const dataUrl = URL.createObjectURL(blob);
                window.open(dataUrl, '_blank');
            } catch (e) {
                console.error('Falha ao compartilhar:', e);
                // alert('Compartilhamento não suportado neste dispositivo/navegador.');
            }
        });
    }

    // criação do card no overlay ocorre somente após a imagem ser carregada (img.onload)
}

function ensureOverlayCard() {
    if (!_compose) return;
    const srcCard = document.getElementById('shareCard');
    if (!srcCard || srcCard.style.display === 'none') return;
    if (_compose.cardEl && _compose.cardEl.parentElement) {
        // atualizar conteúdo
        const posLeft = _compose.cardEl.style.left;
        const posTop = _compose.cardEl.style.top;
        const totalW = (_compose.baseWidth != null) ? _compose.baseWidth : _compose.cardEl.getBoundingClientRect().width;
        _compose.cardEl.replaceWith(cloneShareCard(srcCard));
        _compose.cardEl = _compose.overlay.querySelector('.share-card');
        makeOverlayPositioned(_compose.cardEl);
        // manter posição e largura atual respeitando box model
        const cs = window.getComputedStyle(srcCard);
        const num = (v) => parseFloat(v || '0') || 0;
        const hPadding = num(cs.paddingLeft) + num(cs.paddingRight);
        const hBorder = num(cs.borderLeftWidth) + num(cs.borderRightWidth);
        let setWidth = totalW;
        if (cs.boxSizing === 'content-box') setWidth = Math.max(0, totalW - hPadding - hBorder);
        _compose.cardEl.style.boxSizing = cs.boxSizing;
        _compose.cardEl.style.left = posLeft || '16px';
        _compose.cardEl.style.top = posTop || '16px';
        // reaplica escala atual
        const s = (_compose.scale / 100);
        _compose.cardEl.style.transformOrigin = 'top left';
        _compose.cardEl.style.transform = `scale(${s})`;
        return;
    }
    const clone = cloneShareCard(srcCard);
    _compose.cardEl = clone;
    _compose.overlay.style.position = 'absolute';
    _compose.overlay.style.inset = '0';
    _compose.overlay.appendChild(clone);
    // posição inicial: 16px 16px
    clone.style.left = '16px';
    clone.style.top = '16px';
    // mede largura original do card de origem (mais fiel) e fixa como base (preserva proporção)
    const origRect = srcCard.getBoundingClientRect();
    const cs = window.getComputedStyle(srcCard);
    // usa a largura congelada se já existir; caso contrário, mede e congela agora
    const measured = origRect.width; // largura total (border-box visual, com decimais)
    const ow = (_compose.frozenBaseWidth != null) ? _compose.frozenBaseWidth : measured;
    if (_compose.frozenBaseWidth == null) _compose.frozenBaseWidth = ow;
    _compose.baseWidth = ow;
    // coleta métricas para respeitar box-sizing
    const num = (v) => parseFloat(v || '0') || 0;
    const metrics = {
        boxSizing: cs.boxSizing,
        hPadding: num(cs.paddingLeft) + num(cs.paddingRight),
        hBorder: num(cs.borderLeftWidth) + num(cs.borderRightWidth)
    };
    _compose.metrics = metrics;
    // define width base respeitando o box model (não escalamos a largura)
    let contentWidth = ow;
    if (metrics.boxSizing === 'content-box') contentWidth = Math.max(0, ow - metrics.hPadding - metrics.hBorder);
    clone.style.boxSizing = cs.boxSizing;
    clone.style.maxWidth = 'none';
    clone.style.width = contentWidth + 'px';
    clone.style.minWidth = contentWidth + 'px';
    clone.style.maxWidth = contentWidth + 'px';
    // aplica escala do slider via transform se existir
    if (_compose.scaleInput) {
        const perc = Number(_compose.scaleInput.value) || 100;
        _compose.scale = perc;
        const s = perc / 100;
        clone.style.transformOrigin = 'top left';
        clone.style.transform = `scale(${s})`;
        if (_compose.scaleLabel) _compose.scaleLabel.textContent = `${perc}%`;
    }
}

function cloneShareCard(srcCard) {
    const clone = srcCard.cloneNode(true);
    // remove id do próprio nó e de todos os descendentes para evitar duplicatas no DOM
    const stripIds = (el) => {
        if (el.nodeType !== 1) return;
        if (el.id) el.removeAttribute('id');
        const children = el.children || [];
        for (let i = 0; i < children.length; i++) stripIds(children[i]);
    };
    stripIds(clone);
    // remove a seção de meta do card no clone (print não deve exibir)
    try {
        const metas = clone.querySelectorAll('.card-meta');
        metas.forEach(n => n.remove());
    } catch (_) { }
    clone.style.display = 'block';
    clone.style.position = 'absolute';
    clone.style.pointerEvents = 'none'; // evita capturar cliques internos, drag é pelo overlay
    // garantir mesmas cores inline aplicadas no original
    clone.style.background = srcCard.style.background;
    clone.style.color = srcCard.style.color;
    // Copiar propriedades tipográficas para evitar variações por contexto
    try {
        const cs = window.getComputedStyle(srcCard);
        const props = [
            'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'wordSpacing',
            'fontStretch', 'fontVariant', 'fontKerning', 'textTransform', 'textRendering'
        ];
        for (const p of props) clone.style[p] = cs[p];
    } catch (_) { }
    // Ajuste específico do clone: aplicar frasesPrint e espaçamento/estilos da zone-phrase para print/export
    try {
        const zp = clone.querySelector('.zone-phrase');
        if (zp) {
            // usar a frase de print já resolvida no card original
            try {
                const pf = (srcCard && srcCard.dataset && srcCard.dataset.phrasePrint) || '';
                if (pf) zp.textContent = pf;
            } catch (_) { }
            zp.style.marginTop = '12px';
            // remover blur no clone (print/export)
            zp.style.backdropFilter = 'none';
            zp.style.webkitBackdropFilter = 'none';
        }
    } catch (_) { }
    // Distribui emojis somente no clone e não para nota 100
    try { distributeZoneEmojisOnCard(clone); } catch (_) { }
    return clone;
}

// Redistribui emojis no card clonado (não afeta o card original) e ignora quando a nota é 100
function distributeZoneEmojisOnCard(cardEl) {
    if (!cardEl) return;
    try {
        const scoreEl = cardEl.querySelector('.score-big');
        const scoreTxt = (scoreEl && scoreEl.textContent || '').trim();
        if (scoreTxt === '100') return; // não distribuir para 100
        const zoneEl = cardEl.querySelector('.zone-phrase');
        if (!zoneEl) return;
        const leftCorner = cardEl.querySelector('.card-corner-left');
        const rightCorner = cardEl.querySelector('.card-corner-right');
        const text = (zoneEl.textContent || '').trim();
        // Segmentar por grafema (mantém ZWJ); usa Intl.Segmenter se disponível
        const segmentGraphemes = (s) => {
            try {
                if (typeof Intl !== 'undefined' && Intl.Segmenter) {
                    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
                    return Array.from(seg.segment(s), it => it.segment);
                }
            } catch (_) { }
            const arr = Array.from(s);
            const out = [];
            for (let i = 0; i < arr.length; i++) {
                let g = arr[i];
                while (i + 1 < arr.length && arr[i + 1] === '\uFE0F') { g += arr[++i]; }
                while (i + 2 < arr.length && arr[i + 1] === '\u200D') {
                    g += arr[++i];
                    g += arr[++i];
                    while (i + 1 < arr.length && arr[i + 1] === '\uFE0F') { g += arr[++i]; }
                }
                out.push(g);
            }
            return out;
        };
        const units = segmentGraphemes(text);
        const isEmojiUnit = (u) => {
            if (!u) return false;
            for (const ch of Array.from(u)) {
                const cp = ch.codePointAt(0);
                if (cp >= 0x1F000 && cp <= 0x1FAFF) return true;
                if ((cp >= 0x2190 && cp <= 0x21FF) || (cp >= 0x2300 && cp <= 0x23FF)) return true;
                if ((cp >= 0x2460 && cp <= 0x24FF) || (cp >= 0x2600 && cp <= 0x27BF)) return true;
                if ((cp >= 0x2900 && cp <= 0x297F) || (cp >= 0x2B00 && cp <= 0x2BFF)) return true;
            }
            return false;
        };
        // leading
        let s = 0; const leading = [];
        while (s < units.length) {
            const u = units[s];
            if (u === ' ') { s++; continue; }
            if (isEmojiUnit(u)) { leading.push(u); s++; continue; }
            break;
        }
        // trailing
        let e = units.length - 1; const trailing = [];
        while (e >= 0) {
            const u = units[e];
            if (u === ' ') { e--; continue; }
            if (isEmojiUnit(u)) { trailing.push(u); e--; continue; }
            break;
        }
        const core = units.slice(s, e + 1).join('');
        // manter o mais próximo do texto dentro; demais vão pros cantos
        const keepLeft = leading.length ? leading[leading.length - 1] : '';
        const keepRight = trailing.length ? trailing[trailing.length - 1] : '';
        const zoneText = [keepLeft, core, keepRight].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
        zoneEl.textContent = zoneText;
        if (leftCorner) {
            const extraLeft = leading.slice(0, Math.max(0, leading.length - 1)).reverse();
            leftCorner.innerHTML = extraLeft.length ? extraLeft.map(x => `<div>${x}</div>`).join('') : '';
        }
        if (rightCorner) {
            const extraRight = trailing.slice(0, Math.max(0, trailing.length - 1)).reverse();
            rightCorner.innerHTML = extraRight.length ? extraRight.map(x => `<div>${x}</div>`).join('') : '';
        }
    } catch (_) { }
}

function makeOverlayPositioned(el) {
    if (!el) return;
    el.style.position = 'absolute';
    el.style.pointerEvents = 'none';
}

// Exposta para ser chamada após recalcular o card
function updateOverlayCardFromShareCard() {
    if (!_compose) return;
    const srcCard = document.getElementById('shareCard');
    if (!srcCard || srcCard.style.display === 'none') return;
    ensureOverlayCard();
    if (_compose.cardEl) {
        // Atualiza conteúdo textual do clone para refletir mudanças
        const fresh = srcCard.cloneNode(true);
        // strip IDs do clone inteiro
        (function stripIds(el) { if (el.nodeType !== 1) return; if (el.id) el.removeAttribute('id'); const kids = el.children || []; for (let i = 0; i < kids.length; i++) stripIds(kids[i]); })(fresh);
        // remove a seção de meta do card no clone (print não deve exibir)
        try {
            const metas2 = fresh.querySelectorAll('.card-meta');
            metas2.forEach(n => n.remove());
        } catch (_) { }
        fresh.style.display = 'block';
        fresh.style.position = 'absolute';
        fresh.style.left = _compose.cardEl.style.left || '16px';
        fresh.style.top = _compose.cardEl.style.top || '16px';
        fresh.style.background = srcCard.style.background;
        fresh.style.color = srcCard.style.color;
        fresh.style.pointerEvents = 'none';
        // Copiar propriedades tipográficas para evitar variações por contexto
        try {
            const cs2 = window.getComputedStyle(srcCard);
            const props2 = [
                'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'wordSpacing',
                'fontStretch', 'fontVariant', 'fontKerning', 'textTransform', 'textRendering'
            ];
            for (const p of props2) fresh.style[p] = cs2[p];
        } catch (_) { }
        // Atualiza apenas metrics; mantém baseWidth congelada
        const cs = window.getComputedStyle(srcCard);
        _compose.baseWidth = (_compose.frozenBaseWidth != null) ? _compose.frozenBaseWidth : _compose.baseWidth;
        const num = (v) => parseFloat(v || '0') || 0;
        _compose.metrics = {
            boxSizing: cs.boxSizing,
            hPadding: num(cs.paddingLeft) + num(cs.paddingRight),
            hBorder: num(cs.borderLeftWidth) + num(cs.borderRightWidth)
        };
        // manter largura base e aplicar escala via transform
        fresh.style.boxSizing = cs.boxSizing;
        const hPadding = num(cs.paddingLeft) + num(cs.paddingRight);
        const hBorder = num(cs.borderLeftWidth) + num(cs.borderRightWidth);
        let baseContent = _compose.baseWidth || fresh.getBoundingClientRect().width;
        if (cs.boxSizing === 'content-box') baseContent = Math.max(0, (_compose.baseWidth || 0) - hPadding - hBorder);
        // aplica escala atual
        const s2 = (_compose.scale / 100);
        fresh.style.transformOrigin = 'top left';
        fresh.style.transform = `scale(${s2})`;
        // Ajuste específico do clone atualizado: aplicar frasesPrint e garantir margin-top da zone-phrase em 12px e sem blur
        try {
            const zp2 = fresh.querySelector('.zone-phrase');
            if (zp2) {
                // usar a frase de print já persistida no card original
                try {
                    const pf2 = (srcCard && srcCard.dataset && srcCard.dataset.phrasePrint) || '';
                    if (pf2) zp2.textContent = pf2;
                } catch (_) { }
                zp2.style.marginTop = '12px';
                zp2.style.backdropFilter = 'none';
                zp2.style.webkitBackdropFilter = 'none';
            }
        } catch (_) { }
        // Distribui emojis somente no clone e não para nota 100
        try { distributeZoneEmojisOnCard(fresh); } catch (_) { }
        _compose.cardEl.replaceWith(fresh);
        _compose.cardEl = fresh;
    }
}

function applyOverlayWidthFromBase() {
    if (!_compose || !_compose.cardEl || !_compose.baseWidth) return;
    const cs = window.getComputedStyle(document.getElementById('shareCard'));
    // garante largura base fixa
    const num = (v) => parseFloat(v || '0') || 0;
    const hPadding = num(cs.paddingLeft) + num(cs.paddingRight);
    const hBorder = num(cs.borderLeftWidth) + num(cs.borderRightWidth);
    let baseContent = _compose.baseWidth;
    if (cs.boxSizing === 'content-box') baseContent = Math.max(0, _compose.baseWidth - hPadding - hBorder);
    _compose.cardEl.style.boxSizing = cs.boxSizing;
    // aplica escala
    const s = (_compose.scale / 100);
    _compose.cardEl.style.transformOrigin = 'top left';
    _compose.cardEl.style.transform = `scale(${s})`;
}

function recalibrateOverlayWidthFromSource() {
    if (!_compose || !_compose.cardEl) return;
    const srcCard = document.getElementById('shareCard');
    if (!srcCard || srcCard.style.display === 'none') return;
    requestAnimationFrame(() => {
        const rect = srcCard.getBoundingClientRect();
        const cs = window.getComputedStyle(srcCard);
        // congela nova largura base conforme pedido
        _compose.frozenBaseWidth = rect.width;
        _compose.baseWidth = rect.width;
        // aplica novamente largura e escala
        const num = (v) => parseFloat(v || '0') || 0;
        const hPadding = num(cs.paddingLeft) + num(cs.paddingRight);
        const hBorder = num(cs.borderLeftWidth) + num(cs.borderRightWidth);
        let baseContent = _compose.baseWidth;
        if (cs.boxSizing === 'content-box') baseContent = Math.max(0, _compose.baseWidth - hPadding - hBorder);
        _compose.cardEl.style.boxSizing = cs.boxSizing;
        const s = (_compose.scale / 100);
        _compose.cardEl.style.transformOrigin = 'top left';
        _compose.cardEl.style.transform = `scale(${s})`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const metasTop = window.temposRefOrig;
    if (!metasTop) return;

    // --- Funções auxiliares ---
    const tempoParaSegundos = (tempoStr) => {
        if (!tempoStr) return 0;
        const partes = tempoStr.split(":").map(Number);
        if (partes.length === 2) return partes[0] * 60 + partes[1];
        if (partes.length === 3) return partes[0] * 3600 + partes[1] * 60 + partes[2];
        return 0;
    };

    const segundosParaTempo = (seg) => {
        const min = Math.floor(seg / 60);
        const s = Math.round(seg % 60);
        return `${min}:${s.toString().padStart(2, "0")}`;
    };

    const calcularPace = (distanciaKm, tempoStr) => {
        const segundos = tempoParaSegundos(tempoStr);
        if (!segundos || !distanciaKm) return "--:--";
        const paceSeg = segundos / distanciaKm;
        return segundosParaTempo(paceSeg);
    };

    // --- Preenche tabela estática ---
    const tbody = document.getElementById("temposRefOrigTbody");
    if (!tbody) return;

    tbody.innerHTML = '';

    for (const [distancia, dados] of Object.entries(metasTop)) {
        // Normaliza a distância (ex.: "meia" → 21.1 km)
        const km = distancia.includes("meia")
            ? 21.1
            : parseFloat(distancia.replace("km", "").replace(",", "."));

        // Exibe apenas metas existentes
        if (dados.M) {
            const { idade, tempo } = dados.M;
            const tr = document.createElement('tr');
            tr.style.background = 'rgb(232, 240, 255)';
            tr.innerHTML = `
                <td>${distancia}</td>
                <td>M</td>
                <td>${idade}</td>
                <td>${tempo}</td>
                <td>${calcularPace(km, tempo)}</td>
            `;
            tbody.appendChild(tr);
        }

        if (dados.F) {
            const { idade, tempo } = dados.F;
            const tr = document.createElement('tr');
            tr.style.background = 'rgb(255, 232, 240)';
            tr.innerHTML = `
                <td>${distancia}</td>
                <td>F</td>
                <td>${idade}</td>
                <td>${tempo}</td>
                <td>${calcularPace(km, tempo)}</td>
            `;
            tbody.appendChild(tr);
        }
    }
});

