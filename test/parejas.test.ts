import { describe, expect, it } from 'vitest'
import {
  CONFIG,
  crearEstado,
  crearGeneradorAleatorio,
  ocultarParejaIncorrecta,
  pasarTurno,
  seleccionarCarta,
} from '../src/parejas'

const familias = [
  { id: 'variable', concepto: 'Variable', ejemplo: 'Una caja con etiqueta' },
  { id: 'bucle', concepto: 'Bucle', ejemplo: 'Repetir una receta' },
  { id: 'funcion', concepto: 'Funcion', ejemplo: 'Una maquina reutilizable' },
  { id: 'condicion', concepto: 'Condicion', ejemplo: 'Una decision segun el clima' },
]

function crearPartida(semilla = 123): ReturnType<typeof crearEstado> {
  return crearEstado(familias, semilla)
}

describe('reglas de parejas', () => {
  it('deberia crear una carta de cada zona por familia', () => {
    const estado = crearPartida()

    expect(estado.cartas).toHaveLength(familias.length * CONFIG.cartasPorFamilia)
    expect(estado.cartas.filter((carta) => carta.zona === 'concepto')).toHaveLength(familias.length)
    expect(estado.cartas.filter((carta) => carta.zona === 'ejemplo')).toHaveLength(familias.length)
  })

  it('deberia generar el mismo tablero con la misma semilla y tableros distintos con estas semillas distintas', () => {
    const tableroUno = crearPartida(123).cartas.map((carta) => carta.id)
    const tableroRepetido = crearPartida(123).cartas.map((carta) => carta.id)
    const tableroDistinto = crearPartida(456).cartas.map((carta) => carta.id)
    const aleatorioUno = crearGeneradorAleatorio(123)
    const aleatorioRepetido = crearGeneradorAleatorio(123)

    expect(tableroRepetido).toEqual(tableroUno)
    expect(tableroDistinto).not.toEqual(tableroUno)
    expect(aleatorioUno()).toBe(aleatorioRepetido())
  })

  it('deberia aceptar una carta valida y rechazar cartas repetidas o inexistentes', () => {
    const estado = crearPartida()
    const carta = estado.cartas[0]

    expect(seleccionarCarta(estado, carta.id)).toBe(true)
    expect(carta.descubierta).toBe(true)
    expect(estado.accionesDisponibles).toBe(CONFIG.accionesPorTurno - CONFIG.incrementoIndice)
    expect(seleccionarCarta(estado, carta.id)).toBe(false)
    expect(seleccionarCarta(estado, 'no-existe')).toBe(false)
  })

  it('deberia ocultar una pareja incorrecta y rechazar el ocultamiento cuando no corresponde', () => {
    const estado = crearPartida()
    const primera = estado.cartas[0]
    const segunda = estado.cartas.find((carta) => carta.idFamilia !== primera.idFamilia)!

    expect(ocultarParejaIncorrecta(estado)).toBe(false)
    expect(seleccionarCarta(estado, primera.id)).toBe(true)
    expect(seleccionarCarta(estado, segunda.id)).toBe(true)
    expect(estado.mensaje).toBe('incorrecta')
    expect(ocultarParejaIncorrecta(estado)).toBe(true)
    expect(primera.descubierta).toBe(false)
    expect(segunda.descubierta).toBe(false)
    expect(estado.accionesDisponibles).toBe(CONFIG.accionesPorTurno)
    expect(ocultarParejaIncorrecta(estado)).toBe(false)
  })

  it('deberia impedir seleccionar cartas cuando no quedan acciones disponibles', () => {
    const estado = crearPartida()
    const primera = estado.cartas[0]
    const segunda = estado.cartas.find((carta) => carta.idFamilia !== primera.idFamilia)!
    const tercera = estado.cartas.find((carta) => carta.id !== primera.id && carta.id !== segunda.id)!

    seleccionarCarta(estado, primera.id)
    seleccionarCarta(estado, segunda.id)

    expect(estado.accionesDisponibles).toBe(CONFIG.ceroElementos)
    expect(seleccionarCarta(estado, tercera.id)).toBe(false)
  })

  it('deberia terminar el turno al revelar dos cartas y registrar el intento', () => {
    const estado = crearPartida()
    const primera = estado.cartas.find((carta) => carta.id === 'variable:concepto')!
    const pareja = estado.cartas.find((carta) => carta.id === 'variable:ejemplo')!

    expect(seleccionarCarta(estado, primera.id)).toBe(true)
    expect(estado.intentos).toBe(CONFIG.ceroElementos)
    expect(seleccionarCarta(estado, pareja.id)).toBe(true)
    expect(estado.intentos).toBe(CONFIG.incrementoIntentos)
    expect(estado.mensaje).toBe('correcta')
    expect(primera.encontrada).toBe(true)
    expect(pareja.encontrada).toBe(true)
    expect(estado.accionesDisponibles).toBe(CONFIG.accionesPorTurno)
  })

  it('deberia declarar victoria al encontrar todas las familias y derrota al pasar sin actuar', () => {
    const partidaGanada = crearPartida()

    for (const familia of familias) {
      expect(seleccionarCarta(partidaGanada, `${familia.id}:concepto`)).toBe(true)
      expect(seleccionarCarta(partidaGanada, `${familia.id}:ejemplo`)).toBe(true)
    }

    expect(partidaGanada.resultado).toBe('victoria')
    expect(partidaGanada.mensaje).toBe('ganaste')
    expect(seleccionarCarta(partidaGanada, 'variable:concepto')).toBe(false)

    const partidaPerdida = crearPartida()
    expect(pasarTurno(partidaPerdida)).toBe(true)
    expect(partidaPerdida.resultado).toBe('derrota')
    expect(partidaPerdida.mensaje).toBe('perdiste')
    expect(pasarTurno(partidaPerdida)).toBe(false)
  })

  it('deberia conservar la cantidad de familias durante toda la partida', () => {
    const estado = crearPartida()
    const cantidadInicial = estado.familias.length
    const concepto = estado.cartas.find((carta) => carta.id === 'variable:concepto')!
    const ejemplo = estado.cartas.find((carta) => carta.id === 'variable:ejemplo')!
    const cartaIncorrecta = estado.cartas.find((carta) => carta.id === 'bucle:ejemplo')!

    seleccionarCarta(estado, concepto.id)
    seleccionarCarta(estado, cartaIncorrecta.id)
    ocultarParejaIncorrecta(estado)
    seleccionarCarta(estado, concepto.id)
    seleccionarCarta(estado, ejemplo.id)

    expect(estado.familias).toHaveLength(cantidadInicial)
    expect(estado.familias.filter((familia) => familia.encontrada)).toHaveLength(CONFIG.incrementoParejas)
  })

  it('deberia permitir ganar una partida con una estrategia de emparejar cada concepto con su ejemplo', () => {
    const estado = crearPartida(789)

    for (const familia of familias) {
      const cartaConcepto = estado.cartas.find((carta) => carta.id === `${familia.id}:concepto`)!
      const cartaEjemplo = estado.cartas.find((carta) => carta.id === `${familia.id}:ejemplo`)!

      expect(seleccionarCarta(estado, cartaConcepto.id)).toBe(true)
      expect(seleccionarCarta(estado, cartaEjemplo.id)).toBe(true)
    }

    expect(estado.resultado).toBe('victoria')
    expect(estado.parejasEncontradas).toBe(familias.length)
  })

  it('deberia terminar en derrota si el jugador pasa el turno sin hacer nada', () => {
    const estado = crearPartida()

    expect(estado.parejasEncontradas).toBe(CONFIG.ceroElementos)
    expect(pasarTurno(estado)).toBe(true)
    expect(estado.resultado).toBe('derrota')
  })
})