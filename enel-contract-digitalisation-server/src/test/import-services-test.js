require('dotenv').config();

const expect = require('chai').expect;
const logger = require('../utils/logger.js');

const DbUpdater = require('../db/db-updater.js');
const dbUpdater = new DbUpdater();

const SoapWrapper = require('../soap/soap-wrappers.js');
const soapMethods = new SoapWrapper();


describe('Import PPC data', function() {
  // Increase Mocha timeout
  this.timeout(20000);
  const schema = 'test';

  before(async () => {
    logger.info('START Truncating tables');
    await dbUpdater.truncateTable(schema, 'distribuitor');
    await dbUpdater.truncateTable(schema, 'furnizor');
    await dbUpdater.truncateTable(schema, 'judet');
    await dbUpdater.truncateTable(schema, 'localitate');
    await dbUpdater.truncateTable(schema, 'artera');
    await dbUpdater.truncateTable(schema, 'strada');
    logger.info('STOP Truncating tables');
  });


  describe('DB access', function() {
    it('should delete and insert values into tables', async () => {
      const distribuitorData = [
        {internal_id: 111, denumire: 'Banat', createdAt: new Date(), updatedAt: new Date()},
        {internal_id: -222, denumire: 'Dobrogea', createdAt: new Date(), updatedAt: new Date()},
        {internal_id: -333, denumire: 'Muntenia Sud', createdAt: new Date(), updatedAt: new Date()}
      ];

      const furnizorData = [
        { internal_id: 385179, denumire: 'OMV PETROM S.A.', cui: 'RO1590082', createdAt: new Date(), updatedAt: new Date()},
        { internal_id: 526974, denumire: 'LCC COMPANIA CARBUNELUI S.R.L.', cui: 'RO1556820', createdAt: new Date(), updatedAt: new Date()},
        {internal_id: 227944, denumire: 'HIDROCONSTRUCTIA S.A.', cui: '10874881', createdAt: new Date(), updatedAt: new Date()}
      ];

      const resDistribuitorUpdate = await dbUpdater.renewTableData(schema, 'distribuitor', distribuitorData);
      expect(resDistribuitorUpdate.previousRowCount).to.be.equal(0);
      expect(resDistribuitorUpdate.currentRowCount).to.be.equal(3);

      const resFurnizorUpdate = await dbUpdater.renewTableData(schema, 'furnizor', furnizorData);
      expect(resFurnizorUpdate.previousRowCount).to.be.equal(0);
      expect(resFurnizorUpdate.currentRowCount).to.be.equal(3);

    });

    it('should rollback in one error case(furnizor invalid) ', async function() {
      const distribuitorData = [
        {internal_id: 111, denumire: 'Banat', createdAt: new Date(), updatedAt: new Date()},
        {internal_id: 222, denumire: 'Dobrogea', createdAt: new Date(), updatedAt: new Date()}
      ];

      let furnizorData = [
        { internal_id: 'INVALID VALUE', denumire: 'OMV PETROM S.A.', createdAt: new Date(), updatedAt: new Date()}
      ];

      const resDistribuitorUpdate = await dbUpdater.renewTableData(schema, 'distribuitor', distribuitorData);
      const distribuitorPreviousCountFromTest = 3;
      expect(resDistribuitorUpdate.previousRowCount).to.be.equal(distribuitorPreviousCountFromTest);
      expect(resDistribuitorUpdate.currentRowCount).to.be.equal(2);

      try {
        await dbUpdater.renewTableData(schema, 'furnizor', furnizorData);
        expect(true, 'Should not get here').to.be.equal(false);
      } catch(err) {
        expect(err.name).to.be.equal('SequelizeDatabaseError');
        expect(err.message).to.be.equal('invalid input syntax for integer: "INVALID VALUE"');
      }

      //Fix previous error
      furnizorData[0].internal_id = 12345;
      const resFurnizorUpdate = await dbUpdater.renewTableData(schema, 'furnizor', furnizorData);
      //Check FURNIZOR table was not updated
      expect(resFurnizorUpdate.previousRowCount).to.be.equal(3);
      //Now it was
      expect(resFurnizorUpdate.currentRowCount).to.be.equal(1);
    });
  });

  describe('SOAP access testing', () => {
    it('should extract data from SOAP endpoints', async () => {
      const cnp = '1520620353949';
      const clientData = await soapMethods.wsGetInfoClient(cnp);
      expect(clientData.cnp_cui).to.be.equal(cnp);
      expect(clientData.enelCustomerId).to.be.equal('323759');
      expect(clientData.name).to.be.equal('CRISAN');
      logger.info(`InfoClient: ${JSON.stringify(clientData)}`);

      const nlc = 'RO005E512599702';
      const infoNLC = await soapMethods.wsGetInfoNLC(nlc);
      expect(infoNLC.enelLocationId).to.be.equal('837991633');
      expect(infoNLC.districtId).to.be.equal('TIMIS');
      logger.info(`InfoNLC: ${JSON.stringify(infoNLC)}`);

      logger.transports.console.level = 'info';
      const nomGeografice = await soapMethods.wsGetNomGeografice();

      logger.info(`Judete no.:  ${nomGeografice.judete.length}`);
      logger.info(`Localitati no.: ${nomGeografice.localitati.length}`);
      logger.info(`Artere no.:  ${nomGeografice.artere.length}`);
      logger.info(`Strazi no.:  ${nomGeografice.strazi.length}`);
      expect(nomGeografice.judete.length).to.be.equal(42);
      expect(nomGeografice.artere.length).to.be.equal(22);
    });
  });

  describe('should combine reading from SOAP services with writing to the DB', function () {

    it('should import all data for NomGeografice', async () => {
      logger.transports.console.level = 'info';
      const nomGeografice = await soapMethods.wsGetNomGeografice();

      const transformedJudete = nomGeografice.judete.map( judet => {
        logger.info(`Judet: ${JSON.stringify(judet)}`);
        return { denumire: judet.denumire, cod: judet.cod, prefixTel: judet.prefix_tel, createdAt: new Date(), updatedAt: new Date()};
      });
      const bulkInserResult = await dbUpdater.renewTableData(schema, 'judet', transformedJudete);
      expect(bulkInserResult.currentRowCount).to.be.equal(42);

      const transformedLocalitati = nomGeografice.localitati.map( localitate => {
        return { denumire: localitate.denumire, judet: localitate.judet, internal_id: localitate.id, createdAt: new Date(), updatedAt: new Date()};
      });
      const localitateBulkInsert = await dbUpdater.renewTableData(schema, 'localitate', transformedLocalitati);
      expect(localitateBulkInsert.currentRowCount).to.be.equal(13428);

      const transformedArtera = nomGeografice.artere.map( artera => {
        return { cod: artera.cod, prefix: artera.prefix, createdAt: new Date(), updatedAt: new Date()};
      });
      const artereBulkInsert = await dbUpdater.renewTableData(schema, 'artera', transformedArtera);
      expect(artereBulkInsert.currentRowCount).to.be.equal(22);

      const transformedStrada = nomGeografice.strazi.map( strada => {
        return { denumire: strada.denumire, internal_id: strada.id,
          localitate_id: strada.localitate, tip_artera: strada.tip_artera ,
          createdAt: new Date(), updatedAt: new Date()};
      });
      const straziBulkInsert = await dbUpdater.renewTableData(schema, 'strada', transformedStrada);
      expect(straziBulkInsert.currentRowCount).to.be.equal(76275);


    });

    it('should import all data for NomOperationale', async () => {
      const nomOperationale = await soapMethods.wsGetNomOperationale();

      const transformedDistribuitori = nomOperationale.distribuitori.map( distribuitor => {
        logger.info(`Distribuitor: ${JSON.stringify(distribuitor)}`);
        return { denumire: distribuitor.denumire, cui: distribuitor.cui, mail: distribuitor.mail,
          ee: distribuitor.ee, gaz: distribuitor.gaz, internal_id: distribuitor.id,
          createdAt: new Date(), updatedAt: new Date()};
      });
      const distribuitorBulkInsert = await dbUpdater.renewTableData(schema, 'distribuitor', transformedDistribuitori);
      expect(distribuitorBulkInsert.currentRowCount).to.be.equal(27);

      const transformedFurnizori = nomOperationale.furnizori.map( furnizor => {
        return { denumire: furnizor.denumire, cui: furnizor.cui, mail: furnizor.mail,
          ee: furnizor.ee, gaz: furnizor.gaz, internal_id: furnizor.id,
          createdAt: new Date(), updatedAt: new Date()};
      });
      const furnizoriBulkInsert = await dbUpdater.renewTableData(schema, 'furnizor', transformedFurnizori);
      expect(furnizoriBulkInsert.currentRowCount).to.be.equal(204);

    });

  });

  describe('Should import NomServicii from SOAP endpoint', function() {
    it('should import all from NomServicii', async () => {
      logger.transports.console.level = 'info';
      const nomServicii = await soapMethods.wsGetNomServicii();

      const transformedOfertaServicii = nomServicii.oferteServicii.map( ofertaServiciu => {
        logger.info(`Oferta: ${JSON.stringify(ofertaServiciu)}`);
        return { serviciu: ofertaServiciu.serviciu, gama: ofertaServiciu.gama, tip: ofertaServiciu.tip,
          seg: ofertaServiciu.seg, site: ofertaServiciu.site, cod: ofertaServiciu.cod,
          denumire: ofertaServiciu.denumire, de_la: ofertaServiciu.de_la, la: ofertaServiciu.la,
          pret: ofertaServiciu.pret, pret_ea: ofertaServiciu.pret_ea, pret_eaz: ofertaServiciu.pret_eaz,
          pret_eanw: ofertaServiciu.pret_eanw, pret_eano: ofertaServiciu.pret_eano, pret_gaz: ofertaServiciu.pret_gaz,
          pret_tr_gaz: ofertaServiciu.pret_tr_gaz, abonament: ofertaServiciu.abonament,
          createdAt: new Date(), updatedAt: new Date()};
      });
      const oferteServiciiBulkInsert = await dbUpdater.renewTableData(schema, 'service_offers', transformedOfertaServicii);
      expect(oferteServiciiBulkInsert.currentRowCount).to.be.equal(53);
    });


  });
});