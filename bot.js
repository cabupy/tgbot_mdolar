require('dotenv').config()
const { Telegraf } = require('telegraf')
const axios = require('axios')
const moment = require('moment')

const bot = new Telegraf(process.env.TOKEN)

bot.start((ctx) =>{
  console.log(`start: ${ctx.from.username}`)
  ctx.replyWithMarkdown(`Bienvenido ${ctx.from.username} al 🤖 *MejorDolarPy*`)
})

bot.help((ctx) => {
  console.log(`help: ${ctx.from.username}`)
  ctx.replyWithMarkdown(`*Lista de comandos*:
  /mejordolar para solicitar las cotizaciones.
  /md para solicitar las cotizaciones (abreviado).
  /help para solicitar ayuda.`)
})

bot.command(['mejordolar', 'md'], async (ctx) => {
  if (ctx.from.is_bot) {
    ctx.reply('No converso con otros bots.')
  } else {
    console.log(`md: ${ctx.from.username}`)
    const ahora = new Date()
    const cotizaciones = await axios(process.env.APIURL)
    let impresion
    impresion = `*Hola ${ctx.from.username} !*\n`
    impresion += '👍 *Cotizaciones del dólar*\n'
    cotizaciones.data.forEach((cotizacion) => {
      const a = moment(ahora)
      const b = moment(cotizacion.fecha_hora)
      if (a.diff(b, 'days') < 4) {
        impresion += `*${cotizacion.entidad}*: ${cotizacion.compra} - ${
          cotizacion.venta
        } ${b.format('DD/MM HH:mm')}\n`
      }
    })
    impresion += 'Powered by [Vamyal S.A.](https://www.vamyal.com/)'
    ctx.replyWithMarkdown(impresion)
  }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
