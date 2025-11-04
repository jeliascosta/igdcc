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

document.addEventListener('DOMContentLoaded', function() {
    // Controle de exibição dos campos de entrada
    const radioButtons = document.querySelectorAll('input[name="tipoEntrada"]');
    const tempoInput = document.getElementById('tempoInput');
    const paceInput = document.getElementById('paceInput');

    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
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
    document.getElementById('calcForm').addEventListener('submit', function(e) {
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
            document.getElementById('nota').textContent = 
                `Nota: ${nota.toFixed(2)} pontos`;
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
    if (p.length === 3) return p[0]*3600 + p[1]*60 + p[2];
    if (p.length === 2) return p[0]*60 + p[1];
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
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    } else {
        const m = Math.floor(total / 60);
        const s = total % 60;
        return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
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
    for (let n = 50; n <= 100; n += 5) notas.push(n);

    const idade = parseInt(document.getElementById('idade')?.value) || 30;
    const distancias = [
        { id: 'chart-2-4', km: 2.4, label: '2.4 km' },
        { id: 'chart-5',   km: 5,   label: '5 km' },
        { id: 'chart-10',  km: 10,  label: '10 km' },
        { id: 'chart-15',  km: 15,  label: '15 km' },
        { id: 'chart-meia',km: 21.0975, label: 'Meia' }
    ];

    window._charts = window._charts || {};

    for (const d of distancias) {
        const ctx = document.getElementById(d.id);
        if (!ctx) continue;

        if (window._charts[d.id]) {
            try { window._charts[d.id].destroy(); } catch(e) {}
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
                            title: function(items) {
                                // mostrar tempo no título do tooltip
                                const item = items[0];
                                return item && item.raw && item.raw.x != null ? segundosParaMMSS(item.raw.x) : '';
                            },
                            label: function(ctx) {
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
                            callback: function(value) { return segundosParaMMSS(value); }
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
document.addEventListener('DOMContentLoaded', function() {
    try { gerarGraficos(); } catch (e) {}
    const idadeInput = document.getElementById('idade');
    if (idadeInput) idadeInput.addEventListener('change', () => { try { gerarGraficos(); } catch(e){} });
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
    for (let nota = 100; nota >= 50; nota -= 1) {
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