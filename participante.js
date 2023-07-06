class participante{
    participantes = [
        'y7X5vuP8TuNzzvJ3IOHmczbYHjQMXRh73-GgaPdsUfYhP70',
        '3eIR95u1l6PZDLmFwkqbOpWbxasu0bYaMcD2EY-YbzeZn2cm_uoXWqjJTw',
        '8R3HJ42tFYxYtCJ16jzPanhRMuoqBndk523gY4r7Owe0Oxtd',
        'acHKjfmlXMe_EKzjzyQwZcI9E4aFkhe-jp90XnZvIFc8M7Q',
        'AmqfQquQ4WLqfKNPr7CGx_RbX66_OfklGbw0i2bQ-wleKiHJ',
        'BNw9fVN6QMd0jR6DpdipWKgJZCc_-1qKl3l_gX1sdvALqXU',
        'kllZCAiVxG-9XLCj74j6nSxYZD4XkcGjjpEpF_NXop6osKOh',
        'qNs8UbyWy0KTKjbwciIqgbqNL3mACGHhf-nlHse3nUTi5Kqj',
        'zNLNuvnFxbqoPVKGWfdPQNieLkzo87vIBnRAh9pLK9GoMXw',
        'iwm0KpRPtbPQQCSZBm8LATzdzKT34nZ85h04bf_QG19HdkU',
        'QZ8IpaSCrst3ayAj07fWJf-O_Un1LmJ4DlSk1O34bv6QAxM',
        'lvu5g-8eUhcDZqoH8M2HhtS6HlRy2fglYYgC5aY6tQmOPrenA6N3lNj3Tw',
        'u_jUdgjUon8qmoNC5LHJARhEY4jwYGv82dsqpBFIbOFjW6TxkBOgfcmN7Q',
        'OyMh80BrEUdzI7t_TjVDl7bQCY04ZNPVN05hgy6RMQaW9Rw',
        'OxbgP84fcWdfPGLMdMGjFIR1zL90bARSg0GpSAkzeLMHRvY',
        'LPkfX5IlsHyJ8lHN3ZkC2qdQM_N9wdY9bWLUQ_bLTLn8gUM',
        '_Wz7W2ylKuCH0Lwpx2CgRnvURVepz6nlidzTKtArfNKKT-M',
        'Q92MY2imzhNMsOHhkbGUOwRVZ8kpZwn6IjAbFJc1k_Qw1hk',
        '_qxJ8twjqXgor4DNZXwrFFfRQrMHCoUaNBaOy8LWQDC87dQ'
      ];

      key = 'RGAPI-76a0827f-e2b8-428b-b8e5-7de0d2f441dd';
    constructor (nombre){
        this.nombre = nombre;
    }

    
}

// Función para obtener el id del participante
async function obtenerDatosParticipante(participante) {
    const link = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${participante}?api_key=${key}`;
  
    return new Promise((resolve, reject) => {
      const conec = new XMLHttpRequest();
  
      conec.addEventListener('load', function() {
        if (conec.status >= 200 && conec.status < 400) {
          const datos = JSON.parse(this.response);
        } else {
          reject(new Error(`Ha ocurrido un error: ${conec.status} ${conec.statusText}`));
        }
      });
  
      conec.open('GET', link, true);
      conec.send();
    });
  }

