// Array de participantes
const participantes = [
  'y7X5vuP8TuNzzvJ3IOHmczbYHjQMXRh73-GgaPdsUfYhP70',
  '3eIR95u1l6PZDLmFwkqbOpWbxasu0bYaMcD2EY-YbzeZn2cm_uoXWqjJTw',
  '8R3HJ42tFYxYtCJ16jzPanhRMuoqBndk523gY4r7Owe0Oxtd',
  'acHKjfmlXMe_EKzjzyQwZcI9E4aFkhe-jp90XnZvIFc8M7Q',
  'AmqfQquQ4WLqfKNPr7CGx_RbX66_OfklGbw0i2bQ-wleKiHJ',
  'BNw9fVN6QMd0jR6DpdipWKgJZCc_-1qKl3l_gX1sdvALqXU',
  'kllZCAiVxG-9XLCj74j6nSxYZD4XkcGjjpEpF_NXop6osKOh',
];

// Valor por defecto para el orden
let ordenSeleccionado = 'ascendente';

// Clave de la API de Riot
const key = 'RGAPI-89987f29-1a38-4988-a434-1eaad3bb3e06';

// Función para obtener los datos de un participante
async function obtenerDatosParticipante(participante) {
  const link = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${participante}?api_key=${key}`;

  return new Promise((resolve, reject) => {
    const conec = new XMLHttpRequest();

    conec.addEventListener('load', function() {
      if (conec.status >= 200 && conec.status < 400) {
        const datos = JSON.parse(this.response);
        const participanteOrdenado = datos.find(entry => entry.queueType === 'RANKED_SOLO_5x5');
        resolve(participanteOrdenado);
      } else {
        reject(new Error(`Ha ocurrido un error: ${conec.status} ${conec.statusText}`));
      }
    });

    conec.open('GET', link, true);
    conec.send();
  });
}

// Función para generar la tabla con el orden seleccionado
async function generarTabla(orden) {
  const tablaParticipantes = document.getElementById('tablaParticipantes').getElementsByTagName('tbody')[0];
  tablaParticipantes.innerHTML = ''; // Limpiar contenido anterior

  try {
    // Obtener los datos de todos los participantes
    const datosParticipantes = await Promise.all(participantes.map(obtenerDatosParticipante));

    // Filtrar los participantes válidos
    const participantesValidos = datosParticipantes.filter(participante => participante !== null);

    // Ordenar los participantes según el orden seleccionado
    let participantesOrdenados;
    if (orden === 'ascendente') {
      participantesOrdenados = participantesValidos.sort((a, b) => compararParticipantes(a, b));
    } else if (orden === 'descendente') {
      participantesOrdenados = participantesValidos.sort((a, b) => compararParticipantes(b, a));
    }

    // Agregar las filas a la tabla en el nuevo orden
    participantesOrdenados.forEach(participante => {
      const fila = tablaParticipantes.insertRow();
      fila.innerHTML = `
        <td>${participante.summonerName}</td>
        <td>${participante.inactive ? 'Inactivo' : 'Activo'}</td>
        <td>${participante.tier} ${participante.rank}</td>
        <td>${participante.leaguePoints}</td>
        <td>${participante.wins + participante.losses}</td>
        <td>${participante.wins}</td>
        <td>${participante.losses}</td>
        <td>${((participante.wins * 100) / (participante.wins + participante.losses)).toFixed(0)}%</td>
        <td><a href="https://www.op.gg/summoners/euw/${participante.summonerName}" target="_blank">opgg</a></td>
      `;
    });
  } catch (error) {
    console.log(error);
  }
}

// Función para comparar dos participantes
function compararParticipantes(a, b) {
  const rangoA = `${a.tier} ${a.rank}`;
  const rangoB = `${b.tier} ${b.rank}`;

  if (rangoA !== rangoB) {
    return compararRangos(rangoA, rangoB);
  } else {
    return b.leaguePoints - a.leaguePoints;
  }
}

// Función para comparar dos rangos
function compararRangos(a, b) {
  const ordenRango = [
    'CHALLENGER', 'GRANDMASTER', 'MASTER',
    'DIAMOND I', 'DIAMOND II', 'DIAMOND III', 'DIAMOND IV',
    'PLATINUM I', 'PLATINUM II', 'PLATINUM III', 'PLATINUM IV',
    'GOLD I', 'GOLD II', 'GOLD III', 'GOLD IV',
    'SILVER I', 'SILVER II', 'SILVER III', 'SILVER IV',
    'BRONZE I', 'BRONZE II', 'BRONZE III', 'BRONZE IV',
    'IRON I', 'IRON II', 'IRON III', 'IRON IV'
  ];

  return ordenRango.indexOf(a) - ordenRango.indexOf(b);
}

// Función para cambiar el orden de la tabla
function cambiarOrden() {
  const ordenSelect = document.getElementById('ordenSelect');
  ordenSeleccionado = ordenSelect.value;
  generarTabla(ordenSeleccionado);
}

// Crear desplegable para seleccionar el orden
const ordenSelect = document.createElement('select');
ordenSelect.id = 'ordenSelect';
ordenSelect.addEventListener('change', cambiarOrden);

// Opciones del desplegable
const opcionesOrden = [
  { value: 'ascendente', text: 'Ascendente' },
  { value: 'descendente', text: 'Descendente' }
];

// Agregar opciones al desplegable
opcionesOrden.forEach(opcion => {
  const option = document.createElement('option');
  option.value = opcion.value;
  option.text = opcion.text;
  ordenSelect.appendChild(option);
});

// Agregar el desplegable al documento
const contenedorOrden = document.getElementById('contenedorOrden');
contenedorOrden.appendChild(ordenSelect);

// Generar la tabla inicial
generarTabla(ordenSeleccionado);





