import { Router } from "express"
import { MercadoPagoConfig, Preference } from 'mercadopago';

export const MercadoPago = () => {
  const router = Router()
  const client = new MercadoPagoConfig({
    accessToken: 'APP_USR-2600172555638929-110615-48b72acf439f876516eb0d0fc0a81fb6-2079921755',
  });

  router.post("/createPreference", async (req, res) => {
    try {
      const body = {
        items: [
          {
            title: req.body.title,
            quantity: Number(req.body.quantity),
            unit_price: Number(req.body.price),
            currency_id: "ARS",
          }
        ],
        back_urls: {
          success: "https://www.youtube.com",
          failure: "https://www.youtube.com",
          pending: "https://www.youtube.com",
        },
        auto_return: "approved",
      }

      const preference = new Preference(client)
      const result = await preference.create({body})

      res.json({
        id: result.id
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({
        error: "Error al crear la preferencia."
      })
    }
  })

  return router
}