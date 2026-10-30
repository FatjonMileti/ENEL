'use strict';
const {DataTypes} = require("sequelize");
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('session_history',
            {
                id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                },
                status: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                agent_id: {
                    type: DataTypes.INTEGER,
                },
                nume: {
                    type: DataTypes.STRING,
                },
                prenume: {
                    type: DataTypes.STRING,
                },
                secret: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                perioada_furnizare: {
                    type: DataTypes.INTEGER,
                },
                judet: {
                    type: DataTypes.STRING,
                },
                tip_client: {
                    type: DataTypes.STRING,
                },
                scadenta_factura: {
                    type: DataTypes.INTEGER,
                },
                ee_offer_success: {
                    type: DataTypes.BOOLEAN,
                },
                ee_offer_error: {
                    type: DataTypes.JSON,
                },
                ee_offer_date: {
                    type: DataTypes.DATE,
                },
                ee_offer_request: {
                    type: DataTypes.JSON,
                },
                ee_offer_internal_id: {
                    type: DataTypes.STRING,
                },
                ee_sign_success: {
                    type: DataTypes.BOOLEAN,
                },
                ee_sign_error: {
                    type: DataTypes.JSON,
                },
                ee_sign_date: {
                    type: DataTypes.DATE,
                },
                ee_activate_success: {
                    type: DataTypes.BOOLEAN,
                },
                ee_activate_error: {
                    type: DataTypes.JSON,
                },
                ee_activate_date: {
                    type: DataTypes.DATE,
                },
                ee_agree: {
                    type: DataTypes.BOOLEAN,
                },
                gaz_offer_success: {
                    type: DataTypes.BOOLEAN,
                },
                gaz_offer_error: {
                    type: DataTypes.JSON,
                },
                gaz_offer_date: {
                    type: DataTypes.DATE,
                },
                gaz_offer_request: {
                    type: DataTypes.JSON,
                },
                gaz_offer_internal_id: {
                    type: DataTypes.STRING,
                },
                gaz_sign_success: {
                    type: DataTypes.BOOLEAN,
                },
                gaz_sign_error: {
                    type: DataTypes.JSON,
                },
                gaz_sign_date: {
                    type: DataTypes.DATE,
                },
                gaz_activate_success: {
                    type: DataTypes.BOOLEAN,
                },
                gaz_activate_error: {
                    type: DataTypes.JSON,
                },
                gaz_activate_date: {
                    type: DataTypes.DATE,
                },
                gaz_agree: {
                    type: DataTypes.BOOLEAN,
                },
                is_closed: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                },
                closed_date: {
                    type: DataTypes.DATE,
                },
                type: {
                    type: DataTypes.STRING,
                },
                ee_documents: {
                    type: DataTypes.JSON,
                },
                gaz_documents: {
                    type: DataTypes.JSON,
                },
                ee_generated_documents: {
                    type: DataTypes.JSON,
                },
                gaz_generated_documents: {
                    type: DataTypes.JSON,
                },
                ee_serviciu: {
                    type: DataTypes.JSON,
                },
                gaz_serviciu: {
                    type: DataTypes.JSON,
                },
                ee_schimba_furnizor: {
                    type: DataTypes.BOOLEAN,
                },
                ee_are_furnizare_activa: {
                    type: DataTypes.BOOLEAN,
                },
                ee_schimba_titular: {
                    type: DataTypes.BOOLEAN,
                },
                gaz_schimba_furnizor: {
                    type: DataTypes.BOOLEAN,
                },
                gaz_are_furnizare_activa: {
                    type: DataTypes.BOOLEAN,
                },
                gaz_schimba_titular: {
                    type: DataTypes.BOOLEAN,
                },
                client_update_cross: {
                    type: DataTypes.BOOLEAN,
                },
                client: {
                    type: DataTypes.JSON,
                },
                ee_loc: {
                    type: DataTypes.JSON,
                },
                gaz_loc: {
                    type: DataTypes.JSON,
                },
                ee_loc_doc: {
                    type: DataTypes.JSON,
                },
                gaz_loc_doc: {
                    type: DataTypes.JSON,
                },
                ee_furnizor_viitor: {
                    type: DataTypes.STRING,
                },
                ee_furnizor_data_start: {
                    type: DataTypes.DATE,
                },
                gaz_furnizor_viitor: {
                    type: DataTypes.STRING,
                },
                gaz_furnizor_data_start: {
                    type: DataTypes.DATE,
                },
                ee_factura: {
                    type: DataTypes.JSON,
                },
                gaz_factura: {
                    type: DataTypes.JSON,
                },
                ee_consum: {
                    type: DataTypes.JSON,
                },
                gaz_consum: {
                    type: DataTypes.JSON,
                },
                ee_contact: {
                    type: DataTypes.JSON,
                },
                gaz_contact: {
                    type: DataTypes.JSON,
                },
                createdAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                ocr_count: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
                    allowNull: false,
                },
                ee_last_page: {
                    type: DataTypes.STRING(100),
                },
                gaz_last_page: {
                    type: DataTypes.STRING(100),
                },
                client_app: {
                    type: DataTypes.STRING,
                },
                company_id: {
                    type: DataTypes.INTEGER,
                },
                backoffice: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
                abandon_type: {
                    type: DataTypes.STRING,
                },
                abandon_details: {
                    type: DataTypes.TEXT,
                },
                token: {
                    type: DataTypes.STRING,
                },
                cron_rejection_date: {
                    type: DataTypes.DATE,
                },
                ee_cantitate_anuala: {
                    type: DataTypes.INTEGER,
                },
                gaz_cantitate_anuala: {
                    type: DataTypes.INTEGER,
                },
                link_sent_date: {
                    type: DataTypes.DATE,
                },
                signature_agree_date: {
                    type: DataTypes.DATE,
                },
                client_upload_agree_date: {
                    type: DataTypes.DATE,
                },
                ee_serviciu_pana_la: {
                    type: DataTypes.DATE,
                },
                gaz_serviciu_pana_la: {
                    type: DataTypes.DATE,
                },
                reminders: {
                    type: DataTypes.JSONB,
                },
                is_fast_flow: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                ee_sign_channel: {
                    type: DataTypes.STRING,
                },
                gaz_sign_channel: {
                    type: DataTypes.STRING,
                },
                ee_offer_opportunity_id: {
                    type: DataTypes.STRING,
                },
                gaz_offer_opportunity_id: {
                    type: DataTypes.STRING,
                },
                resend_link_counter: {
                    type: DataTypes.INTEGER,
                },
                ee_contact_email: {
                    type: DataTypes.STRING,
                },
                ee_contact_telefon: {
                    type: DataTypes.STRING,
                },
                gaz_contact_email: {
                    type: DataTypes.STRING,
                },
                gaz_contact_telefon: {
                    type: DataTypes.STRING,
                },
                generic_dossier_id: {
                    type: DataTypes.STRING,
                },
                abandon_type_updated_at: {
                    type: DataTypes.DATE,
                },
                generic_dossier_name: {
                    type: DataTypes.STRING,
                },
                measurement_indexes: {
                    type: DataTypes.JSONB,
                },
                company: {
                    type: DataTypes.JSONB,
                },
                contract_type: {
                    type: DataTypes.STRING,
                    defaultValue: 'b2c',
                },
                ee_putere_avizata: {
                    type: DataTypes.INTEGER,
                },
                voucher: {type: DataTypes.JSONB, allowNull: true},
            }, {
                schema: process.env.PG_SCHEMA
            }
        );
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('session_history');
    }
};
