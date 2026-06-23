import { Suspense } from "react";
import SetupPasswordForm from "./SetupPasswordForm";


export default function SetupPasswordPage(){
    return(
        <Suspense fallback={<div>Loading...</div>}>
            <SetupPasswordForm />
        </Suspense>
    )
}