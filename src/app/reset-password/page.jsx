"use client"

import { Suspense } from "react"
import ResetPassword from "./ResetPasswordForm"


export default function Page() {
    return(
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPassword />
        </Suspense>
    );
}