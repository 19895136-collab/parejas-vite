import './estilo.css'
import {
  crearPartida,
  ocultarParejaIncorrecta,
  pasarTurno,
  seleccionarCarta,
  type Estado,
} from './juego.ts'

const aplicacion = document.querySelector<HTMLDivElement>('#app')

if (!aplicacion) {
  throw new Error('No se encontro el contenedor de la aplicacion.')
}

let estado: Estado | null = null
let temporizadorIncorrecta: number | undefined

function escapar(texto: string): string {
  const entidades: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }

  return texto.replace(/[&<>"']/g, (caracter) => entidades[caracter])
}

function mostrarInicio(): void {
  aplicacion!.innerHTML = `
    <main class="marco" data-pantalla="nueva">
      <header class="encabezado">
        <span class="marca"><span class="marca__punto"></span> Memoria de programación</span>
        <span class="indice">JUEGO 01</span>
      </header>
      <section class="portada" aria-labelledby="titulo">
        <p class="sobretitulo">Conceptos en contexto</p>
        <h1 id="titulo">Parejas <span>que no se parecen</span></h1>
        <p class="introduccion">Conectá conceptos de programación con situaciones de la vida real.</p>
        <button class="boton boton--inicio" type="button" data-comenzar>
          Comenzar partida <span aria-hidden="true">→</span>
        </button>
        <p class="nota-portada">Encontrá todas las parejas para ganar.</p>
      </section>
      <footer class="pie">
        <span>CONCEPTO <i class="muestra muestra--azul"></i></span>
        <span>ACIERTO <i class="muestra muestra--verde"></i></span>
        <span>ATENCIÓN <i class="muestra muestra--amarillo"></i></span>
      </footer>
    </main>
  `

  aplicacion!.querySelector<HTMLButtonElement>('[data-comenzar]')?.addEventListener('click', () => {
    estado = crearPartida()
    dibujar()
  })
}

function mostrarFinal(): void {
  if (!estado) return

  const gano = estado.resultado === 'victoria'
  aplicacion!.innerHTML = `
    <main class="marco marco--final" data-pantalla="final">
      <header class="encabezado">
        <span class="marca"><span class="marca__punto"></span> Memoria de programación</span>
        <span class="indice">RESULTADO</span>
      </header>
      <section class="cierre ${gano ? 'cierre--victoria' : 'cierre--derrota'}" aria-live="polite">
        <p class="sobretitulo">${gano ? 'Todas las familias encontradas' : 'Partida terminada'}</p>
        <h1>${gano ? '¡Ganaste!' : 'Esta vez no fue'}</h1>
        <p class="introduccion">${gano ? 'Relacionaste cada concepto con su ejemplo.' : 'Pasaste el turno sin seleccionar cartas.'}</p>
        <div class="resumen-final">
          <span>Parejas encontradas</span>
          <strong>${estado.parejasEncontradas} / ${estado.familias.length}</strong>
          <span>Intentos</span>
          <strong>${estado.intentos}</strong>
        </div>
        <button class="boton boton--inicio" type="button" data-reiniciar>
          Jugar otra vez <span aria-hidden="true">↻</span>
        </button>
      </section>
    </main>
  `

  aplicacion!.querySelector<HTMLButtonElement>('[data-reiniciar]')?.addEventListener('click', () => {
    estado = crearPartida()
    dibujar()
  })
}

function dibujarPartida(): void {
  if (!estado) return

  const partida = estado
  const textoMensaje = estado.mensaje === 'correcta'
    ? 'Pareja encontrada.'
    : estado.mensaje === 'incorrecta'
      ? 'No coinciden. Volvé a intentarlo.'
      : 'Buscá un concepto y su ejemplo.'
  const claseMensaje = estado.mensaje === 'correcta'
    ? 'mensaje--correcto'
    : estado.mensaje === 'incorrecta'
      ? 'mensaje--error'
      : 'mensaje--guia'
  const cartas = estado.cartas.map((carta) => {
    const visible = carta.descubierta || carta.encontrada
    const incorrecta = partida.mensaje === 'incorrecta' && partida.cartasSeleccionadas.includes(carta.id)
    const claseCarta = carta.encontrada
      ? 'carta--encontrada'
      : incorrecta
        ? 'carta--incorrecta'
        : visible
          ? `carta--${carta.zona}`
          : 'carta--oculta'
    const frente = visible
      ? `<span class="carta__zona">${escapar(carta.zona)}</span><span class="carta__texto">${escapar(carta.contenido)}</span>`
      : '<span class="reverso" aria-hidden="true"><i></i><i></i></span>'
    const etiqueta = visible ? `${carta.zona}: ${carta.contenido}` : 'Carta oculta'

    return `
      <button class="carta ${claseCarta}" type="button" data-carta="${escapar(carta.id)}"
        aria-label="${escapar(etiqueta)}" aria-pressed="${visible}" ${carta.encontrada ? 'disabled' : ''}>
        ${frente}
      </button>
    `
  }).join('')

  aplicacion!.innerHTML = `
    <main class="marco marco--partida" data-pantalla="curso">
      <header class="encabezado">
        <span class="marca"><span class="marca__punto"></span> Parejas que no se parecen</span>
        <button class="boton-texto" type="button" data-abandonar>Pasar sin jugar</button>
      </header>
      <section class="panel-partida" aria-labelledby="titulo-partida">
        <div class="cabecera-partida">
          <div>
            <p class="sobretitulo">Memoria de programación</p>
            <h1 id="titulo-partida">Encontrá las parejas</h1>
          </div>
          <div class="marcadores" aria-label="Marcadores de la partida">
            <div class="marcador"><span>Parejas</span><strong>${estado.parejasEncontradas}<small> / ${estado.familias.length}</small></strong></div>
            <div class="marcador"><span>Intentos</span><strong>${estado.intentos}</strong></div>
          </div>
        </div>
        <div class="mensaje ${claseMensaje}" role="status" aria-live="polite">${textoMensaje}</div>
        <section class="tablero" aria-label="Cartas del juego">
          ${cartas}
        </section>
        <footer class="pie pie--partida" aria-label="Significado de los colores">
          <span>Concepto <i class="muestra muestra--azul"></i></span>
          <span>Pareja encontrada <i class="muestra muestra--verde"></i></span>
          <span>Error <i class="muestra muestra--rojo"></i></span>
          <span>Atención <i class="muestra muestra--amarillo"></i></span>
        </footer>
      </section>
    </main>
  `

  aplicacion!.querySelectorAll<HTMLButtonElement>('[data-carta]').forEach((boton) => {
    boton.addEventListener('click', () => {
      const idCarta = boton.dataset.carta
      if (estado && idCarta && seleccionarCarta(estado, idCarta)) {
        dibujar()
      }
    })
  })

  aplicacion!.querySelector<HTMLButtonElement>('[data-abandonar]')?.addEventListener('click', () => {
    if (estado && pasarTurno(estado)) {
      dibujar()
    }
  })

  if (estado.mensaje === 'incorrecta') {
    temporizadorIncorrecta = window.setTimeout(() => {
      temporizadorIncorrecta = undefined
      if (estado && ocultarParejaIncorrecta(estado)) {
        dibujar()
      }
    }, 1100)
  }
}

function dibujar(): void {
  if (temporizadorIncorrecta !== undefined) {
    window.clearTimeout(temporizadorIncorrecta)
    temporizadorIncorrecta = undefined
  }

  if (!estado) {
    mostrarInicio()
  } else if (estado.resultado !== 'en curso') {
    mostrarFinal()
  } else {
    dibujarPartida()
  }
}

dibujar()
