# Parejas que no se parecen

Juego de memoria para aprender conceptos de programación relacionándolos con ejemplos de la vida cotidiana. El objetivo es encontrar todas las parejas de cartas: un concepto y su ejemplo.

## Cómo jugar

1. Seleccioná dos cartas para intentar formar una pareja.
2. Si corresponden, quedan descubiertas y se suma una pareja encontrada.
3. Si no corresponden, se muestran brevemente y luego se ocultan.
4. Encontrá las seis parejas para ganar. Pasar el turno sin jugar termina la partida en derrota.

Se puede jugar con mouse o tocando las cartas en un dispositivo móvil.

## Tecnologías

- TypeScript
- Vite
- Vitest
- HTML y CSS

## Requisitos

- Node.js
- npm

## Instalación y uso

Instalá las dependencias:

```bash
npm install
```

Iniciá el servidor de desarrollo:

```bash
npm run dev
```

## Pruebas y compilación

Ejecutá las pruebas:

```bash
npm test
```

Ejecutá las pruebas en modo de observación:

```bash
npm run test:watch
```

Generá la versión de producción:

```bash
npm run build
```

## Estructura principal

- `src/parejas.ts`: estado y reglas del juego.
- `src/juego.ts`: datos de las parejas y funciones que usa la interfaz.
- `src/main.ts`: interacción y representación de los estados en pantalla.
- `src/estilo.css`: estilos de la aplicación.
- `test/parejas.test.ts`: pruebas de las reglas del juego.