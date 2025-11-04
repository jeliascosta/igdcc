// -------------------TABELAS DE REFERÊNCIA----------------------------

// --- Tabela de referência (nota 100) ---
const temposRefOrig = {
    "2.4km": { idade: 40, tempo: "08:10", sexo: 'M' },
    "10km": { idade: 38, tempo: "40:00", sexo: 'M' },
    "meia": { idade: 40, tempo: "120:00", sexo: 'F' }
};
window.temposRefOrig = temposRefOrig; // Expor para index.html

// --- Mapear distâncias base para km ---
const distanciasBase = {
    "2.4km": 2.4,
    "10km": 10,
    "meia": 21.0975
};
window.distanciasBase = distanciasBase; // Expor para index.html

// -------------------FATORES DE IDADE----------------------------

// --- Fatores por idade ---
const fatorIdadeMascMarujo = [
    { teto: 25, fator: 0.828 }, // 9:36  / 11:36
    { teto: 33, fator: 0.862 }, // 10:00 / 11:36
    { teto: 39, fator: 0.931 }, // 10:48 / 11:36
    { teto: 45, fator: 1.000 }, // 11:36 / 11:36
    { teto: 49, fator: 1.138 }, // 13:12 / 11:36
    { teto: 60, fator: 1.276 }  // 14:48 / 11:36 (sem divisão fina além de 50+)
];
const fatorIdadeFemMarujo = [
    { teto: 25, fator: 0.824 },
    { teto: 33, fator: 0.883 },
    { teto: 39, fator: 0.941 },
    { teto: 45, fator: 1.000 },
    { teto: 49, fator: 1.059 },
    { teto: 60, fator: 1.176 }
];

const fatorIdadeMascNaval = [
    { teto: 25, fator: 0.875 },
    { teto: 33, fator: 0.910 },
    { teto: 39, fator: 0.980 },
    { teto: 45, fator: 1.000 },
    { teto: 49, fator: 1.088 },
    { teto: 54, fator: 1.124 },
    { teto: 60, fator: 1.161 }
];
const fatorIdadeFemNaval = [
    { teto: 25, fator: 0.826 },
    { teto: 33, fator: 0.870 },
    { teto: 39, fator: 0.927 },
    { teto: 45, fator: 1.000 },
    { teto: 49, fator: 1.071 },
    { teto: 54, fator: 1.117 },
    { teto: 60, fator: 1.145 }
];

const fatorIdadeMascMesclado = [
    { teto: 25, fator: 0.9 }, //CASNAV
    { teto: 33, fator: 0.915 }, //CASNAV
    { teto: 39, fator: 0.931 }, //Marujo
    { teto: 45, fator: 1.000 }, //Marujo
    { teto: 49, fator: 1.138 }, //Marujo
    { teto: 54, fator: 1.124 }, //Naval
    { teto: 60, fator: 1.276 }, //Marujo (sem divisão fina além de 50+)
];

const fatorIdadeFemMesclado = [
    { teto: 25, fator: 0.826 }, //Naval
    { teto: 33, fator: 0.883 }, //Marujo
    { teto: 39, fator: 0.927 }, //Naval
    { teto: 45, fator: 1.000 }, //Marujo
    { teto: 49, fator: 1.071 }, //Naval
    { teto: 54, fator: 1.117 }, //Naval        
    { teto: 60, fator: 1.176 }, //Marujo
];

const fatorSexoMarujo = [
    { teto: 25, fator: 1.167 },
    { teto: 33, fator: 1.200 },
    { teto: 39, fator: 1.185 },
    { teto: 45, fator: 1.174 },
    { teto: 49, fator: 1.091 },
    { teto: 60, fator: 1.081 }
];

const fatorSexoNaval = [
    { teto: 25, fator: 1.163 },
    { teto: 33, fator: 1.175 },
    { teto: 39, fator: 1.164 },
    { teto: 45, fator: 1.230 },
    { teto: 49, fator: 1.210 },
    { teto: 54, fator: 1.220 },
    { teto: 60, fator: 1.210 }
];

const fatorSexo = [
    { teto: 25, fator: 1.167 }, //Marujo
    { teto: 33, fator: 1.200 }, //Marujo
    { teto: 39, fator: 1.185 }, //Marujo
    { teto: 45, fator: 1.230 }, //Naval
    { teto: 49, fator: 1.210 }, //Naval
    { teto: 54, fator: 1.220 }, //Naval
    { teto: 60, fator: 1.210 }  //Naval
];

