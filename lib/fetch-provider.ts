import { IAjaxProvider, AjaxOptions, mergeAjaxOptions } from "jinqu";

export class FetchProvider implements IAjaxProvider {

    static readonly defaultOptions: AjaxOptions = {
        method: 'GET',
        headers: {
            'Accept': 'application/json; charset=utf-8',
            'Content-Type': 'application/json; charset=utf-8'
        }
    };

    ajax<T>(o: AjaxOptions): Promise<T> {
        if (o.params && o.params.length) {
            o.url += '?' + o.params.map(p => `${p.key}=${encodeURIComponent(p.value)}`).join('&');
        }
        const p = fetch(o.url, createRequest(o))
            .then(response => {
                return response.json()
                    .then(data => {
                        if (data != null) {
                            const ic = response.headers.get('X-InlineCount');
                            if (ic != null) {
                                data.$inlineCount = Number(ic);
                            }
                        }

                        return data;
                    });
            });

        if (!o.timeout) return <any>p;

        return <any>Promise.race([
            p,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), o.timeout)
            )
        ]);
    }
}

export function createRequest(o: AjaxOptions) {
    const d = Object.assign({}, FetchProvider.defaultOptions);
    o = mergeAjaxOptions(d, o);

    return <RequestInit>{
        body: JSON.stringify(o.data),
        headers: o.headers,
        method: o.method
    };
}