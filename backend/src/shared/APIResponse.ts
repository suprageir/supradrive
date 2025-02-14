export function APIResponse(status: string, code: number, message: string, details: string, id: number | null) {
    let json = JSON.stringify({ status, code, message, details, id });
    return json;
}