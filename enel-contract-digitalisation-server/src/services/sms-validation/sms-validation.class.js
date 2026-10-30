const { GeneralError, TooManyRequests, BadRequest, NotFound } = require('@feathersjs/errors');
const { sendSMS } = require('../../utils/web2sms');
const Mailer = require('../../utils/mailer.js');

class Service {
  setup(app) {
    this.app = app;
    this.smsValidation = this.app.service('sms-validations');
    this.mailer = new Mailer({
      get: () => {
        return {
          smtp: process.env.SMTP_SERVER,
          from: process.env.MAIL_FROM
        };
      }
    });
  }

  constructor(options) {
    this.options = options || {};
  }

  async find(params) {
    return [];
  }

  // Helper method to build contact conditions (phone has priority over email)
  _buildContactConditions(phoneNumber, email) {
    if (!phoneNumber && !email) {
      throw new BadRequest('Either phone number or email is required');
    }

    // Phone number has priority - if provided, only use phone
    if (phoneNumber) {
      return { phoneNumber };
    }

    // Only use email if no phone number
    return { email };
  }

  // Helper method to find active validation
  async _findActiveValidation(contactConditions) {
    return await this.options.Model.findOne({
      where: {
        ...contactConditions,
        isConfirmed: false,
        isFinished: false
      },
      order: [['id', 'DESC']]
    });
  }

  // Helper method to find any validation (for session updates)
  async _findAnyValidation(contactConditions) {
    return await this.options.Model.findOne({
      where: contactConditions,
      order: [['id', 'DESC']]
    });
  }

  // Check validation status
  async get(id, params) {
    const { phoneNumber, email, session } = params.query;

    const contactConditions = this._buildContactConditions(phoneNumber, email);

    // Find the most recent validation for this contact
    const validation = await this.options.Model.findOne({
      where: contactConditions,
      order: [['id', 'DESC']]
    });

    if (!validation) {
      return { isValidated: false };
    }

    // If no session provided, validation is not complete
    if (!session) {
      return { isValidated: false };
    }

    // Check if validation is complete and has the correct session
    const isValidated = validation.isConfirmed &&
                       validation.isFinished &&
                       validation.session === parseInt(session);

    return { isValidated };
  }

  // Create new validation and send PIN
  async create(data, params) {
    const { phoneNumber, email } = data;

    const contactConditions = this._buildContactConditions(phoneNumber, email);
    const validatedBy = phoneNumber ? 'phone' : 'email';

    // Check for existing active validation
    const existingValidation = await this._findActiveValidation(contactConditions);

    // Rate limiting check
    if (existingValidation) {
      const lastSentTime = new Date(existingValidation.lastSentAt).getTime();
      const currentTime = new Date().getTime();
      const timeDiff = (currentTime - lastSentTime) / 1000;

      if (timeDiff < 150) {
        const remainingTime = Math.ceil(150 - timeDiff);
        throw new TooManyRequests(`Te rugăm să aștepți ${remainingTime} de secunde înainte de a reîncerca`);
      }
    }

    // Generate new PIN and expiration
    const pin = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 150);

    // Determine if we should increment attempts count
    let newAttemptsCount = 0;
    if (existingValidation) {
      // Only increment if the previous PIN expired due to time (not wrong PIN attempts)
      const hasExpired = existingValidation.expiresAt < new Date();
      newAttemptsCount = hasExpired ? existingValidation.attemptsCount + 1 : existingValidation.attemptsCount;
    }

    const validationData = {
      ...contactConditions,
      pin,
      expiresAt,
      lastSentAt: new Date(),
      isConfirmed: false,
      isFinished: false,
      validatedBy,
      attemptsCount: newAttemptsCount
    };

    let validation;
    if (existingValidation) {
      // Update existing validation
      await this.options.Model.update(validationData, {
        where: { id: existingValidation.id }
      });
      validation = { ...existingValidation, ...validationData };
    } else {
      // Create new validation
      validation = await this.options.Model.create(validationData);
    }

    // Send PIN
    await this._sendPin(phoneNumber, email, pin);

