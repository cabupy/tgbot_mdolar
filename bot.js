require('dotenv').config()
const { Telegraf, Markup } = require('telegraf')
const axios = require('axios')
const moment = require('moment-timezone')
const _ = require('lodash')

const bot = new Telegraf(process.env.TOKEN)

//bot.use(Telegraf.log())

const getByEntity = (data, entity = 'bcp') => {
  return _.filter(data, { entidad: entity })
}

const getOrderBy = (data, field = 'venta', order = 'asc') => {
  return _.orderBy(data, [field], [order])
}

const getPoweredBy = () => {
  return `\nPowered by [Vamyal S.A.](${process.env.SITEURL})`
}

const getHelp = () => {
  return `*Lista de comandos*:

  /start Mensaje de Bienvenida a la conversación 👋.
  /opciones Botonera de opcioines.
  /mejorventa Lista ordenada por mejor precio de venta 📈.
  /mv Lista ordenada por mejor precio de venta 📈(abreviado).
  /mejorcompra Lista ordenada por mejor precio de compra 📉.
  /mc Lista ordenada por mejor precio de compra 📉 (abreviado).
  /bcp Cotización BCP 🏛.
  /set Cotización SET 🏛.
  /help Para solicitar ayuda 🆘.
  
  Seguinos en [twitter](${process.env.TWITTERURL})
  `
}

const getDataFromAPI = async () => {
  const cotizaciones = await axios(process.env.APIURL)
  const datosFiltrados = _.filter(cotizaciones.data, function (d) {
    return moment(new Date()).diff(moment(d.fecha_hora), 'days') < 4
  })
  return datosFiltrados
}

const getDataFromAPIEntity = async () => {
  const cotizaciones = await axios(process.env.APIURL)
  return _.filter(cotizaciones.data, function (d) {
    return (
      moment(new Date()).diff(moment(d.fecha_hora), 'days') < 4 &&
      d.entidad !== 'bcp' &&
      d.entidad !== 'set'
    )
  })
}

const getFormatList = (data) => {
  let impresion = ''
  data.forEach((cotizacion) => {
    impresion += `*${cotizacion.entidad}*: ${cotizacion.compra} - ${
      cotizacion.venta
    } ${moment(cotizacion.fecha_hora)
      .tz(process.env.TZ)
      .format('DD/MM HH:mm')}\n`
  })
  return impresion
}

const fnMejorVenta = async (ctx) => {
  if (ctx.from.is_bot || !ctx.from.username) {
    console.log('No converso con anónimos ni con otros bots.')
    ctx.reply('No converso 🤬 con anónimos ni con otros bots.')
  } else {
    console.log(`mv: ${ctx.from.username}`)
    let impresion = `*Hola 👋 ${ctx.from.username} !*\n\n 👍 *Mejor precio de venta*\n\n`
    const datos = await getDataFromAPIEntity()
    impresion += getFormatList(datos)
    impresion += getPoweredBy()
    ctx.replyWithMarkdown(impresion)
  }
}

const fnMejorCompra = async (ctx) => {
  if (ctx.from.is_bot || !ctx.from.username) {
    console.log('No converso con anónimos ni con otros bots.')
    ctx.reply('No converso 🤬 con anónimos ni con otros bots.')
  } else {
    console.log(`mc: ${ctx.from.username}`)
    let impresion = `*Hola 👋 ${ctx.from.username} !*\n\n 👍 *Mejor precio de compra*\n\n`
    let datos = await getDataFromAPIEntity()
    datos = getOrderBy(datos, 'compra', 'desc')
    impresion += getFormatList(datos)
    impresion += getPoweredBy()
    ctx.replyWithMarkdown(impresion)
  }
}

const fnBCP = async (ctx) => {
  if (ctx.from.is_bot || !ctx.from.username) {
    console.log('No converso con anónimos ni con otros bots.')
    ctx.reply('No converso 🤬 con anónimos ni con otros bots.')
  } else {
    console.log(`bcp: ${ctx.from.username}`)
    let impresion = `*Hola 👋 ${ctx.from.username} !*\n\n 🏛 *Cotización BCP*\n\n`
    let datos = await getDataFromAPI()
    datos = getByEntity(datos, 'bcp')
    impresion += getFormatList(datos)
    impresion += getPoweredBy()
    ctx.replyWithMarkdown(impresion)
  }
}

const fnSET = async (ctx) => {
  if (ctx.from.is_bot || !ctx.from.username) {
    console.log('No converso con anónimos ni con otros bots.')
    ctx.reply('No converso 🤬 con anónimos ni con otros bots.')
  } else {
    console.log(`set: ${ctx.from.username}`)
    let impresion = `*Hola 👋 ${ctx.from.username} !*\n\n 🏛 *Cotización SET*\n\n`
    let datos = await getDataFromAPI()
    datos = getByEntity(datos, 'set')
    impresion += getFormatList(datos)
    impresion += getPoweredBy()
    ctx.replyWithMarkdown(impresion)
  }
}

bot.start((ctx) => {
  console.log(`start: ${ctx.from.username}`)
  if (ctx.from.is_bot || !ctx.from.username) {
    console.log('No converso con anónimos ni con otros bots.')
    ctx.reply('No converso 🤬 con anónimos ni con otros bots.')
  } else {
    ctx.replyWithMarkdown(`Bienvenido *${
      ctx.from.username
    }* al 🤖💵 *MejorDolarPy*

    ${getHelp()}`)
  }
})

bot.help((ctx) => {
  console.log(`help: ${ctx.from.username}`)
  if (ctx.from.is_bot || !ctx.from.username) {
    console.log('No converso con anónimos ni con otros bots.')
    ctx.reply('No converso 🤬 con anónimos ni con otros bots.')
  } else {
    ctx.replyWithMarkdown(getHelp())
  }
})

bot.command(['mejorventa', 'mv'], fnMejorVenta)
bot.command(['mejorcompra', 'mc'], fnMejorCompra)
bot.command(['set'], fnSET)
bot.command(['bcp'], fnBCP)

bot.command(['opciones'], async (ctx) => {
  return await ctx.reply(
    'Elegí una de las opciones: ',
    Markup.keyboard([
      ['BCP', 'SET'], 
      ['Mejor Venta', 'Mejor Compra'],
      ['Cancelar']
    ])
      .oneTime()
      .resize()
  )
})
bot.hears('Mejor Venta', fnMejorVenta)
bot.hears('Mejor Compra', fnMejorCompra)
bot.hears('BCP', fnBCP)
bot.hears('SET', fnSET)
bot.hears('Cancelar', ctx => ctx.reply('Ok ! Cancelado.'))

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
