
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import { Configuration, OpenAIApi } from "openai"
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit"
import { checkSubscription } from "@/lib/subscription"

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

export async function POST(
    req: Request
) {
    try {

        const { userId } = auth()
        const body = await req.json()
        const { prompt, amount = 1, resolution = "512x512" } = body

        if (!userId) {
            return new NextResponse("Unauth", { status: 401 })
        }

        if (!configuration) {
            return new NextResponse("No api key configured", { status: 500 })
        }

        if (!amount) {
            return new NextResponse("No amount", { status: 500 })
        }

        if (!resolution) {
            return new NextResponse("No resolution", { status: 500 })
        }

        if (!prompt) {
            return new NextResponse("No prompt", { status: 500 })
        }

        const freeTrail = await checkApiLimit()
        const isPro = await checkSubscription()

        if (!freeTrail && !isPro) {
            return new NextResponse("Free trail ended", { status: 403 })
        }

        const response = await openai.createImage({
            prompt,
            n: parseInt(amount, 10),
            size: resolution
        })

        if (!isPro) {
            await increaseApiLimit()
        }

        return NextResponse.json(response.data.data)

    } catch (error) {
        console.log(error)
        return new NextResponse("Internal image error", { status: 500 })
    }
}