    return {
      success: true,
      data: {
        attemptsCount: validation.attemptsCount,
        sentBy: validatedBy,
        id: validation.id
      },
      message: 'Validation code sent successfully'
    };
  }

  // Verify PIN or update session
  async update(id, data) {
    const { phoneNumber, email, pin, session } = data;

    const contactConditions = this._buildContactConditions(phoneNumber, email);

    // If only session is provided, update session on validated record
    if (session && !pin) {
      return await this._updateSession(contactConditions, session);
    }

    // If PIN is provided, verify it
    if (pin) {
      return await this._verifyPin(contactConditions, pin, session);
    }

    throw new BadRequest('Either PIN or session must be provided');
  }

  // Update session on already validated record
  async _updateSession(contactConditions, session) {
    const validation = await this._findAnyValidation(contactConditions);

    if (!validation) {
      throw new NotFound('Validation not found');
    }

    await this.options.Model.update(
      { session: parseInt(session), isFinished: true },

      { where: { id: validation.id } }
    );

    return {
      success: true,
      message: 'Session updated successfully'
    };
  }

  // Verify PIN and optionally set session
  async _verifyPin(contactConditions, pin, session = null) {
    const validation = await this._findActiveValidation(contactConditions);

    if (!validation) {
      throw new BadRequest('Validarea nu a fost găsită');
    }

    if (validation.isConfirmed) {
      throw new BadRequest('Această validare a fost deja confirmată');
    }

    if (validation.expiresAt < new Date()) {
      throw new BadRequest('Codul de validare a expirat');
    }

    if (validation.pin !== pin) {
      await this.options.Model.update(
        { lastSentAt: new Date(Date.now() - 150 * 1000), attemptsCount: validation.attemptsCount + 1 },
        { where: { id: validation.id } }
      );
      throw new BadRequest('PIN-ul introdus este invalid. Te rugăm să reîncerci',{attempts: validation.attemptsCount + 1});
    }

    // Mark as confirmed and finished
    const updateData = {
      isConfirmed: true,
      isFinished: true,
      attemptsCount: 0
    };

    if (session) {
      updateData.session = parseInt(session);
    }

    await this.options.Model.update(updateData, {
      where: { id: validation.id }
    });

    return {
      success: true,
      data: {
        sentBy: validation.validatedBy
      },
      message: 'Validation successful'
    };
  }

  // Send PIN via SMS or emailf
  async _sendPin(phoneNumber, email, pin) {
    const message = `Codul pentru validare date contact este ${pin}. Daca nu ai o solicitare pentru incheierea unui contract de furnizare, te rugam sa ignori acest mesaj.`;
    if (phoneNumber) {
      await this.sendSms(phoneNumber, pin);
    } else if (email) {
      await this.mailer.sendMail(email, "Validarea contactului", message);
    }
  }

  async remove(id, params) {
    await this.options.Model.destroy({
      where: { id }
    });
    return {
      id,
      text: 'removed'
    };
  }

  async sendSms(phoneNumber, pin) {
    const message = `Codul pentru validare date contact este ${pin}. Daca nu ai o solicitare pentru incheierea unui contract de furnizare, te rugam sa ignori acest mesaj.`;
    const result = await sendSMS({
      recipient: phoneNumber,
      message,
      subject: 'Validarea contactului',
      sessionID: ''
    });

    if (!result.status) {
      throw new GeneralError(`Failed to send SMS: ${result.message}`);
    }
  }

  // Restart validation process
  async restart(data, params) {
    const { phoneNumber, email } = data;

    const contactConditions = this._buildContactConditions(phoneNumber, email);

    const validation = await this._findActiveValidation(contactConditions);

    if (!validation) {
      throw new NotFound('No active validation found');
    }

    try {
      await this.options.Model.update({
        isConfirmed: false,
        isFinished: false,
        attemptsCount: 0
      }, {
        where: { id: validation.id }
      });

      return {
        success: true,
        message: 'Validation restarted'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Validation failed to restart'
      };
    }
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
