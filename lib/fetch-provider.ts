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
    const oo = Object.assign({}, FetchProvider.defaultOptions, o);
    const ao = Object.fromEntries(Object.entries(oo).filter(([key]) => key[0] != "$"));

    ao.method = ao.method || oo.$method;
    if (oo.$data != null && ao.$method != "GET") {
        ao.body = JSON.stringify(oo.$data);
    }
    if (oo.$headers != null) {
        ao.headers = Object.assign(ao.headers || {}, oo.$headers);
    }

    return ao;
}
