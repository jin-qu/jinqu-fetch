import 'mocha';
import { expect } from 'chai';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import fetchMock = require('fetch-mock');
import 'whatwg-fetch';

import { FetchProvider } from '..';

chai.use(chaiAsPromised)
const emptyResponse = {};

describe('Fetch tests', () => {

    it('should set url', async () => {
        fetchMock.get(
            'Companies',
            emptyResponse,
            {
                method: 'GET',
                query: {
                    '$where': 'o => o.id > 5',
                    '$orderBy': 'o => o.id',
                    '$skip': '10',
                    '$take': '10'
                },
                overwriteRoutes: false
            }
        );

        const fetchProvider = new FetchProvider();
        const r = await fetchProvider.ajax({
            url: 'Companies',
            params: [
                { key: '$where', value: 'o => o.id > 5' },
                { key: '$orderBy', value: 'o => o.id' },
                { key: '$skip', value: '10' },
                { key: '$take', value: '10' }
            ]
        });

        expect(r.value).deep.equal(emptyResponse);

        const options = fetchMock.lastOptions();
        expect(options.method).to.equal('GET');

        fetchMock.restore();
    });

    it('should return null', async () => {
        fetchMock.get(
            'Companies',
            {
                body: 'null'
            },
            {
                method: 'GET',
                overwriteRoutes: false
            }
        );

        const fetchProvider = new FetchProvider();
        const r = await fetchProvider.ajax({
            url: 'Companies'
        });

        expect(r.value).to.be.null;

        fetchMock.restore();
    });

    it('should throw when timeout elapsed', async () => {
        fetchMock.get(
            'Companies',
            new Promise((r, _) => setTimeout(() => r(emptyResponse), 10)),
            {
                method: 'GET',
                overwriteRoutes: false
            }
        );

        const fetchProvider = new FetchProvider();

        try {
            await fetchProvider.ajax({
                url: 'Companies',
                timeout: 1
            });
            expect.fail('Should have failed because of timeout');
        }
        catch (e) {
            expect(e).to.has.property('message', 'Request timed out');
        }

        fetchMock.restore();
    });
});
