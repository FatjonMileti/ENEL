import React, { Component, Fragment } from 'react';
import autoBind from 'react-autobind';

import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@material-ui/core';

import { mix, requiredBefore, minValue, integer, maxValue } from 'services/rules';

import { Select, Text } from 'components/form';
import Months from '../Months';
import { Checkbox } from 'components/form/Checkbox';
import { Button } from 'components/Button';
import _ from 'lodash';

class Consumption extends Component {
    state = {
        showMonthly: true,
        showHiddenMeters: false,
        showWarningConsum: false,
        showWarningConsumHighValume: false,
        previousAnual: null,
    };

    constructor(props) {
        super(props);
        autoBind(this);
    }

    handleMonthlyToggle(e) {
        this.setState({
            showMonthly: !this.state.showMonthly,
        });
    }

    handleHiddenMetersToggle(e) {
        this.setState({
            showHiddenMeters: !this.state.showHiddenMeters,
        });
    }

    handleCategoryChange(e) {
        const { formApi, index } = this.props;
        let perYear = 0;
        switch (e.target.value) {
            default:
            case 'C1':
                perYear = 9000;
                break;
        }

        formApi.setValue(`loc_cantitate_anuala-${index}`, perYear);
        this.handleQuantityChange();
    }

    handleQuantityChange() {
        const { formApi, index, onQuantityChange, contractType, flow } = this.props;
        const perYear = formApi.getValue(`loc_cantitate_anuala-${index}`);
        const annualValue = formApi.getValue(`loc_cantitate_anuala-${index}`);
        if (flow === 'gaz' && contractType === 'b2c') {
            const a = formApi.getValue(`loc_categorie-${index}`);
            formApi.setValue(`loc_categorie-${index}`, 'C1');
        } else if (flow === 'gaz' && contractType === 'b2b') {
            if (annualValue <= 280000) {
                formApi.setValue(`loc_categorie-${index}`, 'C1');
            } else if (annualValue > 280000 && annualValue <= 2800000) {
                formApi.setValue(`loc_categorie-${index}`, 'C2');
            } else if (annualValue > 2800000 && annualValue <= 28000000) {
                formApi.setValue(`loc_categorie-${index}`, 'C3');
            } else if (annualValue > 28000000 && annualValue <= 280000000) {
                formApi.setValue(`loc_categorie-${index}`, 'C4');
            } else if (annualValue > 280000000) {
                formApi.setValue(`loc_categorie-${index}`, 'C5');
            }
            // if (
            //     this.state.previousAnual !== formApi.getValue(`loc_categorie-${index}`) &&
            //     this.state.previousAnual !== null
            // ) {
            //     this.setState({
            //         showWarningConsum: true,
            //     });
            // }
            // this.setState({
            //     previousAnual: formApi.getValue(`loc_categorie-${index}`),
            // });
        }

        if (annualValue < 50 && contractType === 'b2c') {
            this.setState({
                showWarningConsum: true,
            });
        } else if (annualValue < 100 && contractType === 'b2b') {
            this.setState({
                showWarningConsum: true,
            });
        } else if (annualValue > 280000 && contractType === 'b2b') {
            this.setState({
                showWarningConsumHighValume: true,
            });
        } else {
            this.setState({
                showWarningConsum: false,
            });
        }

        onQuantityChange(perYear);
    }

    renderCategory() {
        const { flow, isLinkSent, index } = this.props;
        if (flow === 'gaz') {
            const categories = [
                {
                    label: 'C1',
                    value: 'C1',
                },
                {
                    label: 'C2',
                    value: 'C2',
                },
                {
                    label: 'C3',
                    value: 'C3',
                },
                {
                    label: 'C4',
                    value: 'C4',
                },
                {
                    label: 'C5',
                    value: 'C5',
                },
            ];
            return (
                <Select
                    className="col-md-12"
                    label="Categorie"
                    name={`loc_categorie-${index}`}
                    options={categories}
                    onChange={this.handleCategoryChange}
                    validate={requiredBefore(isLinkSent)}
                    highlight={!isLinkSent}
                    // disabled={isLinkSent}
                    disabled={true}
                />
            );
        }
    }

    renderPressure() {
        const { flow, index } = this.props;
        if (flow === 'gaz') {
            return (
                <Fragment>
                    <Text
                        className="col-md-12"
                        label="Presiune"
                        name={`loc_pressure-${index}`}
                        disabled
                    />
                    <Text
                        className="col-md-12"
                        label="Nivel Presiune"
                        name={`loc_presureLevel-${index}`}
                        disabled
                    />
                </Fragment>
            );
        }
    }

