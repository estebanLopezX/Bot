const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require("dotenv").config


const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const path = require("path")
const fs = require("fs")
const chat = require("./chatGTP")

const menuPath = path.join(__dirname, "mensajes", "menu.txt");
const menu = fs.readFileSync(menuPath, "utf-8");

const consultaPrompt = path.join(__dirname, "mensajes", "promptConsultas.txt")
const consultas = fs.readFileSync(consultaPrompt, "utf-8")

const { delay } = require('@whiskeysockets/baileys')
const { log } = require('console')

const flowDropshipping = addKeyword(EVENTS.ACTION)
    .addAnswer('El Dropshipping es un modelo de negocio donde vendes productos sin tener inventarios. El proveedor envía directamente al cliente cuando se hace una compra en tu tienda online. 💻🛒')

const flowAprendizaje = addKeyword(EVENTS.ACTION)
    .addAnswer('En este curso aprenderás las bases para crear tu propia tienda online desde cero. Además, descubrirás cómo diseñar campañas efectivas y crear anuncios en Facebook. Te enseñaremos a usar diversas herramientas para diseñar tus creativos y redactar copys persuasivos que aumenten tus conversiones. 🚀💻📈')

const flowDuracion = addKeyword(EVENTS.ACTION)
    .addAnswer('El curso tiene una duración de 2 horas, inicia el dia 08/12 a las 7:00 pm.⏳')

const flowPrecio = addKeyword(EVENTS.ACTION)
    .addAnswer('NO, no tiene costo alguno, ¡es completamente GRATIS! 🎉💥🙌')

const flowInscripcion = addKeyword(EVENTS.ACTION)
    .addAnswer('Solamente tienes que ingresar al siguiente enlace y estar atento de las notificaciones.')
    .addAnswer('https://chat.whatsapp.com/H9oRdbdtRS9AJM0hlbs9O1', {
      delay: 3000
    })


const flowMenuConsultas = addKeyword(EVENTS.ACTION)
    .addAnswer('Bienvenidio')
    .addAnswer('Soy el *asistente* de la Academia de Dropi. ¿En que te puedo ayudar?', { capture: true }, async (ctx, ctxFn) => {
        const promt = consultas
        const consulta = ctx.body
        const answer = await chat(promt, consulta)
        await ctxFn.flowDynamic(answer.content)
    })



const flowWelcome = addKeyword(EVENTS.WELCOME)
    .addAnswer("Debes escribir 'Dropi' para poder elegir una opcion ", {
        delay: 1000,
    },
        async (ctx, ctxFn) => {
            if (ctx.body.includes("Menu")) {
                await ctxFn.flowDynamic("Escribiste Menu")
            } else {
                await ctxFn.flowDynamic("Dropi")
            }
        })

const menuFlow = addKeyword("Dropi").addAnswer(
    menu,
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        if (!["1", "2", "3", "4", "5", "6", "0"].includes(ctx.body)) {
            return fallBack(
                "Respuesta no válida, por favor selecciona una de las opciones."
            );
        }
        switch (ctx.body) {
            case "1":
                return gotoFlow(flowDropshipping);
            case "2":
                return gotoFlow(flowAprendizaje);
            case "3":
                return gotoFlow(flowDuracion);
            case "4":
                return gotoFlow(flowPrecio);
            case "5":
                return gotoFlow(flowInscripcion);
            case "6":
                return gotoFlow(flowMenuConsultas);
            case "0":
                return await flowDynamic(
                    "¡Hola! Soy el director del curso, ¿en qué puedo ayudarte específicamente? ✨"
                );
        }
    }
);


const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([menuFlow, flowWelcome, flowDropshipping, flowAprendizaje,flowDuracion, flowPrecio, flowInscripcion, flowMenuConsultas])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}


main()
