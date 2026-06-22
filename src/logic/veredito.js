// Motor de veredito: recebe (perfil, tenis) e devolve { nivel, titulo, razoes, pontos }
// nivel: "vale" | "atencao" | "evite"
// razoes: [{ tipo: "positivo"|"neutro"|"negativo", texto: string }]

// === Compatibilidade funcional: uso do corredor × categoria do tênis (0–40 pts) ===
const COMPAT_FUNCIONAL = {
  'corrida de rua':   { asfalto: 40, misto: 28, esteira: 14, trilha: 5  },
  'trilha':           { trilha:  40, misto: 32, asfalto: 8,  esteira: 5  },
  'esteira/academia': { esteira: 40, asfalto: 34, misto: 22, trilha: 8  },
  'dia a dia':        { asfalto: 26, misto: 28, esteira: 20, trilha: 10 },
}

const CATEGORIA_LABEL = {
  asfalto: 'asfalto / corrida de rua',
  trilha:  'trilha / off-road',
  esteira: 'esteira / indoor',
  misto:   'superfícies mistas',
}

function categoriaPrecoDe(preco) {
  if (preco <= 400) return 'entrada'
  if (preco <= 800) return 'intermediario'
  return 'premium'
}

export function calcularVeredito(perfil, tenis) {
  const razoes = []
  let pontos = 0

  // === 1. VERSATILIDADE FUNCIONAL (0–40 pts) ===
  // Quanto o tênis serve para o contexto principal de uso do corredor.
  const compat = (COMPAT_FUNCIONAL[perfil.tipoUso] ?? {})[tenis.categoria] ?? 15
  pontos += compat

  if (compat >= 35) {
    razoes.push({ tipo: 'positivo', texto: `Ótima compatibilidade de uso: o tênis é feito para ${CATEGORIA_LABEL[tenis.categoria] ?? tenis.categoria}, exatamente o seu contexto principal.` })
  } else if (compat >= 20) {
    razoes.push({ tipo: 'neutro', texto: `Compatibilidade razoável: o tênis funciona no seu contexto, mas não foi projetado especificamente para ele — pode não extrair o melhor desempenho.` })
  } else {
    razoes.push({ tipo: 'negativo', texto: `Incompatibilidade de uso: o tênis é de ${CATEGORIA_LABEL[tenis.categoria] ?? tenis.categoria}, mas você o usaria para ${perfil.tipoUso}. Isso afeta desempenho e pode aumentar o risco de lesão.` })
  }

  // === 2. VERSATILIDADE VISUAL (0–10 pts) ===
  // Quanto o tênis funciona além da corrida (visual/estilo).
  const vv = tenis.versatilidade_visual ?? 3
  let scoreVisual = 0

  if (vv >= 4) {
    scoreVisual = 10
    razoes.push({ tipo: 'positivo', texto: 'Visual versátil: funciona fora da corrida também, o que eleva o custo por uso e a utilidade do tênis no dia a dia.' })
  } else if (vv === 3) {
    scoreVisual = 5
    razoes.push({ tipo: 'neutro', texto: 'Visual moderadamente versátil — serve em alguns contextos fora da corrida, mas não em todos.' })
  } else {
    scoreVisual = 0
    razoes.push({ tipo: 'negativo', texto: 'Visual muito esportivo: fora da corrida pode destoar no visual. O custo por uso tende a ser mais alto.' })
  }

  pontos += scoreVisual

  // === 3. DOR × FICHA TÉCNICA (até 25 pts, deduzidos por incompatibilidades) ===
  // Cada regra cruza uma dor relatada com uma característica técnica do tênis.
  let scoreDor = 25
  const dores = Array.isArray(perfil.dores) ? perfil.dores : []
  const temDor = dores.length > 0 && !dores.includes('nenhuma')

  // Fáscia plantar + entressola firme: amortecimento insuficiente agrava a condição
  if (dores.includes('fáscia plantar') && tenis.entressola === 'firme') {
    scoreDor -= 10
    razoes.push({ tipo: 'negativo', texto: 'Atenção — fáscia plantar + entressola firme: a entressola firme oferece pouco amortecimento no calcanhar, o que costuma agravar a fascite. Prefira entressolas macias ou equilibradas.' })
  }

  // Pronação + pisada neutra: sem suporte de estabilidade para quem prona
  if (dores.includes('sensação de pé caindo pra dentro (pronação)') && tenis.pisada_indicada === 'neutro') {
    scoreDor -= 10
    razoes.push({ tipo: 'negativo', texto: 'Atenção — pronação + tênis neutro: você relatou sensação de pé caindo pra dentro, e este tênis não tem suporte de pisada. Um modelo com indicação "suporte" ou "estabilidade" seria mais adequado.' })
  }

  // Canela + entressola firme: impacto elevado agrava canelite
  if (dores.includes('canela') && tenis.entressola === 'firme') {
    scoreDor -= 6
    razoes.push({ tipo: 'negativo', texto: 'Cuidado — canela + entressola firme: dor na canela costuma ser agravada por impacto elevado. Entressola firme absorve menos choque; um modelo mais macio pode ajudar.' })
  }

  // Joelho + drop baixo: drop < 8 mm aumenta carga na cadeia posterior e nos joelhos
  if (dores.includes('joelho') && typeof tenis.drop === 'number' && tenis.drop < 8) {
    scoreDor -= 7
    razoes.push({ tipo: 'negativo', texto: `Atenção — joelho + drop baixo (${tenis.drop} mm): drops abaixo de 8 mm transferem mais carga para joelhos e quadril. Modelos com drop acima de 8 mm costumam ser mais confortáveis para essa queixa.` })
  }

  // Tornozelo + trilha fora do contexto de trilha: sola irregular cria instabilidade lateral
  if (dores.includes('tornozelo') && tenis.categoria === 'trilha' && perfil.tipoUso !== 'trilha') {
    scoreDor -= 8
    razoes.push({ tipo: 'negativo', texto: 'Risco para o tornozelo: sola de trilha no asfalto cria instabilidade lateral — perigoso para tornozelos sensíveis. Este tênis é mais seguro onde foi projetado: no off-road.' })
  }

  scoreDor = Math.max(0, scoreDor)
  pontos += scoreDor

  if (!temDor) {
    razoes.push({ tipo: 'positivo', texto: 'Sem histórico de dor ou lesão — você tem mais liberdade de escolha e menor risco de incompatibilidade técnica.' })
  }

  // === 4. CUSTO-BENEFÍCIO (0–25 pts) ===
  // Compara a faixa de preço do tênis com o que o corredor pretende gastar.
  const catPreco = tenis.categoria_preco || categoriaPrecoDe(tenis.preco)
  const NIVEL_PRECO = { entrada: 0, intermediario: 1, premium: 2 }
  const nivelTenis    = NIVEL_PRECO[catPreco] ?? 1
  const nivelDesejado = NIVEL_PRECO[perfil.faixaPreco] ?? 1
  const diff = nivelTenis - nivelDesejado

  let scoreCusto = 0
  if (diff < 0) {
    scoreCusto = 25
    razoes.push({ tipo: 'positivo', texto: 'Ótimo custo-benefício: o tênis é mais barato do que você pretendia gastar. Seu orçamento cobre com folga.' })
  } else if (diff === 0) {
    scoreCusto = 25
    razoes.push({ tipo: 'positivo', texto: 'Preço dentro da sua faixa planejada. Alinha bem com o que você quer gastar.' })
  } else if (diff === 1) {
    scoreCusto = 12
    razoes.push({ tipo: 'neutro', texto: 'O tênis é um nível acima da sua faixa de preço. Vale avaliar se o que ele entrega justifica o investimento extra.' })
  } else {
    scoreCusto = 3
    razoes.push({ tipo: 'negativo', texto: 'O tênis é significativamente mais caro do que você pretendia. Provavelmente há opções equivalentes em faixas mais acessíveis.' })
  }

  pontos += scoreCusto

  // === 5. DURABILIDADE — informativo, não pontua ===
  // Calcula o custo por km como dado de apoio à decisão.
  if (tenis.durabilidade_km && tenis.preco) {
    const custoPorKm = (tenis.preco / tenis.durabilidade_km).toFixed(2)
    razoes.push({ tipo: 'neutro', texto: `Custo estimado por km: R$ ${custoPorKm} (vida útil estimada de ${tenis.durabilidade_km} km).` })
  }

  // === Veredito final ===
  const nivel = pontos >= 70 ? 'vale' : pontos >= 45 ? 'atencao' : 'evite'
  const titulos = {
    vale:    'Vale a pena!',
    atencao: 'Tem pontos de atenção',
    evite:   'Melhor evitar',
  }

  return { nivel, titulo: titulos[nivel], razoes, pontos }
}
