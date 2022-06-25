// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import Asset from 'App/Models/Asset'
import { exists, mkdir  } from 'node:fs';

export default class AssetsController {
    public async store({ auth, request, response }){
        try {
            await auth.use('api').authenticate()
            const userLogin = auth.use('api').user!

            const files = request.files('files', {
                size: '10mb',
            })!

            const currentDate = new Date()
            const timestamp = currentDate.getTime()
            const year = currentDate.getFullYear()
            const month = currentDate.getMonth()+1
            const date = currentDate.getDate()

            const fileUploads: Object[] = [];

            const newPath = `${year}/${month}/${date}/`

            exists(`./${newPath}`, (e) => {
                if(!e)
                    mkdir(`./${newPath}`, { recursive: true }, (err) => {
                        if(err)
                            return response.badRequest({ code: 400, message: err })
                    })
            })

            for (let file of files) {
                const type = file.type
                const originalFileName = file.clientName
                await file.moveToDisk(`./${newPath}`, {
                    name: `${userLogin.id}_${timestamp}.${file.extname}`
                })
                const fileName = file.fileName
                const filePath = await Drive.getUrl(`${newPath}${fileName}`)

                const asset = new Asset()
                asset.media_name = fileName
                asset.media_path = filePath
                asset.media_original_name = originalFileName
                asset.media_type = type
                asset.created_id = userLogin.id
                asset.created_name = userLogin.name
                asset.updated_id = userLogin.id
                asset.updated_name = userLogin.name
                await asset.save()

                fileUploads.push(asset.toObject())
            }

            return response.send({ code: 200, message: 'File berhasil di upload', data: fileUploads })
        } catch (error) {
            console.log(error)
            response.badRequest({code: 400, message:  error?.responseText || error?.code})
        }
    }
}
