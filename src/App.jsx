import { useState } from 'react'
import tenisList from './data/tenis.json'
import { calcularVeredito } from './logic/veredito.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function categoriaPrecoDe(preco) {
  if (preco <= 400) return 'entrada'
  if (preco <= 800) return 'intermediario'
  return 'premium'
}

function buildManualTenis(m) {
  const preco = parseFloat(m.preco) || 0
  return {
    nome: m.nome,
    marca: 'Manual',
    categoria: m.categoria,
    drop: parseFloat(m.drop) || 0,
    pisada_indicada: m.pisada_indicada,
    preco,
    entressola: m.entressola,
    versatilidade_visual: 3,
    durabilidade_km: 600,
    categoria_preco: categoriaPrecoDe(preco),
  }
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

function Checkbox({ valor, selecionado, onToggle, children }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(valor)}
      className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all cursor-pointer flex items-center gap-3 ${
        selecionado
          ? 'border-emerald-500 bg-emerald-500/10 text-white'
          : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:text-white'
      }`}
    >
      <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold ${
        selecionado ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-500'
      }`}>
        {selecionado && '✓'}
      </span>
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

// ─── State iniciais ───────────────────────────────────────────────────────────

const PERFIL_VAZIO = {
  peso: '',
  tipoUso: '',
  kmSemana: '',
  faixaPreco: '',
  dores: [],
}

const TENIS_MANUAL_VAZIO = {
  nome: '',
  categoria: '',
  drop: '',
  pisada_indicada: '',
  entressola: '',
  preco: '',
}

