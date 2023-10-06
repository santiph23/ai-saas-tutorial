
import { auth, currentUser } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import { stripe } from "@/lib/stripe"
import { absoluteUrl } from "@/lib/utils"

const settingsUrl = absoluteUrl("/settings")

export async function GET() {
    try {
        const {userId} = auth()
        const user = await currentUser()

        if (!userId || !user) {
            return new NextResponse("Unauth", {status: 401})
        }

        const userSubscription = await prismadb.userSubscription.findUnique({
            where: {
                userId
            }
        })

        if (userSubscription && userSubscription.stripeCostumerId) {
            // Has stripe subscription
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: userSubscription.stripeCostumerId,
                return_url: settingsUrl
            })

            return new NextResponse(JSON.stringify({url: stripeSession.url}))
        }

        // Dosnt have stripe suscription
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: settingsUrl,
            cancel_url: settingsUrl,
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: user.emailAddresses[0].emailAddress,
            line_items: [
                {
                    price_data: {
                        currency: "USD",
                        product_data: {
                            name: "Genious Pro",
                            description: "Unlimited AI Generatios",
                        },
                        unit_amount: 2000,
                        recurring: {
                            interval: "month"
                        }
                    },
                    quantity: 1
                }
            ],
            metadata: {
                userId
            }
        })

        return new NextResponse(JSON.stringify({url: stripeSession.url}))

    } catch (error) {
        console.log(error)
        return new NextResponse("Internal error", {status: 500})
    }
}