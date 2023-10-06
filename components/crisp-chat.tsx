"use client"

import { useEffect } from "react"
import { Crisp } from "crisp-sdk-web"

const CrispChat = () => {
    useEffect(() => {
        Crisp.configure("bd8ba129-1877-4a44-b211-fa9038ba1ef4")
    }, [])

    return null
}
 
export default CrispChat;