const choo = require("choo");
const html = require("choo/html");
const raw = require("choo/html/raw");
const css = require("sheetify");
const serviceRepo = require("./services");
const persistState = require("./persistState");

css("tachyons");
css("./style.css");

const app = choo();

if (process.env.NODE_ENV !== "production") {
  app.use(require("choo-devtools")());
} else {
  app.use(require("choo-service-worker")());
}

app.route("/", mainView);

app.use(persistState("matrix"));
app.use(matrixState);

if (!module.parent) app.mount("body");
else module.exports = app;

const randomCoord = () => Math.floor(Math.random() * 220) + 5;

function matrixState(state, emitter) {
  const initialServices = Object.keys(serviceRepo);

  state.matrix = Object.assign(
    {
      doc: null,
      services: {
        available: initialServices,
        enabled: initialServices
      },
      drag: initialServices.reduce((obj, service) => {
        obj[service] = { x: randomCoord(), y: randomCoord() };
        return obj;
      }, {})
    },
    state.matrix,
    { doc: null }
  );

  emitter.on("matrix.set_doc", elm => {
    state.matrix.doc = elm;
  });

  emitter.on("matrix.select", event => {
    const target = event.target.parentNode;
    const name = target && target.getAttributeNS(null, "drag-name");

    if (!name) {
      return;
    }

    state.matrix.selected = target;

    const { doc, drag } = state.matrix;

    const coords = getCoords(doc, event);
    coords.x -= drag[name].x;
    coords.y -= drag[name].y;
    state.matrix.offset = coords;
  });

  emitter.on("matrix.deselect", event => {
    state.matrix.selected = null;
  });

  emitter.on("matrix.move", event => {
    const { doc, selected, offset } = state.matrix;
    if (!selected) return;

    const name = selected.getAttributeNS(null, "drag-name");
    const coords = getCoords(doc, event);

    state.matrix.drag[name] = {
      x: coords.x - offset.x,
      y: coords.y - offset.y
    };

    emitter.emit("render");
  });

  emitter.on('matrix.toggle_service', name => {
    const { services: { enabled } } = state.matrix

    if (enabled.includes(name)) {
      console.log(enabled)
      state.matrix.services.enabled = enabled.filter(n => n !== name)
    } else {
      enabled.push(name)
    }

    emitter.emit('render')
  })
}

const TITLE = "The Matrix";

function mainView(state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE);

  const { doc, drag, services } = state.matrix;
  if (!doc && typeof window === "object") {
    setTimeout(findDoc, 0);
  }

  return html`
    <body class='bg-light-gray sans-serif f4 vh-100 flex items-center justify-center'>
      <div class='w-100 flex items-center justify-center'>
        <svg
          width='100%'
          viewBox='0 0 250 250'
          id='matrix'
          onmousemove=${e => emit("matrix.move", e)}
          onmousedown=${e => emit("matrix.select", e)}
          onmouseup=${e => emit("matrix.deselect", e)}
          class='ba bw4 b--near-black'
          style='max-width: 720px'
        >
          <rect width='100%' height='100%' fill='#fff'>

          ${false &&
            html`
          <g>
            <line x1='50%' x2='50%' y1='0' y2='100%' stroke='#ccc' stroke-width='1'>
            <line x1='0' x2='100%' y1='50%' y2='50%' stroke='#ccc' stroke-width='1'>
          </g>
          `}
          <g>
            <rect width='50%' height='50%' x='0' y='0' fill='rgba(255, 0, 0, 0.5)'>
            <rect width='50%' height='50%' x='50%' y='0' fill='rgba(0, 255, 0, 0.5)'>
            <rect width='50%' height='50%' x='0' y='50%' fill='rgba(255, 120, 0, 0.4)'>
            <rect width='50%' height='50%' x='50%' y='50%' fill='rgba(255, 255, 0, 0.4)'>
          </g>

          <g font-weight='bold' font-family='Helvetica' font-size='8' style='text-transform: uppercase'>
            <text x='50%' y='10' text-anchor='middle'>Often</text>
            <text x='50%' y='246' text-anchor='middle'>Never</text>
            <text x='246' y='128' text-anchor='end'>Uplifting</text>
            <text x='3' y='128'>Dreadful</text>
          </g>

          ${services.enabled.map(name => {
            const info = serviceRepo[name];
            return html`
              <g
                drag-name=${name}
                transform='translate(${drag[name].x} ${drag[name].y})'
                class='move'
              >
                <rect
                  width='24' height='24'
                  fill=${info.bg || "#fff"}
                  stroke-width='3'
                  stroke-linejoin='round'
                  stroke=${info.bg || "#fff"}
                >
                ${info.paths.map(
                  path => html`
                  <path
                    d=${path}
                    fill=${info.fg}
                  >
                `
                )}
              </g>
            `;
          })}
        </svg>
        <ul>
          ${services.available.map(
            name => html`
            <li>
              <label>
                <input
                  type='checkbox'
                  checked=${services.enabled.includes(name)}
                  onchange=${e => {
                    emit("matrix.toggle_service", name);
                  }}
                >${raw("&nbsp;")}${name}
              </label>
            </li>
          `
          )}
        </ul>
      </div>
    </body>
  `;

  function findDoc() {
    const doc = document.getElementById("matrix");
    emit("matrix.set_doc", doc);
  }
}

function getCoords(doc, event) {
  let p = doc.createSVGPoint();
  p.x = event.clientX;
  p.y = event.clientY;
  const m = doc.getScreenCTM();
  p = p.matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}
