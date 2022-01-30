const nodemailer = require("nodemailer");
async function sendTo(to, subject, text) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "",
      pass: "",
    },
  });
  let mailOptions = {
    from: "",
    to,
    subject,
    text,
  };
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) console.log(err, 'Ups! algo malo paso');
    if (data) console.log(data, 'Correo enviado con exito');
  });
}

module.exports = sendTo;
