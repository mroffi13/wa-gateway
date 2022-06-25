// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { create, ev, Client } from '@open-wa/wa-automate';
import { writeFileSync  } from 'node:fs';
import { schema } from '@ioc:Adonis/Core/Validator'
let globalClient:Client;

export default class WhatsappsController {
    public async index({ auth, response }){
        try {
            await auth.use('api').authenticate()
            if(!auth.use('api').isAuthenticated)
                return response.badRequest({ code: 400, message: 'Mohon login terlebih dahulu.' })
            /**
             * Detect the qr code
             */
            ev.on('qr.**', async (qrcode,sessionId) => {
                //base64 encoded qr code image
                const imageBuffer = Buffer.from(qrcode.replace('data:image/png;base64,',''), 'base64');
                writeFileSync(`qr_code${sessionId?'_'+sessionId:''}.png`, imageBuffer);
            });

            /**
             * Detect when a session has been started successfully
             */
            ev.on('STARTUP.**', async (data,sessionId) => {
                if(data === 'SUCCESS') console.log(`${sessionId} started!`)
            })
            
            /**
             * Detect all events
             */
            ev.on('**', async (data,sessionId,namespace) => {
                console.log("\n----------")
                console.log('EV',data,sessionId,namespace)
                console.log("----------")
            })
            
            create({
                sessionId: "TEST_HELPER",
                useChrome: true,
                multiDevice: true, //required to enable multiDevice support
                authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
                blockCrashLogs: true,
                disableSpins: true,
                headless: true,
                logConsole: false,
                popup: true,
                qrTimeout: 0, //0 means it will wait forever for you to scan the qr code
            }).then((client) => {
                client.onMessage(async message => {
                    console.log(message)
                    if(message.body === '1'){
                        await client.sendText(message.from, `Yeay terimakasih 😍😘`);
                    }
                    else {
                        await client.sendText(message.from, `👋 Hello ${message.notifyName}!\n\nApakah aku ganteng? Ketik\n1. Ya ganteng\n2. Tidak Ganteng.\n\nPilih salah satu`);
                    }
                });

                globalClient=client;
            });
        } catch (error) {
            response.badRequest({code: 400, message: error?.responseText || error?.code})
        }
    }

    public async sendMessage({ auth, response, request }) {
        const newPostSchema = schema.create({
            number: schema.string(),
            message: schema.string(),
        })
        try {
            await auth.use('api').authenticate()
            if(!auth.use('api').isAuthenticated)
                return response.badRequest({ code: 400, message: 'Mohon login terlebih dahulu.' })

            const payload = await request.validate({ 
                schema: newPostSchema,
                messages: {
                    required: 'Field {{ field }} wajib diisi'
                }
            })

            const number = payload.number
            if(`${number[0]}${number[1]}` !== '62')
                return response.badRequest({ code: 400, message: 'Awal nomor handphone harus 62' })

            globalClient.sendText(`${number}@c.us`, payload.message)
        }
        catch(error){
            console.log(error)
            response.badRequest({code: 400, message: error?.responseText || error?.code})
        }
    }

    exportQR({ qrCode, path }: { qrCode; path; }) {
        qrCode = qrCode.replace('data:image/png;base64,', '');
        const imageBuffer = Buffer.from(qrCode, 'base64');
      
        // Creates 'marketing-qr.png' file
        writeFileSync(path, imageBuffer);
    }
}
