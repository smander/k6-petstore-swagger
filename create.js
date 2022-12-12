import http from 'k6/http';
import { check } from 'k6';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

export const options = {
    stages: [
        { target: 5, duration: '1m' },
        { target: 5, duration: '2m' },
        { target: 0, duration: '1m' },
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
        'create/${Id}': {
            method: 'POST',
            url: 'https://petstore.swagger.io/v2/user',
            params: {
                headers: { 'Content-Type': 'application/json' },
            },
            body: {
                "id": randomUser.Id,
                "username": randomUser.Username,
                "firstName": randomUser.FirstName,
                "lastName": randomUser.LastName,
                "email": randomUser.Email,
                "password": randomUser.Password,
                "phone": randomUser.Phone,
                "userStatus": 1
            }
        }
    };
    let responses = http.batch(requests);

    check(responses['create/${Id}'], {
        'create/${Id} status was 200': (res) => res.status === 200,
    });


}
