// Array de participantes
const participantes = [
  'z4tizn8FKl_bZHhg515w50lB8FJaw-v563thdvYUKaEY3nbbr-JaJ61o_g', //Camaron Es Payo
  'F-5b6ZFPAPUQYI3WibmQhoZzv_l0WWxBK2c-LXXH4nvI0LiNTXG0ynVMGQ', //Nampa de Matola
  '6Q7bSGyBnzlmIcuH10LXDbRLZ67PeOlLtJBvzHqDfWlUu8vca3cYSquWDA', //Seca Bragas
  'fnkaPuiCJiKnyoGuQusmTdkXGKhyvkEFVrpTJYoNaqKiWUg', //CØVΣS
  'huJR-495PKHeCeLcIqI9lT1Roy0VTwWWaWwAokVoSZX4YhdIWZjkU2oX7A', //ShineGang
  'zlSMd_xkgn5G5vYi8SlY7HeHdtjaKWJZIknKfSeekWfIgl7iFZhRV_MpWA', //EvelynnToilet
  'qc4bew51P1ueV29M6ZOnbl2AKcMdpexY3WG548HtbW-vS61w9WX0bUK6mg', //Riustickyley
  'ts5fc5Fr5xGKBY2uB8uVNxyMTfkiZ5DnsXxx_wlH5G7dusL2', //HΣXΔ
  'HI8RfshGatLnazB-uY5Ig6kv1ckDzKxd01GeY4CIQn4eluI',//xCrimOr
  'oSFJOrPOD1KjETJr06kvrFyqNg2AJb5btrwQ6n-eAcIDErBL',//Crimor
  'BU3E8F7cR4LI30HYMBCn0-RKFeP0l0nzXICfaJ4VB0GxNn4',//CouMarioGo
  'eX-dwDUmOEtpCpIeJDJgKg6kvZCkHj3xh5FrSzoJ_jvYJfX5i9Lb1rP7WQ', //Churumbe Es Payo
  'mLZY5DscD2QxR5ZZ85F7xdOovHJCo1e2yfrXttP4Adi-sJo',// El jose breton
  'Ku8BbEpH0UtPvE3HpGt7iWn85ymicq9sAMRIfOnA99CjEPM',//Ukranian Egirl
  'r7_rAYCkmjkFp8UQoprpoRFZ-6MkMN66W_-WzQxk16-hynqb',//xMyerino
  'aai70MN1ZdizMS_FGgkmYromNyhbxQy0XuF5DJgSePBew92H'//Phoenix Fury CMG
];

// Valor por defecto para el orden
let ordenSeleccionado = 'ascendente';


const key = 'RGAPI-ec03262a-c32c-456f-b49e-92d6898035ff';

// Función para obtener los datos de un participante
async function obtenerDatosParticipante(participante) {
  const link = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${participante}?api_key=${key}`;

  return new Promise((resolve, reject) => {
    const conec = new XMLHttpRequest();

    conec.addEventListener('load', function() {
      if (conec.status >= 200 && conec.status < 400) {
        const datos = JSON.parse(this.response);
        const participanteOrdenado = datos.find(entry => entry.queueType === 'RANKED_SOLO_5x5');
        ultimaConsulta = link;
        resolve(participanteOrdenado);
      } else {
        ultimaConsulta = link ;
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
   // Limpiar contenido anterior
   tablaParticipantes.innerHTML = '';

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
    //https://www.tiktok.com/@billkilgore_/video/7197052386479918342
    //https://www.youtube.com/shorts/bJ-dFVQBN9Q
    let contador = 1;
    participantesOrdenados.forEach(participante => {
      const fila = tablaParticipantes.insertRow();
      if (participante.summonerName === "xMyerino") {
        fila.innerHTML =`
        <td>${contador++}. ${participante.summonerName}</td>        <td><img src="img/usuario/${participante.summonerName}.gif" style="width: 30px; height: 30px;"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="img/posicion/${participante.summonerName}.png" style="width: 30px; height: 30px;"/></td>
        <td><img src="img/elo/${participante.tier}${participante.rank}.png" style="width: 30px; height: 30px;"/> ${participante.tier} ${participante.rank}</td>
        <td><font>${participante.leaguePoints}</font> LP</td>
        <td>${participante.wins + participante.losses}</td>
        <td><font color="green">${participante.wins}</font></td>
        <td><font color="red">${participante.losses}</font></td>
        <td>${((participante.wins * 100) / (participante.wins + participante.losses)).toFixed(0)}%</td>
        <td><a href="https://www.op.gg/summoners/euw/${participante.summonerName}" target="_blank">opgg</a></td>
      `;
      }else{
        fila.innerHTML =`
        <td>${contador++}. ${participante.summonerName}</td>
        <td><img src="img/usuario/${participante.summonerName}.png" style="width: 30px; height: 30px;"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="img/posicion/${participante.summonerName}.png" style="width: 30px; height: 30px;"/></td>
        <td><img src="img/elo/${participante.tier}${participante.rank}.png" style="width: 30px; height: 30px;"/> ${participante.tier} ${participante.rank}</td>
        <td><font>${participante.leaguePoints}</font> LP</td>
        <td>${participante.wins + participante.losses}</td>
        <td><font color="green">${participante.wins}</font></td>
        <td><font color="red">${participante.losses}</font></td>
        <td>${((participante.wins * 100) / (participante.wins + participante.losses)).toFixed(0)}%</td>
        <td><a href="https://www.op.gg/summoners/euw/${participante.summonerName}" target="_blank">opgg</a></td>
      `;
      }
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
    'CHALLENGER I', 'GRANDMASTER I', 'MASTER I',
    'DIAMOND I', 'DIAMOND II', 'DIAMOND III', 'DIAMOND IV',
    'EMERALD I', 'EMERALD II', 'EMERALD III', 'EMERALD IV',
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