    renderMonthlyToggleButton() {
        const { flow, index } = this.props;
        /*if (flow === 'gaz') {
            return (
                <div className="col-md-4">
                    <Button
                        secondary
                        outline
                        hasIcon
                        fullWidth
                        value={
                            <i
                                className={
                                    this.state.showMonthly
                                        ? 'ion-ios-arrow-up'
                                        : 'ion-ios-arrow-down'
                                }
                            />
                        }
                        onClick={this.handleMonthlyToggle}
                    />
                </div>
            );
        } else {*/
        return (
            <div className="col-md-4">
                <Checkbox
                    name={`loc_consum_conventie-${index}`}
                    onChange={this.handleMonthlyToggle}
                    checked={true}
                    label="Conventie consum"
                    initialValue={true}
                    disabled={true}
                    // display
                />
            </div>
        );
        //}
    }

    validateConsum = index => () => {
        const { contractType, formApi, onPutereAvizataChange, flow } = this.props;
        if (formApi) {
            const { values } = formApi.getState();
            if (contractType === 'b2c' && flow === 'gaz') {
                const annualValue = values[`loc_cantitate_anuala-${index}`];
                if (annualValue > 280000) {
                    return 'Cantitatea introdusă reprezintă un consum prea mare pentru un client cu consum casnic.';
                }
            } else if (contractType === 'b2b' && flow === 'gaz') {
                const annualValue = values[`loc_cantitate_anuala-${index}`];
                // if (annualValue > 280000) {
                //     return '';
                // }
            }

            if (contractType === 'b2b' && formApi) {
                let putereAvizata = values[`putere_avizata-${index}`];
                let locCantitateAnuala = values[`loc_cantitate_anuala-${index}`];
                let putereAvizataNr = parseFloat(putereAvizata);
                if (_.isNumber(putereAvizataNr) && _.isNumber(locCantitateAnuala)) {
                    let maxVal = parseFloat(putereAvizata) * 24 * 365; //
                    let anula = parseFloat(locCantitateAnuala);
                    if (anula > maxVal && this.props.flow === 'ee') {
                        return `Valoarea maxima acceptata este ${maxVal}kWh.`;
                    }
                }
            }
        }
    };

    validateConsumWithMonths = index => () => {
        const { flow, formApi } = this.props;
        if (flow !== 'gaz') {
            const perYear = parseFloat(formApi.getValue(`loc_cantitate_anuala-${index}`));
            let total = 0;

            const monthNames = [
                'ianuarie',
                'februarie',
                'martie',
                'aprilie',
                'mai',
                'iunie',
                'iulie',
                'august',
                'septembrie',
                'octombrie',
                'noiembrie',
                'decembrie',
            ];

            monthNames.forEach(monthName => {
                if (
                    formApi.getValue(`${monthName}-${index}`) !== undefined &&
                    formApi.getValue(`${monthName}-${index}`) !== null
                ) {
                    total += parseFloat(
                        formApi
                            .getValue(`${monthName}-${index}`)
                            .replace('.', '')
                            .replace(',', '.')
                    );
                }
            });
            if (perYear < total || perYear > total) {
                let diff = perYear - total;
                return `Profilarea lunara a consumului a fost modificata, va rugam sa ajustati cantitatea lunara cu  ${diff}`;
            }
        }
    };

