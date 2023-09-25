import { sequence } from "astro:middleware";

// `context` = { locals, request }
// `context` y `next` son tipados automáticamente.
async function validation(context, next) {
    console.log("solicitud de validación", context.url.href);
    const response = await next();
    console.log("respuesta de validación");
    return response;
}

async function auth(context, next) {
    console.log("solicitud de autenticación");
    const response = await next();
    console.log("respuesta de autenticación");
    return response;
}

async function greeting(context, next) {
    console.log("solicitud de saludo");
    const response = await next();
    console.log("respuesta de saludo");
    return response;
}

export const onRequest = sequence(validation, auth, greeting);
