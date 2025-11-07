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
        const distancia = parseFloat(document.getElementById('distancia').value);

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
                '50-59': '💪 BORA VIBRAR!!! 💪',
                '60-69': '💪😁 ZONA 2, TÁ PAGO!! 😁💪',
                '70-79': '🏃‍♂️👏 QUE TREINO TOP!! 👏🏃‍♂️',
                '80-89': '🔥🏃‍♂️👉 SÉRIO ISSO?!! 👈🏃‍♂️🔥',
                '90-99': '😱🏅⚡ DANGER ZONE ⚡🏅😱',
                '100': '🏆🥇⚓ Lenda Naval ⚓🥇🏆'
            };
            const frasesMulher = {
                '70-79': '🏃‍♀️👏 QUE TREINO TOP!! 👏🏃‍♀️',
                '80-89': '😯🏃‍♀️👉 SÉRIO ISSO?!! 👈🏃‍♀️😯',
            };
            const frases = sexo === 'F' ? { ...frasesHomem, ...frasesMulher } : frasesHomem;

            // utilitários de cor (hex)
            function hexToRgb(hex) {
                const h = hex.replace('#', '');
                const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
                return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
            }
            function rgbToHex([r, g, b]) { return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join(''); }
            function interpHex(a, b, t) {
                const ra = hexToRgb(a), rb = hexToRgb(b);
                const r = Math.round(ra[0] + (rb[0] - ra[0]) * t);
                const g = Math.round(ra[1] + (rb[1] - ra[1]) * t);
                const bl = Math.round(ra[2] + (rb[2] - ra[2]) * t);
                return rgbToHex([r, g, bl]);
            }

            // paletas
            const pale = sexo === 'F' ? '#ffe8f3' : '#bce0faff'; // nota 50
            const strong = sexo === 'F' ? '#ff4f86' : '#096cd5ff'; // nota 90 start
            const gold = '#ffd166'; // final gold

            let bgStart, bgEnd;
            if (inteiro === 100) {
                bgStart = gold;
                bgEnd = gold;
            }
            else if (inteiro < 90) {
                const t = Math.max(0, (inteiro - 50) / 40); // 50->90
                bgStart = interpHex(pale, strong, Math.max(0, t * 0.6));
                bgEnd = interpHex(pale, strong, t);
            } else {
                const t2 = (inteiro - 90) / 10; // 0..1
                // transição do strong para gold
                bgStart = interpHex(strong, gold, Math.min(1, t2 * 0.6));
                bgEnd = interpHex(strong, gold, Math.min(1, t2));
            }

            // legibilidade: calcula luminance
            function luminance(hex) {
                const [r, g, b] = hexToRgb(hex);
                return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            }

            // cor do texto — padrão: branco/preto conforme luminance do fundo
            let textColor;
            if (sexo === 'F') {
                // base desejada para mulheres
                const base = '#3d0060';
                const lumBg = luminance(bgEnd);
                // se fundo muito escuro -> clarear a base aproximando de branco
                if (lumBg < 0.35) {
                    const mix = Math.min(0.9, 0.25 + (0.35 - lumBg)); // 0.25..~0.9
                    textColor = interpHex(base, '#ffffff', mix);
                } else if (lumBg > 0.75) {
                    // se fundo muito claro -> escurecer a base aproximando de preto
                    const mix = Math.min(0.9, 0.25 + (lumBg - 0.75));
                    textColor = interpHex(base, '#000000', mix);
                } else {
                    // fundo médio -> usar a base diretamente
                    textColor = base;
                }
            } else {
                // masculino / neutro: variação em torno de #003c59
                const baseM = '#002e77';
                const lumBgM = luminance(bgEnd);
                if (lumBgM < 0.30) {
                    // fundo muito escuro -> clarear o baseM em direção ao branco
                    const mix = Math.min(0.9, 0.35 + (0.30 - lumBgM)); // 0.35..~0.9
                    textColor = interpHex(baseM, '#ffffff', mix);
                } else if (lumBgM > 0.78) {
                    // fundo muito claro -> escurecer o baseM em direção ao preto
                    const mix = Math.min(0.9, 0.25 + (lumBgM - 0.78));
                    textColor = interpHex(baseM, '#000000', mix);
                } else {
                    // fundo médio -> usar a base diretamente
                    textColor = baseM;
                }
            }

            const zone = zonaLabel(inteiro);
            const phrase = frases[zone] || (inteiro >= 90 ? frases['90-100'] : 'Vibrando!');

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
                ? (distancia % 1 === 0 ? `${distancia} km` : `${distancia.toFixed(2)} km`)
                : '-- km';


            const hoje = (() => {
                const d = new Date();
                const dia = String(d.getDate()).padStart(2, '0');
                const mes = String(d.getMonth() + 1).padStart(2, '0');
                const ano = String(d.getFullYear()).slice(-2);
                return `${dia}/${mes}/${ano}`;
            })();

            const cardHtml = `
                <div class="share-card" style="background: linear-gradient(180deg, ${bgStart}, ${bgEnd}); color:${textColor}">
                    <div class="share-top">
                        <span class="main">IGDCC<span class="rev">REV2</span></span>
                        <div class="card-date" style="font-size:.7rem;font-weight:lighter;opacity:.8;margin-top:3px; margin-bottom: 5px">${hoje}</div>
                        </div>
                    <div class="score-big">${inteiro}</div>
                    <div class="zone-small">${zone}</div>
                    <div class="card-meta" style="display:flex;gap:12px;margin-top:8px;align-items:center;justify-content:center;">
                        <div class="meta-item" style="text-align:center">
                            <div style="font-size:.75rem;font-weight:700;opacity:.9">🛣️ Distância</div>
                            <div style="font-size:.95rem;font-weight:800">${distLabel}</div>
                        </div>
                        <div class="meta-item" style="text-align:center">
                            <div style="font-size:.75rem;font-weight:700;opacity:.9">🕒 Tempo</div>
                            <div style="font-size:.95rem;font-weight:800">${displayTempo}</div>
                        </div>
                        <div class="meta-item" style="text-align:center">
                            <div style="font-size:.75rem;font-weight:700;opacity:.9">🏃🏻‍♂️‍➡️ Pace</div>
                            <div style="font-size:.95rem;font-weight:800">${displayPace} /km</div>
                        </div>
                    </div>
                    <div class="zone-phrase">${phrase}</div>
                </div>
            `;
            document.getElementById('nota').innerHTML = cardHtml;
            // Exibe o botão copiar se o card existir
            const copyBtn = document.getElementById('copyCardBtn');
            if (document.querySelector('.share-card')) {
                copyBtn.style.display = 'inline-block';
            } else {
                copyBtn.style.display = 'none';
            }

        } catch (error) {
            document.getElementById('nota').textContent =
                `Erro: ${error.message}`;
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
                        borderColor: '#1976d2',
                        backgroundColor: 'rgba(25,118,210,0.08)',
                        spanGaps: true,
                        tension: 0.25,
                        pointRadius: 3,
                        parsing: false // usar objetos {x,y} diretamente
                    },
                    {
                        label: 'Mulheres',
                        data: dadosF,
                        borderColor: '#d81b60',
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
});