    render() {
        const { flow, isLinkSent, index, nlc, measurementIndexes, formApi, session } = this.props;
        const indexes = measurementIndexes.INDEXES;
        return (
            <Fragment>
                <div className="group-name">CONSUM ANUAL ESTIMAT</div>
                <div className="row">{this.renderCategory()}</div>
                <div className="row">{this.renderPressure()}</div>
                <div className="row">
                    <Text
                        className="col-md-12"
                        label={flow === 'gaz' ? 'Anual (kWh)' : 'Anual (kWh)'}
                        name={`loc_cantitate_anuala-${index}`}
                        onChange={this.handleQuantityChange}
                        validate={
                            flow === 'ee' &&
                            nlc &&
                            nlc.status &&
                            nlc.status === 'ACTIV' &&
                            session[`${flow}_schimba_furnizor`] === false
                                ? mix(
                                      requiredBefore(isLinkSent),
                                      integer,
                                      this.validateConsum(index),
                                      this.validateConsumWithMonths(index),
                                      maxValue(6 * 24 * 365)
                                  )
                                : mix(
                                      requiredBefore(isLinkSent),
                                      integer,
                                      this.validateConsumWithMonths(index),
                                      this.validateConsum(index)
                                  )
                        }
                        highlight={!isLinkSent}
                        disabled={isLinkSent}
                        type="number"
                    />
                    {this.renderMonthlyToggleButton()}
                </div>
                {flow === 'gaz' &&
                session.contract_type === 'b2b' &&
                this.state.showWarningConsum ? (
                    <>
                        <div>
                            <p className="alert alert-warning">
                                Verifică valoarea declarată și asigură-te că ai introdus consumul
                                anual în KWh și nu în MWh.
                            </p>
                        </div>
                    </>
                ) : (
                    <></>
                )}
                {flow === 'gaz' &&
                session.contract_type === 'b2b' &&
                this.state.showWarningConsumHighValume ? (
                    <>
                        <div>
                            <p className="alert alert-warning">
                                Conform cantității introduse, ai trecut la o categorie superioară de
                                consum. Verifică valoarea declarată și asigură-te că ai introdus o
                                valoare corecta.
                            </p>
                        </div>
                    </>
                ) : (
                    <></>
                )}
                {flow === 'gaz' &&
                session.contract_type === 'b2c' &&
                this.state.showWarningConsum ? (
                    <>
                        <div>
                            <p className="alert alert-warning">
                                Asigură-te că ai introdus cantitatea în KWh și nu în MWh.
                            </p>
                        </div>
                    </>
                ) : (
                    <></>
                )}
                <Months
                    showMonthly={this.state.showMonthly}
                    index={index}
                    formApi={formApi}
                    flow={this.props.flow}
                />
                <div className="group-name">
                    Citire index contor cu seria {measurementIndexes.SERIE_CONTOR}
                </div>
                {flow === 'ee' && (
                    <>
                        <div className="row">
                            <div className="group-name col-sm-12 ">Energia Activa</div>
                            <div className="col-sm-12 col-lg-6 vertical-spacing">
                                <Accordion defaultExpanded={true}>
                                    <AccordionSummary
                                        aria-controls="panel-activa-rata-unica-content"
                                        id="panel-activa-rata-unica-header"
                                    >
                                        <Typography>ENERGIE ACTIVĂ - RATA UNICA</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div className="col-sm-6">
                                            <Text
                                                label="Ultimul Index"
                                                className="no-left-spacing"
                                                name={`index-actual-1.8.0-${index}`}
                                                highlight={!isLinkSent}
                                                disabled={true}
                                                type="text"
                                            />
                                        </div>
                                        <div className="col-sm-6">
                                            <Text
                                                label="Index nou"
                                                name={`meas_index_ELE_SINGLERATE-${index}`}
                                                onChange={this.handleRataUnicaChange}
                                                highlight={!isLinkSent}
                                                validate={mix(integer)}
                                                type="number"
                                            />
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                            </div>

                            {!this.state.showHiddenMeters && (
                                <div className="col-sm-12 col-lg-6 vertical-spacing">
                                    <Button
                                        secondary
                                        outline
                                        hasIcon
                                        fullWidth
                                        value={
                                            <i
                                                className={
                                                    this.state.showHiddenMeters
                                                        ? 'ion-ios-arrow-up'
                                                        : 'ion-ios-arrow-down'
                                                }
                                            />
                                        }
                                        onClick={this.handleHiddenMetersToggle}
                                    />
                                </div>
                            )}
                            {this.state.showHiddenMeters && (
                                <div className="col-sm-12 col-lg-6 vertical-spacing">
                                    <Accordion defaultExpanded={true}>
                                        <AccordionSummary
                                            aria-controls="panel-activa-zona1-content"
                                            id="panel-activa-zona1-header"
                                        >
                                            <Typography>
                                                ENERGIE ACTIVĂ ZONĂ 1: VÂRF / ZI
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <div className="col-sm-6">
                                                <Text
                                                    label="Ultimul Index"
                                                    className="no-left-spacing"
                                                    name={`index-actual-1.8.1-${index}`}
                                                    highlight={!isLinkSent}
                                                    disabled={true}
                                                    type="number"
                                                />
                                            </div>
                                            <div className="col-sm-6">
                                                <Text
                                                    label="Index nou"
                                                    name={`meas_index_ELE_DAY-${index}`}
                                                    onChange={this.handleZonaVarfChange}
                                                    highlight={!isLinkSent}
                                                    validate={mix(integer)}
                                                    type="number"
                                                />
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                </div>
                            )}
                            {this.state.showHiddenMeters && (
                                <div className="col-sm-12 col-lg-6 vertical-spacing">
                                    <Accordion defaultExpanded={true}>
                                        <AccordionSummary
                                            aria-controls="panel-activa-zona2-content"
                                            id="panel-activa-zona2-header"
                                        >
                                            <Typography>
                                                ENERGIE ACTIVĂ ZONĂ 2: REST, NOAPTE
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <div className="col-sm-6">
                                                <Text
                                                    label="Ultimul Index"
                                                    className="no-left-spacing"
                                                    name={`index-actual-1.8.2-${index}`}
                                                    highlight={!isLinkSent}
                                                    disabled={true}
                                                    type="number"
                                                />
                                            </div>
                                            <div className="col-sm-6">
                                                <Text
                                                    label="Index nou"
                                                    name={`meas_index_ELE_NIGHT-${index}`}
                                                    onChange={this.handleZonaRestChange}
                                                    highlight={!isLinkSent}
                                                    validate={mix(integer)}
                                                    type="number"
                                                />
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                </div>
                            )}
                            {this.state.showHiddenMeters && (
                                <div className="col-sm-12 col-lg-6 vertical-spacing">
                                    <Accordion defaultExpanded={true}>
                                        <AccordionSummary
                                            aria-controls="panel-activa-zona3-content"
                                            id="panel-activa-zona3-header"
                                        >
                                            <Typography>ENERGIE ACTIVĂ ZONĂ 3: GOL</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <div className="col-sm-6">
                                                <Text
                                                    label="Ultimul Index"
                                                    className="no-left-spacing"
                                                    name={`index-actual-1.8.3-${index}`}
                                                    highlight={!isLinkSent}
                                                    disabled={true}
                                                    type="number"
                                                />
                                            </div>
                                            <div className="col-sm-6">
                                                <Text
                                                    label="Index nou"
                                                    name={`meas_index_ELE_GOL-${index}`}
                                                    onChange={this.handleZonaGolChange}
                                                    highlight={!isLinkSent}
                                                    validate={mix(integer)}
                                                    type="number"
                                                />
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                </div>
                            )}
                        </div>
                        {this.state.showHiddenMeters && (
                            <div className="row">
                                <div className="group-name col-sm-12 ">Energia Reactiva</div>
                                <div className="col-sm-12 col-lg-6 vertical-spacing">
                                    <Accordion defaultExpanded={true}>
                                        <AccordionSummary
                                            aria-controls="panel-reactiva-ind-content"
                                            id="panel-reactiva-ind-header"
                                        >
                                            <Typography>ENERGIE REACTIVA INDUCTIVĂ</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <div className="col-sm-6">
                                                <Text
                                                    label="Ultimul Index"
                                                    className="no-left-spacing"
                                                    name={`index-actual-5.8.0-${index}`}
                                                    highlight={!isLinkSent}
                                                    disabled={true}
                                                    type="number"
                                                />
                                            </div>
                                            <div className="col-sm-6">
                                                <Text
                                                    label="Index nou"
                                                    name={`meas_index_ELE_INDUCTIVE-${index}`}
                                                    onChange={this.handleReactivaInductivaChange}
                                                    highlight={!isLinkSent}
                                                    validate={mix(integer)}
                                                    type="number"
                                                />
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                </div>
                                <div className="col-sm-12 col-lg-6 vertical-spacing">
                                    <Accordion defaultExpanded={true}>
                                        <AccordionSummary
                                            aria-controls="panel-reactiva-cap-content"
                                            id="panel-reactiva-cap-header"
                                        >
                                            <Typography>ENERGIE REACTIVA CAPACITIVĂ</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <div className="col-sm-6">
                                                <Text
                                                    label="Ultimul Index"
                                                    className="no-left-spacing"
                                                    name={`index-actual-8.8.0-${index}`}
                                                    highlight={!isLinkSent}
                                                    disabled={true}
                                                    type="number"
                                                />
                                            </div>
                                            <div className="col-sm-6">
                                                <Text
                                                    label="Index nou"
                                                    name={`meas_index_ELE_CAPACITIVE-${index}`}
                                                    onChange={this.handleReactivaCapacitativaChange}
                                                    highlight={!isLinkSent}
                                                    validate={mix(integer)}
                                                    type="number"
                                                />
                                            </div>
                                        </AccordionDetails>
                                    </Accordion>
                                </div>
                            </div>
                        )}
                    </>
                )}
                {flow === 'gaz' && (
                    <div className="row">
                        <div className="col-sm-12 vertical-spacing">
                            <Accordion defaultExpanded={true}>
                                <AccordionSummary
                                    aria-controls="panel-cantitate-volum-content"
                                    id="panel-cantitate-volum-header"
                                >
                                    <Typography>Volum masurat in conditii baza</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <div className="col-sm-6">
                                        <Text
                                            label="Ultimul Index"
                                            className="no-left-spacing"
                                            name={`index-actual-VOL-${index}`}
                                            highlight={!isLinkSent}
                                            disabled={true}
                                            type="number"
                                        />
                                    </div>
                                    <div className="col-sm-6">
                                        <Text
                                            label="Index nou"
                                            name={`meas_index_GAS-${index}`}
                                            onChange={this.handleVolumMasuratChange}
                                            highlight={!isLinkSent}
                                            validate={mix(integer)}
                                            type="number"
                                        />
                                    </div>
                                </AccordionDetails>
                            </Accordion>
                        </div>
                    </div>
                )}
            </Fragment>
        );
    }
}

export default Consumption;
