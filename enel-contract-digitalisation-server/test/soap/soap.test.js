require('dotenv').config();

const expect = require('chai').expect;
const logger = require('../../src/utils/logger');

const SoapWrapper = require('../../src/internal-services/soap/soap-wrappers');
const soapMethods = new SoapWrapper();


describe('SOAP access testing', function() {
  // Increase Mocha timeout
  this.timeout(50000);

  it('CNP 1 should extract data from InfoClient', async () => {
    const cnp = '1520620353949';
    const clientData = await soapMethods.wsGetInfoClient(cnp);
    logger.info(`InfoClient: ${JSON.stringify(clientData)}`);
    expect(clientData.cnp_cui).to.be.equal(cnp);
    expect(clientData.enelCustomerId).to.be.equal('323759');
    expect(clientData.name).to.be.equal('CRISAN');
  });

  it('CNP 2 should extract data from InfoClient', async () => {
    if(process.env.ENDPOINT.indexOf('localhost') === -1) {
      let cnp = '2681215351066';
      let clientData = await soapMethods.wsGetInfoClient(cnp);
      logger.info(`InfoClient: ${JSON.stringify(clientData)}`);
      expect(clientData.cnp_cui).to.be.equal(cnp);
      expect(clientData.enelCustomerId).to.be.equal('135947');
      expect(clientData.name).to.be.equal('GREK');
    }
  });

  it('CNP 3 should extract data from InfoClient', async () => {
    if(process.env.ENDPOINT.indexOf('localhost') === -1) {
      let cnp = '2541203354782';
      let clientData = await soapMethods.wsGetInfoClient(cnp);
      logger.info(`InfoClient: ${JSON.stringify(clientData)}`);
      expect(clientData.cnp_cui).to.be.equal(cnp);
      expect(clientData.enelCustomerId).to.be.equal('64691');
      expect(clientData.name).to.be.equal('HULEA');
    }
  });



  it('should extract data from InfoNLC', async () => {
    const nlc = 'RO005E512599702';
    const infoNLC = await soapMethods.wsGetInfoNLC(nlc);
    expect(infoNLC.enelLocationId).to.be.equal('837991633');
    expect(infoNLC.districtId).to.be.equal('TIMIS');
    logger.info(`InfoNLC: ${JSON.stringify(infoNLC)}`);

    //Only for remote
    if(process.env.ENDPOINT.indexOf('localhost') === -1) {
      let nlc = 'RO005E511122400';
      let infoNLC = await soapMethods.wsGetInfoNLC(nlc);
      expect(infoNLC.enelLocationId).to.be.equal('522105');
      expect(infoNLC.districtId).to.be.equal('TIMIS');
      logger.info(`InfoNLC: ${JSON.stringify(infoNLC)}`);

      nlc = 'RO005E510159263';
      infoNLC = await soapMethods.wsGetInfoNLC(nlc);
      expect(infoNLC.enelLocationId).to.be.equal('136127');
      expect(infoNLC.districtId).to.be.equal('TIMIS');
      logger.info(`InfoNLC: ${JSON.stringify(infoNLC)}`);
    }
  });

  it('should extract data from VariantePret', async () => {
    const judet = 'HUNEDOARA';
    const furn24 = 1;
    const serviciu = 'COMBO';
    const scadenta = 15;

    const variantePreturi = await soapMethods.wsVariantePret({serviciu, judet, furn24, scadenta});

    logger.info(`Variante preturi:  ${JSON.stringify(variantePreturi)}`);
    expect(variantePreturi.variantePreturi.length).to.be.equal(4);
  });

  it.skip('should extract data from NomGeografice', async () => {
    const nomGeografice = await soapMethods.wsGetNomGeografice();

    logger.info(`Judete no.:  ${nomGeografice.judete.length}`);
    logger.info(`Localitati no.: ${nomGeografice.localitati.length}`);
    logger.info(`Artere no.:  ${nomGeografice.artere.length}`);
    logger.info(`Strazi no.:  ${nomGeografice.strazi.length}`);
    expect(nomGeografice.judete.length).to.be.equal(42);
    expect(nomGeografice.artere.length).to.be.equal(22);
  });
});
