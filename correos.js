const http = require("http");
const url = require("url");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const sendTo = require("./mailer.js");
const fs = require("fs");

http
  .createServer((req, res) => {
    const { correos, asunto, contenido } = url.parse(req.url, true).query;

    if (req.url == "/") {
      res.setHeader("content-type", "text/html");
      fs.readFile("index.html", "utf8", (err, data) => {
        res.end(data);
      });
    }
   
    async function infoIndicador() {
      const { data } = await axios.get("https://mindicador.cl/api");
      const dolar = data.dolar.valor;
      const euro = data.euro.valor;
      const uf = data.uf.valor;
      const utm = data.utm.valor;      
      return [dolar, euro, uf, utm];
    }

   
    if (req.url.startsWith("/mailing")) {
      infoIndicador().then((r) => {
       
        const template1 = `Hola! Los indicadores económicos de hoy son los siguientes...
                            *El valor del dólar del día de hoy es $ ${r[0]} pesos \n
                            *El valor del euro del día de hoy es $ ${r[1]} pesos \n
                            *El valor de la uf del día de hoy es $ ${r[2]} pesos \n
                            *El valor de la utm del día de hoy $ ${r[3]} pesos`;

        if (correos.includes(",")) {
       
          sendTo(correos, asunto, contenido + template1).then((err, data) => {
            if (err) {
              res.write(
                `<p class="alert alert-info w-25 m-auto text-center"> No se pudo enviar el correo</p>`
              );
              res.end();
            } else {
              res.write(
                `<p class="alert alert-info w-25 m-auto text-center"> Correos enviados con exito =)</p>`
              );
              res.end();
              //preparacion del correo de respaldo
              const template2 = `Correos: ${correos.split(",")}
                        Asunto: ${asunto}
                        Contenido: ${contenido}
                        ${template1}`;

              
              fs.mkdir("./correos", () => {
                fs.writeFile(
                  `./correos/${shortid}.pdf`,
                  template2,
                  "utf-8",
                  (err, data) => {
                    if (err) {
                      console.log("no se pudo crear");
                    } else {
                      console.log("archivo creado");
                    }
                  }
                );
              });
            }
          });
        }
      });
    }

    const id = uuidv4();
    const shortid = id.slice(id.length - 10);
  })
  .listen(3000, () => console.log("UP!"));
