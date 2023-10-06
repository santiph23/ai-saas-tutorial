import { auth } from "@clerk/nextjs";
import prismadb from "./prismadb";

const DAY_IN_MIL = 86_400_000

export const checkSubscription = async () => {
    const { userId } = auth()

    if (!userId) {
        return false
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
        where: {
            userId
        },
        select: {
            stripeCostumerId: true,
            stripeCurrentPeriodEnd: true,
            stripePriceId: true,
            stripeSubscription: true
        }
    })

    if (!userSubscription) {
        return false
    }

    const isValid = (
        userSubscription.stripePriceId
        && userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MIL > Date.now()
    )

    return !!isValid
}