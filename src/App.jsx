import { useState } from 'react'

// Surface compatibility matrix: user surface × shoe surface → score (0–40)
const SCORE_SUPERFICIE = {
  asfalto: { asfalto: 40, misto: 30, trilha: 5,  casual: 15 },
  trilha:  { trilha: 40,  misto: 35,  asfalto: 10, casual: 5  },
  esteira: { asfalto: 35, misto: 30,  trilha: 10,  casual: 20 },
  misto:   { misto: 40,   asfalto: 25, trilha: 20,  casual: 10 },
}

const KM_LABEL = {
  menos10: 'menos de 10 km/semana',
  '10a30': '10 a 30 km/semana',
  '30a60': '30 a 60 km/semana',
  mais60:  'mais de 60 km/semana',
}

const SUPERFICIE_LABEL = {
  asfalto: 'asfalto/calçada',
  trilha:  'trilha/terra',
  esteira: 'esteira',
  misto:   'superfícies mistas',
  casual:  'uso casual',
}

function calcularVeredito(r) {
  const motivos = []
  let pontos = 0

  // 1. Versatilidade funcional (0–40 pts)
  const scoreFuncional = (SCORE_SUPERFICIE[r.superficieUso] || {})[r.superficieTenis] ?? 20
  pontos += scoreFuncional

  if (scoreFuncional >= 35) {
    motivos.push({ tipo: 'positivo', texto: `O tênis é feito para ${SUPERFICIE_LABEL[r.superficieTenis]}, que é onde você corre. Boa compatibilidade.` })
  } else if (scoreFuncional >= 20) {
    motivos.push({ tipo: 'neutro', texto: `O tênis funciona onde você corre, mas não foi projetado especificamente para isso.` })
  } else {
    motivos.push({ tipo: 'negativo', texto: `O tênis é indicado para ${SUPERFICIE_LABEL[r.superficieTenis]}, mas você corre em ${SUPERFICIE_LABEL[r.superficieUso]}. Incompatibilidade importante.` })
  }

  // 2. Versatilidade estética (0–20 pts)
  const scoreEstetico = { sim: 20, talvez: 10, nao: 0 }[r.versatilEstetico] ?? 10
  pontos += scoreEstetico

  if (scoreEstetico === 20) {
    motivos.push({ tipo: 'positivo', texto: 'Versátil no visual: serve pra corrida e pro dia a dia. Custo por uso mais vantajoso.' })
  } else if (scoreEstetico === 10) {
    motivos.push({ tipo: 'neutro', texto: 'Funciona em alguns contextos além da corrida, mas não em todos.' })
  } else {
    motivos.push({ tipo: 'negativo', texto: 'Uso limitado à corrida — fora da pista, o visual não funciona. Custo por uso mais alto.' })
  }

  // 3. Custo-benefício (0–25 pts)
  const preco = parseFloat(r.precoTenis)
  const precoRef = { menos10: 400, '10a30': 550, '30a60': 700, mais60: 900 }[r.kmSemana] ?? 550
  const ratio = preco / precoRef
  let scoreCusto = 0
  let textoCusto = ''

  if (ratio <= 0.7) {
    scoreCusto = 25
    textoCusto = `R$${preco.toFixed(0)} é um excelente preço para quem corre ${KM_LABEL[r.kmSemana]}.`
  } else if (ratio <= 1.0) {
    scoreCusto = 20
    textoCusto = `Preço dentro do razoável para o seu volume de corrida.`
  } else if (ratio <= 1.25) {
    scoreCusto = 13
    textoCusto = `Levemente acima do ideal para ${KM_LABEL[r.kmSemana]}. Vale pesquisar alternativas.`
  } else if (ratio <= 1.6) {
    scoreCusto = 7
    textoCusto = `Caro para a sua intensidade de uso. O preço não é justificado.`
  } else {
    scoreCusto = 2
    textoCusto = `Preço muito elevado para o seu perfil. Há opções equivalentes mais baratas.`
  }

  pontos += scoreCusto
  motivos.push({
    tipo: scoreCusto >= 18 ? 'positivo' : scoreCusto >= 11 ? 'neutro' : 'negativo',
    texto: textoCusto,
  })

  // 4. Lesão e compatibilidade (0–15 pts)
  let scoreLesao = 15
  const avisos = []
  const peso = parseFloat(r.peso)

  if (r.lesao === 'fascite' && r.drop === 'baixo') {
    scoreLesao -= 10
    avisos.push('Drop baixo (<4mm) pode agravar fascite plantar. Prefira drop médio ou alto.')
  }

  if ((r.lesao === 'joelho' || r.lesao === 'tornozelo') && r.superficieTenis === 'trilha' && r.superficieUso === 'asfalto') {
    scoreLesao -= 7
    avisos.push('Tênis de trilha no asfalto sobrecarrega joelho e tornozelo pela sola irregular.')
  }

  if (!isNaN(peso) && peso > 90 && r.superficieTenis === 'casual') {
    scoreLesao -= 5
    avisos.push('Tênis casual tem amortecimento limitado para o seu peso durante a corrida.')
  }

  scoreLesao = Math.max(0, scoreLesao)
  pontos += scoreLesao

  if (avisos.length > 0) {
    motivos.push({ tipo: 'negativo', texto: avisos.join(' ') })
  } else if (r.lesao !== 'nenhuma') {
    motivos.push({ tipo: 'neutro', texto: 'Nenhuma incompatibilidade crítica identificada, mas confirme com um profissional.' })
  } else {
    motivos.push({ tipo: 'positivo', texto: 'Sem histórico de lesão relevante — você tem mais liberdade de escolha.' })
  }

  const niveis = [
    { min: 80, label: 'Vale muito a pena',     cls: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40', descricao: 'Esse tênis casa muito bem com o seu perfil. A compra faz sentido.' },
    { min: 60, label: 'Provavelmente vale',     cls: 'text-green-400 bg-green-500/15 border-green-500/40',     descricao: 'Boa escolha no geral — os positivos superam as ressalvas.' },
    { min: 40, label: 'Fica na dúvida',         cls: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/40',  descricao: 'O tênis tem mérito, mas há pontos que merecem atenção antes de decidir.' },
    { min: 20, label: 'Provavelmente não vale', cls: 'text-orange-400 bg-orange-500/15 border-orange-500/40', descricao: 'As ressalvas são significativas. Avalie com cuidado antes de comprar.' },
    { min: 0,  label: 'Evite essa compra',      cls: 'text-red-400 bg-red-500/15 border-red-500/40',          descricao: 'Esse tênis não é a escolha certa para o seu perfil atual.' },
  ]

  const nivel = niveis.find(n => pontos >= n.min)
  return { pontos, nivel, motivos }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Opcao({ valor, selecionado, onSelect, children }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(valor)}
      className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all cursor-pointer ${
        selecionado
          ? 'border-emerald-500 bg-emerald-500/10 text-white'
          : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function Grupo({ label, sublabel, children }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-200">{label}</p>
      {sublabel && <p className="text-xs text-slate-500 -mt-1">{sublabel}</p>}
      <div className="space-y-2">{children}</div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

const RESPOSTAS_VAZIAS = {
  peso: '', kmSemana: '', superficieUso: '', lesao: '',
  nomeTenis: '', precoTenis: '', superficieTenis: '', drop: '', versatilEstetico: '',
}

export default function App() {
  const [tela, setTela]       = useState('landing')
  const [etapa, setEtapa]     = useState(1)
  const [r, setR]             = useState(RESPOSTAS_VAZIAS)
  const [veredito, setVeredito] = useState(null)

  const set = (campo) => (valor) => setR(prev => ({ ...prev, [campo]: valor }))

  const etapa1OK = r.peso && r.kmSemana && r.superficieUso && r.lesao
  const etapa2OK = r.nomeTenis.trim() && r.precoTenis && parseFloat(r.precoTenis) > 0
                   && r.superficieTenis && r.drop && r.versatilEstetico

  function avancar() {
    if (etapa === 1 && etapa1OK) { setEtapa(2); return }
    if (etapa === 2 && etapa2OK) {
      setVeredito(calcularVeredito(r))
      setTela('resultado')
    }
  }

  function reiniciar() {
    setTela('landing')
    setEtapa(1)
    setR(RESPOSTAS_VAZIAS)
    setVeredito(null)
  }

  // ── Landing ────────────────────────────────────────────────────────────────
  if (tela === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
        <div className="text-center max-w-xl">
          <span className="inline-block text-4xl mb-6">👟</span>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Vale a Pena Comprar<br />Este Tênis?
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Responda algumas perguntas sobre seu perfil de corrida e descubra se o tênis é a escolha certa para você — tudo no navegador, sem enviar seus dados a lugar nenhum.
          </p>
          <button
            onClick={() => setTela('questionario')}
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-lg px-8 py-4 rounded-2xl transition-colors cursor-pointer"
          >
            Começar avaliação
          </button>
        </div>
      </div>
    )
  }

  // ── Questionário ───────────────────────────────────────────────────────────
  if (tela === 'questionario') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-10">
        <div className="max-w-lg mx-auto">

          {/* Progresso */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-2">
                <div className={`h-2 rounded-full transition-all ${etapa >= 1 ? 'w-12 bg-emerald-500' : 'w-6 bg-slate-600'}`} />
                <div className={`h-2 rounded-full transition-all ${etapa >= 2 ? 'w-12 bg-emerald-500' : 'w-6 bg-slate-600'}`} />
              </div>
              <span className="text-slate-400 text-sm">{etapa} de 2</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {etapa === 1 ? 'Sobre você' : 'Sobre o tênis'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {etapa === 1 ? 'Seu perfil de corredor' : 'O tênis que você está namorando'}
            </p>
          </div>

          {/* Etapa 1 */}
          {etapa === 1 && (
            <div className="space-y-6">
              <Grupo label="Qual é o seu peso? (kg)">
                <input
                  type="number" min="30" max="200"
                  placeholder="Ex: 75"
                  value={r.peso}
                  onChange={e => set('peso')(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                />
              </Grupo>

              <Grupo label="Quantos km você corre por semana?">
                {[
                  { val: 'menos10', label: 'Menos de 10 km' },
                  { val: '10a30',   label: '10 a 30 km' },
                  { val: '30a60',   label: '30 a 60 km' },
                  { val: 'mais60',  label: 'Mais de 60 km' },
                ].map(o => (
                  <Opcao key={o.val} valor={o.val} selecionado={r.kmSemana === o.val} onSelect={set('kmSemana')}>
                    {o.label}
                  </Opcao>
                ))}
              </Grupo>

              <Grupo label="Onde você corre principalmente?">
                {[
                  { val: 'asfalto', label: 'Asfalto ou calçada' },
                  { val: 'trilha',  label: 'Trilha ou terra batida' },
                  { val: 'esteira', label: 'Esteira' },
                  { val: 'misto',   label: 'Misto (mais de um ambiente)' },
                ].map(o => (
                  <Opcao key={o.val} valor={o.val} selecionado={r.superficieUso === o.val} onSelect={set('superficieUso')}>
                    {o.label}
                  </Opcao>
                ))}
              </Grupo>

              <Grupo label="Você tem histórico de dor ou lesão nos pés/pernas?">
                {[
                  { val: 'nenhuma',   label: 'Não, nenhum problema' },
                  { val: 'fascite',   label: 'Fascite plantar' },
                  { val: 'joelho',    label: 'Dor no joelho' },
                  { val: 'tornozelo', label: 'Tornozelo ou canela' },
                  { val: 'lombar',    label: 'Lombar' },
                ].map(o => (
                  <Opcao key={o.val} valor={o.val} selecionado={r.lesao === o.val} onSelect={set('lesao')}>
                    {o.label}
                  </Opcao>
                ))}
              </Grupo>

              <button
                onClick={avancar}
                disabled={!etapa1OK}
                className={`w-full font-semibold text-base py-4 rounded-2xl transition-colors ${
                  etapa1OK
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Próximo
              </button>
            </div>
          )}

          {/* Etapa 2 */}
          {etapa === 2 && (
            <div className="space-y-6">
              <Grupo label="Qual tênis você está avaliando?">
                <input
                  type="text"
                  placeholder="Ex: Nike Pegasus 40"
                  value={r.nomeTenis}
                  onChange={e => set('nomeTenis')(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                />
              </Grupo>

              <Grupo label="Qual é o preço? (R$)">
                <input
                  type="number" min="0"
                  placeholder="Ex: 450"
                  value={r.precoTenis}
                  onChange={e => set('precoTenis')(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                />
              </Grupo>

              <Grupo label="Para qual superfície o tênis é indicado?">
                {[
                  { val: 'asfalto', label: 'Asfalto / road running' },
                  { val: 'trilha',  label: 'Trilha / trail running' },
                  { val: 'misto',   label: 'Misto (road + trilha leve)' },
                  { val: 'casual',  label: 'Casual / lifestyle' },
                ].map(o => (
                  <Opcao key={o.val} valor={o.val} selecionado={r.superficieTenis === o.val} onSelect={set('superficieTenis')}>
                    {o.label}
                  </Opcao>
                ))}
              </Grupo>

              <Grupo
                label="Qual é o drop do tênis?"
                sublabel="Diferença de altura entre calcanhar e ponta. Se não souber, procure na embalagem ou no site da marca."
              >
                {[
                  { val: 'baixo',  label: 'Baixo — menos de 4 mm' },
                  { val: 'medio',  label: 'Médio — 4 a 8 mm' },
                  { val: 'alto',   label: 'Alto — acima de 8 mm' },
                  { val: 'naosei', label: 'Não sei informar' },
                ].map(o => (
                  <Opcao key={o.val} valor={o.val} selecionado={r.drop === o.val} onSelect={set('drop')}>
                    {o.label}
                  </Opcao>
                ))}
              </Grupo>

              <Grupo label="Você usaria esse tênis fora da corrida, no dia a dia?">
                {[
                  { val: 'sim',    label: 'Sim, com certeza' },
                  { val: 'talvez', label: 'Talvez em alguns looks' },
                  { val: 'nao',    label: 'Não — parece muito esportivo' },
                ].map(o => (
                  <Opcao key={o.val} valor={o.val} selecionado={r.versatilEstetico === o.val} onSelect={set('versatilEstetico')}>
                    {o.label}
                  </Opcao>
                ))}
              </Grupo>

              <div className="flex gap-3">
                <button
                  onClick={() => setEtapa(1)}
                  className="flex-1 border-2 border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white font-semibold text-base py-4 rounded-2xl transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  onClick={avancar}
                  disabled={!etapa2OK}
                  className={`flex-1 font-semibold text-base py-4 rounded-2xl transition-colors ${
                    etapa2OK
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-white cursor-pointer'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Ver veredito
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Resultado ──────────────────────────────────────────────────────────────
  if (tela === 'resultado' && veredito) {
    const { pontos, nivel, motivos } = veredito
    const positivos = motivos.filter(m => m.tipo === 'positivo')
    const neutros   = motivos.filter(m => m.tipo === 'neutro')
    const negativos = motivos.filter(m => m.tipo === 'negativo')

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-10">
        <div className="max-w-lg mx-auto space-y-5">

          {/* Veredito principal */}
          <div className={`rounded-2xl border-2 p-6 text-center ${nivel.cls}`}>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-1">Veredito para</p>
            <p className="text-lg font-bold text-white mb-4">{r.nomeTenis}</p>
            <p className="text-3xl font-extrabold mb-2">{nivel.label}</p>
            <p className="text-sm opacity-75 leading-relaxed">{nivel.descricao}</p>
            <div className="mt-5 pt-4 border-t border-current/20">
              <span className="text-5xl font-black">{pontos}</span>
              <span className="text-sm opacity-50"> / 100 pontos</span>
            </div>
          </div>

          {/* Motivos */}
          <div className="space-y-2">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider opacity-60 pb-1">Por que esse resultado</h3>

            {positivos.map((m, i) => (
              <div key={i} className="flex gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3">
                <span className="text-emerald-400 font-black text-sm shrink-0 mt-0.5">+</span>
                <p className="text-slate-200 text-sm leading-relaxed">{m.texto}</p>
              </div>
            ))}

            {neutros.map((m, i) => (
              <div key={i} className="flex gap-3 bg-yellow-500/10 border border-yellow-500/25 rounded-xl px-4 py-3">
                <span className="text-yellow-400 font-black text-sm shrink-0 mt-0.5">~</span>
                <p className="text-slate-200 text-sm leading-relaxed">{m.texto}</p>
              </div>
            ))}

            {negativos.map((m, i) => (
              <div key={i} className="flex gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                <span className="text-red-400 font-black text-sm shrink-0 mt-0.5">−</span>
                <p className="text-slate-200 text-sm leading-relaxed">{m.texto}</p>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-4">
            <p className="text-slate-400 text-xs leading-relaxed">
              <span className="font-semibold text-slate-300">Lembrete importante: </span>
              este veredito é uma ajuda na decisão de compra — não substitui a avaliação de um profissional de saúde ou educação física. Se você tem lesão ou dor recorrente, consulte um especialista antes de escolher seu tênis.
            </p>
          </div>

          {/* Ação */}
          <button
            onClick={reiniciar}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold text-base py-4 rounded-2xl transition-colors cursor-pointer"
          >
            Avaliar outro tênis
          </button>
        </div>
      </div>
    )
  }

  return null
}
