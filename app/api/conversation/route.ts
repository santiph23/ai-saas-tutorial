
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit"
import { checkSubscription } from "@/lib/subscription"
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import { Configuration, OpenAIApi } from "openai"

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
        const { messages } = body

        if (!userId) {
            return new NextResponse("Unauth", { status: 401 })
        }

        if (!configuration) {
            return new NextResponse("No api key configured", { status: 500 })
        }

        if (!messages) {
            return new NextResponse("No messages", { status: 500 })
        }

        const freeTrail = await checkApiLimit()
        const isPro = await checkSubscription()

        if (!freeTrail && !isPro) {
            return new NextResponse("Free trail ended", { status: 403 })
        }

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages
        })

        if (!isPro) {
            await increaseApiLimit()
        }

        return NextResponse.json(response.data.choices[0].message)

    } catch (error) {
        console.log(error)
        return new NextResponse("Internal error", { status: 500 })
    }
}