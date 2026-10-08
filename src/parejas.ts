export const CONFIG = {
  cartasPorFamilia: 2, // cartas por familia
  accionesPorTurno: 2, // acciones por turno
  incrementoIntentos: 1, // intentos por pareja
  incrementoParejas: 1, // parejas encontradas
  incrementoIndice: 1, // posiciones de índice
  ceroElementos: 0, // elementos
  ceroSemillas: 0, // semillas
  bitsConversionSemilla: 0, // bits
  bitsDesplazamientoA: 15, // bits
  bitsDesplazamientoB: 7, // bits
  bitsDesplazamientoC: 14, // bits
  semillaAlternativa: 0x6d2b79f5, // valores de semilla de 32 bits
  rangoGenerador: 0x1_0000_0000, // valores posibles del generador
} as const

export type Zona = 'concepto' | 'ejemplo'

type FamiliaInicial = {
  id: string
  concepto: string
  ejemplo: string
}

type Familia = {
  id: string
  cartaConceptoId: string
  cartaEjemploId: string
  encontrada: boolean
}

type Carta = {
  id: string
  idFamilia: string
  zona: Zona
  contenido: string
  descubierta: boolean
  encontrada: boolean
}

export interface Estado {
  cartas: Carta[]
  familias: Familia[]
  accionesDisponibles: number
  intentos: number
  parejasEncontradas: number
  cartasSeleccionadas: string[]
  mensaje: 'correcta' | 'incorrecta' | 'ganaste' | 'perdiste' | null
  resultado: 'en curso' | 'victoria' | 'derrota'
}

export function crearGeneradorAleatorio(semilla: number): () => number {
  let valor = semilla >>> CONFIG.bitsConversionSemilla

  if (valor === CONFIG.ceroSemillas) {
    valor = CONFIG.semillaAlternativa
  }

  return () => {
    valor ^= valor << CONFIG.bitsDesplazamientoA
    valor ^= valor >>> CONFIG.bitsDesplazamientoB
    valor ^= valor << CONFIG.bitsDesplazamientoC
    return (valor >>> CONFIG.bitsConversionSemilla) / CONFIG.rangoGenerador
  }
}

export function crearEstado(familiasIniciales: readonly FamiliaInicial[], semilla: number): Estado {
  const familias: Familia[] = familiasIniciales.map((familia) => ({
    id: familia.id,
    cartaConceptoId: `${familia.id}:concepto`,
    cartaEjemploId: `${familia.id}:ejemplo`,
    encontrada: false,
  }))
  const cartas = familiasIniciales.flatMap((familia) => [
    {
      id: `${familia.id}:concepto`,
      idFamilia: familia.id,
      zona: 'concepto' as const,
      contenido: familia.concepto,
      descubierta: false,
      encontrada: false,
    },
    {
      id: `${familia.id}:ejemplo`,
      idFamilia: familia.id,
      zona: 'ejemplo' as const,
      contenido: familia.ejemplo,
      descubierta: false,
      encontrada: false,
    },
  ])
  const aleatorio = crearGeneradorAleatorio(semilla)

  for (let indice = cartas.length - CONFIG.incrementoIndice; indice > CONFIG.ceroElementos; indice -= CONFIG.incrementoIndice) {
    const indiceAleatorio = Math.floor(aleatorio() * (indice + CONFIG.incrementoIndice))
    ;[cartas[indice], cartas[indiceAleatorio]] = [cartas[indiceAleatorio], cartas[indice]]
  }

  const sinFamilias = familias.length === CONFIG.ceroElementos

  return {
    cartas,
    familias,
    accionesDisponibles: sinFamilias ? CONFIG.ceroElementos : CONFIG.accionesPorTurno,
    intentos: CONFIG.ceroElementos,
    parejasEncontradas: CONFIG.ceroElementos,
    cartasSeleccionadas: [],
    mensaje: sinFamilias ? 'ganaste' : null,
    resultado: sinFamilias ? 'victoria' : 'en curso',
  }
}

export function seleccionarCarta(estado: Estado, idCarta: string): boolean {
  if (estado.resultado !== 'en curso' || estado.accionesDisponibles === CONFIG.ceroElementos) {
    return false
  }

  const carta = estado.cartas.find((elemento) => elemento.id === idCarta)

  if (!carta || carta.descubierta || carta.encontrada) {
    return false
  }

  carta.descubierta = true
  estado.cartasSeleccionadas.push(carta.id)
  estado.accionesDisponibles -= CONFIG.incrementoIndice

  if (estado.cartasSeleccionadas.length < CONFIG.cartasPorFamilia) {
    return true
  }

  estado.intentos += CONFIG.incrementoIntentos
  const [primeraId, segundaId] = estado.cartasSeleccionadas
  const primera = estado.cartas.find((elemento) => elemento.id === primeraId)!
  const segunda = estado.cartas.find((elemento) => elemento.id === segundaId)!

  if (primera.idFamilia !== segunda.idFamilia) {
    estado.mensaje = 'incorrecta'
    return true
  }

  primera.encontrada = true
  segunda.encontrada = true
  estado.familias.find((familia) => familia.id === primera.idFamilia)!.encontrada = true
  estado.parejasEncontradas += CONFIG.incrementoParejas
  estado.cartasSeleccionadas = []

  if (estado.parejasEncontradas === estado.familias.length) {
    estado.resultado = 'victoria'
    estado.mensaje = 'ganaste'
    return true
  }

  estado.accionesDisponibles = CONFIG.accionesPorTurno
  estado.mensaje = 'correcta'
  return true
}

export function ocultarParejaIncorrecta(estado: Estado): boolean {
  if (estado.mensaje !== 'incorrecta' || estado.resultado !== 'en curso') {
    return false
  }

  for (const idCarta of estado.cartasSeleccionadas) {
    const carta = estado.cartas.find((elemento) => elemento.id === idCarta)
    if (carta) {
      carta.descubierta = false
    }
  }

  estado.cartasSeleccionadas = []
  estado.accionesDisponibles = CONFIG.accionesPorTurno
  estado.mensaje = null
  return true
}

export function pasarTurno(estado: Estado): boolean {
  if (
    estado.resultado !== 'en curso' ||
    estado.cartasSeleccionadas.length > CONFIG.ceroElementos ||
    estado.accionesDisponibles !== CONFIG.accionesPorTurno
  ) {
    return false
  }

  estado.accionesDisponibles = CONFIG.ceroElementos
  estado.resultado = 'derrota'
  estado.mensaje = 'perdiste'
  return true
}