const DORES_OPCOES = [
  { val: 'nenhuma',                                    label: 'Nenhuma — sem histórico de dor' },
  { val: 'fáscia plantar',                             label: 'Fáscia plantar (dor no calcanhar ou sola do pé)' },
  { val: 'canela',                                     label: 'Canela (canelite / shin splints)' },
  { val: 'joelho',                                     label: 'Joelho' },
  { val: 'tornozelo',                                  label: 'Tornozelo' },
  { val: 'sensação de pé caindo pra dentro (pronação)', label: 'Sensação de pé caindo pra dentro (pronação)' },
]

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tela, setTela]           = useState('landing')
  const [etapa, setEtapa]         = useState(1)
  const [perfil, setPerfil]       = useState(PERFIL_VAZIO)
  const [tenisIdx, setTenisIdx]   = useState('')
  const [tenisManual, setTenisManual] = useState(TENIS_MANUAL_VAZIO)
  const [veredito, setVeredito]   = useState(null)

  const setP = (campo) => (valor) => setPerfil(prev => ({ ...prev, [campo]: valor }))

  function toggleDor(val) {
    setPerfil(prev => {
      if (val === 'nenhuma') {
        return { ...prev, dores: prev.dores.includes('nenhuma') ? [] : ['nenhuma'] }
      }
      let novas = prev.dores.filter(d => d !== 'nenhuma')
      novas = novas.includes(val) ? novas.filter(d => d !== val) : [...novas, val]
      return { ...prev, dores: novas }
    })
  }

  const modoManual = tenisIdx === 'outro'
  const m = tenisManual
  const setM = (campo) => (e) => setTenisManual(prev => ({ ...prev, [campo]: e.target.value }))
  const setMVal = (campo) => (valor) => setTenisManual(prev => ({ ...prev, [campo]: valor }))

  const etapa1OK = !!(
    perfil.peso && parseFloat(perfil.peso) > 0 &&
    perfil.tipoUso &&
    perfil.kmSemana &&
    perfil.faixaPreco &&
    perfil.dores.length > 0
  )

  const etapa2OK = modoManual
    ? !!(m.nome.trim() && m.categoria && m.drop !== '' && parseFloat(m.drop) >= 0 &&
         m.pisada_indicada && m.entressola && m.preco && parseFloat(m.preco) > 0)
    : tenisIdx !== ''

  function avancar() {
    if (etapa === 1 && etapa1OK) { setEtapa(2); return }
    if (etapa === 2 && etapa2OK) {
      const tenis = modoManual ? buildManualTenis(tenisManual) : tenisList[parseInt(tenisIdx)]
      setVeredito(calcularVeredito(perfil, tenis))
      setTela('resultado')
    }
  }

  function reiniciar() {
    setTela('landing')
    setEtapa(1)
    setPerfil(PERFIL_VAZIO)
    setTenisIdx('')
    setTenisManual(TENIS_MANUAL_VAZIO)
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

          {/* ── Etapa 1: Perfil ─────────────────────────────────────────────── */}
          {etapa === 1 && (
            <div className="space-y-6">

              <Grupo label="Qual é o seu peso? (kg)">
                <input
                  type="number" min="30" max="200"
                  placeholder="Ex: 75"
                  value={perfil.peso}
                  onChange={e => setP('peso')(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                />
              </Grupo>

              <Grupo label="Como você usa o tênis principalmente?">
                {[
                  { val: 'corrida de rua',   label: 'Corrida de rua / asfalto' },
                  { val: 'trilha',           label: 'Trilha / off-road' },
                  { val: 'esteira/academia', label: 'Esteira ou academia' },
                  { val: 'dia a dia',        label: 'Uso diário / casual' },
                ].map(o => (
                  <Opcao key={o.val} valor={o.val} selecionado={perfil.tipoUso === o.val} onSelect={setP('tipoUso')}>
                    {o.label}
                  </Opcao>
                ))}
              </Grupo>

              <Grupo label="Quantos km você corre por semana?">
                {[
                  { val: 'menos10', label: 'Menos de 10 km' },
                  { val: '10a30',   label: '10 a 30 km' },
                  { val: '30a60',   label: '30 a 60 km' },
                  { val: 'mais60',  label: 'Mais de 60 km' },
                ].map(o => (
                  <Opcao key={o.val} valor={o.val} selecionado={perfil.kmSemana === o.val} onSelect={setP('kmSemana')}>
                    {o.label}
                  </Opcao>
                ))}
              </Grupo>

              <Grupo label="Qual faixa de preço você pretende gastar?">
                {[
                  { val: 'entrada',       label: 'Entrada — até R$ 400' },
                  { val: 'intermediario', label: 'Intermediário — R$ 400 a R$ 800' },
                  { val: 'premium',       label: 'Premium — acima de R$ 800' },
                ].map(o => (
                  <Opcao key={o.val} valor={o.val} selecionado={perfil.faixaPreco === o.val} onSelect={setP('faixaPreco')}>
                    {o.label}
                  </Opcao>
                ))}
              </Grupo>

              <Grupo label="Você já sentiu dor ao correr?" sublabel="Marque quantas quiser. 'Nenhuma' desmarca as demais.">
                {DORES_OPCOES.map(o => (
                  <Checkbox
                    key={o.val}
                    valor={o.val}
                    selecionado={perfil.dores.includes(o.val)}
                    onToggle={toggleDor}
                  >
                    {o.label}
                  </Checkbox>
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

          {/* ── Etapa 2: Tênis ──────────────────────────────────────────────── */}
          {etapa === 2 && (
            <div className="space-y-6">

              <Grupo label="Qual tênis você está avaliando?" sublabel="Selecione da lista ou preencha manualmente.">
                <select
                  value={tenisIdx}
                  onChange={e => setTenisIdx(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="" disabled>Selecione um tênis...</option>
                  {tenisList.map((t, i) => (
                    <option key={i} value={String(i)}>{t.nome} — {t.marca}</option>
                  ))}
                  <option value="outro">— Não encontrei meu tênis (preencher manualmente)</option>
                </select>
              </Grupo>

              {/* Ficha rápida do tênis selecionado na lista */}
              {tenisIdx !== '' && !modoManual && (() => {
                const t = tenisList[parseInt(tenisIdx)]
                return (
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-4 space-y-3">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Ficha técnica</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div><span className="text-slate-500">Categoria: </span><span className="text-white capitalize">{t.categoria}</span></div>
                      <div><span className="text-slate-500">Drop: </span><span className="text-white">{t.drop} mm</span></div>
                      <div><span className="text-slate-500">Pisada: </span><span className="text-white capitalize">{t.pisada_indicada}</span></div>
                      <div><span className="text-slate-500">Entressola: </span><span className="text-white capitalize">{t.entressola}</span></div>
                      <div><span className="text-slate-500">Preço ref.: </span><span className="text-white">R$ {t.preco.toLocaleString('pt-BR')}</span></div>
                      <div><span className="text-slate-500">Durabilidade: </span><span className="text-white">~{t.durabilidade_km} km</span></div>
                    </div>
                  </div>
                )
              })()}

              {/* Formulário manual */}
              {modoManual && (
                <div className="space-y-5 border-t border-slate-700 pt-5">
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Preencha o que você sabe sobre o tênis. Procure a ficha técnica no site da marca ou na caixa do produto.
                  </p>

                  <Grupo label="Nome do tênis">
                    <input
                      type="text"
                      placeholder="Ex: Adidas Ultraboost 23"
                      value={m.nome}
                      onChange={setM('nome')}
                      className="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                    />
                  </Grupo>

                  <Grupo label="Categoria" sublabel="Para qual tipo de uso o tênis foi projetado?">
                    {[
                      { val: 'asfalto', label: 'Asfalto / road running' },
                      { val: 'trilha',  label: 'Trilha / trail running' },
                      { val: 'misto',   label: 'Misto (road + trilha leve)' },
                      { val: 'esteira', label: 'Esteira / indoor' },
                    ].map(o => (
                      <Opcao key={o.val} valor={o.val} selecionado={m.categoria === o.val} onSelect={setMVal('categoria')}>
                        {o.label}
                      </Opcao>
                    ))}
                  </Grupo>

                  <Grupo label="Drop (mm)" sublabel="Diferença de altura entre calcanhar e ponta. Está na ficha técnica.">
                    <input
                      type="number" min="0" max="20"
                      placeholder="Ex: 10"
                      value={m.drop}
                      onChange={setM('drop')}
                      className="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                    />
                  </Grupo>

                  <Grupo label="Tipo de pisada indicada">
                    {[
                      { val: 'neutro',  label: 'Neutro (sem controle de pronação)' },
                      { val: 'suporte', label: 'Suporte / estabilidade (controle de pronação)' },
                    ].map(o => (
                      <Opcao key={o.val} valor={o.val} selecionado={m.pisada_indicada === o.val} onSelect={setMVal('pisada_indicada')}>
                        {o.label}
                      </Opcao>
                    ))}
                  </Grupo>

                  <Grupo label="Entressola" sublabel="Tipo de amortecimento. Costuma estar na caixa ou no site da marca.">
                    {[
                      { val: 'macia',       label: 'Macia — máximo amortecimento' },
                      { val: 'equilibrada', label: 'Equilibrada — amortecimento moderado' },
                      { val: 'firme',       label: 'Firme — leveza e resposta, menos amortecimento' },
                    ].map(o => (
                      <Opcao key={o.val} valor={o.val} selecionado={m.entressola === o.val} onSelect={setMVal('entressola')}>
                        {o.label}
                      </Opcao>
                    ))}
                  </Grupo>

                  <Grupo label="Preço (R$)">
                    <input
                      type="number" min="0"
                      placeholder="Ex: 450"
                      value={m.preco}
                      onChange={setM('preco')}
                      className="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                    />
                  </Grupo>
                </div>
              )}

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
    const { nivel, titulo, razoes, pontos } = veredito
    const tenis = modoManual ? buildManualTenis(tenisManual) : tenisList[parseInt(tenisIdx)]

    const NIVEL_CLS = {
      vale:    'text-emerald-400 bg-emerald-500/15 border-emerald-500/40',
      atencao: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/40',
      evite:   'text-red-400 bg-red-500/15 border-red-500/40',
    }

    const positivos = razoes.filter(r => r.tipo === 'positivo')
    const neutros   = razoes.filter(r => r.tipo === 'neutro')
    const negativos = razoes.filter(r => r.tipo === 'negativo')

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-10">
        <div className="max-w-lg mx-auto space-y-5">

          {/* Veredito principal */}
          <div className={`rounded-2xl border-2 p-6 text-center ${NIVEL_CLS[nivel]}`}>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-1">Veredito para</p>
            <p className="text-lg font-bold text-white mb-4">{tenis.nome}</p>
            <p className="text-3xl font-extrabold mb-2">{titulo}</p>
            <div className="mt-5 pt-4 border-t border-current/20">
              <span className="text-5xl font-black">{pontos}</span>
              <span className="text-sm opacity-50"> / 100 pontos</span>
            </div>
          </div>

          {/* Razões */}
          <div className="space-y-2">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider opacity-60 pb-1">Por que esse resultado</h3>

            {positivos.map((r, i) => (
              <div key={i} className="flex gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3">
                <span className="text-emerald-400 font-black text-sm shrink-0 mt-0.5">+</span>
                <p className="text-slate-200 text-sm leading-relaxed">{r.texto}</p>
              </div>
            ))}

            {neutros.map((r, i) => (
              <div key={i} className="flex gap-3 bg-yellow-500/10 border border-yellow-500/25 rounded-xl px-4 py-3">
                <span className="text-yellow-400 font-black text-sm shrink-0 mt-0.5">~</span>
                <p className="text-slate-200 text-sm leading-relaxed">{r.texto}</p>
              </div>
            ))}

            {negativos.map((r, i) => (
              <div key={i} className="flex gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                <span className="text-red-400 font-black text-sm shrink-0 mt-0.5">−</span>
                <p className="text-slate-200 text-sm leading-relaxed">{r.texto}</p>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-4">
            <p className="text-slate-400 text-xs leading-relaxed">
              <span className="font-semibold text-slate-300">Lembrete importante: </span>
              este veredito é uma orientação baseada nos dados informados — não é diagnóstico médico nem substitui avaliação de profissional de saúde ou educação física. Em caso de dor recorrente, consulte um especialista antes de escolher seu tênis.
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
