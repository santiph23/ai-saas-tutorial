
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import Replicate from "replicate"
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit"
import { checkSubscription } from "@/lib/subscription"

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY!
})

export async function POST(
    req: Request
) {
    try {

        const { userId } = auth()
        const body = await req.json()
        const { prompt } = body

        if (!userId) {
            return new NextResponse("Unauth", { status: 401 })
        }

        if (!prompt) {
            return new NextResponse("No prompt", { status: 500 })
        }

        const freeTrail = await checkApiLimit()
        const isPro = await checkSubscription()

        if (!freeTrail && !isPro) {
            return new NextResponse("Free trail ended", { status: 403 })
        }

        const response = await replicate.run(
            "anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
            {
                input: {
                    prompt: prompt
                }
            }
        );

        if (!isPro) {
            await increaseApiLimit()
        }

        return NextResponse.json(response)

    } catch (error) {
        console.log(error)
        return new NextResponse("Internal error", { status: 500 })
    }
}