// -------------------CONVERSÃO DE TEMPOS----------------------------

function tempoParaSegundos(tempo) {
    const partes = tempo.split(":").map(Number);
    if (partes.length === 2) return partes[0] * 60 + partes[1];      // mm:ss
    if (partes.length === 3) return partes[0] * 3600 + partes[1] * 60 + partes[2]; // hh:mm:ss
    throw new Error("Formato de tempo inválido. Use mm:ss ou hh:mm:ss");
}

function segundosParaTempo(totalSegundos) {
    let horas = Math.floor(totalSegundos / 3600);
    let resto = totalSegundos % 3600;
    let minutos = Math.floor(resto / 60);
    let seg = Math.floor(resto % 60);

    if (seg === 60) { seg = 0; minutos += 1; }
    if (minutos === 60) { minutos = 0; horas += 1; }

    if (horas > 0) return `${horas}:${String(minutos).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
    return `${minutos}:${String(seg).padStart(2, '0')}`;
}

// -------------------INTERPOLADORES----------------------------

// --- Interpolação linear genérica ---
function interpolarArray(arr, idade) {
    let fator = arr[arr.length - 1].fator;
    for (let i = 0; i < arr.length; i++) {
        if (idade <= arr[i].teto) {
            const tetoAtual = arr[i].teto;
            const fatorAtual = arr[i].fator;
            const tetoAnt = i === 0 ? 18 : arr[i - 1].teto;
            const fatorAnt = i === 0 ? arr[i].fator : arr[i - 1].fator;
            fator = fatorAnt + (fatorAtual - fatorAnt) * (idade - tetoAnt) / (tetoAtual - tetoAnt);
            break;
        }
    }
    return fator;
}

// --- Retorna array de fatores ajustados por sexo ---
function obterFatoresIdade(distancia, sexo) {
    const sexoUp = sexo.toUpperCase();
    if (sexoUp === "M") return fatorIdadeMascMesclado;

    // Para feminino, multiplica os fatores masculinos pelo fatorSexo interpolado
    return fatorIdadeMascMesclado.map(f => {
        const sexoF = interpolarArray(fatorSexo, f.teto);
        return { teto: f.teto, fator: parseFloat((f.fator * sexoF).toFixed(3)) };
    });
}

// --- Interpolação de fator de idade para idade específica ---
function interpolarFatorIdadePorDistancia(idade, sexo) {
    const faixas = obterFatoresIdade("", sexo);
    return interpolarArray(faixas, idade);
}

// -------------------TEMPOS DE REFERÊNCIA----------------------------

/// --- Gera tempos ajustados por sexo, mas ainda na idade base ---
const temposRefBase = {};
for (const distancia in temposRefOrig) {
    temposRefBase[distancia] = {};
    const sexoOrig = temposRefOrig[distancia].sexo;
    const idadeOrig = temposRefOrig[distancia].idade;
    const tSegOrig = tempoParaSegundos(temposRefOrig[distancia].tempo);

    for (const sexo of ['M', 'F']) {
        let tSeg = tSegOrig;

        if (sexo !== sexoOrig) {
            // Ajuste de sexo usando fatores
            const sexoFator = interpolarArray(fatorSexo, idadeOrig);
            tSeg = sexo === 'F' ? tSeg * sexoFator : tSeg / sexoFator;
        }

        temposRefBase[distancia][sexo] = { tSeg, idadeOrig };
    }
}

// --- Parâmetro global do expoente Riegel ajustado (amador) ---
const EXPOENTE_RIEGEL_AMADOR = 1.07;

// --- Função Riegel ajustada ---
function tempoRiegel(t1, d1, d2, expoente = EXPOENTE_RIEGEL_AMADOR) {
    return t1 * Math.pow(d2 / d1, expoente);
}

// --- Função tempoRefPorDistanciaExp híbrida (interpolação + Riegel) ---
function tempoRefPorDistanciaExp(distanciaKm, idade, sexo) {
    const sexoUp = sexo.toUpperCase();
    const dKm = parseFloat(distanciaKm);
    const nomes = Object.keys(distanciasBase).map(k => ({
        nome: k,
        km: distanciasBase[k]
    }));

    // --- Encontra a distância mais próxima (maior em caso de empate) ---
    let maisProxima = nomes[0];
    let menorDiff = Math.abs(dKm - maisProxima.km);
    for (let i = 1; i < nomes.length; i++) {
        const diff = Math.abs(dKm - nomes[i].km);
        if (diff < menorDiff || (diff === menorDiff && nomes[i].km > maisProxima.km)) {
            maisProxima = nomes[i];
            menorDiff = diff;
        }
    }

    // --- Se distância exata ---
    if (Math.abs(maisProxima.km - dKm) < 0.001) {
        const base = temposRefBase[maisProxima.nome][sexoUp];
        const fatorOrig = interpolarFatorIdadePorDistancia(base.idadeOrig, sexoUp);
        const fatorDesejado = interpolarFatorIdadePorDistancia(idade, sexoUp);
        return base.tSeg * (fatorDesejado / fatorOrig);
    }

    // --- Determinar vizinhas ---
    let menor = nomes[0], maior = nomes[nomes.length - 1];
    for (let i = 1; i < nomes.length; i++) {
        if (dKm <= nomes[i].km) {
            menor = nomes[i - 1];
            maior = nomes[i];
            break;
        }
    }

    // --- Ajustes de idade ---
    const fator = interpolarFatorIdadePorDistancia(idade, sexoUp);
    const baseMenor = temposRefBase[menor.nome][sexoUp];
    const baseMaior = temposRefBase[maior.nome][sexoUp];
    const tMenor = baseMenor.tSeg *
        (fator / interpolarFatorIdadePorDistancia(baseMenor.idadeOrig, sexoUp));
    const tMaior = baseMaior.tSeg *
        (fator / interpolarFatorIdadePorDistancia(baseMaior.idadeOrig, sexoUp));

    // --- Riegel ajustado (expoente mais conservador para amadores) ---
    const expoRiegel = 1.07; // típico de corredores recreativos
    const tRiegel = tMenor * Math.pow(dKm / menor.km, expoRiegel);

    // --- Interpolação entre distâncias conhecidas ---
    const p = (dKm - menor.km) / (maior.km - menor.km);
    const tInterp = tMenor + (tMaior - tMenor) * p;

    // --- Peso adaptativo: mais Riegel quanto mais distante das bases ---
    const distMin = Math.min(
        ...nomes.map(n => Math.abs(dKm - n.km))
    );
    const distMax = Math.max(...nomes.map(n => n.km));
    const pesoRiegel = Math.min(1, Math.pow(distMin / distMax, 0.7) * 2); // curva suave 0–1
    const pesoInterp = 1 - pesoRiegel;

    // --- Combinação adaptativa ---
    return tInterp * pesoInterp + tRiegel * pesoRiegel;
}

// -------------------CÁLCULO DE NOTAS----------------------------

function calcularNotaPorPace(pace, idade, sexo, distancia) {
    const pacePartes = pace.split(":").map(Number);
    const paceSegundos = pacePartes[0] * 60 + pacePartes[1];
    const tempo = segundosParaTempo(paceSegundos * distancia);
    return calcularNota(tempo, idade, sexo, distancia);
}

// --- Pontos configuráveis da curva de nota ---
// cada ponto é [nota, proporção do tempoRef → tempo0]
// const pontosCurva = [
//     { nota: 100, proporcao: 1.00 }, // tempoRef (nota máxima)
//     { nota: 90, proporcao: 1.50 }, // 
//     { nota: 50, proporcao: 1.60 }, //
//     { nota: 0, proporcao: 2.00 }  // tempo0Seg
// ];

// function proporcaoPorNota(nota) {
//     // parâmetros base
//     const proporcao100 = 1.0;
//     const proporcaoY2 = 1.2; // ponto fixo intermediário (mantém linear)
//     const proporcaoY1 = 1.5;
//     const proporcao0  = 4.0;  // extrapolação simétrica
//     const notaY1 = 50;
//     const notaY2 = 89;
//     const nota100 = 100;

//     // expoentes de curvatura
//     const expoenteSobre = 2.0; // sobrelinear entre 50–90
//     const expoenteSub = 0.6;   // sublinear entre 90–100

//     if (nota >= nota100) {
//         // extrapolação acima de 100 → cada ponto extra reduz ~1% do tempo
//         const fatorExtra = 0.01;
//         return proporcao100 * (1 - (nota - 100) * fatorExtra);
//     }

//     if (nota <= 0) {
//         // extrapolação abaixo de 0 → simétrica (4x em 0)
//         const t = (0 - nota) / 50; // 0→50
//         return proporcaoY1 + (proporcao0 - proporcaoY1) * Math.pow(t, 1 / expoenteSub);
//     }

//     if (nota >= notaY2 && nota <= nota100) {
//         // 90–100: sublinear (curva suaviza até 100)
//         const t = (nota - notaY2) / (nota100 - notaY2);
//         return proporcaoY2 + (proporcao100 - proporcaoY2) * Math.pow(t, expoenteSub);
//     }

//     if (nota >= notaY1 && nota < notaY2) {
//         // 50–90: sobrelinear (crescimento mais lento no início, acelera no fim)
//         const t = (nota - notaY1) / (notaY2 - notaY1);
//         return proporcaoY1 + (proporcaoY2 - proporcaoY1) * Math.pow(t, expoenteSobre);
//     }

//     // abaixo de 50: simétrico ao sobrelinear
//     if (nota < notaY1) {
//         const t = (notaY1 - nota) / notaY1;
//         return proporcaoY1 + (proporcao0 - proporcaoY1) * Math.pow(t, 1 / expoenteSobre);
//     }
// }

function proporcaoPorNota(nota) {
    const proporcao100 = 1.0;
    const proporcao0 = 2.0;
    const nota0 = 0;
    const nota90 = 90;
    const nota100 = 100;

    if (nota >= nota100) {
        // acima de 100 → ~1% mais rápido por ponto
        const fatorExtra = 0.01;
        return proporcao100 * (1 - (nota - 100) * fatorExtra);
    }

    if (nota <= 0) {
        // abaixo de 0 → dobra novamente o tempo (simétrico)
        const proporcaoNeg = proporcao0 * 2.0;
        const t = (-nota) / 100;
        return proporcao0 + (proporcaoNeg - proporcao0) * Math.pow(t, 0.6);
    }

    // --- Região 0–100 com expoente variável contínuo ---
    let expoente;
    if (nota <= nota90) {
        // transição suave 0→90: 1.6 → 1.0
        const t = (nota - nota0) / (nota90 - nota0);
        expoente = 1.6 - 0.5 * t;
    } else {
        // transição suave 90→100: 1.0 → 0.6
        const t = (nota - nota90) / (nota100 - nota90);
        expoente = 1.0 - 0.4 * t;
    }

    // cálculo da proporção usando expoente dinâmico
    const t = (nota - nota0) / (nota100 - nota0);
    return proporcao0 + (proporcao100 - proporcao0) * Math.pow(t, expoente);
}

function calcularNota(tempo, idade, sexo, distanciaKm) {
    const tempoSeg = tempoParaSegundos(tempo);

    let notaMin = 0;
    let notaMax = 100;
    let nota = 50;

    // Tolerância de erro percentual no tempo (evita erro flutuante)
    const toleranciaRelativa = 1e-6;

    for (let i = 0; i < 60; i++) {
        nota = (notaMin + notaMax) / 2;

        // Gera tempo pela função direta
        const { segundos: tempoCurvaSeg } = tempoEPaceParaNota(nota, idade, sexo, distanciaKm);

        const diff = tempoCurvaSeg - tempoSeg;

        // critério de parada proporcional (não fixo)
        if (Math.abs(diff) <= tempoSeg * toleranciaRelativa) break;

        if (tempoCurvaSeg > tempoSeg) {
            // tempo maior → atleta mais rápido → nota deve subir
            notaMin = nota;
        } else {
            // tempo menor → atleta mais lento → nota deve cair
            notaMax = nota;
        }
    }

    // se o tempo for melhor que o tempoRef, extrapola nota acima de 100
    const tempoRefSeg = tempoParaSegundos(tempoEPaceParaNota(100, idade, sexo, distanciaKm).tempo);
    if (tempoSeg <= tempoRefSeg) {
        // diferença percentual
        const ganho = (tempoRefSeg - tempoSeg) / tempoRefSeg;
        // cada 1% mais rápido = +5 pontos (ajustável)
        const bonus = ganho * 500;
        return Math.min(200, 100 + bonus); // teto 200 por segurança
    }

    // idem para o limite inferior
    const tempoZero = tempoEPaceParaNota(0, idade, sexo, distanciaKm).tempo;
    if (tempoParaSegundos(tempo) >= tempoParaSegundos(tempoZero)) return 0.0;

    return Math.floor(nota);
}

// --- Função inversa: dado nota → tempo e pace ---
function tempoEPaceParaNota(nota, idade, sexo, distanciaKm) {
    const tempoRefSeg = tempoRefPorDistanciaExp(distanciaKm, idade, sexo);
    const proporcao = proporcaoPorNota(nota);
    const tempoSeg = tempoRefSeg * proporcao;

    const paceMin = tempoSeg / 60 / distanciaKm;
    const paceMinInt = Math.floor(paceMin);
    const paceSeg = Math.floor((paceMin - paceMinInt) * 60);

    const fatorIdade = interpolarFatorIdadePorDistancia(idade, sexo);
    // console.log("Nota", nota, "Tempo Float", tempoSeg)
    return {
        segundos: tempoSeg,
        tempo: segundosParaTempo(tempoSeg),
        fatorIdade: fatorIdade.toFixed(3),
        pace: `${paceMinInt}:${String(paceSeg).padStart(2, '0')}`,
    };
}


// -------------------IMPRESSÃO DE TABELA----------------------------

function imprimirTabelaMaxNotaComFator() {
    const idades = [30, 33, 40, 45, 55];
    const distancias = Object.keys(temposRefOrig);

    console.log("Tempo para nota 100 por distância e idade (M/F) com fator de idade:\n");
    console.log(`Idade | ${distancias.map(d => d.padEnd(20)).join(" | ")}`);
    console.log("-".repeat(9 + distancias.length * 25));

    for (const idade of idades) {
        let linha = `${idade.toString().padEnd(5)}| `;
        for (const distancia of distancias) {
            const resultadoM = tempoEPaceParaNota(100, idade, "M", distanciasBase[distancia]);
            const resultadoF = tempoEPaceParaNota(100, idade, "F", distanciasBase[distancia]);
            linha += `M:${resultadoM.tempo}(${resultadoM.fatorIdade})[${resultadoM.pace}] F:${resultadoF.tempo}(${resultadoF.fatorIdade})[${resultadoF.pace}] | `;
        }
        console.log(linha);
    }
}

// --- Exemplo de uso ---
// imprimirTabelaMaxNotaComFator();

console.log("TEMPOS REF", temposRefBase);

// --- Chamada ---
// imprimirTabelaMaxNotaComFator();

// // --- Exemplos ---
// console.log("5km, M40, 22:30 =>", calcularNota("22:30", 40, "M", 5));
// console.log("15km, F35, 1:20:00 =>", calcularNota("1:20:00", 35, "F", 15));
// console.log("7km, M30, 32:00 =>", calcularNota("32:00", 30, "M", 7));
// console.log("2.4km, M30, 08:20 =>", calcularNota("08:20", 30, "M", 2.4));

// //---------------------------------------------------------------------------------------------

// console.log("\nTempo para nota 100, M40, 2.4km =>", tempoParaNota(100, 40, "M", 2.4).tempo); // 08:15
// console.log("Tempo para nota 85, F45, meia =>", tempoParaNota(85, 45, "F", 21.0975).tempo); // Exemplo adicional
// console.log("\nTempo para nota 100, M45, 15km =>", tempoParaNota(100, 45, "M", 15).tempo); // 01:15
// console.log("16.08km, M45, 1:08:59 =>", calcularNota("1:33:00", 45, "M", 16.08));
// console.log("15.11km, M38, 1:13:53 =>", calcularNota("1:13:53", 38, "M", 15.11));
// console.log("10km, M38, 41:47 =>", calcularNota("41:47", 38, "M", 10));
// console.log("10km, M30, 41:47 =>", calcularNota("41:47", 30, "M", 10));
// console.log("\nTempo para nota 100, M30, 10km =>", tempoParaNota(100, 30, "M", 10).tempo); // 00:41:47
// console.log("2.53km, M38, 09:12 =>", calcularNota("09:12", 38, "M", 2.53));
