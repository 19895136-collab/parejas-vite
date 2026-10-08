import {
  crearEstado,
  ocultarParejaIncorrecta,
  pasarTurno,
  seleccionarCarta,
  type Estado,
} from './parejas.ts'

export type { Estado, Zona } from './parejas.ts'
export { ocultarParejaIncorrecta, pasarTurno, seleccionarCarta }

const familias = [
  { id: 'variable', concepto: 'Variable', ejemplo: 'Una caja con una etiqueta para guardar un valor.' },
  { id: 'bucle', concepto: 'Bucle', ejemplo: 'Repetir los mismos pasos de una receta.' },
  { id: 'funcion', concepto: 'Función', ejemplo: 'Una máquina que realiza una tarea cada vez que la usás.' },
  { id: 'condicion', concepto: 'Condición', ejemplo: 'Llevar paraguas si el pronóstico anuncia lluvia.' },
  { id: 'arreglo', concepto: 'Arreglo', ejemplo: 'Una fila de casilleros para ordenar una lista.' },
  { id: 'evento', concepto: 'Evento', ejemplo: 'La campana que avisa que terminó una clase.' },
]

export function crearPartida(): Estado {
  return crearEstado(familias, Date.now())
}