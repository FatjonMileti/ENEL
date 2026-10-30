export const STARTED = 'STARTED';
export const ACTIVATED = 'ACTIVATED';
export const PENDING = 'PENDING';
export const REJECTED = 'REJECTED';
export const UNFINISHED = 'UNFINISHED';
export const ERRORED = 'ERRORED';
export const BO_UNPROCESSED = 'BO_UNPROCESSED';

// probabil trebuie sa mutam statusurile si restul de coloane calculate pe tabela de sesiune.
// la fiecare patch sa se recalculeze
export const getStatusFilters = (status) => {
	const filters = [];
	switch (status) {
		case STARTED:
	        break;
	    case ACTIVATED:
	        filters.push({ column: '$or[10][type]', value: 'EE' });
	        filters.push({ column: '$or[10][ee_agree]', value: 'true' });

	        filters.push({ column: '$or[11][type]', value: 'GAZ' });
	        filters.push({ column: '$or[11][gaz_agree]', value: 'true' });

	        filters.push({ column: '$or[12][type]', value: 'COMBO' });
	        filters.push({ column: '$or[12][ee_agree]', value: 'true' });
	        filters.push({ column: '$or[12][gaz_agree]', value: 'true' });
	        break;
	    case PENDING:
	        filters.push({ column: '$or[11][type]', value: 'EE' });
	        filters.push({ column: '$or[11][ee_agree]', value: 'null' });
	        filters.push({ column: '$or[11][ee_sign_success]', value: 'true' });

	        filters.push({ column: '$or[12][type]', value: 'GAZ' });
	        filters.push({ column: '$or[12][gaz_agree]', value: 'null' });
	        filters.push({ column: '$or[12][gaz_sign_success]', value: 'true' });

	        filters.push({ column: '$or[13][type]', value: 'COMBO' });
	        filters.push({ column: '$or[13][ee_agree]', value: 'null' });
	        filters.push({ column: '$or[13][gaz_agree]', value: 'null' });
	        filters.push({ column: '$or[13][ee_sign_success]', value: 'true' });
	        filters.push({ column: '$or[13][gaz_sign_success]', value: 'true' });

	        filters.push({ column: '$or[14][type]', value: 'COMBO' });
	        filters.push({ column: '$or[14][ee_agree]', value: 'null' });
	        filters.push({ column: '$or[14][gaz_agree]', value: 'null' });
	        filters.push({ column: '$or[14][ee_sign_success]', value: 'null' });
	        filters.push({ column: '$or[14][gaz_sign_success]', value: 'true' });

	        filters.push({ column: '$or[15][type]', value: 'COMBO' });
	        filters.push({ column: '$or[15][ee_agree]', value: 'null' });
	        filters.push({ column: '$or[15][gaz_agree]', value: 'null' });
	        filters.push({ column: '$or[15][ee_sign_success]', value: 'true' });
	        filters.push({ column: '$or[15][gaz_sign_success]', value: 'null' });
	        break;
	    case REJECTED:
	        filters.push({ column: '$or[10][ee_agree]', value: 'false' });
	        filters.push({ column: '$or[11][gaz_agree]', value: 'false' });
	        break;
	    case UNFINISHED:
	        filters.push({ column: '$or[10][type]', value: 'EE' });
	        filters.push({ column: '$or[10][ee_agree]', value: 'null' });
	        filters.push({ column: '$or[10][ee_sign_success]', value: 'null' });
	        filters.push({ column: '$or[10][ee_offer_success]', value: 'null' });
			
	        filters.push({ column: '$or[11][type]', value: 'EE' });
	        filters.push({ column: '$or[11][ee_agree]', value: 'null' });
	        filters.push({ column: '$or[11][ee_sign_success]', value: 'null' });
	        filters.push({ column: '$or[11][ee_offer_success]', value: 'true' });

	        filters.push({ column: '$or[12][type]', value: 'GAZ' });
	        filters.push({ column: '$or[12][gaz_agree]', value: 'null' });
	        filters.push({ column: '$or[12][gaz_sign_success]', value: 'null' });
	        filters.push({ column: '$or[12][gaz_offer_success]', value: 'null' });
	        filters.push({ column: '$or[13][type]', value: 'GAZ' });
	        filters.push({ column: '$or[13][gaz_agree]', value: 'null' });
	        filters.push({ column: '$or[13][gaz_sign_success]', value: 'null' });
	        filters.push({ column: '$or[13][gaz_offer_success]', value: 'true' });

	        filters.push({ column: '$or[14][type]', value: 'COMBO' });
	        filters.push({ column: '$or[14][ee_agree]', value: 'null' });
	        filters.push({ column: '$or[14][ee_sign_success]', value: 'null' });
	        filters.push({ column: '$or[14][ee_offer_success]', value: 'null' });
	        filters.push({ column: '$or[14][gaz_agree]', value: 'null' });
	        filters.push({ column: '$or[14][gaz_sign_success]', value: 'null' });
	        filters.push({ column: '$or[14][gaz_offer_success]', value: 'null' });
			
	        filters.push({ column: '$or[15][type]', value: 'COMBO' });
	        filters.push({ column: '$or[15][ee_agree]', value: 'null' });
	        filters.push({ column: '$or[15][ee_sign_success]', value: 'null' });
	        filters.push({ column: '$or[15][ee_offer_success]', value: 'true' });
	        filters.push({ column: '$or[15][gaz_agree]', value: 'null' });
	        filters.push({ column: '$or[15][gaz_sign_success]', value: 'null' });
	        filters.push({ column: '$or[15][gaz_offer_success]', value: 'null' });
			
	        filters.push({ column: '$or[16][type]', value: 'COMBO' });
	        filters.push({ column: '$or[16][ee_agree]', value: 'null' });
	        filters.push({ column: '$or[16][ee_sign_success]', value: 'null' });
	        filters.push({ column: '$or[16][ee_offer_success]', value: 'null' });
	        filters.push({ column: '$or[16][gaz_agree]', value: 'null' });
	        filters.push({ column: '$or[16][gaz_sign_success]', value: 'null' });
	        filters.push({ column: '$or[16][gaz_offer_success]', value: 'true' });
			
	        filters.push({ column: '$or[17][type]', value: 'COMBO' });
	        filters.push({ column: '$or[17][ee_agree]', value: 'null' });
	        filters.push({ column: '$or[17][ee_sign_success]', value: 'null' });
	        filters.push({ column: '$or[17][ee_offer_success]', value: 'true' });
	        filters.push({ column: '$or[17][gaz_agree]', value: 'null' });
	        filters.push({ column: '$or[17][gaz_sign_success]', value: 'null' });
	        filters.push({ column: '$or[17][gaz_offer_success]', value: 'true' });

	        filters.push({ column: '$or[9][type]', value: 'null' });
	        break;
	    case ERRORED:
	        filters.push({ column: '$or[10][ee_offer_success]', value: 'false' });
	        filters.push({ column: '$or[11][gaz_offer_success]', value: 'false' });
	        filters.push({ column: '$or[12][ee_sign_success]', value: 'false' });
	        filters.push({ column: '$or[13][gaz_sign_success]', value: 'false' });
	        filters.push({ column: '$or[14][ee_activate_success]', value: 'false' });
	        filters.push({ column: '$or[15][gaz_activate_success]', value: 'false' });
	        break;
	    case BO_UNPROCESSED:
			filters.push({ column: '$or[10][type]', value: 'EE' });
			filters.push({ column: '$or[10][ee_offer_success]', value: 'true' });
			filters.push({ column: '$or[10][ee_sign_success]', value: 'null' });
			filters.push({ column: '$or[10][backoffice]', value: 'true' });

			filters.push({ column: '$or[11][type]', value: 'GAZ' });
			filters.push({ column: '$or[11][gaz_offer_success]', value: 'true' });
			filters.push({ column: '$or[11][gaz_sign_success]', value: 'null' });
			filters.push({ column: '$or[11][backoffice]', value: 'true' });

			filters.push({ column: '$or[12][type]', value: 'COMBO' });
			filters.push({ column: '$or[12][ee_offer_success]', value: 'true' });
			filters.push({ column: '$or[12][ee_sign_success]', value: 'null' });
			filters.push({ column: '$or[12][gaz_offer_success]', value: 'true' });
			filters.push({ column: '$or[12][gaz_sign_success]', value: 'null' });
			filters.push({ column: '$or[12][backoffice]', value: 'true' });
	        break;
	}

	return filters;
} 
