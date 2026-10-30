import ValidationException from './exceptions/validation';
import InvalidSessionException from './exceptions/invalidSession';
import InvalidTokenException from './exceptions/invalidToken';
import strings from './strings';
import _ from 'lodash';

class ExceptionService {
    // Exceptions types
    types = Object.freeze({
        VALIDATION: 'validation',
        INVALID_SESSION: 'invalid_session',
        INVALID_TOKEN: 'invalid_token',
    });

    // Map errors type from server to errors types from string files
    stringsMap = Object.freeze({
        'any.required': 'required',
        'any.empty': 'required',
        'number.base': 'invalid',
        'number.positive': 'invalid',
        'string.uri': 'invalidURL',
        'string.email': 'invalid',
        'string.max': 'tooLarge',
    });

    throw(type) {
        const exception = this.create(type);
        throw exception;
    }

    // Throw exception based on API Response
    throwFromResponse(data) {
        _.forEach(this.types, (type) => {
            if (this.hasResponseErrors(type, data)) {
                const exception = this.createFromResponse(type, data);
                throw exception;
            }
        });
    }

    // Retrieve message string based on error type and strings
    getMessage(error) {
        if (!(error.type in this.stringsMap)) {
            return error.message;
        }

        const vars = {
            field: _.capitalize(error.path),
        };

        if (error.type === 'string.max') {
            vars.limitNumber = error.context.limit;
        }

        const key = `Exceptions.${this.stringsMap[error.type]}`;

        return strings.get(key, vars);
    }

    checkType(type, e) {
        if (e instanceof ValidationException && type === this.types.VALIDATION) {
            return true;
        } else if (e instanceof InvalidSessionException && type === this.types.INVALID_SESSION) {
            return true;
        } else if (e instanceof InvalidTokenException && type === this.types.INVALID_TOKEN) {
            return true;
        }
        return false;
    }

    hasResponseErrors(type, data) {
        // Check for validation errors
        if (type === this.types.VALIDATION) {
            if (data.error) {
                if (typeof data.error === 'string' && data.error === 'invalid_request') {
                    return true;
                } else if (typeof data.error === 'object' && 'valid' in data && !data.valid) {
                    return true;
                }
            }
        }

        // Check for invalid session errors
        else if (type === this.types.INVALID_SESSION) {
            if (data.error === 'invalid_session') {
                return true;
            }
        }

        // Check for invalid token errors
        else if (type === this.types.INVALID_TOKEN) {
            if (data.error === 'invalid_token') {
                return true;
            }
        }

        return false;
    }

    createFromResponse(type, data) {
        let errors = {};

        // Handle ValidationException
        if (type === this.types.VALIDATION) {
            if (data.error) {
                // Error is just a message
                if (typeof data.error === 'string') {
                    errors = { message: data.error };
                }
                // Multiple errors for different fields
                else if (typeof data.error === 'object' && data.error.length > 0) {
                    for (let i = 0; i < data.error.length; i++) {
                        const error = data.error[i];
                        _.set(errors, error.path, this.getMessage(error));
                    }
                }
            }
        }

        // Handle AuthException
        else if (type === this.types.INVALID_SESSION) {
            // nothing to process here for now
        }

        // Handle ExpiredTokenException
        else if (type === this.types.INVALID_TOKEN) {
            // nothing to process here for now
        }

        return this.create(type, errors);
    }

    create(type, errors) {
        // Create ValidationException
        if (type === this.types.VALIDATION) {
            return new ValidationException(errors);
        }

        // Create InvalidSessionException
        else if (type === this.types.INVALID_SESSION) {
            return new InvalidSessionException();
        }

        // Create InvalidTokenException
        else if (type === this.types.INVALID_TOKEN) {
            return new InvalidTokenException();
        }
    }
}

export default new ExceptionService();
