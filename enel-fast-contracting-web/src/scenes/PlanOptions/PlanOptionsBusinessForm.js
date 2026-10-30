import React, { Component } from 'react';
import _ from 'lodash';

import Form from 'components/validation/form';
import Button from 'components/validation/button';
import Select from 'components/validation/select';
import { required } from 'components/validation/rules';

import * as selectOptions from 'utils/constants/energyInfo';
import { toClientTypeSelect, toEnergyInfoSelect } from 'utils/serializers';
import Gradinet from './Gradinet'
import './PlanOptions.scss';
import Input from 'components/validation/input';

class PlanOptionsBusinessForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            annualConsumptionLabel: 'Consum anual estimat (kWh/an)',
        };
    }

    handleTipEnergeChange = (e) => {
        if (e.target.value === 'ELECTRICA') {
            this.setState({
                annualConsumptionLabel: 'Consum anual estimat (kWh/an)',
            });
        } else {
            this.setState({
                annualConsumptionLabel: 'Consum anual estimat (KWh/an)',
            });
        }
    };

    handleTipEnergeSelectionChange = (e) => {
        this.props.handleInputChange(e);
        this.handleTipEnergeChange(e);
    }


    render() {
        const {
            hasOfferParams,
            setForm,
            loaded,
            counties,
            form,
            handleInputChange,
            getEnergyEstimate,
            handleNextClick,
            handleRestoreProcess,
        } = this.props;

        return (
            <Form className="hero-form" ref={(c) => { setForm(c); }}>
                {loaded && <div className="row custom-bg ai-c">
                    {/* <Gradinet> */}
                    <div className="col-md-7">
                        <div className='container' style={{ maxWidth: '800px' }}>
                            <div className="row first-page-autocomplete">
                                <Select
                                    name="judet"
                                    label="În ce județ se află locul de consum?"
                                    placeholder="Alege"
                                    value={form.judet}
                                    className="form-control"
                                    containerClass="mb-3 col-md-12"
                                    validations={[required]}
                                    // autocomplete
                                    onSelect={handleInputChange}
                                    items={counties}
                                />
                            </div>
                            <div className="row first-page-autocomplete">
                                <Select
                                    name="clientType"
                                    label="Firma"
                                    placeholder="Alege"
                                    value={form.clientType}
                                    className="form-control"
                                    containerClass="mb-3 col-md-12"
                                    validations={[required]}
                                    // autocomplete
                                    onSelect={handleInputChange}
                                    items={toClientTypeSelect(selectOptions.CLIENT_TYPE)}
                                />
                            </div>
                            <div className="row first-page-autocomplete">
                                <Select
                                    name="energyType"
                                    label="Tip Energie"
                                    placeholder="Alege"
                                    value={form.energyType}
                                    className="form-control"
                                    containerClass="mb-3 col-md-12"
                                    validations={[required]}
                                    // autocomplete
                                    onSelect={this.handleTipEnergeSelectionChange}
                                    items={toEnergyInfoSelect(selectOptions.ENERGY_TYPE)}
                                />
                            </div>
                            {/* <div className="row first-page-autocomplete"> */}
                            {/*    <Select */}
                            {/*        name="energyClientType" */}
                            {/*        label="În ce scop este utilizată energia electrică / gaze naturale?" */}
                            {/*        placeholder="Alege" */}
                            {/*        value={form.energyClientType} */}
                            {/*        className="form-control" */}
                            {/*        containerClass="mb-3 col-md-12" */}
                            {/*        validations={[required]} */}
                            {/*        onSelect={handleInputChange} */}
                            {/*        items={toEnergyInfoSelect(selectOptions.ENERGY_CLIENT_TYPE)} */}
                            {/*    /> */}
                            {/* </div> */}
                            <div className="row first-page-autocomplete">
                                {/* <Select */}
                                {/*    name="consum_anual_estimat" */}
                                {/*    label="Consum anual estimat" */}
                                {/*    placeholder="Alege" */}
                                {/*    value={form.consum_anual_estimat} */}
                                {/*    className="form-control" */}
                                {/*    containerClass="mb-3 col-md-12" */}
                                {/*    validations={[required]} */}
                                {/*    autocomplete */}
                                {/*    onSelect={handleInputChange} */}
                                {/*    items={getEnergyEstimate()} */}
                                {/* /> */}
                                <Input
                                    name="consum_anual_estimat"
                                    label={this.state.annualConsumptionLabel}
                                    value={form.consum_anual_estimat}
                                    onChange={handleInputChange}
                                    type="number"
                                    errorLabel="Consum anual este necesar."
                                    className="form-control custom-color"
                                    containerClass="mb-3 col-md-12"
                                    validations={[required]}
                                    placeholder="Consum anual"
                                    upperCase
                                />
                            </div>
                            {/*! hasOfferParams && <div className="row offset-top-lg">
                                        <BinaryRadio
                                            containerClass="mb-3 col-md-12"
                                            name="formInput61"
                                            label="Pe ce perioadă vrei să închei contractul de furnizare?"
                                            onAgree={e => this.handleRadioChange(e, 'furn24', '0')}
                                            onDisagree={e => this.handleRadioChange(e, 'furn24', '1')}
                                            value={this.state.form.furn24}
                                            values={['0', '1']}
                                            valueLabels={['12 luni', '24 luni']}
                                            validations={[required]}
                                        />
                                    </div> */}
                            <div className="row">
                                <div className="mb-3 col-md-12" >
                                    <div className="text-left offset-top">
                                        <Button type="submit" className="btn btn-primary col-12 btn-full-mobile" onClick={handleNextClick}>
                                            Continuă
                                        </Button>
                                    </div>
                                </div>
                                <div className="mb-3 col-md-12" style={{ marginBottom: 0 }}>
                                    <div className="text-left">
                                        {!hasOfferParams && <Button type="submit" className="btn btn-outline-secondary col-12 btn-full-mobile underline--white" onClick={handleRestoreProcess}>
                                            Reia Procesul
                                        </Button>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="blue-black" style={{ position: 'absolute', bottom: 0, zIndex: -1 }}>
                            <div className="row" style={{ display: 'inherit' }}>
                                <div className="col-sm gradient gradient1"></div>
                                <div className="col-sm gradient gradient2"></div>
                                <div className="col-sm gradient gradient3"></div>
                                <div className="col-sm gradient gradient4"></div>
                                <div className="col-sm gradient gradient5"></div>
                                <div className="col-sm gradient gradient6"></div>
                            </div>
                        </div>
                    </div>
                    {/* </Gradinet> */}

                    <div className="col-md-4">
                        <img className="home-illustration" style={{ width: '100%' }} src="home.png" />
                    </div>
                </div>}
            </Form>

        );
    }
}

export default PlanOptionsBusinessForm;
