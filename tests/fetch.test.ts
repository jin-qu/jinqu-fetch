import fetchMock from "jest-fetch-mock";
import { FetchProvider } from "..";

fetchMock.enableMocks();

const headers = {
    "Accept": "application/json; charset=utf-8",
    "Content-Type": "application/json; charset=utf-8"
};

describe("Fetch tests", () => {

    afterEach(() => {
        fetchMock.resetMocks();
    });

    it("should return null", async () => {
        fetchMock.mockResponseOnce(JSON.stringify(null));

        const ajaxProvider = new FetchProvider();
        const r = await ajaxProvider.ajax({
            url: "Companies"
        });

        expect(r.value).toBe(null);
    });

    it("should set url", async () => {
        fetchMock.mockResponseOnce(JSON.stringify({}));

        const ajaxProvider = new FetchProvider();
        const r = await ajaxProvider.ajax({
            url: "Companies",
            params: [
                { key: "$where", value: "o => o.id > 5" },
                { key: "$orderBy", value: "o => o.id" },
                { key: "$skip", value: "10" },
                { key: "$take", value: "10" }
            ]
        });
        expect(r.value).toEqual({});

        const options = fetchMock.mock.lastCall;
        const request = [
            "Companies?$where=o%20%3D%3E%20o.id%20%3E%205&$orderBy=o%20%3D%3E%20o.id&$skip=10&$take=10",
            {
                body: undefined,
                method: "GET",
                headers
            }
        ];
        expect(options).toEqual(request);
    });

    it("should throw when timeout elapsed", async () => {
        fetchMock.mockImplementationOnce(() => new Promise(r => setTimeout(() => r(null as never), 10)));

        const ajaxProvider = new FetchProvider();

        try {
            await ajaxProvider.ajax({
                url: "Companies",
                timeout: 1
            });

            fail("Should have failed because of timeout");
        }
        catch (e) {
            expect(e).toHaveProperty("message", "Request timed out");
        }
    });
});