// Adicione estes event listeners
inputIdade.addEventListener('change', atualizarTituloGraficos);
inputIdade.addEventListener('input', atualizarTituloGraficos);

// Chamar a função uma vez para definir o título inicial
atualizarTituloGraficos();

function atualizarTabelaNotas() {
    const idade = parseInt(document.getElementById('idade').value);
    const sexo = document.getElementById('sexo').value;
    const distancia = parseFloat(document.getElementById('distancia').value);
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

document.addEventListener("DOMContentLoaded", () => {
    const metasTop = window.temposRefOrig;
    const container = document.getElementById("temposRefOrigContent");
    if (!metasTop || !container) return;

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

    // --- Gera tabela ---
    let html = `
        <table cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
            <thead>
                <tr style="background: #eee;">
                    <th>Distância</th>
                    <th>Sexo</th>
                    <th>Idade</th>
                    <th>Tempo</th>
                    <th>Pace / km</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const [distancia, dados] of Object.entries(metasTop)) {
        // Normaliza a distância (ex.: "meia" → 21.1 km)
        const km = distancia.includes("meia")
            ? 21.1
            : parseFloat(distancia.replace("km", "").replace(",", "."));

        // Exibe apenas metas existentes
        if (dados.M) {
            const { idade, tempo } = dados.M;
            html += `
                <tr style="background:#e8f0ff">
                    <td>${distancia}</td>
                    <td>M</td>
                    <td>${idade}</td>
                    <td>${tempo}</td>
                    <td>${calcularPace(km, tempo)}</td>
                </tr>
            `;
        }

        if (dados.F) {
            const { idade, tempo } = dados.F;
            html += `
                <tr style="background:#ffe8f0">
                    <td>${distancia}</td>
                    <td>F</td>
                    <td>${idade}</td>
                    <td>${tempo}</td>
                    <td>${calcularPace(km, tempo)}</td>
                </tr>
            `;
        }
    }

    html += "</tbody></table>";
    container.innerHTML = html;
});

