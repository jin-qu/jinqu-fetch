import { AjaxOptions, AjaxResponse, IAjaxProvider, mergeAjaxOptions, Value } from "jinqu";

export class FetchProvider implements IAjaxProvider<Response> {

    public static readonly defaultOptions: AjaxOptions = {
        headers: {
            "Accept": "application/json; charset=utf-8",
            "Content-Type": "application/json; charset=utf-8",
        },
        method: "GET",
    };

    public ajax<T>(o: AjaxOptions): Promise<Value<T> & AjaxResponse<Response>> {
        if (o.params && o.params.length) {
            o.url += "?" + o.params.map((p) => `${p.key}=${encodeURIComponent(p.value)}`).join("&");
        }

        const promise = fetch(o.url, createRequest(o))
            .then((r) => {
                return r.json()
                    .then((d) => ({ value: d, response: r }));
            });

        if (!o.timeout) {
            return promise as any;
        }

        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out")), o.timeout),
            ),
        ]) as any;
    }
}

export function createRequest(o: AjaxOptions) {
    const d = Object.assign({}, FetchProvider.defaultOptions);
    o = mergeAjaxOptions(d, o);

    return {
        body: JSON.stringify(o.data),
        headers: o.headers,
        method: o.method,
    } as RequestInit;
}
