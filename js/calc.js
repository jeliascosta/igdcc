// -------------------TABELAS DE REFERÊNCIA----------------------------

// --- Tabela de referência (nota 100) ---
const temposRefOrig = {
    "2.4km": { idade: 40, tempo: "08:15", sexo: 'M' },
    "10km": { idade: 38, tempo: "40:00", sexo: 'M' },
    "meia": { idade: 40, tempo: "120:00", sexo: 'F' }
};

// --- Mapear distâncias base para km ---
const distanciasBase = {
    "2.4km": 2.4,
    "10km": 10,
    "meia": 21.0975
};

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
    let seg = Math.round(resto % 60);

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

// function calcularNota(tempo, idade, sexo, distanciaKm) {
//     const tempoSeg = tempoParaSegundos(tempo);
//     const tempoRefSeg = tempoRefPorDistanciaExp(distanciaKm, idade, sexo);
//     const tempo0Seg = tempoRefSeg * 2;

//     let nota = 100 - (tempoSeg - tempoRefSeg) / (tempo0Seg - tempoRefSeg) * 100;
//     return Math.max(0, Math.floor(nota));
// }

function calcularNota(tempo, idade, sexo, distanciaKm) {
    const tempoSeg = tempoParaSegundos(tempo);
    const tempoRefSeg = tempoRefPorDistanciaExp(distanciaKm, idade, sexo);
    const tempo0Seg = tempoRefSeg * 2; // tempo que daria nota 0 na linear

    // normaliza tempo em 0..1 (0 = tempoRef, 1 = tempo0)
    let x = (tempoSeg - tempoRefSeg) / (tempo0Seg - tempoRefSeg);

    // nota linear para referência
    const notaLinear = 100 - x * 100;

    // PONTOS DE TRANSIÇÃO
    const nota50 = 50;
    const nota80 = 90;

    // determina x correspondente para nota50 e nota80 na linear
    const x50 = (100 - nota50) / 100; // 0.5
    const x80 = (100 - nota80) / 100; // 0.2

    let nota;

    if (x >= x50) {
        // nota < 50 → linear
        nota = notaLinear;
    } else if (x >= x80) {
        // região 50–80 → crescimento rápido
        const t = (x50 - x) / (x50 - x80); // 0..1
        nota = 50 + (90 - 50) * Math.pow(t, 0.5); // raiz quadrada
    } else if (x >= 0) {
        // região 80–100 → crescimento lento
        const t = (x80 - x) / x80; // 0..1
        nota = 90 + (100 - 90) * Math.pow(t, 2); // quadrado
    } else {
        // tempo melhor que tempoRef → extrapolação acima de 100
        // mantém o mesmo padrão lento: pequenas melhorias → pequenas notas extras
        const t = -x / x80; // 0..1+
        nota = 100 + (100 - 90) * Math.pow(t, 2); // mesma curva que 90-100, continua subindo
    }

    return Math.max(0, Math.floor(nota));
}


function calcularNotaPorPace(pace, idade, sexo, distancia) {
    const pacePartes = pace.split(":").map(Number);
    const paceSegundos = pacePartes[0] * 60 + pacePartes[1];
    const tempo = segundosParaTempo(paceSegundos * distancia);
    return calcularNota(tempo, idade, sexo, distancia);
}

// function tempoEPaceParaNota(nota, idade, sexo, distanciaKm) {
//     const tempoRefSeg = tempoRefPorDistanciaExp(distanciaKm, idade, sexo);
//     const tempo0Seg = tempoRefSeg * 2;
//     const tempoSeg = tempoRefSeg + (100 - nota) / 100 * (tempo0Seg - tempoRefSeg);

//     const paceMin = tempoSeg / 60 / distanciaKm;
//     const paceMinInt = Math.floor(paceMin);
//     const paceSeg = Math.round((paceMin - paceMinInt) * 60);

//     const fatorIdade = interpolarFatorIdadePorDistancia(idade, sexo);

//     return {
//         tempo: segundosParaTempo(tempoSeg),
//         fatorIdade: fatorIdade.toFixed(3),
//         pace: `${paceMinInt}:${String(paceSeg).padStart(2, '0')}`,
//     };
// }

function tempoEPaceParaNota(nota, idade, sexo, distanciaKm) {
    const tempoRefSeg = tempoRefPorDistanciaExp(distanciaKm, idade, sexo);
    const tempo0Seg = tempoRefSeg * 2;

    // PONTOS DE TRANSIÇÃO
    const nota50 = 50;
    const nota80 = 90;
    const x50 = (100 - nota50) / 100; // 0.5
    const x80 = (100 - nota80) / 100; // 0.2

    let x; // valor normalizado tempo → 0..1, inverso do calcularNotaCurva

    if (nota <= 50) {
        // linear abaixo de 50
        x = (100 - nota) / 100;
    } else if (nota <= 90) {
        // região 50-90 (crescimento rápido)
        const t = (nota - 50) / (90 - 50);
        x = x50 - Math.pow(t, 2) * (x50 - x80); // raiz quadrada invertida
    } else if (nota <= 100) {
        // região 90-100 (crescimento lento)
        const t = (nota - 90) / (100 - 90);
        x = x80 - Math.sqrt(t) * x80; // curva lenta invertida
    } else {
        // extrapolação acima de 100
        const t = (nota - 100) / (100 - 90); // continua a curva lenta
        x = -Math.sqrt(t) * x80; // x < 0 → tempo melhor que referência
    }

    const tempoSeg = tempoRefSeg + x * (tempo0Seg - tempoRefSeg);

    const paceMin = tempoSeg / 60 / distanciaKm;
    const paceMinInt = Math.floor(paceMin);
    const paceSeg = Math.round((paceMin - paceMinInt) * 60);

    const fatorIdade = interpolarFatorIdadePorDistancia(idade, sexo);

    return {
        tempo: segundosParaTempo(tempoSeg),
        fatorIdade: fatorIdade.toFixed(3),
        pace: `${paceMinInt}:${String(paceSeg).padStart(2,'0')}`,
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