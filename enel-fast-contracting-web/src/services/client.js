import _ from 'lodash';
import moment from 'moment';

class ClientService {

    matchName(client1 = {}, client2 = {}) {
        if (!client1.firstName || !client1.lastName || !client2.firstName || !client2.lastName) {
            return false;
        }

        client1.firstName = client1.firstName.trim().replace(/-+/g, ' ');
        client1.lastName = client1.lastName.trim().replace(/-+/g, ' ');
        client2.firstName = client2.firstName.trim().replace(/-+/g, ' ');
        client2.lastName = client2.lastName.trim().replace(/-+/g, ' ');

        client1.firstName = client1.firstName.trim().replace(/\s+/g, ' ');
        client1.lastName = client1.lastName.trim().replace(/\s+/g, ' ');
        client2.firstName = client2.firstName.trim().replace(/\s+/g, ' ');
        client2.lastName = client2.lastName.trim().replace(/\s+/g, ' ');

        if (client1.lastName.toLowerCase() !== client2.lastName.toLowerCase()) {
            return false;
        }

        const firstName1 = client1.firstName.split(/ |-/).map(item => item.toLowerCase()).sort();
        const firstName2 = client2.firstName.split(/ |-/).map(item => item.toLowerCase()).sort();

        return _.isEqual(firstName1.sort(), firstName2.sort());
    }

    getAgeFromCNP(cnp) {
        let birthday = moment(cnp.substr(1, 6), 'YYMMDD');

        if (birthday.year() > moment().year()) {
            birthday = birthday.subtract(100, 'years');
        }

        const age = moment().diff(birthday, 'years');

        return parseInt(age);
    }
}

export default new ClientService();
