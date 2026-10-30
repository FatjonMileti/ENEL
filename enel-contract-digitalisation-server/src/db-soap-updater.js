require('dotenv').config();
const scheduler = require('node-schedule');
const logger = require('./db-soap-updater/utils/logger');
const DbUpdater = require('./db-soap-updater/db-updater');
const dbUpdater = new DbUpdater();
const SoapWrapper = require('./internal-services/soap/soap-wrappers');
const soapMethods = new SoapWrapper();

async function synchronizeEnelData(schema) {
    let transaction;
    try {
        try {
            transaction = await dbUpdater.sequelize.transaction({ autocommit: true });
            logger.info(`START IMPORT "NOMENCLATOARE GEOGRAFICE" AT: ${new Date()}`);
            const { judete, localitati, artere, coduriPostale, strazi } = await soapMethods.wsGetNomGeografice();

            // JUDETE
            const transformedJudete = judete.map(judet => {
                return { denumire: judet.denumire, cod: judet.cod, prefixTel: judet.prefix_tel, createdAt: new Date(), updatedAt: new Date() };
            });
            const judetImportResults = await dbUpdater.transactionalRenewTableData(transaction, schema, 'judet', transformedJudete);
            logger.debug(`JUDET rows: PREV ${judetImportResults.previousRowCount} | ACTUAL ${judetImportResults.currentRowCount}`);

            // LOCALITATI
            const transformedLocalitati = localitati.map(localitate => {
                return {
                    denumire: localitate.denumire,
                    judet: localitate.judet,
                    internal_id: localitate.id,
                    urban: localitate.urban,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            });
            const localitateImportResults = await dbUpdater.transactionalRenewTableData(transaction, schema, 'localitate', transformedLocalitati);
            logger.debug(`LOCALITATE rows: PREV ${localitateImportResults.previousRowCount} | ACTUAL ${localitateImportResults.currentRowCount}`);

            // ARTERE
            const transformedArtere = artere.map(artera => {
                return { cod: artera.cod, prefix: artera.prefix, createdAt: new Date(), updatedAt: new Date() };
            });
            const arteraImportResults = await dbUpdater.transactionalRenewTableData(transaction, schema, 'artera', transformedArtere);
            logger.debug(`ARTERA rows: PREV ${arteraImportResults.previousRowCount} | ACTUAL ${arteraImportResults.currentRowCount}`);

            // STRAZI
            const transformedStrazi = strazi.map(strada => {
                return {
                    denumire: strada.denumire,
                    localitate_id: strada.localitate,
                    tip_artera: strada.tip_artera,
                    internal_id: strada.id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            });
            const stradaImportResults = await dbUpdater.transactionalRenewTableData(transaction, schema, 'strada', transformedStrazi);
            logger.debug(`STRADA rows: PREV ${stradaImportResults.previousRowCount} | ACTUAL ${stradaImportResults.currentRowCount}`);

            // CODURI POSTALE
            const transformedCoduriPostale = coduriPostale.map(codPostal => {
                return {
                    cod_postal: codPostal.cod_postal,
                    strada_id: codPostal.strada,
                    nr_de_la: codPostal.nr_de_la,
                    nr_la: codPostal.nr_la,
                    par_impar: codPostal.par_impar,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            });
            const codPostalImportResults = await dbUpdater.transactionalRenewTableData(transaction, schema, 'cod_postal', transformedCoduriPostale);
            logger.debug(`COD_POSTAL rows: PREV ${codPostalImportResults.previousRowCount} | ACTUAL ${codPostalImportResults.currentRowCount}`);

            await transaction.commit();
        } catch(err) {
            logger.error(err);
            await transaction.rollback();
        } finally {
            logger.info(`FINISH IMPORT "NOMENCLATOARE GEOGRAFICE" AT: ${new Date()}`);
        }


        try {
            transaction = await dbUpdater.sequelize.transaction({ autocommit: true });
            logger.info(`START IMPORT "NOMENCLATOARE OPERATIONALE" AT: ${new Date()}`);

            const { distribuitori, furnizori, banci, coduriCAEN, tipuriCanale, canale, kami, segmente } = await soapMethods.wsGetNomOperationale();

            // DISTRIBUITORI
            const transformedDistribuitori = distribuitori.map(distribuitor => {
                return {
                    denumire: distribuitor.denumire,
                    cui: distribuitor.cui,
                    mail: distribuitor.mail,
                    ee: distribuitor.ee,
                    gaz: distribuitor.gaz,
                    internal_id: distribuitor.id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            });
            const distribuitoriImportResults = await dbUpdater.transactionalRenewTableData(transaction, schema, 'distribuitor', transformedDistribuitori);
            logger.debug(`DISTRIBUITOR rows: PREV ${distribuitoriImportResults.previousRowCount} | ACTUAL ${distribuitoriImportResults.currentRowCount}`);

            // FURNIZORI
            const transformedFurnizori = furnizori.map(furnizor => {
                return {
                    denumire: furnizor.denumire,
                    cui: furnizor.cui,
                    mail: furnizor.mail,
                    ee: furnizor.ee,
                    gaz: furnizor.gaz,
                    internal_id: furnizor.id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            });
            const furnizoriImportResults = await dbUpdater.transactionalRenewTableData(transaction, schema, 'furnizor', transformedFurnizori);
            logger.debug(`FURNIZOR rows: PREV ${furnizoriImportResults.previousRowCount} | ACTUAL ${furnizoriImportResults.currentRowCount}`);

            // BANCI
            const transformedBanci = banci.map(banca => {
                return { cod: banca.cod, denumire: banca.denumire, createdAt: new Date(), updatedAt: new Date() };
            });
            const banciImportResults = await dbUpdater.transactionalRenewTableData(transaction, schema, 'banca', transformedBanci);
            logger.debug(`BANCA rows: PREV ${banciImportResults.previousRowCount} | ACTUAL ${banciImportResults.currentRowCount}`);

            // CODURI CAEN
            const transformedCoduriCAEN = coduriCAEN.map(codCAEN => {
                return { cod: codCAEN.cod, denumire: codCAEN.denumire, createdAt: new Date(), updatedAt: new Date() };
            });
            const coduriCAENImportResults = await dbUpdater.transactionalRenewTableData(transaction, schema, 'cod_caen', transformedCoduriCAEN);
            logger.debug(`COD_CAEN rows: PREV ${coduriCAENImportResults.previousRowCount} | ACTUAL ${coduriCAENImportResults.currentRowCount}`);

            // TIPURI CANALE
            const transformedTipuriCanale = tipuriCanale.map(tipCanal => {
                return { internal_id: tipCanal.id, denumire: tipCanal.denumire, createdAt: new Date(), updatedAt: new Date() };
            });
            const tipuriCanaleImportResults = await dbUpdater.transactionalRenewTableData(transaction, schema, 'tip_canal', transformedTipuriCanale);
            logger.debug(`TIP_CANAL rows: PREV ${tipuriCanaleImportResults.previousRowCount} | ACTUAL ${tipuriCanaleImportResults.currentRowCount}`);

            // CANALE
            const transformedCanale = canale.map(canal => {
                return { internal_id: canal.id, denumire: canal.denumire, createdAt: new Date(), updatedAt: new Date() };
            });
            let filteredChannels = [];
            for (const canal of transformedCanale) {
                if (!canal.internal_id)
                    continue;

                if (!filteredChannels.find(x => x.internal_id === canal.internal_id))
                    filteredChannels.push(canal);
            }

            const canaleImportResults = await dbUpdater.transactionalRenewTableData(transaction, schema, 'canal', filteredChannels);
            logger.debug(`CANAL rows: PREV ${canaleImportResults.previousRowCount} | ACTUAL ${canaleImportResults.currentRowCount}`);

            // SEGMENTE
            let newSegmente = segmente;
            if (!(segmente instanceof Array)) {
                newSegmente = [newSegmente];
            }

            const transformedSegmente = newSegmente.map(segment => {
                return { cod: segment.cod, denumire: segment.denumire, createdAt: new Date(), updatedAt: new Date() };
            });
            const segmenteImportResults = await dbUpdater.transactionalRenewTableData(transaction, schema, 'segment', transformedSegmente);
            logger.debug(`SEGMENT rows: PREV ${segmenteImportResults.previousRowCount} | ACTUAL ${segmenteImportResults.currentRowCount}`);

            await transaction.commit();
        } catch (e) {
            logger.error(e);
            if(transaction) {
                await transaction.rollback();
            }
        } finally {
            logger.info(`FINISH IMPORT "NOMENCLATOARE OPERATIONALE" AT: ${new Date()}`);
        }

    } catch (e) {
        logger.error(e);
        if(transaction) {
            await transaction.rollback();
        }
    } finally {
        logger.info(`======= FINISH IMPORT AT: ${new Date().toLocaleString()} ===========`);
    }
}

// synchronizeEnelData(process.env.PG_SCHEMA);

scheduler.scheduleJob('30 6 * * 1-5', jobDate => {
    logger.info(`===== Synchronizing SOAP endpoints with local tables on schema: ${process.env.PG_SCHEMA} ======`);
    logger.info(`Scheduled at: ${jobDate.toLocaleString()} and started at: ${new Date().toLocaleString()}`);
    return synchronizeEnelData(process.env.PG_SCHEMA);
});
