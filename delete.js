import http from 'k6/http';
import { check } from 'k6';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

export const options = {
    stages: [
        { target: 5, duration: '1m' },
        { target: 5, duration: '2m' },
    ],
    thresholds: {
        "http_req_duration": ["p(95)<1000"]
    },
};

const csvData = papaparse.parse(open('./create.csv'), { header: true }).data;
console.log(csvData);

export default function () {

    let randomUser = csvData[Math.floor(Math.random() * csvData.length)];
    console.log('Random user: ', JSON.stringify(randomUser));

    let requests = {
        'update/${Id}': {
            method: 'DELETE',
            url: 'https://petstore.swagger.io/v2/user/' + randomUser.Username,
            params: {
                headers: { 'Content-Type': 'application/json' },
            },
        }
    };
    let responses = http.batch(requests);

    check(responses['update/${Id}'], {
        'update/${Id} status was 400': (res) => res.status === 400,
    });


}
