import { AjaxOptions, AjaxResponse, IAjaxProvider, Value } from "jinqu";

export type FetchOptions = AjaxOptions & RequestInit;

export class FetchProvider implements IAjaxProvider<Response, FetchOptions> {

    public static readonly defaultOptions: FetchOptions = {
        $headers: {
            "Accept": "application/json; charset=utf-8",
            "Content-Type": "application/json; charset=utf-8",
        },
        $method: "GET",
    };

    public ajax<T>(o: FetchOptions): Promise<Value<T> & AjaxResponse<Response>> {
        if (o.$params && o.$params.length) {
            o.$url += "?" + o.$params.map(p => `${p.key}=${encodeURIComponent(p.value)}`).join("&");
        }

        const promise = fetch(o.$url, createRequest(o))
            .then(async r => {
                let d = await r.json();
                return ({ value: d, response: r });
            });

        if (!o.$timeout)
            return promise as never;

        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out")), o.$timeout),
            ),
        ]) as never;
    }
}

export function createRequest(o: FetchOptions) {
    const ao = Object.fromEntries(Object.entries(o).filter(([key]) => key[0] != "$"));

    ao.method = ao.method || o.$method || FetchProvider.defaultOptions.$method;
    if (ao.$method != "GET" && o.$data != null && Object.keys(o.$data).length > 0) {
        ao.body = JSON.stringify(o.$data);
    }
    let headers = Object.assign({}, FetchProvider.defaultOptions.$headers, ao.headers);
    if (o.$headers != null) {
        headers = Object.assign(headers, o.$headers);
    }
    ao.headers = headers;

    return ao;
}
